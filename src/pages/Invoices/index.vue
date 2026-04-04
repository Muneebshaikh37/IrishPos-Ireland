<template>
  <h2 class="mt-10 text-lg font-semibold intro-y"> {{ $t('invoices.invoices') }}</h2>

  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between intro-y">
      <div class="col-span-12 flex justify-between items-center w-full">
        <div class="flex items-center col-span-6 ">
          <RouterLink v-if="!loading && openRegister"
                      :to="{ name: 'RegisterInvoice', params: { registerId: openRegister } }">
            <Button variant="primary" class="mr-2 shadow-md">
              {{ $t('invoices.continueSelling') }}
            </Button>
          </RouterLink>
          <RouterLink v-else-if="!loading" :to="{ name: 'Register Open' }">
            <Button variant="primary" class="mr-2 shadow-md">
              {{ $t('invoices.openRegister') }}
            </Button>
          </RouterLink>
        </div>
        <div class="relative w-56 text-slate-500 mr-3 ">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('invoices.searchPlaceholder')"/>
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"/>
        </div>
      </div>
    </div>
    <div class="col-span-12">
      <vue3-datatable :rows="rows" :columns="columns" :loading="loading" :totalRows="totalRows" :isServerMode="true"
                      :pageSize="params.limit" :sortable="true" :sort="params.sort"
                      :sortDirection="params.sort_direction"
                      :search="params.search" @change="changeServer">
        <template #status="slotProps">
          <span class="px-2 py-1 capitalize rounded text-white" :class="{
            'bg-red-500': slotProps.value.status === 'hold',
            'bg-green-500': slotProps.value.status !== 'hold',
          }">
            {{ slotProps.value.status === 'hold' ? 'hold' : 'paid' }}
          </span>
        </template>
        <template #date="data">
          {{ data.value.date ?? '' }}
        </template>
        <template #payment_type="data">
          {{ data.value.payment_type ?? '' }}
        </template>
        <template #actions="slotProps">
          <div class="flex gap-2.5">
            <a href="#" v-if="ability.can('list','invoice')" class="bg-[#96837f33] p-2 rounded-md"
               @click="isOpenInvoicePrint(slotProps.value.id)">
              <Lucide icon="Eye" class="w-4 h-4"/>
            </a>
            <a v-if="slotProps.value.status === 'hold' && ability.can('create','invoice')"  href="#" class="bg-green-100 p-2 rounded-md"
               @click="editInvoice(slotProps.value.id)">
              <Lucide icon="Pencil" class="w-4 h-4 text-green-600"/>
            </a>
            <a v-if="shouldShowReturnIcon(slotProps.value)" href="#" class="bg-blue-100 p-2 rounded-md cursor-pointer"
              @click="openReturnInvoice(slotProps.value.id)">
              <Lucide icon="RotateCcw" class="w-4 h-4 text-blue-500"/>
            </a>
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>

  <!-- Invoice Table -->
  <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[700px]">
      <!-- Skeleton Loader -->
      <InvoiceSkeleton v-if="isLoading" />
      <!-- Invoice Content -->
      <div class="p-8 invoice-container" v-else>
        <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
          <h1 class="text-base font-medium mb-1">{{ $t('invoices.saleInvoice') }}</h1>
          <h2 class="text-base font-medium mb-1">{{ $t('invoices.invoiceNumber') }}: <span>{{ isDataInvoice.invoice_number }}</span></h2>
          <h2 class="text-base font-medium mb-1">{{ USER.store_name }}</h2>
          <h3 class="text-base font-medium">{{ USER.address }}</h3>
          <span class="absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
          <Lucide icon="Printer" class="w-5 h-5 text-white" />
        </span>
        </div>

        <!-- Invoice Details -->
        <div class="py-6 border-dashed border-b border-gray-500">
          <h4 class="text-sm font-medium mb-2">{{ $t('invoices.date') }}: <span>{{ isDataInvoice.date }}</span></h4>
          <h4 class="text-sm font-medium mb-2">{{ $t('invoices.sellerVatNumber') }}: <span>{{ USER.vat_number }}</span></h4>
          <h4 class="text-sm font-medium">{{ $t('invoices.customer') }}: <span v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span> <span v-else>{{ $t('invoices.na') }}</span></h4>
        </div>

        <!-- Items Table -->
        <div class="py-4 border-dashed border-b border-gray-500 items-list">
          <table class="w-full text-sm text-left rtl:text-right dark:">
            <thead>
            <tr>
              <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tl-lg">{{ $t('invoices.productName') }}</th>
              <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.qty') }}</th>
              <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.disc') }}</th>
              <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.price') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatExcl') }})</p></th>
              <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.vat') }}</th>
              <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.total') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatIncl') }})</p></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="list in isDataInvoice.items" :key="list.id">
              <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
              <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
              <td class="py-3 px-2 text-xs">{{ decimalFormat(list.discount) }}</td>
              <td class="py-3 px-2 text-xs">{{ decimalFormat(getUnitPrice(list)) }}</td>
              <td class="py-3 px-2 text-xs">{{ decimalFormat(list.vat_amount) }}</td>
              <td class="py-3 px-2 text-xs">{{ decimalFormat(list.total) }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Total and Grand Total -->
        <div class="py-4 border-dashed border-b border-gray-500">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatExcl') }})</h4>
            <h4>{{ decimalFormat(isDataInvoice.total_amount) }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.vatAmount') }}</h4>
            <h4>{{ decimalFormat(isDataInvoice.vat_amount) }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.additionalDiscount') }}</h4>
            <h4>{{ decimalFormat(isDataInvoice.invoice_discount) }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.grandTotal') }}</h4>
            <h4>{{ decimalFormat(isDataInvoice.grand_total) }}</h4>
          </div>
        </div>

        <!-- QR Code -->
        <div class="py-4" v-if="isDataInvoice?.qr_code">
          <h4 class="font-medium text-center mb-4 mt-2">{{ $t('invoices.scanToGetInfo') }}</h4>
          <div class="flex items-center justify-center">
            <img
                :src="isDataInvoice.qr_code"
                class="qr-code w-28 border border-[#d9d9d9] p-2"
                alt="{{ $t('invoices.invoiceBarcode') }}"
            />
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import {RouterLink, useRouter} from "vue-router";
import {FormInput} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import Lucide from "@/components/Base/Lucide";
import httpClient from "@/network/api/httpClient";
import {handleError, handleResponse} from "@/network/api/responseHandler";
import Urlbarcode from "@/assets/images/landing-page/barcode.jpg";
import {Dialog} from "@/components/Base/Headless";
import {decimalFormat} from "@/helpers/commonHelper";
import { normalizeInvoiceDetailFromApi } from "@/helpers/posInvoiceHelper.js";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";
import {useAbility} from "@casl/vue";

import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const USER = authStore.getUser;
// Props
const props = defineProps({
  registerId: {
    type: String,
    required: true,
  },
});
const router = useRouter();
const ability = useAbility();

const loading = ref(false);
const totalRows = ref(0);
const rows = ref([]);
const openRegister = ref(null);

const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "",
  sort_direction: "desc",
  paginate: true,
  column_filters: [],
});

const {t} = useI18n();
// Columns for the table
const columns = [
  {field: "invoice_number", title: t('invoices.invoiceNumber')},
  {field: "date", title: t('invoices.date')},
  {field: "grand_total", title: t('invoices.invoiceTotal')},
  {field: "payment_type", title: t('invoices.paymentMethod')},
  {field: "customer_name", title: t('invoices.customer'), sort: false},
  {field: "status", title: t('invoices.status')},
  {field: "actions", title: t('invoices.actions'), sort: false},
];


let controller: any;
let timer: any;
const filterUsers = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchInvoices();
  }, 300);
};
const editInvoice = (invoiceId) => {
  router.push({name: 'EditInvoice', params: {invoiceId}});
};

const printInvoice = () => {
  print();
};
// Fetch data from the server
const fetchInvoices = async () => {

  try {
    // cancel request if previous request still pending before next request fire
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    loading.value = true;

    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + "/invoices", {
      params: {...params, user_id: USER_ID},
      signal: controller.signal,
    });
    const result = response.data;
    const list = Array.isArray(result.data) ? result.data : [];
    rows.value = list.map((inv: any) => ({
      ...inv,
      date: inv.date ?? inv.created_at ?? "",
      customer_name: inv.customer_name ?? inv.customer?.name ?? "",
    }));
    totalRows.value = result.meta?.total ?? result.total ?? 0;
    openRegister.value = result.meta?.open_register_id ?? result.open_register_id ?? "";
  } catch (error) {
    console.error("Error fetching invoices:", error);
  } finally {
    loading.value = false;
  }
};

const changeServer = (data: any) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort = data.sort_column ? (data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`) : "";
  params.sort_direction = data.sort_direction;
  params.search = data.search;

  if (data.change_type === 'search') {
    filterUsers();
  } else {
    fetchInvoices();
  }
};

const isInvoicePrint = ref(false)
const isLoading = ref(false)
const isDataInvoice = ref()
const isOpenInvoicePrint = async (Uuid) => {
  isInvoicePrint.value = true
  isLoading.value = true;
  isDataInvoice.value = null; // Reset data before fetching new data
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${Uuid}`, {
      params: { user_id: USER_ID },
    });
    const result = handleResponse(response);
    if (result.success) {
      isDataInvoice.value = normalizeInvoiceDetailFromApi(result.data);
    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isLoading.value = false; // Ensure loader hides after request
  }
}
const isCloseInvoicePrint = () => {
  isInvoicePrint.value = false
}
const openReturnInvoice = (invoiceId) => {
  router.push({name: 'ReturnInvoice', params: {invoiceId}});
};

const shouldShowReturnIcon = (invoice) => {
  // Don't show return button for invoices on hold
  if (invoice.status === 'hold') {
    return false;
  }

  if (!invoice.returns || invoice.returns.length === 0) {
    return true; // No returns yet, show return button
  }

  // Calculate the total returned amount
  const totalReturnedAmount = invoice.returns.reduce((sum, returnInvoice) => {
    return sum + parseFloat(returnInvoice.grand_total || 0);
  }, 0);

  // Compare with the original invoice's grand total
  return totalReturnedAmount < parseFloat(invoice.grand_total);
};
// Initial data load
onMounted(fetchInvoices);

const getUnitPrice = (list) => {
  const total = parseFloat(list.total || 0);
  const vat = parseFloat(list.vat_amount || 0);
  return total - vat;
};

</script>
<style>
@media print {
  /* Set page size and margins */
  @page {
    size: auto;
    margin: -10mm 0mm -10mm -6mm;
  }

  #app {
    display: none;
  }

  /* Enlarge the QR code image */
  .qr-code {
    width: 100% !important; /* Adjust this value as needed */
    height: auto;
  }

  /* Increase overall text size for the invoice */
  .invoice-container {
    font-size: 16px !important;
    font-weight: bold;
    page-break-before: always !important;
  }

  /* Specifically increase the text size for table cells in the items list */
  .items-list td, .items-list th {
    font-size: 12px !important;
  }
  .invoice-container .items-list {
   page-break-inside: avoid;
   page-break-after: auto;
  }
}
</style>
