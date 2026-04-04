<template>
  <div class="mb-4">
    <label for="productSearch" class="block text-gray-700 font-medium mb-2">
      {{ $t('product.scanOrType') }}
    </label>
    <div class="relative">
      <FormInput type="text" id="productSearch" v-model="productSearch" />
      <div name="fade" mode="out-in">
        <div
          v-if="matchedProducts.length && productSearch.length"
          class="absolute top-full left-0 mt-1 w-[75%] z-[9999]"
        >
          <!-- Scrollable Product List -->
          <ul class="w-full bg-white rounded-b-md shadow-lg box product-dropdown-list">
            <li
              v-for="(product, index) in matchedProducts"
              :key="product.id"
              :class="[
                'pt-3 pb-2 px-3 bg-white hover:bg-[#f1f5f9] intro-y cursor-pointer',
                index !== matchedProducts.length - 1 ? 'border-b border-dashed border-gray-300' : ''
              ]"
              @click="addProductToInvoice(product)"
            >
              <div class="font-medium text-sm">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm mb-1">{{ product.name_en }}</h4>
                    <p class="text-xs font-light">
                      <span v-if="product.is_service === 1 || product.is_service === true" class="text-blue-600 font-medium">Service</span>
                      <span v-else-if="product.barcode">Barcode - {{ product.barcode }}</span>
                      <span v-else>Product</span>
                    </p>
                  </div>
                  <span class="text-primary">{{ formatMoney(product.sale_price) }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else-if="!matchedProducts.length && productSearch.length" class="absolute top-full left-0 mt-1 w-[75%] z-[9999]">
          <div class="w-full bg-white rounded-lg shadow-lg border border-gray-100">
            <div class="flex items-center justify-between p-6">
              <p class="text-gray-500 font-medium">{{ $t('product.noProductsMatched') }}</p>
              <RouterLink :to="`/inventory/products/create?barcode=${productSearch}`">
                <Button variant="primary" class="mr-2 shadow-md">
                  <Lucide icon="Plus" class="w-5 h-5 mr-2" /> {{ $t('product.addNewProduct') }}
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';
import FormInput from '@/components/Base/Form/FormInput.vue';
import Button from '@/components/Base/Button';
import { RouterLink } from 'vue-router';
import Lucide from '@/components/Base/Lucide';
import { formatMoney } from '@/utils/currency';

// Props and Emits
const props = defineProps({
  addedProductIds: { type: Set, required: true },
  addedServiceIds: { type: Set, required: true },
});
const emit = defineEmits(['add-product', 'add-new-product']);

// Pinia Store
const productStore = useProductStore();
const productSearch = ref('');

// Computed Filtered Products
const matchedProducts = computed(() => {
  const query = productSearch.value.trim().toLowerCase();
  if (!query) return [];

  const result = productStore.products.filter((product) => {
    const nameMatches =
      product.name_en?.toLowerCase().includes(query) ||
      product.name_ar?.toLowerCase().includes(query);

    const barcodeMatches = product.barcode?.toLowerCase() === query;

    // Check if it's already added (either as product or service)
    const isAdded = props.addedProductIds.has(product.id) || props.addedServiceIds.has(product.id);

    return (nameMatches || barcodeMatches) && !isAdded;
  });

  if (result[0]?.barcode?.toLowerCase() === query) {
    addProductToInvoice(result[0]);
    productSearch.value = '';
    return [];
  }

  return result;
});

// Add Product to Invoice
function addProductToInvoice(product) {
  productSearch.value = '';
  emit('add-product', product);
}

defineExpose({ resetSearch: () => (productSearch.value = '') });
</script>

<style>
/* Fixed height dropdown with scrollbar */
.product-dropdown-list {
  height: 300px !important; /* Fixed height - approximately 6-7 items */
  max-height: 300px !important; /* Ensure it doesn't exceed this height */
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

/* Custom Scrollbar Styling */
.product-dropdown-list::-webkit-scrollbar {
  width: 10px !important;
}

.product-dropdown-list::-webkit-scrollbar-thumb {
  background-color: #94a3b8 !important; /* Slate-400 - more visible scrollbar */
  border-radius: 5px;
  border: 2px solid #f1f5f9; /* Add border for better visibility */
}

.product-dropdown-list::-webkit-scrollbar-thumb:hover {
  background-color: #64748b !important; /* Slate-500 - darker on hover */
}

.product-dropdown-list::-webkit-scrollbar-track {
  background-color: #f1f5f9 !important; /* Slate-100 - light gray background */
  border-radius: 5px;
}

/* Firefox scrollbar styling */
.product-dropdown-list {
  scrollbar-width: thin !important;
  scrollbar-color: #94a3b8 #f1f5f9 !important;
}

/* Ensure list items have proper background */
.product-dropdown-list li {
  background-color: white !important;
}

</style>
