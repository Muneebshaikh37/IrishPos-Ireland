<script setup lang="ts">

import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted, reactive } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import Lucide from "@/components/Base/Lucide";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
import CurrencyFormatter from "@/utils/currencyFormatter"
import {useAuthStore} from "@/stores/auth.js"; 
import Litepicker from "@/components/Base/Litepicker";

const props = defineProps({
	start_date: {
		type: String,
		required: false,
	},
	end_date: {
		type: String,
		required: false,
	}
});
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const SalesPerformanceByServices = ref();

const series = ref([]);
const labels = ref<string[]>([]); 
const options = ref({
	chart: {
		toolbar: {
			show: true
		},
		height: 400,
		type: 'bar',
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
		itemMargin: {
			horizontal: 0,
			vertical: 0,
		},
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
		categories: [],
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

const updateChartData = (data: any) => {
	if (!Array.isArray(data)) return;
 
  // ApexCharts expects categories + series data to be non-undefined arrays.
  // If backend fields are missing, fall back to safe defaults to avoid runtime crashes.
  const salesData = data.map((item: any) => Number(item.sales_revenue) || 0);
  const xCategories = data.map((item: any) => (item.name_en ?? item.product_name ?? '').toString());
  
  labels.value = xCategories;
  series.value = [{
    name: "Sales Revenue",
    data: salesData
  }];

	options.value = {
		...options.value,
		xaxis: {
			...options.value.xaxis,
			categories: xCategories
		}
	};
};
const isLoading = ref(false)
const showChart = ref(true)
const toggleView = () => {
  showChart.value = !showChart.value
}
const locale = ref(localStorage.getItem('locale') || 'en');
const isfetchSalesPerformanceByServices = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_REPORTING}/v1/reporting/sales-performance-by-service?user_id=${USER_ID}&start_date=${start_date.value}&end_date=${end_date.value}`)
		const result = handleResponse(response);
		if (result.success) {
			SalesPerformanceByServices.value = result.data;
			console.log("result.data", result.data)
			updateChartData(result.data); 
		}
	} catch (error) {
		const result = handleError(error);
	} finally {
		isLoading.value = false
	}
}
const dateRange = ref('1 Jan, 2025 - 31 Jan, 2025');
const start_date = ref('');
const end_date = ref('');

const parseDate = (dateStr : any) => {
  // Parse the date string into a Date object
  const date = new Date(dateStr);


  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  // Format the date as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
watch(dateRange, (newValue) => {
  try {
    if (newValue) {
      const [start, end] = newValue.split(' - ');
      start_date.value = parseDate(start.trim());
      end_date.value = parseDate(end.trim());
      console.log('start_date:', start_date.value);
      console.log('end_date:', end_date.value);
    }
  } catch (error) {
    console.error('Error converting date:', error.message);
  }
});
watch([() =>  start_date.value, () => end_date.value], () => { isfetchSalesPerformanceByServices(); });

onMounted(() => {
	isfetchSalesPerformanceByServices();
})





</script>

<template>
	<div class="p-5 intro-y box h-full">
		<div class="mb-2 flex justify-between items-center">
			<h4 class="text-lg font-semibold text-gray-800 mb-6">{{$t('reporting.SalesPerformanceByServices')}}</h4>
			<div class="flex items-center gap-3">
				<div class="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500 flex items-center">
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
	          <Button 
	            v-if="SalesPerformanceByServices?.length > 0"
	            variant="outline-secondary" 
	            class="flex items-center justify-center toggle-view-btn"
	            style="height: 34px; padding: 7px 18px; margin: 0;"
	            @click="toggleView"
	          >
	            <Lucide :icon="showChart ? 'List' : 'BarChart'" class="w-4 h-4 mr-2" />
	            {{ showChart ? 'Show Table' : 'Show Chart' }}
	          </Button>
			</div>
		</div>
		<div v-if="isLoading">
			<div class="animate-pulse  bg-slate-200 w-full h-56  rounded-lg"> </div>
		</div>
		<div v-else-if="SalesPerformanceByServices?.length > 0 " > 
			<apexchart v-if="showChart && series?.length > 0" width="100%" height="344" type="bar" :options="options" :series="series" />
			<div v-else class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="bg-gray-50 border-b">
							<th class="text-left py-3 px-4 font-semibold text-gray-700">Service Name</th>
							<th class="text-right py-3 px-4 font-semibold text-gray-700">Sales Revenue</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, index) in SalesPerformanceByServices" :key="index" class="border-b hover:bg-gray-50">
							<td class="py-3 px-4 text-gray-800">{{ item.name_en }}</td>
							<td class="py-3 px-4 text-right font-medium text-gray-800">{{ CurrencyFormatter(parseFloat(item.sales_revenue).toFixed(2)) }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div v-else>
			<img :src="NotFoundIcon" class="w-[160px] mx-auto">
			<h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{$t('dashboard.noDataAvailable')}}</h3>
			<p class="text-base text-gray-400 font-normal pb-4 text-center">{{$t('dashboard.noDataDescription')}}</p>
			<div class="flex justify-center">
				<Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
					@click="isfetchSalesPerformanceByServices()">
					<Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> {{$t('dashboard.refreshNow')}}
				</Button>
			</div>
		</div>
		 
	</div>
</template>

<style scoped>
.toggle-view-btn:hover {
  background-color: #169B62 !important;
  color: #fff !important;
  border-color: #169B62 !important;
}
</style>

