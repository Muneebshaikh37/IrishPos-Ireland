<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import Lucide from "@/components/Base/Lucide";
import { useAuthStore } from "@/stores/auth.js";
import httpClient from "@/network/api/httpClient";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg";
import Button from "@/components/Base/Button";
import { RouterLink } from 'vue-router';
import CurrencyFormatter from "@/utils/currencyFormatter"

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const props = defineProps({
	start_date: {
		type: String,
		required: true,
	},
	end_date: {
		type: String,
		required: true,
	},
});

const isSalesTarget = ref();
const isLoading = ref(false);
const series = ref([0]); // Progress percentage
const chartOptions = ref({
	chart: { type: 'radialBar' },
	plotOptions: {
		radialBar: {
			startAngle: -90,
			endAngle: 90,
			hollow: { size: '50%' },
			track: { background: '#e6e6e6', strokeWidth: '97%' },
			dataLabels: {
				name: { show: false },
				value: {
					fontSize: '20px',
					fontWeight: 'semibold',
					color: '#000',
					offsetY: 10,
					formatter: (val) => val + '%',
				},
			},
			strokeLinecap: "round",
		},
	},
	colors: ['#FF7300'],
	tooltip: {
		enabled: true,
		theme: 'dark',

		y: {
			formatter: () => {
				// Get achieved_amount from the original data
				const achievedAmount = isSalesTarget.value?.achieved_amount || 0;
				return `${CurrencyFormatter(achievedAmount)} `;
			},
			title: {
				formatter: () => 'Achieved Amount'
			}
		}
	},
});

const isfetchSalesTarget = async () => {
	try {
		isLoading.value = true;
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/daily-targets?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}`);
		const result = handleResponse(response);
		if (result.success) {
			isSalesTarget.value = result.data;

			// Extract achieved_amount & target_amount
			const achieved = isSalesTarget.value?.achieved_amount || 0;
			const target = isSalesTarget.value?.target_amount || 1; // Avoid division by zero

			// Calculate progress percentage
			const percentage = ((achieved / target) * 100).toFixed(1);
			series.value = [percentage];
		}
	} catch (error) {
		console.log(error);
		isSalesTarget.value = ""
	} finally {
		isLoading.value = false;
	}
};

// Watch for prop changes
watch([() => props.start_date, () => props.end_date], isfetchSalesTarget);
onMounted(isfetchSalesTarget);

const SalesTargetDifference = computed(() =>
	isSalesTarget.value?.target_amount - isSalesTarget.value?.achieved_amount
);
</script>

<template>
	<div :class="[
		'relative zoom-in h-full',
		'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']'
	]">
		<div class="p-5 box h-full" v-if="isLoading">
			<p class="animate-pulse bg-slate-200 w-full h-24 rounded-lg"></p>
		</div>

		<div class="p-5 box h-full" v-else-if="isSalesTarget">
			<div class="flex">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-[26px] lucide lucide-chart-bar-stacked h-[28px] text-primary"
					viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
					stroke-linejoin="round">
					<path d="M11 13v4" />
					<path d="M15 5v4" />
					<path d="M3 3v16a2 2 0 0 0 2 2h16" />
					<rect x="7" y="13" width="9" height="4" rx="1" />
					<rect x="7" y="5" width="12" height="4" rx="1" />
				</svg>
				<div :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }"></div>
			</div>
			<div class="grid grid-cols-12 gap-4 auto-cols-auto items-center">
				<div class="mb-4 col-span-6">
					<h4 class="mt-6 text-3xl font-semibold leading-8"> {{ CurrencyFormatter(isSalesTarget.target_amount) }} </h4>
					<p class="mt-1 text-[18px] text-slate-600">{{ $t('sale-target.TargetAmount') }}</p>
					<div class="flex gap-4 justify-between mt-4">
						<div>
							<h4 class="mt-6 text-xl font-semibold leading-6"> {{ CurrencyFormatter(isSalesTarget.achieved_amount) }}
							</h4>
							<p class="mt-1 text-xs text-slate-500">{{ $t('sale-target.AchievedAmount') }}</p>
						</div>
						<div>
							<h4 class="mt-6 text-xl font-semibold leading-6">
								{{ CurrencyFormatter(Number(Math.abs(SalesTargetDifference))) }} </h4>
							<p class="mt-1 text-xs text-slate-500" v-if="SalesTargetDifference > 0">
								{{ $t('sale-target.RemainingAmount') }}</p>
							<p class="mt-1 text-xs text-slate-500" v-else-if="SalesTargetDifference < 0">
								{{ $t('sale-target.ExceededBy') }}</p>
						</div>
					</div>
				</div>
				<div class="col-span-6">
					<apexchart type="radialBar" :options="chartOptions" :series="series"></apexchart>
				</div>
			</div>

		</div>
		<div class="px-5 py-10 intro-y box h-full flex items-center justify-center" v-else>
			<div>
				<img :src="NotFoundIcon" class="w-[100px] mx-auto">
				<h3 class="text-lg font-semibold text-gray-600 pt-4   text-center">
					{{ $t('sale-target.errorTargetHead') }}</h3>
				<h4 class="text-base font-medium text-gray-400   pb-2 text-center">
					{{ $t('sale-target.errorDailyTarget') }}</h4>
				<RouterLink to="/setting/sale-target">
					<Button variant="primary" class="flex items-center justify-center mx-auto w-48  "> {{
						$t('sale-target.setTargetAmount') }} </Button>
				</RouterLink>

			</div>
		</div>
	</div>
</template>