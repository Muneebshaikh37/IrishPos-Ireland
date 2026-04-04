<script setup lang="ts">
import _ from "lodash";
import { ref, reactive, onMounted } from "vue";
import Button from "../../../components/Base/Button";
import { FormInput, FormSwitch, FormLabel } from "../../../components/Base/Form";
import Lucide from "../../../components/Base/Lucide";
import noImageUrl from '../../../assets/images/placeholders/no-image.png'
import { RouterLink, useRoute } from "vue-router";
import { Dialog } from "../../../components/Base/Headless";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import Toastify from "toastify-js";
import Notification from "../../../components/Base/Notification";
import LoadingIcon from "../../../components/Base/LoadingIcon";
import * as XLSX from 'xlsx';
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import httpClient from "@/network/api/httpClient";
import TomSelect from "../../../components/Base/TomSelect";
import ErrorHandler from "../../../utils/validation";
import InvoiceReturnModel from "../../../components/Models/PurchaseInvoiceReturnModel/index.vue"
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const route = useRoute()
const form = reactive(new ErrorHandler());
const isloading: any = ref(true);
const total_rows = ref(0);
const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "",
  sort_direction: "desc",
  paginate:true,
  column_filters: [],
});
const rows: any = ref(null);
const totalRows = ref(0);
const {t} = useI18n();
const columns: any = ref([
	{ field: 'return_number', title: t('purchase-returns.returnNumber'), width: '160px' },
	{ field: 'created_at', title: t('purchase-returns.date'), width: '200px' },
	{ field: 'grand_total', title: t('purchase-returns.totalAmount'),   },
	{ field: 'amount_paid', title: t('purchase-returns.amountReceived'),  },
	{ field: 'remaining_amount', title: t('purchase-returns.remainingAmount') },
	{ field: 'payment_type', title: t('purchase-returns.paymentType'),  },
	{ field: 'payment_status', title: t('purchase-returns.paymentStatus'),   },
	{ field: 'actions', title: t('purchase-returns.actions'), sort: false },
]) || [];
const datatable: any = ref(null);
let controller: any;
let timer: any;
const filterUsers = () => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		getUsers();
	}, 100);
};

const paginate = (rows: any[], params: any) => {
	if (!Array.isArray(rows)) {
		console.error("Rows is not a valid array.");
		return {
			data: [],
			meta: {
				current_page: params.current_page || 1,
				per_page: params.pagesize || 10,
				first_page: 1,
				last_page: 1,
				total_pages: 1,
				total: 0,
			},
		};
	}
	const total = rows.length;
	const current_page = Math.max(1, params.current_page);
	const pagesize = Math.max(1, params.pagesize);
	const offset = (current_page - 1) * pagesize;
	const limit = offset + pagesize;
	const paginatedRows = rows.slice(offset, limit);
	const total_pages = Math.ceil(total / pagesize);

	return {
		data: paginatedRows,
		meta: {
			current_page,
			per_page: pagesize,
			first_page: 1,
			last_page: total_pages,
			total_pages,
			total,
		},
	};
};

const getUsers = async () => {
	try {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
        const signal = controller.signal;
		isloading.value = true;
		// const response = await axios.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/return-purchases?user_id=9d9e7d71-1ce6-48e8-bbba-17ea5e85178d`)
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL + "/return-purchases", {
			params: { ...params, user_id: USER_ID },
			signal,
		});

		const body = response.data ?? {};
		// Laravel paginator: { data: rows[], total, ... }; some APIs nest data again
		const list = Array.isArray(body.data)
			? body.data
			: Array.isArray(body?.data?.data)
				? body.data.data
				: [];
		rows.value = list;
		totalRows.value = Number(
			body.meta?.total ?? body.total ?? body?.data?.total ?? 0
		);

	}  catch (error) {
    console.error("Error fetching invoices:", error);
  } finally {
    isloading.value = false;
  }
};

const formattedDate = (dateStr: any) => {
    const date = new Date(dateStr);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
};

const changeServer = (data: any) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort ="";
//   params.column_filters = data.column_filters;
params.sort_direction = data.sort_direction;
  params.search = data.search;

  if (data.change_type === 'search') {
    filterUsers();
  } else {
    getUsers();
  }
};
onMounted(() => {
	getUsers();
});

const isAmountInvoiceModel = ref(false);
const isAmountInvoiceId = ref(null);
const openAmountInvoiceModal = (Uuid: any) => {
	isAmountInvoiceId.value = Uuid;
	isAmountInvoiceModel.value = true;
};
const closeDeleteModal = () => {
	isAmountInvoiceModel.value = false;
	isAmountInvoiceId.value = null;
};
const addAmountInvoice = (Uuid: any) => { openAmountInvoiceModal(Uuid);
	isAmountInvoiceId.value = Uuid
 };
const isInvoiceAmount = ref({
	amount: "",
	payment_type: "",
})
const submitAmountInvoice = async () => {
	try {
		isloading.value = true;
		// Clear any previous errors before submitting
		form.clear();

		// Validate and format the data before sending
		const amount = parseFloat(isInvoiceAmount.value.amount);
		const paymentType = isInvoiceAmount.value.payment_type?.trim();

		// Client-side validation
		if (!amount || amount <= 0 || isNaN(amount)) {
			form.setErrors({ amount: ['The amount field is required and must be greater than 0.'] });
			isloading.value = false;
			return;
		}

		if (!paymentType || (paymentType !== 'CC' && paymentType !== 'Cash')) {
			form.setErrors({ payment_type: ['The payment type field is required.'] });
			isloading.value = false;
			return;
		}

		// Prepare the payload with properly formatted data
		const payload = {
			amount: amount,
			payment_type: paymentType,
		};

		const response = await httpClient.put(
			`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/return-payment/${isAmountInvoiceId.value.id}`,
			payload,
			{
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		)
		const result = handleResponse(response);
		console.log('login response', result)
		if (result.success) {
			closeDeleteModal();
			isInvoiceAmount.value.amount = "";
			isInvoiceAmount.value.payment_type = "";
			getUsers();
			toast().fry(pan.purchase.success(result.message))
		}
	} catch (error) {
		console.log('Error response:', error.response?.data);
		console.log('Error object:', error);
		console.log('Error message:', error.message);
		
		// Get error message - check multiple possible locations
		// Note: httpClient interceptor rejects with error.response?.data, so error might be the data object itself
		let errorMessage = null;
		let errorData = null;
		
		// Check if error is the data object itself (from interceptor)
		if (error.message && error.errors) {
			errorData = error;
		} else if (error.response?.data) {
			errorData = error.response.data;
		} else if (error.message) {
			// Might be a string error
			errorMessage = error.message;
		}
		
		// First, try to get the main message
		if (errorData?.message) {
			errorMessage = errorData.message;
		}
		
		// If no main message, try to get from errors object
		if (!errorMessage && errorData?.errors) {
			const errors = errorData.errors;
			// Get the first error from the first field
			const firstErrorKey = Object.keys(errors)[0];
			if (firstErrorKey && Array.isArray(errors[firstErrorKey]) && errors[firstErrorKey].length > 0) {
				errorMessage = errors[firstErrorKey][0];
			} else if (firstErrorKey && typeof errors[firstErrorKey] === 'string') {
				errorMessage = errors[firstErrorKey];
			}
		}
		
		// Show error message in toast
		if (errorMessage) {
			toast().fry(pan.serverErrors.error(errorMessage));
		} else {
			toast().fry(pan.serverErrors.error('An error occurred while processing the payment'));
		}

		// Set form errors for display in the form
		if (errorData?.errors) {
			form.setErrors(errorData.errors);
		} else if (error.response?.data?.errors) {
			form.setErrors(error.response.data.errors);
		}
	} finally {
		isloading.value = false;
	}
}

const isListInvoice = ref()
const isOpenViewInvoice = ref(false)
const isAllView = async (Uuid: any) => {
	// isOpenViewInvoice.value = true
	// isListInvoice.value = data
	try {
		isOpenViewInvoice.value = true
		const response = await httpClient.get(
			`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/return-purchases/${Uuid}`,
			{ params: { user_id: USER_ID } }
		);
		const result = handleResponse(response);
		if (result.success) {
			isListInvoice.value = result.data?.data ?? result.data;
		}
	} catch (error) {
		const result = handleError(error);
		isloading.value = false;
	}
}
const closeInvoiceView = () => {
  isOpenViewInvoice.value = false;
};
const ability = useAbility();

</script>
<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('purchase-returns.heading') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between intro-y">
      <div>
        <RouterLink v-if="ability.can('create', 'purchaseReturn')" to="/purchasing/invoice/return/create">
          <Button variant="primary" class="mr-2 shadow-md">
            {{ $t('purchase-returns.newPurchaseReturnInvoice') }}
          </Button>
        </RouterLink>
      </div>
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('purchase-returns.searchPlaceholder')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>

    <!-- BEGIN: Data List -->
    <div class="col-span-12">
      <vue3-datatable ref="datatable" :rows="rows"
                      :columns="columns"
                      :loading="isloading"
                      :totalRows="totalRows"
                      :isServerMode="true"
                      :pageSize="params.limit"
                      :sortable="true"
                      :sort="params.sort"
                      :sortDirection="params.sort_direction"
                      :search="params.search"
                      @change="changeServer">
        <template #remaining_amount="data">
          <p v-if="Number(data.value.grand_total - data.value.amount_paid) <= 0 ">0.00</p>
          <p v-else>{{ Number(data.value.grand_total - data.value.amount_paid).toFixed(2) }}</p>
        </template>
        <template #created_at="data">
          {{ formattedDate(data.value.created_at) }}
        </template>
        <template #actions="data">
          <div class="flex gap-2.5">
            <template v-if="Number(data.value.grand_total - data.value.amount_paid) > 0">
              <a v-if="ability.can('update', 'purchaseReturn')" @click="addAmountInvoice(data.value)" class="bg-blue-100 p-2 rounded-md cursor-pointer">
                <Lucide icon="PencilLine" class="w-4 h-4 text-blue-500" />
              </a>
            </template>
            <a href="#" class="bg-[#96837f33] p-2 rounded-md" @click="isAllView(data.value.id)">
              <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
            </a>
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>

  <!-- BEGIN: Delete Confirmation Modal -->
  <Dialog :open="isAmountInvoiceModel" @close="closeDeleteModal">
    <Dialog.Panel>
      <div class="py-4">
        <div class="border-b border-gray-300 mb-4">
          <h4 class="text-lg text-black font-semibold pb-3 px-6">{{ $t('purchase-returns.receiveAmount') }}</h4>
        </div>
        <div class="mb-4 px-8 ">
          <FormLabel class="text-gray-700 font-medium mb-1.5 flex">{{ $t('purchase-returns.amountReceived') }}</FormLabel>
          <FormInput
              v-model="isInvoiceAmount.amount"
              :disabled="Number(isAmountInvoiceId?.grand_total - isAmountInvoiceId?.amount_paid) <= 0"
              type="number"
              min="0"
              class="w-full px-4 py-2 border rounded-lg"
              :class="{'border-red-500': form.invalid('amount')}"
          />
          <template v-if="form.invalid('amount')">
            <div class="mt-1 text-xs text-red-600">{{ form.getError('amount') }}</div>
          </template>
        </div>
        <div class="px-8 mb-4">
          <FormLabel class="text-gray-700 font-medium mb-1.5 flex">{{ $t('purchase-returns.paymentType') }}</FormLabel>
          <div class="flex items-center w-full">
            <TomSelect
                v-model="isInvoiceAmount.payment_type"
                :disabled="Number(isAmountInvoiceId?.grand_total - isAmountInvoiceId?.amount_paid) <= 0"
                :options="{ placeholder: $t('purchase-returns.selectPayment') }"
                class="w-full bg-white rounded-lg"
                :class="{'border-red-500': form.invalid('payment_type')}"
            >
              <option></option>
              <option value="CC">{{ $t('purchase-returns.cc') }}</option>
              <option value="Cash">{{ $t('purchase-returns.cash') }}</option>
            </TomSelect>
          </div>
          <template v-if="form.invalid('payment_type')">
            <div class="mt-1 text-xs text-red-600">{{ form.getError('payment_type') }}</div>
          </template>
        </div>
      </div>
      <div class="px-8 pb-8 flex items-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1 h-10">
          {{ $t('purchase-returns.cancel') }}
        </Button>
        <Button variant="primary"
                :disabled="Number(isAmountInvoiceId?.grand_total - isAmountInvoiceId?.amount_paid) <= 0"
                type="button"
                class="ml-4 w-38 h-10"
                @click="submitAmountInvoice"
        >
          <template v-if="isloading">
            <LoadingIcon icon="three-dots" class="w-8 h-5 text-white " />
          </template>
          <template v-else>
            {{ $t('purchase-returns.receiveAmount') }}
          </template>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <InvoiceReturnModel :isListInvoice="isListInvoice" @closeViewInvoice="closeInvoiceView" :isOpenViewInvoice="isOpenViewInvoice" />
</template>
