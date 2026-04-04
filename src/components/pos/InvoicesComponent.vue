<template>
  <div class="grid  grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 flex justify-between intro-y">

      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('invoices.searchPlaceholder')"/>
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"/>
        </div>
      </div>
    </div>
  </div>
  <!-- Invoice Table -->
  <vue3-datatable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :totalRows="totalRows"
      :isServerMode="true"
      :pageSize="params.limit"
      :sortable="true"
      :sort="params.sort"
      :sortDirection="params.sort_direction"
      :search="params.search"
      @change="changeServer"
  >

    <template #status="slotProps">
  <span
      class="px-2 py-1 capitalize rounded text-white"
      :class="{
      'bg-red-500': slotProps.value.status.toLowerCase() === 'hold',
      'bg-green-500': slotProps.value.status.toLowerCase() !== 'hold'
}"
  >
    {{ slotProps.value.status === 'hold' || slotProps.value.status === 'Hold' ? 'hold' : 'paid' }}
  </span>
    </template>
    <template #updated_at="data">
      {{ data.value.updated_at ?? '' }}
    </template>
    <template #payment_type="data">
      {{ data.value.payment_type ?? 'None' }}
    </template>
    <template #customer_name="data">
      {{
        data.value.customer?.name
          ?? data.value.customer_name
          ?? '—'
      }}
    </template>
    <template #actions="data">
      <div class="flex gap-2.5">
        <a href="#" class="bg-[#96837f33] p-2 rounded-md" @click="isOpenInvoicePrint(data.value.id,data.value.type)">
          <Lucide icon="Eye" class="w-4 h-4 text-gray-600"/>
        </a>
        <a v-if="data.value.status === 'hold'" href="#" class="bg-green-100 p-2 rounded-md"
          @click="editInvoice(data.value.id)">
          <Lucide icon="Pencil" class="w-4 h-4 text-green-600"/>
        </a>
        <a v-if="shouldShowReturnIcon(data.value)" href="#" class="bg-blue-100 p-2 rounded-md cursor-pointer"
          @click="openReturnInvoice(data.value.id)">
          <Lucide icon="RotateCcw" class="w-4 h-4 text-blue-500"/>
        </a>
      </div>
    </template>
  </vue3-datatable>

  <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[700px]">
      <InvoiceSkeleton v-if="isLoading"/>
      <!-- Invoice Content -->
      <div class="p-8 invoice-container" v-else>
        <!-- Hold Invoice - Same style as Quotation -->
        <template v-if="isDataInvoice?.status === 'hold'">
          <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
            <div class="flex justify-center mb-3">
              <img src="@/assets/images/jaldi.png" alt="Jaldi Logo" class="h-12" />
            </div>
              
            <h4 class="text-sm font-medium mb-2">{{ $t('invoices.date') }}: <span>{{ isDataInvoice.date }}</span></h4>
            <h4 class="text-sm font-medium">{{ $t('invoices.customer') }}: <span v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span> <span v-else>{{ $t('invoices.na') }}</span></h4>
            <h1 class="text-md font-medium mb-2">{{ $t('invoices.receiptNumber') }}: {{ isDataInvoice.invoice_number }}</h1>
            
            <span class="absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
              <Lucide icon="Printer" class="w-5 h-5 text-white" />
            </span>
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
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatIncl') }})</h4>
              <h4>{{ totalVatIncl }}</h4>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.additionalDiscount') }}</h4>
              <h4>{{ decimalFormat(isDataInvoice.invoice_discount) }}</h4>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.grandTotal') }}</h4>
              <h4>{{ grandTotal }}</h4>
            </div>
          </div>
        </template>
        <!-- Regular Invoice - Original style -->
        <template v-else>
          <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
            <h1 class="text-base font-medium text-gray-600 mb-1">{{ $t('invoices.saleInvoice') }}</h1>
            <h2 class="text-base font-medium text-gray-600 mb-1">{{ $t('invoices.invoiceNumber') }}: <span
                class="text-gray-400">{{ isDataInvoice.invoice_number }}</span>
            </h2>
            <h2 class="text-base font-medium text-gray-600 mb-1"> {{ USER.store_name }}
            </h2>
            <h3 class="text-base font-medium text-gray-600 ">{{ USER.address }}</h3>
            <span class=" absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
              <Lucide icon="Printer" class="w-5 h-5 text-white"/>
            </span>
          </div>
          <div class="py-6 border-dashed border-b border-gray-500">
            <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('invoices.date') }}: <span
                class="text-gray-400">{{ isDataInvoice.date }}</span></h4>
            <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('invoices.sellerVatNumber') }}: <span
                class="text-gray-400">{{ USER.vat_number }}</span></h4>
            <h4 class="text-sm font-medium text-gray-600">{{ $t('invoices.customer') }}: <span class="text-gray-400"
                                                                      v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span>
              <span class="text-gray-400" v-else>{{ $t('invoices.na') }}</span></h4>
          </div>
          <div class="py-4 border-dashed border-b border-gray-500">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead>
              <tr class="">
                <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tl-lg">{{ $t('invoices.productName') }}</th>
                <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">{{ $t('invoices.unit') }}</th>
                <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">{{ $t('invoices.qty') }}</th>
                <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.disc') }}</th>
                <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.price') }} <p
                    class="text-[10px] -mt-1">({{ $t('invoices.vatExcl') }})</p></th>
                <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.vat') }}</th>
                <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.total') }} <p
                    class="text-[10px] -mt-1">({{ $t('invoices.vatIncl') }})</p></th>
              </tr>
              </thead>
              <tbody>
              <tr class=" " v-for="list in isDataInvoice.items">
                <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
                <td class="py-3 px-2 text-xs">{{ list.type }}</td>
                <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
                <td class="py-3 px-2 text-xs"> {{ decimalFormat(list.discount) }}</td>
                <td class="py-3 px-2 text-xs">{{ decimalFormat(list.unit_price) }}</td>
                <td class="py-3 px-2 text-xs"> {{ decimalFormat(list.vat_amount) }}</td>
                <td class="py-3 px-2 text-xs"> {{ decimalFormat(list.total) }}</td>
              </tr>


              </tbody>
            </table>
          </div>
          <div class="py-4 border-dashed border-b border-gray-500">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatExcl') }})</h4>
              <h4 class="text-gray-600">{{ totalExcl }}</h4>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.vatAmount') }}</h4>
              <h4 class="text-gray-600">{{ vatSum }}</h4>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.additionalDiscount') }}</h4>
              <h4 class="text-gray-600">{{ isDataInvoice.invoice_discount }}</h4>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.grandTotal') }}</h4>
              <h4 class="text-gray-600">{{ grandTotal }}</h4>
            </div>
          </div>
          <div class="py-4" v-if="isDataInvoice?.qr_code">
            <h4 class="text-gray-600 font-medium text-center mb-4 mt-2">{{ $t('invoices.scanToGetInfo') }}</h4>
            <div class="flex items-center justify-center">
              <img
                  :src="isDataInvoice.qr_code"
                  class="w-28 border border-[#d9d9d9] p-2"
                  alt="Invoice Barcode"
              />
            </div>
          </div>
        </template>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup lang="ts">
import {ref, reactive, watch, onMounted, computed} from "vue";
import httpClient from '@/network/api/httpClient';
import Lucide from "@/components/Base/Lucide";
import {FormInput} from "@/components/Base/Form";
import {useDatatable} from "@/composables/useDatatable";
import Urlbarcode from "@/assets/images/landing-page/barcode.jpg";
import {Dialog} from "@/components/Base/Headless";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import {handleError, handleResponse} from "@/network/api/responseHandler";
import { normalizeInvoiceDetailFromApi } from "@/helpers/posInvoiceHelper.js";
import {useRouter} from "vue-router";
import {decimalFormat} from "@/helpers/commonHelper";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";

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
const printInvoice = () => {
  print();
};
const {t} = useI18n();
// Columns for the table
const columns = [
  {field: "invoice_number", title: t('invoices.invoiceNumber')},
  {field: "updated_at", title: t('invoices.date')},
  {field: "grand_total", title: t('invoices.invoiceTotal')},
  {field: "payment_type", title: t('invoices.paymentMethod')},
  {field: "customer_name", title: t('invoices.customer'), sort: false},
  {field: "status", title: t('invoices.status'), sort: false},
  {field: "actions", title: t('invoices.actions'), sort: false},
];

// // Columns for invoices
// const columns = [
//   {field: "invoice_number", title: "Invoice Number"},
//   {field: "updated_at", title: "updated_at"},
//   {field: "grand_total", title: "Invoice Total"},
//   {field: "payment_type", title: "Payment Method"},
//   {field: "customer_name", title: "Customer"},
//   {field: "status", title: "Status"},
//   {field: "actions", title: "Actions"},
// ];

const {rows, totalRows, loading, params, fetchData, changeServer} = useDatatable(
    import.meta.env.VITE_PUBLIC_API_URL_POS + "/invoices",
    {user_id: USER_ID, register_id: props.registerId});

// Watch for changes in `registerId`
// watch(
//     () => props.registerId,
//     (newRegisterId) => {
//       console.log("Register ID changed:", newRegisterId);
//       fetchData();  // Fetch invoices whenever registerId changes
//     },
//     { immediate: true } // Trigger on initial mount
// );
const isInvoicePrint = ref(false);
const isLoading = ref(false);
const isDataInvoice = ref();
const isOpenInvoicePrint = async (Uuid) => {
  isInvoicePrint.value = true
  isLoading.value = true;
  isDataInvoice.value = null;
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
const openReturnInvoice = (invoiceId) => {
  router.push({name: 'ReturnInvoice', params: {invoiceId}});
};

const shouldShowReturnIcon = (invoice) => {
  // If invoice status is 'hold', do not show return button
  if (invoice.status === 'hold') {
    return false;
  }

  // If there are no returns yet, allow return
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


const router = useRouter();
const editInvoice = (invoiceId) => {
  router.push({name: 'EditInvoice', params: {invoiceId}});
};
onMounted(fetchData);
const isCloseInvoicePrint = () => {
  isInvoicePrint.value = false
}

// Computed totals derived from items to ensure accuracy
const totalExcl = computed(() => {
  const items = isDataInvoice.value?.items || [];
  const sum = items.reduce((acc: number, it: any) => {
    const total = parseFloat(it.total || 0);
    const vat = parseFloat(it.vat_amount || 0);
    return acc + (total - vat);
  }, 0);
  return sum.toFixed(2);
});

const vatSum = computed(() => {
  const items = isDataInvoice.value?.items || [];
  const sum = items.reduce((acc: number, it: any) => acc + parseFloat(it.vat_amount || 0), 0);
  return sum.toFixed(2);
});

const grandTotal = computed(() => {
  const items = isDataInvoice.value?.items || [];
  const discount = parseFloat(isDataInvoice.value?.invoice_discount || 0);
  const lineTotal = items.reduce((acc: number, it: any) => acc + parseFloat(it.total || 0), 0);
  return (lineTotal - discount).toFixed(2);
});

const totalVatIncl = computed(() => {
  const items = isDataInvoice.value?.items || [];
  return items.reduce((acc: number, it: any) => acc + parseFloat(it.total || 0), 0).toFixed(2);
});

const getUnitPrice = (list) => {
  const total = parseFloat(list.total || 0);
  const vat = parseFloat(list.vat_amount || 0);
  return total - vat;
};

</script>
