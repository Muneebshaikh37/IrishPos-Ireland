<template>
  <div class="mb-4">
    <label for="productSearch" class="block text-gray-700 font-medium mb-2">
      {{ $t('stock-adjustment.product') }}  <span class="text-danger "> *</span>
    </label>
    <div class="relative">
      <FormInput
          type="text"
          id="productSearch"
          v-model="productSearch"
          @input="searchProduct"
          :class="{'border-red-500': invalid}"
          :placeholder="$t('stock-adjustment.enterProductCodeOrName')"
      />
      <span class="absolute top-4 right-5">
    <template v-if="isIconLoading">
      <BuffLoadingIcon icon="three-dots" class="w-6 h-6 text-red-700" />
    </template>
  </span>
    </div>
    <transition name="fade" mode="out-in">
      <div class="relative " v-if="isloading">
        <div v-if="matchedProducts.length && productSearch.length" class="mt-1 bg-white box rounded-t-none z-[999]" key="matched">
          <ul :class="{'h-[350px] overflow-y-scroll overflow-hidden': matchedProducts.length > 7}" class="absolute top-0 w-full bg-white shadow-md rounded-b-md z-[999] ">
            <li v-for="product in matchedProducts" :key="product.id" class="border-t border-gray-200 py-2 px-3 hover:bg-[#f1f5f9] ">
              <div @click="addProductToInvoice(product)"
                   class="cursor-pointer font-medium text-sm  flex justify-between items-center">
                <div class="flex items-center">
                  <div>
                    <h4 class="text-sm mb-1">{{ product.name_en }}</h4>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else-if="productSearch.length" class="mt-4" key="none">
          <p class="text-gray-500">{{ $t('stock-adjustment.noProductsMatched') }}</p>
        </div>
      </div>
    </transition>
  </div>

</template>


<script setup>
import { ref, onMounted, defineProps} from 'vue';
import FormInput from "@/components/Base/Form/FormInput.vue";
import apiService from '@/network/api/apiService';
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import BuffLoadingIcon from "@/components/Base/BuffLoadingIcon";
const emit = defineEmits(['add-product']);
const props = defineProps({
  addedProductIds: {
    type: Object,
    required: true,
  },
  invalid: {
    type: Boolean,
    default: false
  }
});



const productSearch = ref('');
const matchedProducts = ref([]);
const isloading = ref(false)
const isIconLoading = ref(false)
async function searchProduct() {
  if (!productSearch.value || !productSearch.value.trim()) {
    matchedProducts.value = [];
    isloading.value = false;
    return;
  }
  isIconLoading.value = true
  try {
    const searchTerm = productSearch.value.trim().toLowerCase();
    // Pass search term to backend - if backend supports it, it will filter; otherwise we filter on frontend
    const response = await apiService.purchaseInvoice.allList(searchTerm);
    const result = handleResponse(response) 
    if(result.success){
      isloading.value = true
      const allProducts = result.data.data || [];
      
      // Filter products on frontend (in case backend doesn't filter or returns all)
      // Only filter if we got results and search term is provided
      if (allProducts.length > 0 && searchTerm) {
        matchedProducts.value = allProducts.filter(product => {
          // Skip if already added or is a service
          if (product?.is_service || props.addedProductIds.has(product.id)) {
            return false;
          }
          
          // Check name matches (English or Arabic)
          const nameEn = (product.name_en?.toLowerCase() || '').trim();
          const nameAr = (product.name_ar?.toLowerCase() || '').trim();
          
          // For names: match if starts with search term, or contains it as a whole word (with spaces), or contains it if search is 3+ chars
          const nameEnMatches = nameEn.startsWith(searchTerm) || 
                               (nameEn.includes(' ' + searchTerm + ' ') || nameEn.startsWith(searchTerm + ' ') || nameEn.endsWith(' ' + searchTerm)) ||
                               (searchTerm.length >= 3 && nameEn.includes(searchTerm));
          const nameArMatches = nameAr.startsWith(searchTerm) || 
                               (nameAr.includes(' ' + searchTerm + ' ') || nameAr.startsWith(searchTerm + ' ') || nameAr.endsWith(' ' + searchTerm)) ||
                               (searchTerm.length >= 3 && nameAr.includes(searchTerm));
          
          // Check barcode match - only exact match or starts with (strict matching for barcodes)
          const barcode = (product.barcode?.toString().toLowerCase() || '').trim();
          // Only match barcode if it exactly equals search term or starts with it (no partial matches in middle)
          const barcodeMatches = barcode.length > 0 && (barcode === searchTerm || barcode.startsWith(searchTerm));
          
          // Check SKU if available - only exact match or starts with
          const sku = (product.sku?.toString().toLowerCase() || '').trim();
          const skuMatches = sku.length > 0 && (sku === searchTerm || sku.startsWith(searchTerm));
          
          // Return true if name, barcode, or SKU matches
          return nameEnMatches || nameArMatches || barcodeMatches || skuMatches;
        });
      } else {
        matchedProducts.value = [];
      }
    }

  } catch (error) {
    console.error('Error fetching products:', error);
    matchedProducts.value = [];
  }finally {
    isIconLoading.value = false; // Hide loader after the API call completes
  }
}

function addProductToInvoice(product) {
  productSearch.value = '';
  emit('add-product', {
    ...product,
    initial_quantity: product.initial_quantity,
    remove_qty: 0,
    updated_quantity: product.initial_quantity,
    reason: null
  });
  isloading.value = false;
}
</script>

