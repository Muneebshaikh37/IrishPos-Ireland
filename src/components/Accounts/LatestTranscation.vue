<template>
  <div class="mt-8">
    <h2 class="text-lg font-semibold mb-4">Latest Transactions</h2>
    <div class="overflow-x-auto rounded-lg  bg-white">
      <vue3-datatable
        :rows="transactions"
        :columns="columns"
        :loading="loading"
        :totalRows="totalRows"
        :isServerMode="false"
        :pageSize="10"
        :sortable="true"
        :search="search"
        @change="handleChange"
      >
        <template #entry_date="data">
          <div class="text-sm text-gray-700">{{ data.value.entry_date }}</div>
        </template>
         
        <template #referenceable_id="data">
          <div v-if="data.value.referenceable_type === 'purchase_invoice' || data.value.referenceable_type === 'sale_invoice'"
            class="font-semibold text-blue-500 underline cursor-pointer"
            @click="data.value.referenceable_type === 'purchase_invoice' ? isAllView(data.value.referenceable_id) : isOpenInvoicePrint(data.value.referenceable_id)">
            {{ $t('account.viewInvoice') }}
          </div>
          <div v-else class="text-sm text-gray-700">N/A</div>
        </template>
        <template #accountName="data">
          <div class="text-sm text-gray-700">{{ data.value.account.name }}</div>
        </template>
        <template #debit="data">
          <div class="text-sm text-gray-700 ">{{ data.value.debit }}</div>
        </template>
        <template #credit="data">
          <div class="text-sm text-gray-700 ">{{ data.value.credit }}</div>
        </template>
        <template #balance="data">
          <div class="text-sm text-gray-700 ">{{ (Math.abs(data.value.debit - data.value.credit)) }}</div>
        </template>
      </vue3-datatable>
    </div>
  </div>

  <!-- Invoice Dialog -->
  <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[700px]">
      <!-- Skeleton Loader -->
      <div v-if="isInvoicePrintLoading"  class="p-8 text-center">
        Loading....
        </div>
      <!-- Invoice Content -->
      <div class="p-8 invoice-container" v-else>
        <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
          <h1 class="text-base font-medium mb-1">{{ $t('invoices.saleInvoice') }}</h1>
          <h2 class="text-base font-medium mb-1">{{ $t('invoices.invoiceNumber') }}: <span>{{ isDataInvoice.invoice_number }}</span></h2>
          <!-- <h2 class="text-base font-medium mb-1">{{ USER.store_name }}</h2> -->
          <!-- <h3 class="text-base font-medium">{{ USER.address }}</h3>   -->
          <span class="absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
            <Printer class="w-5 h-5 text-white" />
          </span>
        </div>

        <!-- Invoice Details -->
        <div class="py-6 border-dashed border-b border-gray-500">
          <h4 class="text-sm font-medium mb-2">{{ $t('invoices.date') }}: <span>{{ isDataInvoice.date }}</span></h4>
          <!-- <h4 class="text-sm font-medium mb-2">{{ $t('invoices.sellerVatNumber') }}: <span>{{ USER.vat_number }}</span></h4>   -->
          <h4 class="text-sm font-medium">{{ $t('invoices.customer') }}: <span v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span> <span v-else>{{ $t('invoices.na') }}</span></h4>
        </div>

        <!-- Items Table -->
        <div class="py-4 border-dashed border-b border-gray-500 items-list">
          <table class="w-full text-sm text-left rtl:text-right">
            <thead>
              <tr>
                <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tl-lg">{{ $t('invoices.productName') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.qty') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.disc') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.price') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatExcl') }})</p></th>
                <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.vat') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.total') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatIncl') }})</p></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="list in isDataInvoice.items" :key="list.id">
                <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
                <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
                <td class="py-3 px-2 text-xs">{{ list.discount }}</td>
                <td class="py-3 px-2 text-xs">{{ getUnitPrice(list) }}</td>
                <td class="py-3 px-2 text-xs">{{ list.vat_amount }}</td>
                <td class="py-3 px-2 text-xs">{{ list.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total and Grand Total -->
        <div class="py-4 border-dashed border-b border-gray-500">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatExcl') }})</h4>
            <h4>{{ isDataInvoice.total_amount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.vatAmount') }}</h4>
            <h4>{{ isDataInvoice.vat_amount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.additionalDiscount') }}</h4>
            <h4>{{ isDataInvoice.invoice_discount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.grandTotal') }}</h4>
            <h4>{{ isDataInvoice.grand_total }}</h4>
          </div>
        </div>

        <!-- QR Code -->
        <div class="py-4" v-if="isDataInvoice?.qr_code">
          <h4 class="font-medium text-center mb-4 mt-2">{{ $t('invoices.scanToGetInfo') }}</h4>
          <div class="flex items-center justify-center">
            <img
              :src="isDataInvoice.qr_code"
              class="qr-code w-28 border border-[#d9d9d9] p-2"
              :alt="$t('invoices.invoiceBarcode')"
            />
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup>
import { ref, reactive, defineProps, computed } from 'vue';
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import { useRouter } from 'vue-router';
import { Dialog } from "@/components/Base/Headless";
import { Printer } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.js';
import httpClient from '@/network/api/httpClient';

const router = useRouter();
const authStore = useAuthStore();
const USER = computed(() => authStore.user);

const loading = ref(false);
const totalRows = ref(0);
const search = ref("");

const columns = [
  { field: "entry_date", title: "Entry Date" },
  { field: "transaction_type", title: "Transaction type" },
  { field: "referenceable_id", title: "Reference ID" },
  { field: "accountName", title: "Account Name" },
  { field: "debit", title: "Debit" },
  { field: "credit", title: "Credit" },
  { field: "balance", title: "Balance" },
];

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
});

// Use computed property instead of ref to reactively access the prop
const transactions = computed(() => props.transactions);

const handleChange = (data) => {
  // Handle pagination, sorting, and search changes here
  console.log('Table change:', data);
};

// Invoice dialog state
const isInvoicePrint = ref(false);
const isInvoicePrintLoading = ref(false);
const isDataInvoice = ref(null);

const isCloseInvoicePrint = () => {
  console.log('Closing invoice dialog...');
  isInvoicePrint.value = false; 
};

const getUnitPrice = (item) => {
  return (item.total - item.vat_amount) / item.quantity;
};

const printInvoice = () => {
  window.print();
};

const fetchInvoiceData = async (id, type) => {
  console.log('Opening invoice dialog...');
  isInvoicePrint.value = true;
  console.log('isInvoicePrint value:', isInvoicePrint.value);
  isInvoicePrintLoading.value = true;
  try {
    const endpoint = type === 'sale_invoice' ? `${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${id}` : `/api/purchase-invoices/${id}`;
    console.log('Fetching invoice from:', endpoint);
    const response = await httpClient.get(endpoint);
    console.log('Invoice data received:', response.data);
    isDataInvoice.value = response.data.data;
  } catch (error) {
    
    console.error('Error fetching invoice:', error);
  } finally {
    isInvoicePrintLoading.value = false;
    console.log('Dialog loading state:', isInvoicePrintLoading.value);
  }
};

const isAllView = (id) => {
  fetchInvoiceData(id, 'purchase_invoice');
};

const isOpenInvoicePrint = (id) => {
  fetchInvoiceData(id, 'sale_invoice');
};
</script>

<style scoped>
:deep(.bh-datatable) {
  border-collapse: separate;
  border-spacing: 0;
}
:deep(.bh-datatable th),
:deep(.bh-datatable td) {
  border-bottom: 1px dashed #e5e7eb;
}

@media print {
  .invoice-container {
    padding: 0;
  }
  .invoice-container * {
    visibility: visible;
  }
  .invoice-container {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
