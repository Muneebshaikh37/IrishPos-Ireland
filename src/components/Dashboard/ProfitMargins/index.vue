<script setup lang="ts">
import VueApexCharts from "vue3-apexcharts";
import Lucide from "@/components/Base/Lucide";
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
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
const ProfitMargins = ref();
const series = ref([]); // Default values
const labels = ref([]); // Fixed labels 
const colors = ref([]);

const options: any = ref({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: false
    },
    FontFamily: 'Public Sans, sans-serif',
    zoom: {
      enabled: false,
    },
  },
  legend: {
    show: false,
    showForSingleSeries: true,
    showForNullSeries: true,
    showForZeroSeries: true,
    position: 'bottom',
    horizontalAlign: 'center',
    floating: false,
    FontFamily: 'Public Sans, sans-serif',
    fontSize: '16px',
    colors: ["#000"],
    fontWeight: 400,
    formatter: undefined,
    inverseOrder: false,
    width: undefined,
    height: undefined,
    tooltipHoverFormatter: undefined,
    customLegendItems: [],
    offsetX: 0,
    offsetY: 0,

    labels: {
      colors: undefined,
      useSeriesColors: false
    },
    markers: {
      width: 12,
      height: 12,
      strokeWidth: 0,
      strokeColor: '#fff',
      fillColors: undefined,
      radius: 12,
      customHTML: undefined,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0
    },
    itemMargin: {
      horizontal: 5,
      vertical: 0
    },
    onItemClick: {
      toggleDataSeries: true
    },
    onItemHover: {
      highlightDataSeries: true
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
      colors: {
        ranges: [], // This will be dynamically updated
      },
    },
  },


  dataLabels: {
    formatter: (val) => {
      return val / 1000 + 'K';
    },
  },
  tooltip: {
    enabled: true,
    marker: {
      show: false,
    },
    shared: false,
    intersect: false,
    x: {
      show: false,
      formatter: undefined,
    },
    y: {
      formatter: function (value) {
        return   CurrencyFormatter((value).toFixed(1));
      },
    },
  },
  grid: {
    padding: {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
    },
    show: false,
    borderColor: '#f4f4f4',
    strokeDashArray: 0,
    position: 'back',
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    },
    row: {
      colors: undefined,
      opacity: 0.5,
    },
    column: {
      colors: undefined,
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: [],
    labels: {
      formatter: (val) => {
        return val / 1000 + 'K';
      },
    },
  },
  // Base color to apply gradient
});
const calculateColorRanges = (profits) => {
  if (!profits.length) return [];

  const minProfit = Math.min(...profits);
  const maxProfit = Math.max(...profits);
  const range = maxProfit - minProfit;

  // Define thresholds for color ranges
  const thresholds = {
    green: minProfit + range * 0.25,
    yellow: minProfit + range * 0.5,
    red: minProfit + range * 0.75,
  };

  return [
    {
      from: minProfit,
      to: thresholds.green,
      color: "#8176f9", // Light Blue
    },
    {
      from: thresholds.green + 1,
      to: thresholds.yellow,
      color: "#93AAFD", // Medium Blue
    },
    {
      from: thresholds.yellow + 1,
      to: thresholds.red,
      color: "#2D5BFF", // Dark Blue
    },
    {
      from: thresholds.red + 1,
      to: maxProfit,
      color: "#4A3AFF", // Purple
    }
  ];
};

const updateChartData = (data) => { 
  if (!data || !Array.isArray(data)) return;

  // Transform data
  const transformedData = data.map((item) => ({
    name: item.name_en,
    profit: parseFloat(item.profit) || 0,
  }));

  const newLabels = transformedData.map((item) => item.name);
  const newData = transformedData.map((item) => item.profit);
 

  // Compute color ranges
  const newColorRanges = calculateColorRanges(newData);

  // **Check the number of bars** - Disable DataLabels if too many
  const shouldShowDataLabels = newData.length <= 10; // Enable only if <=10 bars

  // Update chart options
  options.value = {
    ...options.value,
    xaxis: {
      ...options.value.xaxis,
      categories: newLabels,
    },
    plotOptions: {
      ...options.value.plotOptions,
      bar: {
        ...options.value.plotOptions.bar,
        colors: {
          ranges: newColorRanges,
        },
      },
    },
    dataLabels: {
      enabled: shouldShowDataLabels, // **Dynamically enable/disable**
      formatter: (val) => {
        return val / 1000 + 'K';
      },
    },
  };

  // Assign updated data to series
  series.value = [{ name: "Profits", data: newData }]; 
};
 

// Loading state
const isLoading = ref(false); 
// Fetch Profit Margins
const isfetchProfitMargins = async () => {
  try {
    isLoading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_REPORTING}/v1/dashboard/product-profit-loss?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`);

    const result = handleResponse(response);
    if (result.status === 200) { 
      ProfitMargins.value = result.data;  
      updateChartData(result.data);
    } else {
      console.error("Invalid API Response:", result);
    }
  } catch (error) {
    console.error("Error fetching profit margins:", handleError(error));
  } finally {
    isLoading.value = false;
  }
};
 
watch([() => props.start_date, () => props.end_date], () => { isfetchProfitMargins();   });
onMounted(() => {
  isfetchProfitMargins(); 
})
 

</script>

<template>
  <div class="p-5 intro-y box h-full">
    <h4 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('dashboard.TotalProfitMargin') }}</h4>
    <div v-if="isLoading">
      <div class="animate-pulse  bg-slate-200 w-full h-56  rounded-lg"> </div>
    </div>
    <div v-else-if="ProfitMargins"> 
      <apexchart type="bar" width="100%" height="450" :options="options" :series="series" />
    </div>
    <div v-else>
      <img :src="NotFoundIcon" class="w-[160px] mx-auto">
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">No data available</h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">There is no available data to show</p>
      <div class="flex justify-center">
        <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
          @click="isfetchProfitMargins()">
          <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> Refresh Now
        </Button>
      </div>
    </div>
  </div>
</template>
