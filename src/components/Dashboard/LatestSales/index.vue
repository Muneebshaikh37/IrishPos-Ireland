<script setup>
import Lucide from "@/components/Base/Lucide";
import AlertUrl from "@/assets/images/alert.svg";
import { onMounted, ref, watch } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import { RouterLink, useRouter } from "vue-router";
import { FormInput } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import httpClient from "@/network/api/httpClient";
// import { USER_ID, USER } from "@/config/constants";
import Urlbarcode from "@/assets/images/landing-page/barcode.jpg";
import { Dialog } from "@/components/Base/Headless";
import { decimalFormat } from "@/helpers/commonHelper";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import CurrencyFormatter from "../../../utils/currencyFormatter"
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const USER = authStore.getUser;
const printInvoice = () => {
  print();
};

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
const LatestSales = ref();
const isLoadingSeleton = ref(false)
const timeAgo = ref('');
const isfetchLatestSales = async () => {
  try {
    isLoadingSeleton.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/latest-sales?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}&limit=5`)
    const result = handleResponse(response);
    if (result.success) {
      LatestSales.value = result.data
      if (LatestSales.value.length > 0) {
        const createdAt = new Date(LatestSales.value[0].created_at);
        const now = new Date();
        const diffInMs = now - createdAt;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60)) % 60;

        // Assign time ago string to `timeAgo`
        if (diffInHours > 0) {
          timeAgo.value = `${diffInHours} hours ago`;
        } else {
          timeAgo.value = `${diffInMinutes} minutes ago`;
        }
      }

    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isLoadingSeleton.value = false; // Ensure loader hides after request
  }
}
watch([() => props.start_date, () => props.end_date], () => { isfetchLatestSales(); });
const dummy = [1, 2, 3, 4, 5];



const isInvoicePrint = ref(false)
const isLoading = ref(false)
const isDataInvoice = ref()
const isOpenInvoicePrint = async (Uuid) => {
  isInvoicePrint.value = true
  isLoading.value = true;
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
    isLoading.value = false
  }
}
const isCloseInvoicePrint = () => {
  isInvoicePrint.value = false
}

// Initial data load
const locale = ref('en'); // Default locale 

onMounted(() => {
  locale.value = localStorage.getItem('locale') || 'en';
  isfetchLatestSales();
})
</script>

<template>
  <div class="p-5 intro-y box h-full">
    <div class="mb-2 ">
      <h4 class="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-4">{{ $t('dashboard.latestSales') }} <span
          class="text-sm text-gray-400 font-medium ml-3">{{ timeAgo }}</span></h4>
    </div>
    <div v-if="isLoadingSeleton">
      <div class="animate-pulse  bg-slate-200 w-full h-56  rounded-lg"> </div>
    </div>
    <div v-else-if="LatestSales?.length > 0">
      <!-- Latest Sales Content -->
      <div class="space-y-6 relative mb-8">
        <div class="absolute  top-2 bottom-0 border-l border-dashed bg-gray-500 " :class="{ 'right-[5px]': locale === 'ar', 'left-[5px]': locale !== 'ar' }"></div>
        <div class="flex items-start relative" v-for="item in LatestSales" :key="item.id">
          <div class="w-3 h-3 rounded-full border border-primary bg-white relative z-10 mt-2"></div>
          <div class=" flex-1" :class="{ 'mr-6': locale === 'ar', 'ml-6': locale !== 'ar' }">
            <div class="flex items-start justify-between w-full">
              <div class="w-full ">
                <p class="text-gray-700 text-lg font-medium">
                  {{ $t('dashboard.invoiceNumber') }} from POS no. <span class="font-bold">{{ item.invoice_number }} , </span>
                  {{ $t('dashboard.grandTotal') }}: <span class="font-bold"> {{ CurrencyFormatter(Number(item.grand_total).toFixed(0))
                  }}</span>
                </p>
              </div>
              <button class="text-gray-400 bg-[#F5F5F5] py-1.5 px-2 rounded-xl" @click="isOpenInvoicePrint(item.id)">
                <Lucide icon="Eye" class="w-5 h-5 text-gray-500  " />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="p-5 py-10   h-full flex items-center justify-center w-full" v-else>
      <div>
        <img :src="NotFoundIcon" class="w-[160px] mx-auto">
        <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{ $t('dashboard.noDataAvailable') }}</h3>
        <p class="text-base text-gray-400 font-normal pb-4 text-center">{{ $t('dashboard.noDataDescription') }}</p>
        <div class="flex justify-center">
          <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
                  @click="isfetchLatestSales()">
            <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> {{ $t('dashboard.refreshNow') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
  <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[700px]">
      <!-- Skeleton Loader -->
      <InvoiceSkeleton v-if="isLoading" />
      <!-- Invoice Content -->
      <div class="p-8" v-else>
        <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
          <h1 class="text-base font-medium text-gray-600 mb-1">{{ $t('dashboard.saleInvoice') }}</h1>
          <h2 class="text-base font-medium text-gray-600 mb-1">{{ $t('dashboard.invoiceNumber') }}: <span class="text-gray-400">{{
              isDataInvoice.invoice_number }}</span></h2>
          <h2 class="text-base font-medium text-gray-600 mb-1"> {{ USER.store_name }}</h2>
          <h3 class="text-base font-medium text-gray-600 ">{{ USER.address }}</h3>
          <span class="absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
            <Lucide icon="Printer" class="w-5 h-5 text-white" />
          </span>
        </div>

        <!-- Invoice Details -->
        <div class="py-6 border-dashed border-b border-gray-500">
          <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('dashboard.date') }}: <span class="text-gray-400">{{ isDataInvoice.date
            }}</span></h4>
          <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('dashboard.sellerVATNumber') }}: <span class="text-gray-400">{{
              USER.vat_number }}</span></h4>
          <h4 class="text-sm font-medium text-gray-600">{{ $t('dashboard.customer') }}: <span class="text-gray-400"
                                                                                              v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span> <span
              class="text-gray-400" v-else>N/A</span></h4>
        </div>

        <!-- Items Table -->
        <div class="py-4 border-dashed border-b border-gray-500">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
            <tr class="">
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tl-lg">{{ $t('dashboard.productName') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">{{ $t('dashboard.quantity') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('dashboard.discount') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('dashboard.price') }} <p
                  class="text-[10px] -mt-1">(VAT Excl.)</p>
              </th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('dashboard.vat') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('dashboard.total') }} <p
                  class="text-[10px] -mt-1">(VAT Incl.)</p>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="list in isDataInvoice.items" :key="list.id">
              <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
              <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
              <td class="py-3 px-2 text-xs">{{ list.discount }}</td>
              <td class="py-3 px-2 text-xs">{{ decimalFormat(list.unit_price) }}</td>
              <td class="py-3 px-2 text-xs">{{ list.vat_amount }}</td>
              <td class="py-3 px-2 text-xs">{{ list.total }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Total and Grand Total -->
        <div class="py-4 border-dashed border-b border-gray-500">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('dashboard.total') }} (VAT Exclusive)</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.total_amount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('dashboard.vat') }} Amount</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.vat_amount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('dashboard.discount') }}</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.invoice_discount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('dashboard.grandTotal') }}</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.grand_total }}</h4>
          </div>
        </div>

        <!-- QR Code -->
        <div class="py-4" v-if="isDataInvoice?.qr_code">
          <h4 class="text-gray-600 font-medium text-center mb-4 mt-2">{{ $t('dashboard.scanToGetInformation') }}</h4>
          <div class="flex items-center justify-center">
            <img :src="isDataInvoice.qr_code" class="w-28 border border-[#d9d9d9] p-2"
                 alt="Invoice Barcode" />
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>