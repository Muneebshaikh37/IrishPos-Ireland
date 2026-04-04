<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { RouterLink, useRoute } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import { onMounted, ref, reactive, watch, provide } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import ErrorHandler from "@/utils/validation";
import httpClient from '@/network/api/httpClient';

const createStockCountForm = ref({
  id: "",
  count_id: "",
  count_name: "",
  count_date: "",
  notes: "",
  status: null,
  products: [
    {
      id: "",
      product_id: "",
      expected: 0,
      counted: 0,
      difference: "",
      cost: ""
    }
  ]
})

const isloading = ref(false)
const fixedDate = ref(new Date().toISOString().split("T")[0]);

const route = useRoute()
const allStockFetch = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`stock-adjustments/${route.params.uuid}`);
    const result = handleResponse(response);
    if (result.success) {
      createStockCountForm.value = result.data.data
      console.log("sD", result.data.data)
    } else {
      console.error("Failed to fetch stock details:", result);
    }
  } catch (error) {
    const result = handleError(error);
    console.error("Error fetching stock details:", result);
  } finally {
    isloading.value = false;
    console.log("Loading state set to false");
  }
};

onMounted(() => {
  createStockCountForm.value.count_date = fixedDate.value
  allStockFetch()
})
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/inventory/stock-adjustment">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-medium">{{ $t('stock-adjustment.viewStockAdjustment') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-6">
            <FormLabel>{{ $t('stock-adjustment.adjustmentName') }}<span class="text-danger"> *</span></FormLabel>
            <FormInput v-model="createStockCountForm.count_name" disabled id="count_name" type="text"
                       :placeholder="$t('stock-adjustment.adjustmentName')" />
          </div>
          <div class="col-span-6"></div>
          <div class="col-span-12">
            <FormLabel>{{ $t('stock-adjustment.notes') }}</FormLabel>
            <FormTextarea v-model="createStockCountForm.notes" disabled class="py-2 pl-4 resize-none" :rows="3"
                          :placeholder="$t('stock-adjustment.notes')">
            </FormTextarea>
          </div>
          <div class="col-span-12">
            <div class="mt-2">
              <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead>
                <tr class="bg-gray-100 border-b">
                  <th scope="col" class="px-6 py-3 text-gray-700 font-medium w-[350px] rounded-lt-lg">
                    {{ $t('stock-adjustment.productName') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-gray-700 font-medium">
                    {{ $t('stock-adjustment.removedQuantity') }}
                  </th>
                  <th scope="col" class="px-4 py-3 text-gray-700 font-medium">
                    {{ $t('stock-adjustment.availableQuantity') }}
                  </th>
                  <th scope="col" class="px-4 py-3 text-gray-700 font-medium">
                    {{ $t('stock-adjustment.updatedQuantity') }}
                  </th>
                  <th scope="col" class="px-4 py-3 text-gray-700 font-medium rounded-rt-lg">
                    {{ $t('stock-adjustment.reason') }}
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(product, index) in createStockCountForm.adjustmentProduct" :key="product.id || index"
                    class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td class="py-3 px-4">{{ product.product?.name_en }}</td>
                  <td class="py-3 px-6">{{ product.remove_quantity }}</td>
                  <td class="py-3 px-4">{{ product.available_quantity }}</td>
                  <td class="py-3 px-4">{{ product.updated_quantity }}</td>
                  <td class="py-3 px-4">{{ product.adjustmentReason?.title }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isloading"
       class="fixed top-0 w-full h-full left-0 flex items-center justifty-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
                 :color="'#fff'" :size="'50px'"></clip-loader>
  </div>
</template>