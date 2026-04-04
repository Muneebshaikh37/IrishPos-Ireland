<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('return-invoices.returnInvoices') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between intro-y">
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('return-invoices.search')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>
    <div class="col-span-12">
      <vue3-datatable :rows="rows" :columns="columns" :loading="loading" :totalRows="totalRows" :isServerMode="true"
                      :pageSize="params.limit" :sortable="true" :sort="params.sort" :sortDirection="params.sort_direction"
                      :search="params.search" @change="changeServer">
        <template #status="slotProps">
          <span class="px-2 py-1 capitalize rounded text-white" :class="{
            'bg-red-500': slotProps.value.status === 'hold',
            'bg-green-500': slotProps.value.status !== 'hold',
          }">
            {{ slotProps.value.status === 'hold' ? 'hold' : 'paid' }}
          </span>
        </template>
        <template #actions="slotProps">
          <div class="flex gap-2.5">
            <a href="#" v-if="ability.can('list','saleReturn')" class="bg-[#96837f33] p-2 rounded-md" @click="isOpenInvoicePrint(slotProps.value.id)">
              <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
            </a>
          </div>
        </template>
      </vue3-datatable>

    </div>
  </div>

  <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[700px]">
      <InvoiceSkeleton v-if="isLoading"/>
      <!-- Invoice Content -->
      <div class="p-8" v-else>
        <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
          <h1 class="text-base font-medium text-gray-600 mb-1">{{ $t('return-invoices.saleInvoice') }}</h1>
          <h2 class="text-base font-medium text-gray-600 mb-1">{{ $t('return-invoices.invoiceNumberLabel') }} <span
              class="text-gray-400">{{ isDataInvoice.invoice_number }}</span>
          </h2>
          <h2 class="text-base font-medium text-gray-600 mb-1"> {{ USER.store_name }}
          </h2>
          <h3 class="text-base font-medium text-gray-600 ">{{ USER.address }}</h3>
          <span class=" absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
            <Lucide icon="Printer" class="w-5 h-5 text-white" />
          </span>
        </div>
        <div class="py-6 border-dashed border-b border-gray-500">
          <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('return-invoices.dateLabel') }} <span
              class="text-gray-400">{{ isDataInvoice.date }}</span></h4>
          <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('return-invoices.sellerVatNumber') }} <span
              class="text-gray-400">{{ USER.vat_number }}</span></h4>
          <h4 class="text-sm font-medium text-gray-600">{{ $t('return-invoices.customerLabel') }} <span class="text-gray-400"
                                                                                                       v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span> <span
              class="text-gray-400" v-else>{{ $t('return-invoices.notApplicable') }}</span></h4>
        </div>
        <div class="py-4 border-dashed border-b border-gray-500">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
            <tr class="">
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tl-lg">{{ $t('return-invoices.productName') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">{{ $t('return-invoices.qty') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('return-invoices.disc') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('return-invoices.priceVatExcl') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('return-invoices.vat') }}</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('return-invoices.totalVatIncl') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class=" " v-for="list in isDataInvoice.items">
              <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
              <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
              <td class="py-3 px-2 text-xs"> {{ list.discount }}</td>
              <td class="py-3 px-2 text-xs">{{ decimalFormat(list.unit_price) }}</td>
              <td class="py-3 px-2 text-xs"> {{ list.vat_amount }} </td>
              <td class="py-3 px-2 text-xs"> {{ list.total }} </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="py-4 border-dashed border-b border-gray-500">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('return-invoices.totalVatExclusive') }}</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.total_amount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('return-invoices.vatAmount') }}</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.vat_amount ?? 0.00 }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('return-invoices.additionalDiscount') }}</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.invoice_discount ?? 0.00 }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{ $t('return-invoices.grandTotal') }}</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.grand_total }}</h4>
          </div>
        </div>
        <div class="py-4" v-if="isDataInvoice?.qr_code">
          <h4 class="text-gray-600 font-medium text-center mb-4 mt-2">{{ $t('return-invoices.scanInfo') }}</h4>
          <div class="flex items-center justify-center">
            <img
                :src="isDataInvoice.qr_code"
                class="w-28 "
                alt="Invoice Barcode"
            />
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { normalizeInvoiceDetailFromApi } from "@/helpers/posInvoiceHelper.js";
import { FormInput } from "@/components/Base/Form";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import Lucide from "@/components/Base/Lucide";
import { handleError, handleResponse } from "@/network/api/responseHandler";
import { useDatatable } from "@/composables/useDatatable";
import httpClient from "@/network/api/httpClient";
import { Dialog } from "@/components/Base/Headless";
import Urlbarcode from "@/assets/images/landing-page/barcode.jpg";
import { decimalFormat } from "@/helpers/commonHelper";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";
import { useAbility } from "@casl/vue";
import { useAuthStore } from "@/stores/auth";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const USER = authStore.getUser;

const {t} = useI18n();
// State
const columns = [
  { field: "invoice_number", title: t('return-invoices.invoiceNumber') },
  { field: "date", title: t('return-invoices.date') },
  { field: "grand_total", title: t('return-invoices.invoiceTotal') },
  { field: "payment_type", title: t('return-invoices.paymentMethod') },
  { field: "customer_name", title: t('return-invoices.customer'), sort: false },
  { field: "status", title: t('return-invoices.status') },
  { field: "actions", title: t('return-invoices.actions'), sort: false },
];

const { rows: returnRowsRaw, totalRows, loading, params, fetchData, changeServer } = useDatatable(
  import.meta.env.VITE_PUBLIC_API_URL_POS + "/returns",
  { user_id: USER_ID }
);

const rows = computed(() =>
  (returnRowsRaw.value || []).map((r: any) => ({
    ...r,
    date: r.date ?? r.created_at ?? "",
    customer_name: r.customer_name ?? "",
  }))
);

const isInvoicePrint = ref(false);
const isLoading = ref(false);
const isDataInvoice = ref();

// Open invoice print dialog
const isOpenInvoicePrint = async (Uuid) => {
  isInvoicePrint.value = true;
  isLoading.value = true;
  isDataInvoice.value = null;
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/returns/${Uuid}`, {
      params: { user_id: USER_ID },
    });
    const result = handleResponse(response);
    if (result.success) {
      isDataInvoice.value = normalizeInvoiceDetailFromApi(result.data);
    }
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false; // Ensure loader hides after request
  }
};

// Close invoice print dialog
const isCloseInvoicePrint = () => {
  isInvoicePrint.value = false;
};

// Initialize data fetch
onMounted(() => {
  fetchData(); // Fetch data on mount
});
const printInvoice = () => {
  print();
};
// Invoice summary calculation
const invoiceSummary = computed(() => ({
  "Total (VAT Exclusive)": isDataInvoice.value?.total_amount || t('return-invoices.notApplicable'),
  "VAT Amount": isDataInvoice.value?.vat_amount || t('return-invoices.notApplicable'),
  "Additional Discount": isDataInvoice.value?.invoice_discount || t('return-invoices.notApplicable'),
  "Grand Total": isDataInvoice.value?.grand_total || t('return-invoices.notApplicable'),
}));

const ability = useAbility();
</script>