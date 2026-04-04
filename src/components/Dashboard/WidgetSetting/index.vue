<script setup lang="ts">
import { Slideover } from "@/components/Base/Headless";
import { FormInput, FormLabel, FormSwitch } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { ref, watch, onMounted } from "vue";
import draggable from 'vuedraggable';
const meals = ref([
  'Hamburger',
  'Pizza',
  'Spaghetti',
  'Tacos',
  'Teriyaki Chicken',
]);


const isSideOver = ref(false);
const OpenSideOver = () => { isSideOver.value = true; };
const CloseSideOver = () => { isSideOver.value = false; };
const options = ref([
  { id: 1, label: "Total Sales", value: true },
  { id: 2, label: "Average Transaction Value", value: true },
  { id: 3, label: "COGS", value: true },
  { id: 4, label: "Inventory Value", value: true },
  { id: 5, label: "Sales Return", value: true },
  { id: 19, label: "Profit Margin", value: true },
  { id: 6, label: "Low Stock Alerts", value: true },
  { id: 7, label: "Peak Sale Hours", value: true },
  { id: 8, label: "Sales by Category", value: true },
  { id: 9, label: "Top Selling Products", value: true },
  { id: 10, label: "Stock Levels", value: true },
  { id: 11, label: "Stock Discrepancies", value: true },
  { id: 12, label: "Inventory Turnover", value: true },
  { id: 13, label: "Inventory Value chart", value: true },
  { id: 14, label: "Profit Margins Chart", value: true },
  { id: 15, label: "Payment Method", value: true },
  { id: 16, label: "Total Loss", value: true },
  { id: 17, label: "Latest Sales", value: true },
  { id: 18, label: "Sale Target", value: true },

]);
onMounted(() => {
  const savedOptions = localStorage.getItem("settings");
  if (savedOptions) {
    options.value = JSON.parse(savedOptions);
  }
});
watch(
  options,
  (newValue) => {
    localStorage.setItem("settings", JSON.stringify(newValue));
    // Emit the change event with new values
    emit('settingsChanged', newValue);
  },
  { deep: true }
);
const emit = defineEmits(['settingsChanged']);
</script>
<template>

  <div class="mr-2.5" @click="OpenSideOver">
    <span class="flex cursor-pointer justify-center items-center shadow-md w-10 h-9 p-1 bg-white rounded-md">
      <Lucide icon="SlidersHorizontal" class="w-5 h-5" />
    </span>
  </div>
  <div>
    <Slideover :open="isSideOver" @close="CloseSideOver">
      <Slideover.Panel>
        <a class="absolute cursor-pointer inset-y-0 left-0 right-auto my-auto -ml-[60px] flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-white/5 text-white/90 transition-all hover:rotate-180 hover:scale-105 hover:bg-white/10 focus:outline-none sm:-ml-[105px] sm:h-14 sm:w-14"
          @click="CloseSideOver">
          <Lucide class="h-3 w-3 stroke-[1] sm:h-8 sm:w-8" icon="X" />
        </a>
        <Slideover.Description class="p-0">
          <div class="p-10">
            <h3 class="text-2xl text-center font-bold mb-2">Widget Setting</h3>
            <div class="py-6">
              <div class="w-full flex justify-between border-dashed border-b-2 border-gray-300 pb-4 mb-4"
                v-for="(option, index) in options" :key="index">
                <FormSwitch.Label :htmlFor="option.id" class="text-gray-700 text-base font-medium">
                  {{ option.label }}
                </FormSwitch.Label>
                <FormSwitch.Input :id="option.id" v-model="option.value" class="ml-3 mr-0" type="checkbox" />
              </div>
            </div>
          </div>
        </Slideover.Description>
      </Slideover.Panel>
    </Slideover>
  </div>
</template>
