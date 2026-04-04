<script setup>
import {ref, defineProps, defineEmits } from 'vue'
import Lucide from "@/components/Base/Lucide";
import { Dialog } from "@/components/Base/Headless";

const props = defineProps({
 isOpenViewInvoice: {
    type: Boolean,
    required: true,
  },
  isListInvoice:{
    type: Object,
    required: true,
  }
});  
console.log("props",props)
const emit = defineEmits(['closeViewInvoice']); 
const isCloseViewInvoice = () => {
  emit('closeViewInvoice');
};  
</script>


<template>
  
  <Dialog :open="isOpenViewInvoice" @close="isCloseViewInvoice">
    <Dialog.Panel class="md:w-[700px]">
      <div class="py-4" v-if="isListInvoice">
        <div class="border-b border-gray-300 mb-4 relative">
          <h4 class="text-lg text-black font-semibold pb-3 px-6">{{ $t('purchase-returns.heading') }} <span class="text-primary text-sm ml-2">{{ isListInvoice.return_number }}</span></h4>
          <span @click="isCloseViewInvoice"
                class="flex justify-center items-center absolute top-0 right-4 cursor-pointer border border-gray-500 rounded-full p-0.5">
                        <Lucide icon="X" class="w-5 h-5 text-gray-700" />
                    </span>
        </div>
        <div class="mb-4">
          <div>
            <div class="grid grid-cols-12 gap-6 mt-5 px-4">
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.supplierName') }}:</h5>
                <h3 class="font-medium text-base text-gray-700">{{ isListInvoice.supplier.supplier_name }}</h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.supplierInvoiceNumber') }}:</h5>
                <h3 class="font-medium text-base text-gray-700">{{ isListInvoice.supplier_invoice_number }}</h3>
              </div>
              <div class="col-span-4"></div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.total') }} <span class="text-[10px] text-gray-600 font-medium">({{ $t('purchase-returns.vatExclusive') }}):</span></h5>
                <h3 class="font-medium text-base text-gray-700">{{ isListInvoice.total_amount }}</h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500 uppercase">{{ $t('purchase-returns.vat') }}:</h5>
                <h3 class="font-medium text-base text-gray-700">{{ isListInvoice.vat }}</h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.total') }} <span class="text-[10px] text-gray-600 font-medium">({{ $t('purchase-returns.vatInclusive') }}):</span></h5>
                <h3 class="font-medium text-base text-gray-700">{{ isListInvoice.grand_total }}</h3>
              </div>
            </div>
            <div class="grid grid-cols-12 gap-6 mt-5 mx-4 bg-[#F7F8FA] p-4 rounded-lg">
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.amountReceived') }}:</h5>
                <h3 class="font-medium text-base text-gray-700">{{ isListInvoice.amount_paid }}</h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.remainingAmount') }}:</h5>
                <h3 class="font-medium text-base text-gray-700" v-if="Number(isListInvoice.grand_total - isListInvoice.amount_paid) <= 0">0.00</h3>
                <h3 class="font-medium text-base text-gray-700" v-else>
                  {{ Number(isListInvoice.grand_total - isListInvoice.amount_paid).toFixed(2) }}
                </h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.paymentType') }}:</h5>
                <h3 class="font-medium text-base text-gray-700">{{ isListInvoice.payment_type }}</h3>
              </div>
            </div>
            <div class="p-4 pt-6">
              <div class="border border-gray-200 rounded-lg">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead>
                  <tr class="bg-gray-100 border-b">
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tl-lg">{{ $t('purchase-returns.productName') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium">{{ $t('purchase-returns.packing') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium">{{ $t('purchase-returns.returnPrice') }} <p class="text-[9px] -mt-0.5">({{ $t('purchase-returns.vatExclusive') }})</p></th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.qty') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.vat') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.totalPrice') }} <p class="text-[9px] -mt-0.5">({{ $t('purchase-returns.vatExclusive') }})</p></th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.totalPrice') }} <p class="text-[9px] -mt-0.5">({{ $t('purchase-returns.vatInclusive') }})</p></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="list in isListInvoice.items"
                      class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td class="py-3 px-2 text-xs">{{ list.product_name_en }} </td>
                    <td class="py-3 px-2 text-xs">{{ list.packing }} </td>
                    <td class="py-3 px-2 text-xs">{{ list.unit_price }} </td>
                    <td class="py-3 px-2 text-xs">{{ list.quantity }} </td>
                    <td class="py-3 px-2 text-xs">{{ list.vat }} </td>
                    <td class="py-3 px-2 text-xs">{{ list.total }} </td>
                    <td class="py-3 px-2 text-xs">{{ Number(list.total) + Number(list.vat) }} </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="py-4" v-else>
        <div class="border-b border-gray-300 mb-4 relative">
          <h4 class="text-lg text-black font-semibold pb-3 px-6">{{ $t('purchaseInvoice.heading') }} <span class="text-primary text-sm ml-2 animate-pulse bg-slate-200 rounded-full w-[80px]"> </span></h4>
          <span @click="isCloseViewInvoice" class="flex justify-center items-center absolute top-0 right-4 cursor-pointer border border-gray-500 rounded-full p-0.5">
                        <Lucide icon="X" class="w-5 h-5 text-gray-700" />
                    </span>
        </div>
        <div class="mb-4">
          <div>
            <div class="grid grid-cols-12 gap-6 mt-5 px-4">
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.supplierName') }}:</h5>
                <h3 class="font-medium text-base text-gray-700"></h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.supplierInvoiceNumber') }}:</h5>
                <h3 class="font-medium text-base text-gray-700"></h3>
              </div>
              <div class="col-span-4"></div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.total') }} <span class="text-[10px] text-gray-600 font-medium">({{ $t('purchase-returns.vatExclusive') }}):</span></h5>
                <h3 class="font-medium text-base text-gray-700"></h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500 uppercase">{{ $t('purchase-returns.vat') }}:</h5>
                <h3 class="font-medium text-base text-gray-700"></h3>
              </div>
              <div class="col-span-4">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.total') }} <span class="text-[10px] text-gray-600 font-medium">({{ $t('purchase-returns.vatInclusive') }}):</span></h5>
                <h3 class="font-medium text-base text-gray-700"></h3>
              </div>
            </div>
            <div class="grid grid-cols-12 gap-6 mt-5 mx-4 bg-[#F7F8FA] p-4 rounded-lg">
              <div class="col-span-6">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.amountPaid') }}:</h5>
                <h3 class="font-medium text-base text-gray-700"></h3>
              </div>
              <div class="col-span-6">
                <h5 class="font-normal text-xs text-gray-500">{{ $t('purchase-returns.paymentType') }}:</h5>
                <h3 class="font-medium text-base text-gray-700"></h3>
              </div>
            </div>
            <div class="p-4 pt-6">
              <div class="border border-gray-200 rounded-lg">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead>
                  <tr class="bg-gray-100 border-b">
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tl-lg">{{ $t('purchase-returns.productName') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium">{{ $t('purchase-returns.unit') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium">{{ $t('purchase-returns.unitPrice') }} <p class="text-[9px] -mt-0.5">({{ $t('purchase-returns.vatExclusive') }})</p></th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.qty') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.vat') }}</th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.totalPrice') }} <p class="text-[9px] -mt-0.5">({{ $t('purchase-returns.vatExclusive') }})</p></th>
                    <th scope="col" class="px-2 py-2 text-xs text-gray-700 font-medium rounded-tr-lg">{{ $t('purchase-returns.totalPrice') }} <p class="text-[9px] -mt-0.5">({{ $t('purchase-returns.vatInclusive') }})</p></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td class="py-3 px-2 text-xs"></td>
                    <td class="py-3 px-2 text-xs"></td>
                    <td class="py-3 px-2 text-xs"></td>
                    <td class="py-3 px-2 text-xs"></td>
                    <td class="py-3 px-2 text-xs"></td>
                    <td class="py-3 px-2 text-xs"></td>
                    <td class="py-3 px-2 text-xs"></td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>