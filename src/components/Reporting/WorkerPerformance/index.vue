<script setup lang="ts">

import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted, reactive } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import Lucide from "@/components/Base/Lucide";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
import {useAuthStore} from "@/stores/auth.js";
import Litepicker from "@/components/Base/Litepicker";
import {useI18n} from "vue-i18n";

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
const {t, locale} = useI18n();

const WorkerPerformance = ref();
const sortedWorkerData = ref<any[]>([]); // Store sorted data for tooltip access

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
	colors: ['#169B62'],
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
			columnWidth: '70%',
			dataLabels: {
				position: 'top',
			},
			distributed: true, // Enable different colors for each bar
		}
	},
	dataLabels: {
		enabled: true,
		formatter: function (val: any) {
			// Format as integer for job counts
			if (typeof val === 'number') {
				return Math.round(val).toString();
			}
			return String(val || '0');
		},
		offsetY: -20,
		style: {
			fontSize: '12px',
			fontWeight: 600,
			colors: ["#fff"],
		},
		background: {
			enabled: false,
		},
	},
	tooltip: {
		enabled: true,
		marker: {
			show: true,
		},
		shared: false,
		intersect: true,
		theme: 'dark',
		style: {
			fontSize: '12px',
			fontFamily: 'Public Sans, sans-serif',
		},
		custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
			// Get worker name from stored sorted data or chart config
			const workerData = sortedWorkerData.value[dataPointIndex];
			const workerName = workerData?.worker_name
				|| workerData?.name
				|| workerData?.name_en
				|| workerData?.employee_name
				|| w.config.xaxis?.categories?.[dataPointIndex]
				|| w.globals.categoryLabels?.[dataPointIndex]
				|| 'Unknown Worker';
			const jobsCompleted = series[seriesIndex]?.[dataPointIndex] || 0;
			const jobsCompletedLabel = locale.value === 'ar' ? 'الوظائف المكتملة:' : 'Jobs Completed:';
			return `
				<div class="px-3 py-2">
					<div class="text-white font-semibold mb-1">${workerName}</div>
					<div class="text-gray-300">
						<span class="font-medium">${jobsCompletedLabel}</span>
						<span class="text-white font-bold">${Math.round(jobsCompleted)}</span>
					</div>
				</div>
			`;
		},
		x: {
			show: false,
		},
		y: {
			formatter: function (value: any) {
				// Format as integer for job counts
				if (typeof value === 'number') {
					return Math.round(value).toString();
				}
				return String(value || '0');
			},
		},
	},
		xaxis: {
		categories: [],
		title: {
			text: '',
			style: {
				fontFamily: 'Public Sans, sans-serif',
				fontSize: '14px',
				fontWeight: 600,
				color: '#374151',
			},
			offsetX: 0,
			offsetY: 0,
		},
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
		tickAmount: 4,
		min: 0,
		forceNiceScale: true,
		title: {
			text: '',
			style: {
				fontFamily: 'Public Sans, sans-serif',
				fontSize: '14px',
				fontWeight: 600,
				color: '#374151',
			},
			rotate: -90,
			offsetX: 0,
			offsetY: 0,
		},
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
			formatter: function (val: any) {
				// Format as integer for job counts
				if (typeof val === 'number') {
					return Math.round(val).toString();
				}
				return String(val || '0');
			}
		}

	},
});

const updateChartData = (data: any) => {
	if (!Array.isArray(data) || data.length === 0) return;

  // Sort data by jobs_completed (descending) for better visualization
  const sortedData = [...data].sort((a: any, b: any) =>
    (b.jobs_completed || 0) - (a.jobs_completed || 0)
  );

  // Store sorted data for tooltip access
  sortedWorkerData.value = sortedData;

  // Extract worker names and jobs completed
  const workData = sortedData.map((item: any) =>
    item.jobs_completed || item.work_count || item.sales_revenue || item.total_work || item.count || 0
  );
  const xCategories = sortedData.map((item: any) =>
    item.worker_name || item.name || item.name_en || item.employee_name || 'Unknown'
  );

  // Generate dynamic colors based on performance (higher = darker green)
  const maxJobs = Math.max(...workData, 1);
  const colors = workData.map((jobs: number) => {
    const intensity = jobs / maxJobs;
    if (intensity >= 0.8) return '#169B62'; // Full color for top performers
    if (intensity >= 0.6) return '#16a34a'; // Medium-high
    if (intensity >= 0.4) return '#4ade80'; // Medium
    return '#86efac'; // Lighter for lower performers
  });

  labels.value = xCategories;
  series.value = [{
    name: t('reporting.jobsCompleted'),
    data: workData
  }];

	options.value = {
		...options.value,
		xaxis: {
			...options.value.xaxis,
			categories: xCategories,
			title: {
				...options.value.xaxis.title,
				text: t('reporting.workersNames'),
			},
			labels: {
				...options.value.xaxis.labels,
				rotate: xCategories.some(name => name.length > 15) ? -45 : 0,
				rotateAlways: false,
				maxHeight: xCategories.some(name => name.length > 15) ? 80 : undefined,
			}
		},
		yaxis: {
			...options.value.yaxis,
			title: {
				...options.value.yaxis.title,
				text: t('reporting.jobsCompleted'),
			},
		},
		tooltip: {
			...options.value.tooltip,
			custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
				// Get worker name from stored sorted data or chart config
				const workerData = sortedWorkerData.value[dataPointIndex];
				const workerName = workerData?.worker_name
					|| workerData?.name
					|| workerData?.name_en
					|| workerData?.employee_name
					|| w.config.xaxis?.categories?.[dataPointIndex]
					|| w.globals.categoryLabels?.[dataPointIndex]
					|| 'Unknown Worker';
				const jobsCompleted = series[seriesIndex]?.[dataPointIndex] || 0;
				const jobsCompletedLabel = t('reporting.jobsCompleted') + ':';
				return `
					<div class="px-3 py-2">
						<div class="text-white font-semibold mb-1">${workerName}</div>
						<div class="text-gray-300">
							<span class="font-medium">${jobsCompletedLabel}</span>
							<span class="text-white font-bold">${Math.round(jobsCompleted)}</span>
						</div>
					</div>
				`;
			},
		},
		colors: colors.length > 0 ? colors : ['#169B62'],
	};
};
const isLoading = ref(false)
const showChart = ref(true)
const toggleView = () => {
  showChart.value = !showChart.value
}
const isfetchWorkerPerformance = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_REPORTING}/v1/reporting/worker-performance?user_id=${USER_ID}&start_date=${start_date.value}&end_date=${end_date.value}`)
		const result = handleResponse(response);
		if (result.success) {
			WorkerPerformance.value = result.data;
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
watch([() =>  start_date.value, () => end_date.value], () => { isfetchWorkerPerformance(); });

onMounted(() => {
	isfetchWorkerPerformance();
})





</script>

<template>
	<div class="p-5 intro-y box h-full">
		<div class="mb-2 flex justify-between items-center">
			<h4 class="text-lg font-semibold text-gray-800 mb-6">{{$t('reporting.WorkerPerformance')}}</h4>
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
	            v-if="WorkerPerformance?.length > 0"
	            variant="outline-secondary" 
	            class="flex items-center justify-center toggle-view-btn"
	            style="height: 34px; padding: 7px 18px; margin: 0;"
	            @click="toggleView"
	          >
	            <Lucide :icon="showChart ? 'List' : 'BarChart'" class="w-4 h-4 mr-2" />
	            {{ showChart ? $t('reporting.showTable') : $t('reporting.showChart') }}
	          </Button>
			</div>
		</div>
		<div v-if="isLoading">
			<div class="animate-pulse  bg-slate-200 w-full h-56  rounded-lg"> </div>
		</div>
		<div v-else-if="WorkerPerformance?.length > 0 " >
			<div class="grid grid-cols-12 gap-2 items-center h-full">
				<div class="col-span-12">
					<div class="mb-4 flex items-center justify-between">
						<div class="text-sm text-gray-600">
							<span class="font-medium">{{ $t('reporting.totalWorkers') }}:</span> {{ WorkerPerformance?.length }}
						</div>
						<div class="text-sm text-gray-600">
							<span class="font-medium">{{ $t('reporting.totalJobs') }}:</span>
							<span class="text-primary font-bold">
								{{ WorkerPerformance?.reduce((sum: number, worker: any) => sum + (worker.jobs_completed || 0), 0) }}
							</span>
						</div>
					</div>
					<apexchart v-if="showChart" width="100%" height="400" type="bar" :options="options" :series="series" />
					<div v-else class="overflow-x-auto">
						<table class="w-full border-collapse">
							<thead>
								<tr class="bg-gray-50 border-b">
									<th class="text-left py-3 px-4 font-semibold text-gray-700">{{ $t('reporting.workerName') }}</th>
									<th class="text-right py-3 px-4 font-semibold text-gray-700">{{ $t('reporting.jobsCompleted') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(worker, index) in WorkerPerformance" :key="index" class="border-b hover:bg-gray-50">
									<td class="py-3 px-4 text-gray-800">{{ worker.worker_name || worker.name || worker.name_en || worker.employee_name || 'Unknown' }}</td>
									<td class="py-3 px-4 text-right font-medium text-gray-800">{{ worker.jobs_completed || worker.work_count || worker.sales_revenue || worker.total_work || worker.count || 0 }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
		<div v-else>
			<img :src="NotFoundIcon" class="w-[160px] mx-auto">
			<h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{$t('dashboard.noDataAvailable')}}</h3>
			<p class="text-base text-gray-400 font-normal pb-4 text-center">{{$t('dashboard.noDataDescription')}}</p>
			<div class="flex justify-center">
				<Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
					@click="isfetchWorkerPerformance()">
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



