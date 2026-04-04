<script setup lang="ts">
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
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

const PaymentMethod = ref();
const series = ref([0, 0]); // Default values
const labels = ["Cash", "Card"]; // Fixed labels 
const isLoading = ref(false)
const isfetchTopSellingProducts = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/payment-type?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`)
		const result = handleResponse(response);
		if (result.success) {
			PaymentMethod.value = result.data 
			series.value = [
        result.data?.total_cash ?? 0, // If null or undefined, use 0
        result.data?.total_card ?? 0  // If null or undefined, use 0
      ];
			 
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

const options = {
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
	series: series,
	labels: labels,
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
			// + '%'
			return seriesName + '  ' + opts.w.globals.series[opts.seriesIndex];
		}
	},
	colors: [
		// Light blue
		'#8176f9',
		'#4A3AFF',
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
};
</script>
<template>
	<div class="p-5 intro-y box h-full">
  <div class="mb-2">
    <h4 class="text-lg font-semibold text-gray-800 mb-6">{{$t('dashboard.paymentMethod')}}</h4>
  </div>
  <div v-if="isLoading">
    <div class="flex items-center justify-between w-full">
      <div>
        <div class="animate-pulse bg-slate-200 w-56 h-3 rounded-full mb-4"></div>
        <div class="animate-pulse bg-slate-200 w-56 h-3 rounded-full mb-4"></div>
      </div>
      <div class="animate-pulse bg-slate-200 w-60 h-60 rounded-full mx-auto"> </div> 
    </div>
  </div>
  <div v-else-if="(series[0] || series[1]) && (series[0] !== 0 || series[1] !== 0)">
    <apexchart width="100%" height="450" type="pie" :options="options" :series="series" />
  </div>
  <div class="h-full" v-else>
    <div>
      <img :src="NotFoundIcon" class="w-[160px] mx-auto">
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{$t('dashboard.noDataAvailable')}}</h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">{{$t('dashboard.noDataDescription')}}</p>
      <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36" @click="isfetchTopSellingProducts()"> 
        <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> {{$t('dashboard.refreshNow')}}
      </Button>
    </div>
  </div>
</div>

</template>