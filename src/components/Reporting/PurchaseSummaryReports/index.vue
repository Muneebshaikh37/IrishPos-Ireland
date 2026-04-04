<script setup lang="ts">
import httpClient from "@/network/api/httpClient";
import { onMounted, ref, watch } from "vue";
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
const PurchaseSummaryReport = ref();
const saleLabels = ref()
const selectedTab: any = ref('day');
const labels = ref<string[]>([]); // Labels for x-axis
const series = ref<any[]>([]); // Series for y-axis
const isLoading = ref(false)
const showChart = ref(true)
const toggleView = () => {
  showChart.value = !showChart.value
}
const updateChartData = (data: any) => {
  if (!data?.periods) return;

  const newLabels = data.periods;
  const newData = data.total_sales;
 

  labels.value = newLabels;
  series.value = [{
    name: "Profits",
    data: newData
  }]; 

  options.value = {
    ...options.value,
    xaxis: {
      ...options.value.xaxis,
      categories: newLabels
    },
    

  };
};
const isfetchPurchaseSummaryReport: any = async (tab = "day") => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/reporting/purchase?interval=${tab}&user_id=${USER_ID}`)
		const result = handleResponse(response);
		if (result.success) {
			PurchaseSummaryReport.value = result.data
			updateChartData(result.data)
			selectedTab.value = tab; 
			 
		}
	} catch (error) {
		const result = handleError(error);
	} finally {
		isLoading.value = false
	}
}
watch([() => props.start_date, () => props.end_date], () => { isfetchPurchaseSummaryReport(); });
onMounted(() => {
	isfetchPurchaseSummaryReport() 
})
const options = ref({
	chart: {
		id: 'chart',
		toolbar: {
			show: false
		},
		height: 450,
		type: 'line',
		FontFamily: 'Public Sans, sans-serif',
		zoom: {
			enabled: false,
		},
	},
	forecastDataPoints: {
		count: 0
	},
	markers: {
		size: [6],
	},
	stroke: {
		width: 3,
		curve: 'straight',
		toolbar: {
			show: true,
		}
	},
	colors: ['#169B62', '#b2b2b2'],
	fill: {
		type: 'solid',
		opacity: '0.85',
		gradient: {
			shade: 'dark',
			type: "vertical",
			invertColors: 'true',
			shadeIntensity: '0.5',
			opacityFrom: '1.0',
			opacityTo: '1.0',
			stops: [0, 100]
		}
	},
	grid: {
		padding: {
			top: 30,
			bottom: 30,
			left: 30,
			right: 30,
		},
		show: true,
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
			borderRadius: 6,
			columnWidth: '80%',
			dataLabels: {
				position: 'top',
			},
		}
	},
	dataLabels: {
		enabled: false,
		formatter: function (val) {
			return CurrencyFormatter((val).toFixed(1));
		},
		offsetY: 10,
		style: {
			fontSize: '11px',
			colors: ["#169B62"],
		},
		background: {
			borderRadius: '3',
			padding: '5',
			borderWidth: '0',
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
				return CurrencyFormatter((value).toFixed(1));
			},
		},
	},
	xaxis: {
		categories: labels.value,
		style: {
			FontFamily: 'Public Sans, sans-serif',
			fontSize: '12px',
			fontWeight: 400,
		},
		labels: {
			style: {
				colors: ["#989898", "#989898", "#989898", "#989898", "#989898", "#989898", "#989898", "#989898", "#989898", "#989898", "#989898", "#989898",],
			}
		},
		position: 'bottom',
		axisBorder: {
			show: false
		},
		axisTicks: {
			show: false
		},
		crosshairs: {
			fill: {
				type: 'gradient',
				gradient: {
					colorFrom: '#D8E3F0',
					colorTo: '#BED1E6',
					stops: [0, 100],
					opacityFrom: 0.4,
					opacityTo: 0.5,
				}
			}
		},
	},
	yaxis: {
		type: 'numeric',
		tickAmount: 3,
		axisBorder: {
			show: false
		},
		axisTicks: {
			show: false,
		},
		labels: {
			show: true,
			style: {
				FontFamily: 'Public Sans, sans-serif',
				fontSize: '13px',
				fontWeight: 400,
				colors: ["#989898"],
			},
			formatter: function (val) {
				return CurrencyFormatter((val).toFixed(1));
			}
		}

	},
}); 
</script>

<template>
  <div class="p-5 box h-full">
    <div class="">
    </div>
    <div class="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h4 class="text-lg font-semibold text-gray-800">{{ $t('reporting.PurchaseSummaryReport') }}</h4>
      </div>
      <div class="flex items-center gap-3">
        <div class="tabs bg-[#F8F8FF] rounded-lg">
          <button v-for="tab in ['day', 'week', 'month']" :key="tab" :class="{ 'active-tab': selectedTab === tab }"
                  @click="isfetchPurchaseSummaryReport(tab)">
            {{ $t(`reporting.tabs.${tab}`) }}
          </button>
        </div>
        <Button 
          v-if="PurchaseSummaryReport?.periods?.length > 0 && PurchaseSummaryReport?.total_sales?.length > 0"
          variant="outline-secondary" 
          class="flex items-center justify-center toggle-view-btn"
          style="height: 34px; padding: 7px 18px; margin: 0;"
          @click="toggleView"
        >
          <Lucide :icon="showChart ? 'List' : 'Activity'" class="w-4 h-4 mr-2" />
          {{ showChart ? 'Show Table' : 'Show Chart' }}
        </Button>
      </div>
    </div>
    <div class="" v-if="isLoading">
      <div class="animate-pulse bg-slate-200 w-full h-56 rounded-lg"></div>
    </div>

    <div v-else-if="PurchaseSummaryReport?.periods?.length > 0 && PurchaseSummaryReport?.total_sales?.length > 0">
      <apexchart v-if="showChart" id="chart" width="100%" height="450" type="line" :options="options" :series="series" />
      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="text-left py-3 px-4 font-semibold text-gray-700">Period</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-700">Total Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(period, index) in PurchaseSummaryReport.periods" :key="index" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4 text-gray-800">{{ period }}</td>
              <td class="py-3 px-4 text-right font-medium text-gray-800">{{ CurrencyFormatter(parseFloat(PurchaseSummaryReport.total_sales[index]).toFixed(2)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <img :src="NotFoundIcon" class="w-[160px] mx-auto">
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{ $t('dashboard.noDataAvailable') }}</h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">{{ $t('dashboard.noDataDescription') }}</p>
      <div class="flex justify-center">
        <Button variant="outline-secondary"
                class="flex items-center hov-end hover:text-gray-700 justify-center mx-auto w-40 py-2"
                @click="isfetchPurchaseSummaryReport()">
          <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" /> {{ $t('dashboard.refreshNow') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs {
	display: flex;
	justify-content: center;
	margin-bottom: 0;
}

button {
	margin: 6px 6px;
	padding: 7px 18px;

	cursor: pointer;
	border-radius: 10px !important;
	font-weight: 400;
	font-size: 14px;
	text-transform: capitalize;
}

button.active-tab {
	background-color: #169B62;
	color: #fff;
}

.hov-end:hover {
	color: #738192 !important;
}

button:hover {
	background-color: #169B62;
	color: #fff;
}
.toggle-view-btn:hover {
  background-color: #169B62 !important;
  color: #fff !important;
  border-color: #169B62 !important;
}
</style>
