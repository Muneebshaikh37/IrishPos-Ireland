<script setup>
import {
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import httpClient from "@/network/api/httpClient";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { ref, onMounted } from "vue";
import { computed } from "vue";
import { handleResponse } from "@/network/api/responseHandler.js";
import { useRoute, RouterLink, useRouter } from "vue-router";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import { useAuthStore } from "@/stores/auth.js";
import { Dialog } from "@/components/Base/Headless";
import InvoiceModel from "../../../components/Models/PurchaseInvoiceModel/index.vue"
import CustomerModel from "../../../components/Models/CustomerModel/index.vue"
import { useI18n } from "vue-i18n";
import JournalEntrySkeleton from "@/components/Skeletons/JournalEntrySkeleton.vue";
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import { decimalFormat } from "@/helpers/commonHelper";

const authStore = useAuthStore();
const router = useRouter();
const USER_ID = authStore.getUserId;
const route = useRoute();
const entryId = route.params.id || route.params.uuid;
const isEntryLoading = ref(false);
const entry = ref(null);
const showInvoiceModal = ref(false);
const invoiceDetails = ref(null);

const USER = authStore.getUser;
const { t } = useI18n();
const isLoading = ref(false);

const fetchEntry = async () => {
  try {
    isLoading.value = true;
    // Guessing endpoint based on conventions
    const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/journal-entries/${entryId}?user_id=${USER_ID}`);
    entry.value = response.data.data;
  } catch (error) {
    entry.value = null;
  } finally {
    isLoading.value = false;
  }
};
const isInvoicePrint = ref(false)
const isInvoicePrintLoading = ref(false)
const isDataInvoice = ref(null)
const isOpenInvoicePrint = async (Uuid) => {
  isInvoicePrint.value = true
  isInvoicePrintLoading.value = true;
  isDataInvoice.value = null; // Reset data before fetching new data
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${Uuid}`)
    const result = handleResponse(response);
    if (result.success) {
      isDataInvoice.value = result.data.data
    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isInvoicePrintLoading.value = false; // Ensure loader hides after request
  }
}
const isCloseInvoicePrint = () => {
  isInvoicePrint.value = false
}
const getUnitPrice = (list) => {
  const total = parseFloat(list.total || 0);
  const vat = parseFloat(list.vat_amount || 0);
  return total - vat;
};

// Computed totals based on line items to avoid any backend rounding/inconsistencies
const totalExcl = computed(() => {
  const items = isDataInvoice.value?.items || [];
  return items.reduce((sum, it) => {
    const total = parseFloat(it.total || 0);
    const vat = parseFloat(it.vat_amount || 0);
    return sum + (total - vat);
  }, 0).toFixed(2);
});

const vatSum = computed(() => {
  const items = isDataInvoice.value?.items || [];
  return items.reduce((sum, it) => sum + parseFloat(it.vat_amount || 0), 0).toFixed(2);
});

const grandTotal = computed(() => {
  const items = isDataInvoice.value?.items || [];
  const discount = parseFloat(isDataInvoice.value?.invoice_discount || 0);
  const lineTotal = items.reduce((sum, it) => sum + parseFloat(it.total || 0), 0);
  return (lineTotal - discount).toFixed(2);
});
const isOpenCustomerView = ref(false);
const customerData = ref(null);

const handleContactClick = async () => {
  if (entry.value?.contactable_type === 'supplier' && entry.value?.contactable_id) {
    router.push(`/purchasing/supplier/${entry.value.contactable_id}/edit`);
  } else if (entry.value?.contactable_type === 'customer' && entry.value?.contactable_id) {
    try {
      isEntryLoading.value = true;
      const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_CRM}/customers/${entry.value.contactable_id}`);
      customerData.value = response.data;
      isOpenCustomerView.value = true;
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast().fry(pan.customer.error(error.message));
    } finally {
      isEntryLoading.value = false;
    }
  }
};

const closeCustomerView = () => {
  isOpenCustomerView.value = false;
};

// Purchase Invoice Code 
const isListInvoice = ref()
const isOpenViewInvoice = ref(false)
const isAllView = async (Uuid) => {
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
    isEntryLoading.value = false;
  }
}
const closeInvoiceView = () => {
  isOpenViewInvoice.value = false;
};

onMounted(() => {
  fetchEntry();
});
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/account/journal-entries">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('account.ViewJournalEntry') }}</h2>
  </div>

  <!-- Invoice Modal -->
  <InvoiceModel :isListInvoice="isListInvoice" @closeViewInvoice="closeInvoiceView"
    :isOpenViewInvoice="isOpenViewInvoice" />
  <!-- Customer Modal -->
  <CustomerModel :isOpenCustomerView="isOpenCustomerView" :customerData="customerData"
    @closeCustomerView="closeCustomerView" />

  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <!-- Loading State -->
      <JournalEntrySkeleton v-if="isLoading" />

      <!-- No Data State -->
      <div v-else-if="!entry" class="intro-y box">
        <div class="p-5 text-center text-gray-500">
          {{ $t('account.noDataFound') }}
        </div>
      </div>

      <!-- Journal Entry Data -->
      <template v-else>
        <!-- Single Box for Header and Details -->
        <div class="intro-y box mb-5">
          <div class="bg-[#F3F9FF] p-5 mb-4 rounded-tl-lg rounded-tr-lg">
            <h1 class="text-xl font-bold text-gray-900">Journal #{{ entry.entry_number }}</h1>
            <p class="text-base text-gray-700">{{ entry.entry_date }}</p>
          </div>
          <div class="p-5"> 
            <div class="grid grid-cols-12 gap-6"> 
              <div class="col-span-12 md:col-span-3">
                <FormLabel>{{ $t('account.transactionType') }}</FormLabel>
                <div class="text-gray-700">{{ entry.transaction_type || $t('account.manualEntry') }}</div>
              </div>
              <div class="col-span-12 md:col-span-3">
                <FormLabel>{{ $t('account.amount') }}</FormLabel>
                <div class="text-gray-700">{{ entry.amount ? entry.amount.toFixed(2) : '0.00' }}</div>
              </div>
              
              <div class="col-span-12 md:col-span-3">
                <FormLabel>{{ $t('account.Reference') }}</FormLabel>
                <div v-if="entry?.referenceable_type === 'purchase_invoice' || entry?.referenceable_type === 'sale_invoice'"
                  class="font-semibold text-blue-500 underline cursor-pointer"
                  @click="entry?.referenceable_type === 'purchase_invoice' ? isAllView(entry?.referenceable_id) : isOpenInvoicePrint(entry?.referenceable_id)">
                  {{ $t('account.viewInvoice') }}
                </div>
                <div v-else class="font-semibold text-gray-500">N/A</div> 
              </div>
              <div class="col-span-12 md:col-span-3">
                <FormLabel>{{ $t('account.Contact') }}</FormLabel>
                <div v-if="entry?.contactable_type === 'supplier' || entry?.contactable_type === 'customer'"
                  class="font-semibold text-blue-500 underline cursor-pointer"
                  @click="handleContactClick">
                  {{ $t('account.viewContact') }}
                </div>
                <div v-else class="font-semibold text-gray-500">N/A</div>
              </div>
              <div class="col-span-12 md:col-span-12 border-t border-gray-200 pt-4 my-2">
                <FormLabel>{{ $t('account.notes') }}</FormLabel>
                <div class="text-gray-700">{{ entry.notes }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Journal Lines Box -->
        <div class="intro-y box">
          <div class="p-5">
            <FormLabel class="text-lg font-bold">{{ $t('account.journalLines') }}</FormLabel>
            <div class="overflow-x-auto mt-4">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-left ">
                  <tr>
                    <th class="pl-4 p-2">{{ $t('account.accountName') }}</th>
                    <th class="p-2">{{ $t('account.debit') }}</th>
                    <th class="p-2">{{ $t('account.credit') }}</th>
                    <th class="p-2">{{ $t('account.description') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(line, idx) in entry.lines" :key="idx">
                    <td class="pl-4 p-2 min-w-[200px]">{{ line.account.name }}</td>
                    <td class=" p-2 min-w-[120px]">{{ Number(line.debit).toFixed(2) }}</td>
                    <td class="pl-2 p-2 min-w-[120px]">{{ Number(line.credit).toFixed(2) }}</td>
                    <td class="pl-2 p-2 min-w-[220px]">{{ line.description }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-gray-100 font-semibold">
                    <td class="p-2 text-right">{{ $t('account.total') }}:</td>
                    <td class="p-2">{{entry.lines.reduce((sum, l) => sum + Number(l.debit || 0), 0).toFixed(2)}}</td>
                    <td class="p-2">{{entry.lines.reduce((sum, l) => sum + Number(l.credit || 0), 0).toFixed(2)}}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
   <!-- Invoice Table -->
   <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[700px]">
      <!-- Skeleton Loader -->
      <InvoiceSkeleton v-if="isInvoicePrintLoading" />
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
          <!-- If API exposes is_service, show Products and Services separately -->
          <template v-if="isDataInvoice?.items?.length && isDataInvoice.items[0]?.hasOwnProperty('is_service')">
            <!-- Products -->
            <div v-if="isDataInvoice.items.some(i => !i.is_service)">
              <h4 class="text-sm font-semibold mb-2">{{ $t('invoices.products') }}</h4>
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
                <tr v-for="list in isDataInvoice.items.filter(i => !i.is_service)" :key="list.id">
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
            <!-- Services -->
            <div class="mt-6" v-if="isDataInvoice.items.some(i => i.is_service)">
              <h4 class="text-sm font-semibold mb-2">{{ $t('invoices.services') }}</h4>
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
                <tr v-for="list in isDataInvoice.items.filter(i => i.is_service)" :key="list.id">
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
          </template>
          <!-- Fallback: legacy table -->
          <template v-else>
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
          </template>
        </div>

        <!-- Total and Grand Total -->
        <div class="py-4 border-dashed border-b border-gray-500">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatExcl') }})</h4>
            <h4>{{ totalExcl }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('invoices.vatAmount') }}</h4>
            <h4>{{ vatSum }}</h4>
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
