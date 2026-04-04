<script setup lang="ts">
import _ from "lodash";
import { ref, reactive, onMounted, computed, watch } from "vue";
import Button from "../../../components/Base/Button";
import { FormInput, FormSwitch, FormLabel } from "../../../components/Base/Form";
import Lucide from "../../../components/Base/Lucide";
import { Dialog } from "../../../components/Base/Headless";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import LoadingIcon from "../../../components/Base/LoadingIcon";
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import httpClient from "@/network/api/httpClient";
import ErrorHandler from "../../../utils/validation";
import { useAuthStore } from "@/stores/auth.js";
import { useI18n } from "vue-i18n";
import Litepicker from "@/components/Base/Litepicker";


const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const form = reactive(new ErrorHandler());
const isloading: any = ref(true);

const params = reactive({
	page: 1,
	limit: 10,
	search: "",
	sort: "",
	sort_direction: "asc",
	paginate: true,
	column_filters: [],
});

const rows: any = ref(null);
const totalRows = ref(0);
const { t } = useI18n();
const columns: any = ref([
  { field: 'target_amount', title: t('sale-target.TargetAmount') },
	{ field: 'achieved_amount', title: t('sale-target.AchievedAmount') },
	{ field: 'target_date', title: t('sale-target.TargetDate') },
	{ field: 'actions', title: t('common.Action'), sort: false },
]) || [];


const datatable: any = ref(null);
let controller: any;
let timer: any;
const fiterSaleTarget = () => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		isListSaleTarget();
	}, 100);
};
const formattedDate = (dateStr: any) => {
	const date = new Date(dateStr);
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
};



const isListSaleTarget = async () => {
	try {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		const signal = controller.signal;
		isloading.value = true;
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + "/v1/daily-targets", {
			params: { ...params, user_id: USER_ID, signal: signal },
		});

		const result = response.data;
		console.log("result", result)
		rows.value = result.data;
		totalRows.value = result.meta.total;

	} catch (error) {
		console.error("Error fetching invoices:", error);
	} finally {
		isloading.value = false;
	}
};
const changeServer = (data: any) => {
	params.page = data.current_page;
	params.limit = data.pagesize;
	params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`,
		params.sort_direction = data.sort_direction;
	params.search = data.search;

	if (data.change_type === 'search') {
		fiterSaleTarget();
	} else {
		isListSaleTarget();
	}
};
onMounted(() => {
	isListSaleTarget();
});

const isTargetAmountModel = ref(false);
const isAmountAdded = ref(false);
const openIsAmountAddedModal = () => {
	isAmountAdded.value = true;
};
const closeIsAmountAddedModal = () => {
	isAmountAdded.value = false;
	form.setErrors({})
};


const isSalesTarget: any = ref({
	user_id: USER_ID,
	target_amount: 0,
	target_date: ""
})




const isTargetAmountId = ref(null);
const openTargetAmountModal = (Uuid: any) => {
	isTargetAmountId.value = Uuid;
	isTargetAmountModel.value = true;
};
const closeDeleteModal = () => {
	isTargetAmountModel.value = false;
	isTargetAmountId.value = null;
	isSalesTarget.value.target_amount = ""
};
const addTargetAmount = (Uuid: any) => {
	openTargetAmountModal(Uuid);
	isTargetAmountId.value = Uuid
	console.log(Uuid)
	isSalesTarget.value.target_amount = Uuid.target_amount
};

const formattedTargetDate = computed(() => {
	return isSalesTarget.value.target_date
		? new Date(isSalesTarget.value.target_date).toISOString().split('T')[0]
		: "";
});
const submitDailyTargets = async () => {
	try {
		isloading.value = true;
		const payload = {
			...isSalesTarget.value,
			target_date: formattedTargetDate.value,
		};
		const response = await httpClient.post(
			`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/daily-targets`,
			payload
		);
		const result = handleResponse(response);
		console.log('login response', result)
		if (result.success) {
			closeIsAmountAddedModal();
			isListSaleTarget();
			isloading.value = false;
			isSalesTarget.value.target_amount = "",
				toast().fry(pan.salesTarget.success(result.message));



		}
	} catch (error) {
		isloading.value = false;
		isSalesTarget.value.target_amount = "",
		console.log("error", error)
		form.setErrors(error.response.data.errors);
		toast().fry(pan.salesTarget.error(error.response.data.message))

	}
}
const submitTargetAmount = async () => {
	try {
		isloading.value = true;
		const payload = {
			target_amount: isSalesTarget.value.target_amount
		};
		const response = await httpClient.put(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/daily-targets/${isTargetAmountId.value.id}`, payload
		);
		const result = handleResponse(response);
		console.log('login response', result)
		if (result.success) {
			closeDeleteModal();
			isListSaleTarget();
			isloading.value = false;
			isSalesTarget.value.target_amount = "",
				toast().fry(pan.salesTarget.success(result.message));
		}
	} catch (error) {
		isloading.value = false;
		form.setErrors(error.response.data.errors);
		toast().fry(pan.salesTarget.error(error.response.data.message))

	}
}


const parseDate = (dateStr) => {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

watch(() => isSalesTarget.value.target_date, (newValue) => {
  try {
    if (newValue) {
      const formattedDate = parseDate(newValue);
      isSalesTarget.value.target_date = formattedDate;
      console.log('target_date:', isSalesTarget.value.target_date);
    }
  } catch (error) {
    console.error('Error converting date:', error.message);
  }
});

</script>
<template>
	<div class="grid grid-cols-12 gap-6 mt-5 intro-y ">
		<div class="col-span-12 flex justify-between">
			<div>
				<Button variant="primary" class="mr-2 shadow-md" @click="openIsAmountAddedModal()">
					{{ $t('sale-target.setTargetAmount') }}
				</Button>
			</div>
			<div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
				<div class="relative w-56 text-slate-500 mr-3">
					<FormInput v-model="params.search" type="text" class="w-56 pr-10 !box"
						:placeholder="$t('common.search')" />
					<Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
				</div>
			</div>
		</div>
		<!-- BEGIN: Data List -->
		<div class="col-span-12">
			<vue3-datatable ref="datatable" :rows="rows" :columns="columns" :loading="isloading" :totalRows="totalRows"
				:isServerMode="true" :pageSize="params.limit" :sortable="true" :sort="params.sort"
				:sortDirection="params.sort_direction" :search="params.search" @change="changeServer">

				<template #created_at="data">
					{{ formattedDate(data.value.created_at) }}
				</template>
				<template #actions="data">
					<div class="flex gap-2.5">
						<template v-if="new Date(data.value.target_date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)">
							<a @click="addTargetAmount(data.value)" class="bg-blue-100 p-2 rounded-md">
								<Lucide icon="PencilLine" class="w-4 h-4 text-blue-500" />
							</a>
						</template>

					</div>

				</template>
			</vue3-datatable>
		</div>
	</div>

	<!-- BEGIN: Add Amount Modal -->

	<Dialog :open="isTargetAmountModel" @close="closeDeleteModal">
		<Dialog.Panel>
			<div class="py-4">
				<div class="border-b border-gray-300 mb-4">
					<h4 class="text-lg text-black font-semibold pb-3 px-6">{{ $t('sale-target.setTargetAmount') }}</h4>
				</div>
				<div class="mb-4 px-8">
					<FormLabel class="text-gray-700 font-medium mb-1.5 flex">{{ $t('sale-target.setAmount') }}</FormLabel>
					<FormInput v-model="isSalesTarget.target_amount" type="number" min="0"
						class="w-full px-4 py-2 border rounded-lg" :class="{ 'border-red-500': form.invalid('target_amount') }" />
					<template v-if="form.invalid('target_amount')">
						<div class="mt-1 text-xs text-red-600">{{ form.getError('target_amount') }}</div>
					</template>
				</div>

			</div>
			<div class="px-8 pb-8 flex items-center">
				<Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1 h-10">
					{{ $t('common.cancel') }}
				</Button>
				<Button variant="primary" type="button" class="ml-4 w-32 h-10" @click="submitTargetAmount">
					<template v-if="isloading">
						<LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
					</template>
					<template v-else>
						{{ $t('common.submit') }}
					</template>
				</Button>
			</div>
		</Dialog.Panel>
	</Dialog>


	<Dialog :open="isAmountAdded" @close="closeIsAmountAddedModal">
		<Dialog.Panel>
			<div class="py-4">
				<div class="border-b border-gray-300 mb-4">
					<h4 class="text-lg text-black font-semibold pb-3 px-6">{{ $t('sale-target.setTargetAmount') }}</h4>
				</div>
				<div class="mb-4 px-8">
					<FormLabel class="text-gray-700 font-medium mb-1.5 flex">{{ $t('sale-target.setAmount') }}</FormLabel>
					<FormInput v-model="isSalesTarget.target_amount" type="number" min="0"
						class="w-full px-4 py-2 border rounded-lg" :class="{ 'border-red-500': form.invalid('target_amount') }" />
					<template v-if="form.invalid('target_amount')">
						<div class="mt-1 text-xs text-red-600">{{ form.getError('target_amount') }}</div>
					</template>
				</div>
				<div class="mb-4 px-8">
					<FormLabel class="text-gray-700 font-medium mb-1.5 flex">{{ $t('sale-target.setDate') }}</FormLabel>
					<div class="relative w-full" >
						<div
							class="absolute flex items-center justify-center w-10 h-full border rounded-l bg-slate-100 text-slate-500 dark:bg-darkmode-700 dark:border-darkmode-800 dark:text-slate-400">
							<Lucide icon="Calendar" class="w-4 h-4" />
						</div>
						<Litepicker v-model="isSalesTarget.target_date" :options="{
							autoApply: false,
							showWeekNumbers: true,
							minDate: new Date(),
              format: 'YYYY-MM-DD',
							dropdowns: {
								minYear: new Date().getFullYear(),
								maxYear: new Date().getFullYear() + 10,
								months: true,
								years: true,
							}
						}" class="pl-12" :class="{ 'border-red-500': form.invalid('target_date') }" />
					</div>
					<template v-if="form.invalid('target_date')">
						<div class="mt-1 text-xs text-red-600">{{ form.getError('target_date') }}</div>
					</template>
				</div>

			</div>
			<div class="px-8 pb-8 flex items-center">
				<Button variant="outline-secondary" type="button" @click="closeIsAmountAddedModal" class="w-24 mr-1 h-10">
					{{ $t('common.cancel') }}
				</Button>
				<Button variant="primary" type="button" class="ml-4 w-32 h-10" @click="submitDailyTargets">
					<template v-if="isloading">
						<LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
					</template>
					<template v-else>
						{{ $t('common.submit') }}
					</template>
				</Button>
			</div>
		</Dialog.Panel>
	</Dialog>

</template>
