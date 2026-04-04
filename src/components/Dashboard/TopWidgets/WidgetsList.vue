<script setup lang="ts">
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted } from "vue";
import profitGraphUrl from "@/assets/images/profit-graph.svg";
import inventoryUrl from "@/assets/images/inventory.svg";
import ReturnBoxUrl from "@/assets/images/return-box.svg";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import CurrencyFormatter from "../../../utils/currencyFormatter";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg";
import Button from "@/components/Base/Button";
import { useAuthStore } from "@/stores/auth.js";
import SalesReport from "../SalesTarget/index.vue";
import { log } from "console";

const props = defineProps({
  start_date: {
    type: String,
    required: true,
  },
  end_date: {
    type: String,
    required: true,
  },
  topWidgetSettings: {
    type: Array,
    required: true,
  },
  isVisible: {
    type: Function,
    required: true,
  },
});

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const TotalInventory = ref();
const AverageTransactionValue = ref();
const ProfitMargin = ref();
const ProfitLoss = ref()
const SalesReturn = ref();
const TotalSales = ref();
const COGS = ref();
const isLoading = ref(false);
const locale = ref("en"); // Default locale

// Function to fetch all data concurrently
const fetchInventoryData = async () => {
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/v1/dashboard/total-inventory-value?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`);
    TotalInventory.value = handleResponse(response).data;
  } catch (error) {
    console.error("Error fetching inventory data:", handleError(error));
  }
};

const fetchSalesData = async () => {
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/total-sale?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`
    );
    TotalSales.value = handleResponse(response).data;
  } catch (error) {
    console.error("Error fetching sales data:", handleError(error));
  }
};

const fetchAverageTransactionData = async () => {
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/average-transaction-value?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`
    );
    AverageTransactionValue.value = handleResponse(response).data;
  } catch (error) {
    console.error("Error fetching average transaction data:", handleError(error));
  }
};

const fetchSalesReturnData = async () => {
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/total-return?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`
    );
    SalesReturn.value = handleResponse(response).data;
  } catch (error) {
    console.error("Error fetching sales return data:", handleError(error));
  }
};

const fetchProfitData = async () => {
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_REPORTING}/v1/dashboard/total-profit?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`
    );
    ProfitMargin.value = handleResponse(response).data;
  } catch (error) {
    console.error("Error fetching profit data:", handleError(error));
  }
};

const fetchProfitLossData = async () => {
  try {
    isLoading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/profit-loss?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`);
    ProfitLoss.value = handleResponse(response).data;
  } catch (error) {
    console.error("Error fetching profit-loss data:", handleError(error));
  }
   finally {
    isLoading.value = false;}
};

const fetchCogsData = async () => {
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/cogs?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`
    );
    COGS.value = handleResponse(response).data;
  } catch (error) {
    console.error("Error fetching COGS data:", handleError(error));
  }
};

const fetchAllData = async () => {
  try {
    isLoading.value = true;

    // Run all API calls concurrently
    await Promise.all([
      fetchInventoryData(),
      fetchSalesData(),
      fetchAverageTransactionData(),
      fetchSalesReturnData(),
      fetchProfitData(),
      fetchProfitLossData(),
      fetchCogsData(),
    ]);
  } finally {
    isLoading.value = false;
  }
};


// Watch for changes in start_date and end_date
watch([() => props.start_date, () => props.end_date], () => {
  console.log("Date range changed:", props.start_date, props.end_date);
  fetchAllData();
});

// Fetch data on component mount
onMounted(() => {
  locale.value = localStorage.getItem("locale") || "en";
  fetchAllData();
});


</script>

<template>

  <div class="grid grid-cols-12 gap-4 auto-cols-auto"
    v-if="topWidgetSettings[0].value || topWidgetSettings[1].value || topWidgetSettings[2].value || topWidgetSettings[3].value || topWidgetSettings[4].value || topWidgetSettings[5].value || topWidgetSettings[6].value">

    <div class="col-span-12 md:col-span-6 intro-y mb-4 flex flex-col" v-if="topWidgetSettings[0].value">
      <div :class="[
        'relative zoom-in h-full',
        'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']'
      ]">
        <div class="p-5 box h-full" v-if="isLoading">
          <p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
        </div>
        <div class="p-5 box h-full" v-else-if="TotalSales">
          <div class="flex">
            <Lucide icon="ShoppingCart" class="w-[28px] h-[28px] text-primary" />
            <div :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
              <Tippy as="div" v-if="TotalSales.comparison > 0"
                class="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${TotalSales.comparison}%  ${$t('dashboard.higherThanLastMonth')}`">
                + {{ TotalSales.comparison }}%
                <Lucide icon="ChevronUp" class="w-4 h-4 ml-0.5" />
              </Tippy>
              <Tippy as="div" v-if="TotalSales.comparison == 0"
                class="cursor-pointer bg-gray-400 py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${TotalSales.comparison}% ${$t('dashboard.sameAsLastMonth')}`">
                {{ TotalSales.comparison }}%
                <div class="ml-1"></div>
              </Tippy>
              <Tippy as="div" v-if="TotalSales.comparison < 0"
                class="cursor-pointer bg-danger py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${TotalSales.comparison}% ${$t('dashboard.lowerThanLastMonth')}`">
                {{ TotalSales.comparison }}%
                <Lucide icon="ChevronDown" class="w-4 h-4 ml-0.5" />
              </Tippy>
            </div>
          </div>
          <div class="mt-6 text-3xl font-medium leading-8">
            {{ CurrencyFormatter(Number(TotalSales.total_sales)) }}
          </div>
          <div class="mt-1 text-base text-slate-500">{{ $t('dashboard.totalSales') }}</div>
        </div>
        <div class="px-5 py-3 intro-y box h-full flex items-center justify-center" v-else>
          <div>
            <img :src="NotFoundIcon" class="w-[100px] mx-auto">
            <h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">
              {{ $t('dashboard.noDataAvailable') }}</h3>
            <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
              @click="fetchSalesData()">
              <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
              {{ $t('dashboard.refreshNow') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 md:col-span-6 intro-y mb-4 flex flex-col" v-if="topWidgetSettings[1].value">
      <div :class="[
        'relative zoom-in h-full',
        'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']'
      ]">
        <div class="p-5 box h-full" v-if="isLoading">
          <p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
        </div>
        <div class="p-5 box h-full" v-else-if="AverageTransactionValue">
          <div class="flex">
            <Lucide icon="CreditCard" class="w-[28px] h-[28px] text-primary" />
            <div :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
              <Tippy as="div" v-if="AverageTransactionValue.average_transaction_comparison > 0"
                class="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${AverageTransactionValue.average_transaction_comparison}% ${$t('dashboard.higherThanLastMonth')}`">
                + {{ AverageTransactionValue.average_transaction_comparison }}%
                <Lucide icon="ChevronUp" class="w-4 h-4 ml-0.5" />
              </Tippy>
              <Tippy as="div" v-if="AverageTransactionValue.average_transaction_comparison == 0"
                class="cursor-pointer bg-gray-400 py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${AverageTransactionValue.average_transaction_comparison} ${$t('dashboard.sameAsLastMonth')}`">
                {{ AverageTransactionValue.average_transaction_comparison }}%
                <div class="ml-1"></div>
              </Tippy>
              <Tippy as="div" v-if="AverageTransactionValue.average_transaction_comparison < 0"
                class="cursor-pointer bg-danger py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${AverageTransactionValue.average_transaction_comparison}% ${$t('dashboard.lowerThanLastMonth')}`">
                {{ AverageTransactionValue.average_transaction_comparison }}%
                <Lucide icon="ChevronDown" class="w-4 h-4 ml-0.5" />
              </Tippy>
            </div>
          </div>
          <div class="mt-6 text-3xl font-medium leading-8">
            {{ CurrencyFormatter(Number(AverageTransactionValue.average_transaction_value)) }}
          </div>
          <div class="mt-1 text-base text-slate-500">{{ $t('dashboard.averageTransactionValue') }}</div>
        </div>
        <div class="px-5 py-3 intro-y box h-full flex items-center justify-center" v-else>
          <div>
            <img :src="NotFoundIcon" class="w-[100px] mx-auto">
            <h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">{{ $t('dashboard.noDataAvailable') }}
            </h3>
            <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
              @click="fetchAverageTransactionData()">
              <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
              {{ $t('dashboard.refreshNow') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 md:col-span-6 intro-y mb-4 flex flex-col" v-if="topWidgetSettings[2].value">
      <div :class="[
        'relative zoom-in h-full',
        'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']'
      ]">
        <div class="p-5 box h-full" v-if="isLoading">
          <p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
        </div>
        <div class="p-5 box h-full" v-else-if="COGS && COGS.total_cogs !== undefined">
          <div class="flex">
            <img :src="inventoryUrl" alt="" class="w-[24px]" />
          </div>
          <div class="mt-6 text-3xl font-medium leading-8">
            {{ CurrencyFormatter(Number(COGS.total_cogs)) }}
          </div>
          <div class="mt-1 text-base text-slate-500">{{ $t('dashboard.COGS') }}</div>
        </div>
        <div class="px-5 py-3 intro-y box h-full flex items-center justify-center" v-else>
          <div>
            <img :src="NotFoundIcon" class="w-[100px] mx-auto">
            <h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">{{ $t('dashboard.noDataAvailable') }}
            </h3>
            <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
              @click="fetchCogsData()">
              <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
              {{ $t('dashboard.refreshNow') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-12 md:col-span-6 intro-y mb-4 flex flex-col" v-if="topWidgetSettings[3].value">
      <div :class="[
        'relative zoom-in h-full',
        'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']'
      ]">
        <div class="p-5 box h-full" v-if="isLoading">
          <p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
        </div>
        <div class="p-5 box h-full" v-else-if="TotalInventory">
          <div class="flex">
            <img :src="inventoryUrl" alt="" class="w-[24px]" />
          </div>
          <div class="mt-6 text-3xl font-medium leading-8">
            {{ CurrencyFormatter(Number(TotalInventory.total_inventory_value)) }}
          </div>
          <div class="mt-1 text-base text-slate-500">{{ $t('dashboard.inventoryValue') }}</div>
        </div>
        <div class="px-5 py-3 intro-y box h-full flex items-center justify-center" v-else>
          <div>
            <img :src="NotFoundIcon" class="w-[100px] mx-auto">
            <h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">{{ $t('dashboard.noDataAvailable') }}
            </h3>
            <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
              @click="fetchInventoryData()">
              <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
              {{ $t('dashboard.refreshNow') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-12 md:col-span-6 intro-y mb-4 flex flex-col" v-if="topWidgetSettings[4].value">
      <div :class="[
        'relative zoom-in h-full',
        'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']'
      ]">
        <div class="p-5 box h-full" v-if="isLoading">
          <p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
        </div>
        <div class="p-5 box h-full" v-else-if="SalesReturn">
          <div class="flex">
            <img :src="ReturnBoxUrl" alt="" class="w-[28px]" />
            <div :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
              <Tippy as="div" v-if="SalesReturn.return_comparison > 0"
                class="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${SalesReturn.return_comparison}% ${$t('dashboard.higherThanLastMonth')}`">
                + {{ SalesReturn.return_comparison }}%
                <Lucide icon="ChevronUp" class="w-4 h-4 ml-0.5" />
              </Tippy>
              <Tippy as="div" v-if="SalesReturn.return_comparison == 0"
                class="cursor-pointer bg-gray-400 py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${SalesReturn.return_comparison}% ${$t('dashboard.sameAsLastMonth')}`">
                {{ SalesReturn.return_comparison }}%
                <div class="ml-1"></div>
              </Tippy>
              <Tippy as="div" v-if="SalesReturn.return_comparison < 0"
                class="cursor-pointer bg-danger py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                :content="`${SalesReturn.return_comparison}% ${$t('dashboard.lowerThanLastMonth')}`">
                {{ SalesReturn.return_comparison }}%
                <Lucide icon="ChevronDown" class="w-4 h-4 ml-0.5" />
              </Tippy>
            </div>
          </div>
          <div class="mt-6 text-3xl font-medium leading-8">
            {{ CurrencyFormatter(Number(SalesReturn.total_returns)) }}
          </div>
          <div class="mt-1 text-base text-slate-500">{{ $t('dashboard.salesReturn') }}</div>
        </div>
        <div class="px-5 py-3 intro-y box h-full flex items-center justify-center" v-else>
          <div>
            <img :src="NotFoundIcon" class="w-[100px] mx-auto">
            <h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">{{ $t('dashboard.noDataAvailable') }}
            </h3>
            <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
              @click="fetchSalesReturnData()">
              <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
              {{ $t('dashboard.refreshNow') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 md:col-span-12 intro-y mb-4 flex flex-col " v-if="topWidgetSettings[5].value">
      <div :class="[
        'relative zoom-in h-full',
        'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']',
      ]">
        <div class="p-5 box h-full" v-if="isLoading">
          <p class="animate-pulse  bg-slate-200 w-full h-24 rounded-lg"></p>
        </div>
        <div class="p-5 box  h-full" v-else-if="ProfitLoss">
          <div class="flex">
            <img :src="profitGraphUrl" alt="" class="w-[28px]" />

          </div>
          <div class="grid grid-cols-12 gap-4 auto-cols-auto">
            <div class="col-span-6">
              <RouterLink to="/reporting/sales/product-profit">
              <div class="mt-6 text-3xl font-medium leading-8"> {{
                CurrencyFormatter(Number(ProfitLoss.current_total_profit).toFixed(0)) }}</div>
              <div class="mt-1 text-base text-slate-500">
                {{ $t('dashboard.TotalProfitMargin') }}
              </div>
              </RouterLink>
            </div>
            <div class="col-span-6">
              <div class="mt-6 text-3xl font-medium leading-8"> {{
                CurrencyFormatter(Number(ProfitLoss.current_total_loss).toFixed(0)) }}</div>
              <div class="mt-1 text-base text-slate-500">
                {{ $t('dashboard.TotalLoss') }}
              </div>
            </div>

          </div>
        </div>
        <div class="px-5 py-3 intro-y box  h-full flex items-center justify-center" v-else>
          <div>
            <img :src="NotFoundIcon" class="w-[100px] mx-auto">
            <h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">No data available</h3>
            <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
            @click="fetchProfitLossData()">
              <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> Refresh Now
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 intro-y mb-4 flex flex-col">
      <SalesReport :start_date="props.start_date" :end_date="props.end_date" />
    </div>
  </div>
</template>
