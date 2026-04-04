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
import InvoiceModel from "../../../components/Models/PurchaseInvoiceModel/index.vue"
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
	sort_direction: "asc",
	paginate: true,
	column_filters: [],
});

const rows: any = ref(null);
const totalRows = ref(0);
const {t} = useI18n();
const columns: any = ref([
	{ field: 'invoice_number', title: t('purchase-invoices.invoiceNumber'), width: '160px' },
	{ field: 'created_at', title: t('purchase-invoices.date'), width: '200px' },
	{ field: 'grand_total', title: t('purchase-invoices.totalAmount'), width: '200px' },
	{ field: 'amount_paid', title: t('purchase-invoices.amountPaid') },
	{ field: 'remaining_amount', title: t('purchase-invoices.remainingAmount') },
	{ field: 'payment_type', title: t('purchase-invoices.paymentType'), width: '200px' },
	{ field: 'payment_status', title: t('purchase-invoices.paymentStatus'), width: '200px' },
	{ field: 'actions', title: t('purchase-invoices.actions'), sort: false },
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
const formattedDate = (dateStr: any) => {
    const date = new Date(dateStr);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
};



const getUsers = async () => {
	try {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		const signal = controller.signal;
		isloading.value = true;
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL + "/invoices", {
			params: { ...params, user_id: USER_ID },
			signal,
		});

		const result = response.data;
		rows.value = Array.isArray(result?.data) ? result.data : [];
		// Laravel paginator: total is top-level; some APIs use meta.total
		totalRows.value = Number(result?.meta?.total ?? result?.total ?? 0);

	} catch (error) {
		console.error("Error fetching invoices:", error);
	} finally {
		isloading.value = false;
	}
};
const changeServer = (data: any) => {
	params.page = data.current_page;
	params.limit = data.pagesize;
	params.sort = "";
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
	// Clear any previous form errors when opening modal
	form.clear();
};
const closeDeleteModal = () => {
	isAmountInvoiceModel.value = false;
	isAmountInvoiceId.value = null;
	// Clear form errors when closing modal
	form.clear();
	// Reset form data
	isInvoiceAmount.value = {
		amount: "",
		payment_type: "",
		note: "Partial payment for invoice"
	};
};
const addAmountInvoice = (Uuid: any) => {
	openAmountInvoiceModal(Uuid);
	isAmountInvoiceId.value = Uuid
};
const isInvoiceAmount = ref({
	amount: "",
	payment_type: "",
	note: "Partial payment for invoice"
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
			return;
		}

		if (!paymentType || (paymentType !== 'CC' && paymentType !== 'Cash')) {
			form.setErrors({ payment_type: ['The payment type field is required.'] });
			return;
		}

		// Prepare the payload with properly formatted data
		const payload = {
			amount: amount,
			payment_type: paymentType,
			note: isInvoiceAmount.value.note?.trim() || null
		};
		const response = await httpClient.put(
			`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoice-payment/${isAmountInvoiceId.value.id}`,
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
			getUsers();
			toast().fry(pan.purchase.success(result.message))
		}
	} catch (error) {
		console.log('Error response:', error.response?.data);
		if (error.response?.data?.errors) {
			form.setErrors(error.response.data.errors);
			console.log('Form errors set:', form);
		}
	} finally {
		isloading.value = false;
	}
}

const isListInvoice = ref()
const isOpenViewInvoice = ref(false)
const isAllView = async (Uuid: any) => {
	try {
		isOpenViewInvoice.value = true
		// const response = await axios.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoices/${Uuid}`)
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoices/${Uuid}`)
		// const response = await apiService.supplier.delete(isAmountInvoiceId.value);
		const result = handleResponse(response);
		console.log('rtwtwtwrt', result)
		if (result.success) {
			isListInvoice.value = result.data.data
		}
	} catch (error) {
		const result = handleError(error);
	} finally {
		isloading.value = false;
	}
}
const closeInvoiceView = () => {
	isOpenViewInvoice.value = false;
};
const ability = useAbility();

</script>
<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('purchase-invoices.heading') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between">
      <div>
        <RouterLink v-if="ability.can('create', 'purchaseInvoice')" to="/purchasing/invoice/create">
          <Button variant="primary" class="mr-2 shadow-md">
            {{ $t('purchase-invoices.newPurchaseInvoice') }}
          </Button>
        </RouterLink>
      </div>
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('purchase-invoices.searchPlaceholder')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>
    <!-- BEGIN: Data List -->
    <div class="col-span-12">
      <vue3-datatable ref="datatable" :rows="rows" :columns="columns" :loading="isloading" :totalRows="totalRows"
                      :isServerMode="true" :pageSize="params.limit" :sortable="true" :sort="params.sort"
                      :sortDirection="params.sort_direction" :search="params.search" @change="changeServer">
        <template #remaining_amount="data">
          <p v-if="Number(data.value.grand_total - data.value.amount_paid) <= 0">0.00</p>
          <p v-else>{{ Number(data.value.grand_total - data.value.amount_paid).toFixed(2) }}</p>
        </template>
        <template #created_at="data">
          {{ formattedDate(data.value.created_at) }}
        </template>
        <template #actions="data">
          <div class="flex gap-2.5">
            <template v-if="Number(data.value.grand_total - data.value.amount_paid) > 0">
              <a v-if="ability.can('update', 'purchaseInvoice')" @click="addAmountInvoice(data.value)" class="bg-blue-100 p-2 rounded-md cursor-pointer">
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

  <!-- BEGIN: Add Amount Modal -->
  <Dialog :open="isAmountInvoiceModel" @close="closeDeleteModal">
    <Dialog.Panel>
      <div class="py-4">
        <div class="border-b border-gray-300 mb-4">
          <h4 class="text-lg text-black font-semibold pb-3 px-6">{{ $t('purchase-invoices.addAmount') }}</h4>
        </div>
        <div class="mb-4 px-8">
          <FormLabel class="text-gray-700 font-medium mb-1.5 flex">{{ $t('purchase-invoices.amountPaid') }}</FormLabel>
          <FormInput v-model="isInvoiceAmount.amount" type="number" min="0" class="w-full px-4 py-2 border rounded-lg"
                     :disabled="Number(isAmountInvoiceId?.grand_total - isAmountInvoiceId?.amount_paid) <= 0"
                     :class="{ 'border-red-500': form.invalid('amount') }" />
          <template v-if="form.invalid('amount')">
            <div class="mt-1 text-xs text-red-600">{{ form.getError('amount') }}</div>
          </template>
        </div>
        <div class="px-8 mb-4">
          <FormLabel class="text-gray-700 font-medium mb-1.5 flex">{{ $t('purchase-invoices.paymentType') }}</FormLabel>
          <div class="flex items-center w-full">
            <TomSelect :disabled="Number(isAmountInvoiceId?.grand_total - isAmountInvoiceId?.amount_paid) <= 0"
                       v-model="isInvoiceAmount.payment_type" :options="{
						searchField: [],
								placeholder: $t('purchase-invoices.selectPayment'),
							}" class="w-full bg-white serach-remove" :class="{ 'border-red-500': form.invalid('payment_type') }">
              <option> </option>
              <option value="CC">CC</option>
              <option value="Cash">Cash</option>
            </TomSelect>
          </div>
          <template v-if="form.invalid('payment_type')">
            <div class="mt-1 text-xs text-red-600">{{ form.getError('payment_type') }}</div>
          </template>
        </div>
      </div>
      <div class="px-8 pb-8 flex items-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1 h-10">
          {{ $t('purchase-invoices.cancel') }}
        </Button>
        <Button variant="primary" type="button"
                :disabled="Number(isAmountInvoiceId?.grand_total - isAmountInvoiceId?.amount_paid) <= 0"
                class="ml-4 w-32 h-10" @click="submitAmountInvoice">
          <template v-if="isloading">
            <LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
          </template>
          <template v-else>
            {{ $t('purchase-invoices.payAmount') }}
          </template>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <InvoiceModel :isListInvoice="isListInvoice" @closeViewInvoice="closeInvoiceView"
                :isOpenViewInvoice="isOpenViewInvoice" />
</template>
<style scoped>
.switch {
	position: relative;
	display: inline-block;
	width: 50px;
	height: 24px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	-webkit-transition: .4s;
	transition: .4s;
}

.slider:before {
	position: absolute;
	content: "";
	height: 20px;
	width: 20px;
	left: 1px;
	bottom: 2px;
	background-color: white;
	-webkit-transition: .4s;
	transition: .4s;
}

input:checked+.slider {
	background-color: #F96F01;
}

input:focus+.slider {
	box-shadow: 0 0 1px #F96F01;
}

input:checked+.slider:before {
	-webkit-transform: translateX(26px);
	-ms-transform: translateX(26px);
	transform: translateX(26px);
}

.slider.round {
	border-radius: 34px;
}

.slider.round:before {
	border-radius: 50%;
}
</style>
