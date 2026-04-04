<template>
  <vue3-datatable
      ref="datatable"
      :rows="data"
      :columns="columns"
      :loading="loading"
      :totalRows="totalRows"
      :isServerMode="true"
      :pageSize="params.pageSize"
      :sortable="true"
      :sortColumn="params.sortColumn"
      :sortDirection="params.sortDirection"
      :search="params.search"
      @change="changeServer"
  >
    <template #status="slotProps">
 <span
     class="px-2 py-1 capitalize rounded text-white"
     :class="{
    'bg-red-500': slotProps.value.status === 'hold',
    'bg-green-500': slotProps.value.status !== 'hold',
  }"
 >
  {{ slotProps.value.status === 'hold' ? 'hold' : 'paid' }}
</span>


    </template>
    <template #actions="slotProps">
      <div class="flex gap-2.5">
        <a href="#" class="bg-[#96837f33] p-2 rounded-md" @click="isOpenInvoicePrint(slotProps.value.id)">
          <Lucide icon="Eye" class="w-4 h-4 text-gray-600"/>
        </a>
        <a v-if="slotProps.value.status === 'hold'" href="#" class="bg-green-100 p-2 rounded-md"
           @click="editInvoice(slotProps.value.id)">
          <Lucide icon="Pencil" class="w-4 h-4 text-green-600"/>
        </a>
        <a v-if="slotProps.value.status !== 'hold' && slotProps.value.type.toLowerCase() !== 'return'" href="#"
           class="bg-blue-100 p-2 rounded-md cursor-pointer" @click="openReturnInvoice(slotProps.value.id)">
          <Lucide icon="RotateCcw" class="w-4 h-4 text-blue-500"/>
        </a>
      </div>
    </template>
  </vue3-datatable>


  <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[700px]">
      <InvoiceSkeleton v-if="isLoading"/>
      <!-- Invoice Content -->
      <div class="p-8" v-else>
        <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
          <h1 class="text-base font-medium text-gray-600 mb-1">Sale Invoice</h1>
          <h2 class="text-base font-medium text-gray-600 mb-1">Invoice Number: <span
              class="text-gray-400">{{ isDataInvoice.invoice_number }}</span>
          </h2> 
          <h3 class="text-base font-medium text-gray-600 ">Emporium Mall Lahore</h3>
          <span class=" absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
            <Lucide icon="Printer" class="w-5 h-5 text-white"/>
          </span>
        </div>
        <div class="py-6 border-dashed border-b border-gray-500">
          <h4 class="text-sm font-medium text-gray-600 mb-2">Date: <span
              class="text-gray-400">{{ isDataInvoice.date }}</span></h4>
          <h4 class="text-sm font-medium text-gray-600 mb-2">Seller VAT Number: <span
              class="text-gray-400">234342453</span></h4>
          <h4 class="text-sm font-medium text-gray-600">Customer: <span class="text-gray-400"
                                                                        v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span>
            <span class="text-gray-400" v-else>N/A</span></h4>
        </div>
        <div class="py-4 border-dashed border-b border-gray-500">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
            <tr class="">
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tl-lg">Product Name</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">Unit</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">Qty</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">Disc</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">Price <p
                  class="text-[10px] -mt-1">(VAT Excl.)</p></th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">VAT</th>
              <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">Total <p
                  class="text-[10px] -mt-1">(VAT Incl.)</p></th>
            </tr>
            </thead>
            <tbody>
            <tr class=" " v-for="list in isDataInvoice.items">
              <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
              <td class="py-3 px-2 text-xs">{{ list.type }}</td>
              <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
              <td class="py-3 px-2 text-xs"> {{ list.discount }}</td>
              <td class="py-3 px-2 text-xs">{{ decimalFormat(list.unit_price) }}</td>
              <td class="py-3 px-2 text-xs"> {{ list.vat_amount }}</td>
              <td class="py-3 px-2 text-xs"> {{ list.total }}</td>
            </tr>


            </tbody>
          </table>
        </div>
        <div class="py-4 border-dashed border-b border-gray-500">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">Total (VAT Exclusive)</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.total_amount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">VAT Amount</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.vat_amount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">Additional Discount</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.invoice_discount }}</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">Grand Total</h4>
            <h4 class="text-gray-600">{{ isDataInvoice.grand_total }}</h4>
          </div>
        </div>
        <div class="py-4">
          <h4 class="text-gray-600 font-medium text-center mb-4 mt-2">Scan to get the information</h4>
          <div class="flex items-center justify-center">
            <img :src="Urlbarcode" class="w-28 ">
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>


<script setup>
import {ref} from "vue"
import Lucide from "@/components/Base/Lucide";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import {useRouter} from "vue-router";
import {Dialog} from "@/components/Base/Headless";
import httpClient from "@/network/api/httpClient";
import {handleResponse, handleError} from "@/network/api/responseHandler";
import Urlbarcode from '../../assets/images/landing-page/barcode.jpg'
import {decimalFormat} from "@/helpers/commonHelper";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";

const props = defineProps({
  data: Array,
  loading: Boolean,
  totalRows: Number,
  params: Object,
  columns: Array,
});
const printInvoice = () => {
  print();
};
const router = useRouter();

const openReturnInvoice = (invoiceId) => {
  router.push({name: 'ReturnInvoice', params: {invoiceId}});
};

const editInvoice = (invoiceId) => {
  router.push({name: 'EditInvoice', params: {invoiceId}});
};

const emit = defineEmits(["deleteRow", "editRow", "changeServer"]);
const changeServer = (data) => {
  emit("changeServer", data);
};
const isInvoicePrint = ref(false)
const isLoading = ref(false)
const isDataInvoice = ref()
const isOpenInvoicePrint = async (Uuid) =>
{
  isInvoicePrint.value = true
  isLoading.value = true;
  isDataInvoice.value = null; // Reset data before fetching new data

  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/returns/${Uuid}`)
    const result = handleResponse(response);
    if (result.success) {
      isDataInvoice.value = result.data.data
      closeDeleteModal();
    }
  } catch (error) {
    const result = handleError(error);
  }finally {
    isLoading.value = false; // Ensure loader hides after request
  }
}
const isCloseInvoicePrint = () => {
  isInvoicePrint.value = false
}


</script>
