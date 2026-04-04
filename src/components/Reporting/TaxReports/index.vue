<script setup>
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted, computed } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { useAuthStore } from "@/stores/auth.js";
import Litepicker from "@/components/Base/Litepicker";
import MazSlider from 'maz-ui/components/MazSlider'
import { FormLabel } from "@/components/Base/Form";
import TomSelect from "@/components/Base/TomSelect";
import CurrencyFormatter from "@/utils/currencyFormatter" 

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isSlider = ref(4)
const VATSummaryReport = ref();
const TaxCollected = ref()
const isLoading = ref(false)
const isfetchVATSummaryReport = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/reporting/microservice/tax-paid?user_id=${USER_ID}&start_date=${start_date.value}&end_date=${end_date.value}&quarter=${isSlider.value}`)
		const result = handleResponse(response);
		if (result.success) {
			VATSummaryReport.value = result.data
			 
		}
	} catch (error) {
		const result = handleError(error);
	} finally {
		isLoading.value = false
	}
}
const isfetchTaxCollected = async () => {
	try {
		isLoading.value = true
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/reporting/microservice/collected-tax?user_id=${USER_ID}&start_date=${start_date.value}&end_date=${end_date.value}&quarter=${isSlider.value}`)
		const result = handleResponse(response);
		if (result.success) {
			TaxCollected.value = result.data
			 
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

const parseDate = (dateStr) => {
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
			 
		}
	} catch (error) {
		console.error('Error converting date:', error.message);
	}
});

const locale = ref('en'); // Default locale
watch([() => start_date.value, () => end_date.value], () => { isfetchVATSummaryReport(); isfetchTaxCollected(); });
onMounted(() => {
	locale.value = localStorage.getItem('locale') || 'en';
	isfetchVATSummaryReport();
	isfetchTaxCollected();
})

const selectedYear = ref("");
const getYearsRange = (start , end ) => {
	let years = [];
	for (let i = start; i <= end; i++) {
		years.push(i);
	}
	return years;
};
const taxDifference = computed(() => 
  TaxCollected.value?.total_collected_tax - VATSummaryReport.value?.total_paid_tax
);
</script>
<template>
	<div class="p-5 intro-y box h-full">
		<div class="mb-6 w-full flex items-center gap-4">
			<h4 class="text-lg font-semibold text-gray-800 w-[300px]">{{ $t('reporting.VATSummaryReport') }}</h4>
		</div>
		<div class="grid grid-cols-3 gap-4 mb-8">
			<div>
				<FormLabel>{{ $t('reporting.SelectDate') }}</FormLabel>
				<div class="relative mt-3 sm:mt-0 text-slate-500 flex items-center"
					:class="{ '': locale === 'ar', '': locale !== 'ar' }">
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
					}" class="pl-10  w-full  " />
				</div>
			</div>
			<div class="relative mt-3 sm:mt-0 text-slate-500 w-full"
				:class="{ ' mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
				<FormLabel>{{ $t('reporting.TaxYear') }} </FormLabel>
				<div class="flex items-center flex-row-reverse w-full ">
					<TomSelect v-model="selectedYear" :options="{ placeholder: $t('reporting.PleaseTaxYear'), }" class="w-full">
						<option></option>
						<option v-for="(year, index) in getYearsRange(1990, new Date().getFullYear())" :key="index" :value="year">
							{{ year }}</option>
					</TomSelect>
				</div>
			</div>
			<div class="">
				<FormLabel class="pl-6">{{ $t('reporting.Quarter') }}</FormLabel>
				<MazSlider v-model="isSlider" :min="0" :max="4" color="info" />
			</div>
			
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
			<div :class="[ 'relative h-full', '' ]">
				<div class="p-5 box h-full" v-if="isLoading">
					<p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
				</div>
				<div class="p-5 box h-full" v-else-if="VATSummaryReport">
					<div class="flex mb-6">
						<Lucide icon="Percent" class="w-[28px] h-[28px] text-primary"/>
					</div>
					<div class="mt-2 text-3xl font-medium leading-8">
						{{ CurrencyFormatter(VATSummaryReport.total_paid_tax) }}
					</div>
					<div class="mt-4 text-base text-slate-500 font-semibold">{{ $t('reporting.TotalPaidTax') }}</div>
				</div>
				<div class="px-5 py-3 intro-y box h-full flex items-center justify-center" v-else>
					<div>
						<img :src="NotFoundIcon" class="w-[100px] mx-auto">
						<h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">
							{{ $t('dashboard.noDataAvailable') }}</h3>
						<Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
							@click="isfetchVATSummaryReport()">
							<Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
							{{ $t('dashboard.refreshNow') }}
						</Button>
					</div>
				</div>
			</div>
			<div :class="[ 'relative h-full', '' ]">
				<div class="p-5 box h-full" v-if="isLoading">
					<p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
				</div>
				<div class="p-5 box h-full" v-else-if="TaxCollected">
					<div class="flex mb-6">
						<Lucide icon="BadgePercent" class="w-[28px] h-[28px] text-primary"/>
					</div>
					<div class="mt-2 text-3xl font-medium leading-8">
						{{ CurrencyFormatter(TaxCollected.total_collected_tax) }}
					</div>
					<div class="mt-4 text-base text-slate-500 font-semibold">{{ $t('reporting.TotalCollectedTax') }}</div>
				</div>
				<div class="px-5 py-3 intro-y box h-full flex items-center justify-center" v-else>
					<div>
						<img :src="NotFoundIcon" class="w-[100px] mx-auto">
						<h3 class="text-lg font-semibold text-gray-400 pt-1 pb-2 text-center">
							{{ $t('dashboard.noDataAvailable') }}</h3>
						<Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36"
							@click="isfetchTaxCollected()">
							<Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
							{{ $t('dashboard.refreshNow') }}
						</Button>
					</div>
				</div>
			</div>
			<div :class="[ 'relative h-full','' ]">
				<div class="p-5 box h-full" v-if="isLoading">
					<p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
				</div>
				<div class="p-5 box h-full" v-else-if="TaxCollected">
					<div class="flex mb-6">
						<Lucide icon="DollarSign" class="w-[28px] h-[28px] text-primary"/>
					</div>
					<div class="mt-2 text-3xl font-medium leading-8">
						{{ CurrencyFormatter(Math.abs(taxDifference)) }}
					</div>
					<div class="mt-4 text-base text-slate-500 font-semibold"> 
						<p v-if="taxDifference > 0"> {{ $t('reporting.TaxPayable') }} </p>
            <p v-else-if="taxDifference < 0"> {{ $t('reporting.TaxReceivable') }} </p>
            <p v-else>{{ $t('reporting.NoTax') }}</p>
					</div>
				</div> 
			</div>
		</div> 
		<div class="border border-slate-200 rounded-md relative px-4 pb-5 mt-10">
    <h2 class="mr-auto text-lg font-semibold absolute -top-4 bg-white px-2">{{ $t('tax-management.vatFilling') }}</h2>
    <div class="mt-6">
      <Button variant="primary" type="button" class="  mt-4"  >
        <a href="https://zatca.gov.sa/en/eServices/Pages/eServices_009.aspx" target="_blank">
          {{ $t('tax-management.vatFilling') }}
        </a>
      </Button>
    </div>
  </div>
	</div>
</template>