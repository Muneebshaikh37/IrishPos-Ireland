<script setup lang="ts">

import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import Lucide from "@/components/Base/Lucide";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
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
const TopSellingProducts = ref();
const series = ref([]); // Default values
const labels = ref([]); // Fixed labels 
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
    // formatter: function (val: any) {
    //     return val.toFixed(2) + '%';
    // },
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
    marker: {
      show: false,
    },
    // y: {
    //     formatter: function (value: any) {
    //         return value.toFixed(2) + '%';
    //     },
    // },
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
      return `<span>${truncatedLabel}</span> <strong style="color: #7f7f7f;">${seriesValue}</strong>`;
    }
  },
  colors: [
    '#4A3AFF', // Deep blue
    '#2D5BFF', // Bright blue
    '#93AAFD', // Light blue
    '#8176f9', // Very light blue
    '#4A3AFF', // Deep blue (repeated for additional items)
    '#2D5BFF',
    '#93AAFD',
    '#8176f9',
    '#93AAFD',
    '#8176f9'
  ],

  subtitle: {

    align: 'left',
    style: {
      fontSize: '14px',
      fontWeight: 'normal',
      fontFamily: 'Inter, sans-serif',
      color: '#666'
    }
  }
});
const isLoading = ref(false)
const isfetchTopSellingProducts = async () => {
  try {
    isLoading.value = true
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_REPORTING}/v1/dashboard/top-selling-product?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`)
    const result = handleResponse(response);
    if (result.success) {
      TopSellingProducts.value = result.data;
      labels.value = result.data.label_en; // Using English labels
      series.value = result.data.total_revenue.map((revenue) => parseFloat(revenue));
      // series.value = [result.data.total_cash, result.data.total_card];
      options.value = {
        ...options.value,
        labels: labels.value
      };
    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isLoading.value = false
  }
}
watch([() => props.start_date, () => props.end_date], () => { isfetchTopSellingProducts(); });
onMounted(() => {
  isfetchTopSellingProducts();
})


</script>
<template>
  <div class="p-5 box h-full">
    <div class="mb-2">
      <h4 class="text-lg font-semibold text-gray-800 mb-5">{{ $t('dashboard.topSellingProducts') }}</h4>
    </div>
    <div v-if="isLoading">
      <div class="animate-pulse bg-slate-200 w-full h-56 rounded-lg"> </div>
    </div>
    <div v-else-if="TopSellingProducts?.label_en.length > 0 && TopSellingProducts?.total_revenue.length > 0">
      <apexchart width="100%" height="auto" type="pie" :options="options" :series="series" />
    </div>
    <div class="w-full" v-else>
      <div>
        <img :src="NotFoundIcon" class="w-[160px] mx-auto">
        <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{ $t('dashboard.noDataAvailable') }}</h3>
        <p class="text-base text-gray-400 font-normal pb-4 text-center">{{ $t('dashboard.noDataDescription') }}</p>
        <div class="flex justify-center">
          <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2 "
                  @click="isfetchTopSellingProducts()">
            <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" /> {{ $t('dashboard.refreshNow') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>