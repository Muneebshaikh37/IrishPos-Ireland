<script setup lang="ts">
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import {useAuthStore} from "@/stores/auth.js";
import Litepicker from "@/components/Base/Litepicker";

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
const labels = ["Discount Percentage", "Invoice Count"]; // Fixed labels 
const isLoading = ref(false)
const showChart = ref(true)
const toggleView = () => {
  showChart.value = !showChart.value
}
const isfetchDiscountsReport = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/reporting/discounts?user_id=${USER_ID}&start_date=${start_date.value}&end_date=${ end_date.value}`)
		const result = handleResponse(response);
		if (result.success) {
			PaymentMethod.value = result.data;
			series.value = [
        result.data?.widget.discount_percentage ?? 0, // If null or undefined, use 0
        result.data?.widget.invoice_count ?? 0  // If null or undefined, use 0
      ];
			console.log("series.value",series.value)
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

const locale = ref('en'); // Default locale
watch([() =>  start_date.value, () =>  end_date.value], () => { isfetchDiscountsReport(); });
onMounted(() => {
	locale.value = localStorage.getItem('locale') || 'en';
	isfetchDiscountsReport();
})

const options = {
	chart: {
		toolbar: {
			show: true,
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
  <div class="mb-6 flex justify-between items-center w-full ">
    <h4 class="text-lg font-semibold text-gray-800 ">{{$t('reporting.DiscountsReport')}}</h4>
	<div class="flex items-center gap-3">
		<div class="relative mt-3   sm:mt-0 text-slate-500 flex items-center" :class="{ ' mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
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
			v-if="PaymentMethod?.widget"
			variant="outline-secondary" 
			class="flex items-center justify-center toggle-view-btn"
			style="height: 34px; padding: 7px 18px; margin: 0;"
			@click="toggleView"
		>
			<Lucide :icon="showChart ? 'List' : 'PieChart'" class="w-4 h-4 mr-2" />
			{{ showChart ? 'Show Table' : 'Show Chart' }}
		</Button>
	</div>
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
  <div  v-else-if="PaymentMethod?.widget">
    <apexchart v-if="showChart" width="100%" height="450" type="pie" :options="options" :series="series" />
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
            <th class="text-right py-3 px-4 font-semibold text-gray-700">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4 text-gray-800">Discount Percentage</td>
            <td class="py-3 px-4 text-right font-medium text-gray-800">{{ PaymentMethod?.widget?.discount_percentage || 0 }}%</td>
          </tr>
          <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4 text-gray-800">Invoice Count</td>
            <td class="py-3 px-4 text-right font-medium text-gray-800">{{ PaymentMethod?.widget?.invoice_count || 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
 <div class="h-full" v-else>
    <div>
      <img :src="NotFoundIcon" class="w-[160px] mx-auto">
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{$t('dashboard.noDataAvailable')}}</h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">{{$t('dashboard.noDataDescription')}}</p>
      <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36" @click="isfetchDiscountsReport()"> 
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