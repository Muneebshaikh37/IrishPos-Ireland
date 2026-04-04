<script setup lang="ts">
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted, reactive } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import Lucide from "@/components/Base/Lucide";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
import CurrencyFormatter from "@/utils/currencyFormatter"
import {useAuthStore} from "@/stores/auth.js";

const props = defineProps({
  start_date: {
    type: String,
    required: true,
  },
  end_date: {
    type: String,
    required: true,
  }
});
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const ProductInventoryValue = ref();
const series = ref([]);
const labels = ref<string[]>([]);

const options: any = ref({
  chart: {
    toolbar: {
      show: false,
    },
    height: 450,
    type: 'pie',
    fontFamily: 'Inter, sans-serif',
    zoom: {
      enabled: false,
    },
  },

  dataLabels: {
    enabled: false,
    style: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      colors: ["#fff"]
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '0%'
      }
    }
  },
  tooltip: {
    enabled: true,
  },
  legend: {
    show: true,
    position: 'left',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    markers: {
      width: 8,
      height: 8,
      radius: 12,
      offsetX: -5
    },
    itemMargin: {
      horizontal: 15,
      vertical: 5
    },
    formatter: function (seriesName: string, opts: any) {
      const seriesValue = opts.w.globals.series[opts.seriesIndex];
      const maxLength = 20; // Set maximum length for labels
      const truncatedLabel = seriesName.length > maxLength
        ? seriesName.substring(0, maxLength) + '...'
        : seriesName;
      return `<span>${truncatedLabel}</span> <strong style="color: #7f7f7f;">${(seriesValue).toFixed(1)}</strong>`;
    }
  },
  colors: [
    '#4A3AFF', '#2D5BFF', '#93AAFD', '#8176f9',
    '#4A3AFF', '#2D5BFF', '#93AAFD', '#8176f9'
  ],
});
const updateChartData = (data: any[]) => {
  if (!data?.length) return;

  const newLabels = data.map(item => item.name_en);
  const newSeries = data.map(item => item.inventory_value);

  // chartLabels.value = newLabels;
  series.value = newSeries;
  options.labels = newLabels;
  console.log("ghdhdg", newLabels);
  options.value = {
    ...options,
    labels: newLabels
  }; // Update the labels in options
};
const isLoading = ref(false)
const isfetchProductInventoryValue = async () => {
  try {
    isLoading.value = true
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/v1/dashboard/product-inventory-value?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`)
    const result = handleResponse(response);
    if (result.success) {
      ProductInventoryValue.value = result.data.data;
      labels.value = ProductInventoryValue.value.map(item => item.name_en); // Using English labels
      series.value = ProductInventoryValue.value.map(item => item.inventory_value);
      // series.value = [result.data.total_cash, result.data.total_card];
      options.value = {
        ...options.value,
        labels: labels.value
      };
      // updateChartData(result.data.data);

    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isLoading.value = false
  }
}
watch([() => props.start_date, () => props.end_date], () => { isfetchProductInventoryValue(); });
onMounted(() => {
  isfetchProductInventoryValue();
})



const dummyData = {
  labels: ["Lighter", "Bakery", "Dairy", "Meat", "Fruits", "Vegetables"],
  series: [10, 20, 15, 25, 30, 40,],
};

// series: [30, 40,],
// labels: ["Data 1", "Data 2",],
// Use dummy data if no props are provided
// const labels =   dummyData.labels;
// const series =   dummyData.series;


</script>
<template>
  <div class="p-5 intro-y box h-full">
    <div class="mb-2">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">{{$t('dashboard.inventoryValue')}}</h4>
    </div>
    <div v-if="isLoading">
      <div class="animate-pulse  bg-slate-200 w-full h-56  rounded-lg"> </div>
    </div>
    <div v-else-if="ProductInventoryValue?.length > 0"> 
      <apexchart width="100%" height="auto" type="pie" :options="options" :series="series" />
    </div>
    <div v-else>
      <img :src="NotFoundIcon" class="w-[160px] mx-auto">
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{$t('dashboard.noDataAvailable')}}</h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">{{$t('dashboard.noDataDescription')}}</p>
      <div class="flex justify-center">
        <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
          @click="isfetchProductInventoryValue()">
          <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> {{$t('dashboard.refreshNow')}}
        </Button>
      </div>
    </div>
  </div>
</template>