<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { RouterLink, useRoute } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import { onMounted, ref, reactive } from "vue";
import apiService from '@/network/api/apiService';
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import ErrorHandler from "@/utils/validation";


const createStockCountForm = ref({
  id: "",
  countId: "",
  countName: "",
  countDate: "",
  notes: "",
  status: null,
  products: [
    {
      id: "",
      productId: "",
      expected: 0,
      counted: 0,
      difference: "",
      cost: ""
    }
  ]
});

const isLoading = ref(false);
const form = reactive(new ErrorHandler());
const fixedDate = ref(new Date().toISOString().split("T")[0]);

const route = useRoute();
const allStockFetch = async () => {
  try {
    isLoading.value = true;
    const response = await apiService.stockCount.show(route.params.uuid);
    const result = handleResponse(response);
    if (result.success) {
      const data = result.data.data;
      // Map the response data to form fields, handling both snake_case and camelCase
      createStockCountForm.value = {
        ...data,
        countName: data.count_name || data.countName || '',
        countDate: data.count_date || data.countDate || fixedDate.value,
        countId: data.count_id || data.countId || '',
        products: data.products || []
      };
    } else {
      console.error("Failed to fetch stock details:", result);
    }
  } catch (error) {
    const result = handleError(error);
    console.error("Error fetching stock details:", result);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  createStockCountForm.value.countDate = fixedDate.value;
  allStockFetch();
});
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/inventory/stock-count">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-medium">{{ $t('stock-count.viewStockCount') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-6">
            <FormLabel>{{ $t('stock-count.countName') }} <span class="text-danger">*</span></FormLabel>
            <FormInput v-model="createStockCountForm.countName" disabled id="countName" type="text"
                       :placeholder="$t('stock-count.countName')" />
          </div>
          <div class="col-span-12">
            <FormLabel>{{ $t('stock-count.notes') }}</FormLabel>
            <FormTextarea v-model="createStockCountForm.notes" disabled class="py-2 pl-4 resize-none" :rows="3"
                          :placeholder="$t('stock-count.notes')">
            </FormTextarea>
          </div>
          <div class="col-span-12">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead>
              <tr class="bg-gray-100 border-b">
                <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{ $t('stock-count.productName') }}</th>
                <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{ $t('stock-count.systemInventory') }}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('stock-count.physicalStock') }}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('stock-count.variance') }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(product, index) in createStockCountForm.products" :key="product.id || index"
                  class="border-b">
                <td class="py-3 px-4">{{ product.product?.name_en }}</td>
                <td class="py-3 px-6">{{ product.expected }}</td>
                <td class="py-3 px-4">{{ product.counted }}</td>
                <td class="py-3 px-4">{{ Number(product.difference).toFixed(0) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isLoading" class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
                 :color="'#fff'" :size="'50px'"></clip-loader>
  </div>
</template>
