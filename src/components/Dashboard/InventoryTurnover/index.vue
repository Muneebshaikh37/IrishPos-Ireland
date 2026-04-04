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

const InventoryTurnover = ref<any>({ monthly: [] });

const series = ref([]);
const labels = ref<string[]>([]);
const TotalInventoryTurnOver = ref<any>({})
const TotalInventory = ref<any>([])
const options = ref({
	chart: {
		toolbar: {
			show: false
		},
		height: 400,
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
	if (!Array.isArray(data?.monthly)) return;

	const newLabels = data.monthly.map((item: any) => item.month);
	const newData = data.monthly.map((item: any) => item.inventory_turnover);
	TotalInventory.value = data.monthly.map((item: any) => item.inventory_turnover);

	labels.value = newLabels;
	series.value = [{
		name: "Inventory Turnover",
		data: newData
	}];

	options.value = {
		...options.value,
		xaxis: {
			...options.value.xaxis,
			categories: newLabels
		}
	};
};
const isLoading = ref(false)
const isfetchInventoryTurnover = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/v1/dashboard/inventory-turnover?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`)
		const result = handleResponse(response);
		if (result.success) {
			InventoryTurnover.value = result.data;
			updateChartData(result.data);
			TotalInventoryTurnOver.value = result.data.overall
		}
	} catch (error) {
		const result = handleError(error);
	} finally {
		isLoading.value = false
	}
}
watch([() => props.start_date, () => props.end_date], () => { isfetchInventoryTurnover(); });

onMounted(() => {
	isfetchInventoryTurnover();
})






</script>
<template>
	<div class="p-5 intro-y box h-full">
		<div class="mb-2">
			<h4 class="text-lg font-semibold text-gray-800 mb-6">{{$t('dashboard.inventoryTurnover')}}</h4>
		</div>
		<div v-if="isLoading">
			<div class="animate-pulse  bg-slate-200 w-full h-56  rounded-lg"> </div>
		</div>
		<div v-else-if="InventoryTurnover?.monthly?.length > 0 && TotalInventoryTurnOver?.inventory_turnover !== undefined"> 
			<div class="grid grid-cols-12 gap-2 items-center h-full">
				<div class="col-span-4 flex justify-center" v-if="TotalInventoryTurnOver">
					<div>
						<h3 class="text-7xl font-bold text-gray-700 mb-4"> {{ TotalInventoryTurnOver.inventory_turnover
							}} </h3> 
					</div>
				</div>
				<div class="col-span-8">
					<apexchart width="100%" height="344" type="line" :options="options" :series="series" />
				</div>
			</div>
		</div>
		<div v-else>
			<img :src="NotFoundIcon" class="w-[160px] mx-auto">
			<h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{$t('dashboard.noDataAvailable')}}</h3>
			<p class="text-base text-gray-400 font-normal pb-4 text-center">{{$t('dashboard.noDataDescription')}}</p>
			<div class="flex justify-center">
				<Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
					@click="isfetchInventoryTurnover()">
					<Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> {{$t('dashboard.refreshNow')}}
				</Button>
			</div>
		</div>
	</div>
</template>