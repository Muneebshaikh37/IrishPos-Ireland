<script setup lang="ts">
import {ref, provide, onMounted, computed, watch} from "vue";
import axios from "axios";

// Utility Functions and Constants
import {handleResponse, handleError} from "@/network/api/responseHandler.js";

// Third-Party Components
import draggable from "vuedraggable";
  import SaveTokenNotification from '@/composables/SaveTokenNotification.vue';
// Base Components
import TinySlider, {type TinySliderElement} from "@/components/Base/TinySlider";
import Lucide from "@/components/Base/Lucide";
import Litepicker from "@/components/Base/Litepicker";

// Dashboard Components
import TopWidgets from "@/components/Dashboard/TopWidgets/WidgetsList.vue";
import LowStockAlerts from "@/components/Dashboard/LowStockAlerts/index.vue";
import PeakSaleHours from "@/components/Dashboard/PeakSaleHours/index.vue";
import SalesByCategory from "@/components/Dashboard/SalesByCategory/index.vue";
import TopSellingProducts from "@/components/Dashboard/TopSellingProducts/index.vue";
import StockLevels from "@/components/Dashboard/StockLevels/index.vue";
import StockDiscrepancies from "@/components/Dashboard/StockDiscrepancies/index.vue";
import InventoryValue from "@/components/Dashboard/InventoryValue/index.vue";
import InventoryTurnover from "@/components/Dashboard/InventoryTurnover/index.vue";
import PaymentMethod from "@/components/Dashboard/PaymentMethod/index.vue";
import ProfitMargins from "@/components/Dashboard/ProfitMargins/index.vue";
import LossProfitMargins from "@/components/Dashboard/LossProfitMargins/index.vue";
import LatestSales from "@/components/Dashboard/LatestSales/index.vue";
import WidgetSetting from "@/components/Dashboard/WidgetSetting/index.vue";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();

const USER = authStore.getUser;
const importantNotesRef = ref<TinySliderElement>();
provide("bind[importantNotesRef]", (el: TinySliderElement) => {
  importantNotesRef.value = el;
});

 // Get today's date and the date 7 days ago
const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7); // Subtract 7 days from today

// Function to format the date as "1 Jan, 2025"
const formatDate = (date) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

// Function to parse date format "1 Jan, 2025" to "YYYY-MM-DD"
const parseDate = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Default date range (7 days ago to today)
const dateRange = ref(`${formatDate(sevenDaysAgo)} - ${formatDate(today)}`);
const start_date = ref(parseDate(sevenDaysAgo));
const end_date = ref(parseDate(today));

// Watch for changes in dateRange
watch(dateRange, (newValue) => {
  try {
    if (newValue) {
      const [start, end] = newValue.split(' - ');
      start_date.value = parseDate(start.trim());
      end_date.value = parseDate(end.trim());
      console.log("Selected Start Date:", start_date.value);
      console.log("Selected End Date:", end_date.value);
    }
  } catch (error) {
    console.error("Error converting date:", error.message);
  }
});
const greeting = ref("");
const widgetSettings = ref([]);
const loadSettings = () => {
  const storedSettings = localStorage.getItem("settings");
  if (storedSettings) {
    widgetSettings.value = JSON.parse(storedSettings);
  } else {
    console.error("Settings not found in localStorage.");
  }
};
const handleSettingsChanged = (newSettings) => {
  widgetSettings.value = newSettings;
  topWidgetSettings.value = newSettings;
};
const isVisible = (id: string) => {
  const setting = widgetSettings.value.find((s) => s.id === id && id != "1");
  return setting ? setting.value : true; // Default to true if setting not found
};


const {t} = useI18n();
const fetchGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    greeting.value = t('dashboard.goodMorning');
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting.value = t('dashboard.goodAfternoon');
  } else if (currentHour >= 18 && currentHour < 23) {
    greeting.value = t('dashboard.goodEvening');
  } else {
    greeting.value = t('dashboard.goodNight');
  }
};
const locale = ref('en'); // Default locale
onMounted(() => {
  locale.value = localStorage.getItem('locale') || 'en';
  // isfetchTotalInventory();
  fetchGreeting()
  loadSettings();
  loadWidgets();
  const storedWidgets = localStorage.getItem("dashboardWidgets");
  if (storedWidgets) {
    widgets.value = JSON.parse(storedWidgets);
  }
});
const widgets = ref([]);
const topWidgetSettings = ref(
    [
      {id: 1, name: "Total Sales", value: true},
      {id: 2, name: "Average Transaction Value", value: true},
      {id: 3, name: "COGS", value: true},
      {id: 4, name: "Inventory Value", value: true},
      {id: 5, name: "Sales Return", value: true},
      {id: 19, name: "Profit Margin", value: true},
    ]
);

// Load widgets from localStorage or set default widgets
const loadWidgets = () => {
  const storedWidgets = localStorage.getItem("dashboardWidgets");
  if (storedWidgets) {
    widgets.value = JSON.parse(storedWidgets);
  } else {
    widgets.value = [
      {id: 1, component: "TopWidgets", name: "TopWidget", wrapperClass: "col-span-6", settings: topWidgetSettings},
      {id: 6, component: "LowStockAlerts", name: "Low Stock Alerts", wrapperClass: "col-span-6"},
      {id: 7, component: "PeakSaleHours", name: "Peak Sale Hours", wrapperClass: "col-span-12"},
      {id: 8, component: "SalesByCategory", name: "Sales by Category", wrapperClass: "col-span-6"},
      {id: 9, component: "TopSellingProducts", name: "Top Selling Products", wrapperClass: "col-span-6"},
      {id: 10, component: "StockLevels", name: "Stock Levels", wrapperClass: "col-span-6"},
      {id: 11, component: "StockDiscrepancies", name: "Stock Discrepancies", wrapperClass: "col-span-6"},
      {id: 12, component: "InventoryTurnover", name: "Inventory Turnover", wrapperClass: "col-span-6"},
      {id: 13, component: "InventoryValue", name: "Inventory Value", wrapperClass: "col-span-6"},
      {id: 14, component: "ProfitMargins", name: "Profit Margins", wrapperClass: "col-span-6"},
      {id: 15, component: "PaymentMethod", name: "Payment Method", wrapperClass: "col-span-6"},
      {id: 16, component: "LossProfitMargins", name: "Profit Margins", wrapperClass: "col-span-6"},
      {id: 17, component: "LatestSales", name: "Latest Sales", wrapperClass: "col-span-12"},
    ];
  }
};
// Save widget order
const saveWidgetOrder = () => {
  localStorage.setItem("dashboardWidgets", JSON.stringify(widgets.value));
};
const componentMap = {
  TopWidgets,
  LowStockAlerts,
  PeakSaleHours,
  SalesByCategory,
  TopSellingProducts,
  StockLevels,
  StockDiscrepancies,
  InventoryTurnover,
  InventoryValue,
  ProfitMargins,
  PaymentMethod,
  LossProfitMargins,
  LatestSales,
};


</script>
<template>
<!--  -->
  <SaveTokenNotification/>
    <div class=" col-span-12" >
      <div class="col-span-12 mt-8 mb-2">
        <div class="flex items-center justify-between h-10 intro-y">
          <h1 class="mr-5 text-2xl font-semibold text-gray-800 truncate">{{greeting}}, {{ USER.name }}</h1>
          <div class="pl-2 flex justify-center items-center">
            <WidgetSetting @settings-changed="handleSettingsChanged"/>
            <div class="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500" :class="{ 'mr-2': locale === 'ar', '': locale !== 'ar' }">
              <Lucide icon="Calendar" class="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3" />
              <Litepicker v-model="dateRange" :options="{
                    autoApply: false, singleMode: false, numberOfColumns: 2,
                    numberOfMonths: 2, showWeekNumbers: true,
                    dropdowns: {
                      minYear: 1990,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                  }" class="pl-10  w-60 shadow-md"/>
          </div>
        </div>
      </div>
    </div>
    <draggable
        v-model="widgets"
        item-key="id"
        @end="saveWidgetOrder"
        :animation="200"
        :class="`grid grid-cols-12 gap-6 w-full`"
    >
      <template #item="{ element }">
        <div v-if="isVisible(element.id)" :class="`flex flex-col cursor-move ${element.wrapperClass}`">
          <component v-if="element.settings && Object.keys(element.settings).length"
                     :topWidgetSettings="element.settings"
                     :isVisible="isVisible"
                     :is="componentMap[element.component]"
                     :start_date="start_date"
                     :end_date="end_date"/>
          <component v-else
                     :is="componentMap[element.component]"
                     :start_date="start_date"
                     :end_date="end_date"/>
        </div>
      </template>
    </draggable>
  </div>
</template>
