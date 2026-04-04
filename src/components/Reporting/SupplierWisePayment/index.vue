<script setup lang="ts">
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import CurrencyFormatter from "@/utils/currencyFormatter"
import {useAuthStore} from "@/stores/auth.js";
import Litepicker from "@/components/Base/Litepicker";
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import TomSelect from "@/components/Base/TomSelect";

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

const SupplierwisePaymentReport = ref();
const series = ref([0, 0]); // Default values
const labels = ["Paid", "Remaining", "Total"]; // Fixed labels 
const isLoading = ref(false)
const showChart = ref(true)
const toggleView = () => {
  showChart.value = !showChart.value
}
const CreateSupplierFields = ref({
  supplier_id: "", 
  isloading: false
})
const isfetchDiscountsReport = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/reporting/supplier-invoice-payment?user_id=${USER_ID}&supplier_id=${CreateSupplierFields.value.supplier_id}`)
		const result = handleResponse(response);
		if (result.success) {
			SupplierwisePaymentReport.value = result.data
			console.log("SupplierwisePaymentReport.value",SupplierwisePaymentReport.value)
			series.value = [
  Number(result.data?.chart_data.paid) || 0, 
  Number((result.data?.chart_data.remaining).toFixed(2)) || 0,
  Number(result.data?.chart_data.total) || 0
];
			console.log("series.value",series.value)
		}
	} catch (error) {
		const result = handleError(error);
	} finally {
		isLoading.value = false
	}
}
const isloading = ref(false)
const supplierList: any = ref("")

const fetchSupplier = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/supplier-list?user_id=${USER_ID}&is_active=true`)
    // const response = await apiService.supplier.list();
    const result = handleResponse(response);

    if (result.success) {
      isloading.value = false;
      supplierList.value = result.data.data
      console.log("result", result)
    }
  } catch (error) { 
    isloading.value = false;
  }
}

 
watch(
  () => CreateSupplierFields.value.supplier_id,
  (newSupplierId) => {
    if (newSupplierId) {
      isfetchDiscountsReport();
    }
  }
);
const locale = ref('en'); // Default locale
// watch([() =>  start_date.value, () =>  end_date.value], () => { isfetchDiscountsReport(); });
onMounted(() => {
	locale.value = localStorage.getItem('locale') || 'en';
	isfetchDiscountsReport();
    fetchSupplier()
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
    <h4 class="text-lg font-semibold text-gray-800 ">{{$t('reporting.SupplierwisePaymentReport')}}</h4>
	<div class="flex items-center gap-3">
		<div class="relative mt-3   sm:mt-0 text-slate-500 flex items-center w-64 gap-4 " :class="{ ' mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
        <FormLabel>{{ $t('purchase-returns.suppliers') }}  </FormLabel>
            <div class="flex items-center flex-row-reverse w-40 ">

              <TomSelect v-model="CreateSupplierFields.supplier_id" :options="{
								placeholder: $t('purchase-returns.searchSupplier'),
                            }" class="w-full"  >
                <option></option>
                <!-- <option value="1">Test</option>
                                <option value="2">Test 2</option> -->
                <template v-for="list in supplierList">
                  <option :value="list.id">{{ list.supplier_name }}</option>
                </template>
              </TomSelect>
            </div>
          </div>
		<Button 
			v-if="SupplierwisePaymentReport?.chart_data"
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
  <div  v-else-if="SupplierwisePaymentReport?.chart_data">
    <apexchart v-if="showChart" width="100%" height="450" type="pie" :options="options" :series="series" />
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Payment Type</th>
            <th class="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4 text-gray-800">Paid</td>
            <td class="py-3 px-4 text-right font-medium text-gray-800">{{ CurrencyFormatter(parseFloat(SupplierwisePaymentReport?.chart_data?.paid || 0).toFixed(2)) }}</td>
          </tr>
          <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4 text-gray-800">Remaining</td>
            <td class="py-3 px-4 text-right font-medium text-gray-800">{{ CurrencyFormatter(parseFloat(SupplierwisePaymentReport?.chart_data?.remaining || 0).toFixed(2)) }}</td>
          </tr>
          <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4 text-gray-800 font-semibold">Total</td>
            <td class="py-3 px-4 text-right font-semibold text-gray-800">{{ CurrencyFormatter(parseFloat(SupplierwisePaymentReport?.chart_data?.total || 0).toFixed(2)) }}</td>
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