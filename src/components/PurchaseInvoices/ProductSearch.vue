<template>
  <div class="mb-4">
    <label for="productSearch" class="block text-gray-700 font-medium mb-2">
      {{ $t('product.scanOrType') }}
    </label>
    <div class="relative">
      <FormInput
          type="text"
          id="productSearch"
          v-model="productSearch"
          @input="searchProduct"
          :placeholder="$t('product.placeholder.enterProductCode')"
          :class="{'border-red-500': form.invalid('items')}"
      />
      <span class="absolute top-4 right-5">
        <template v-if="isIconLoading">
          <BuffLoadingIcon icon="three-dots" class="w-6 h-6 text-red-700" />
        </template>
      </span>
    </div>
    <template v-if="form.invalid('items')">
      <div class="mt-2 text-xs text-red-600">{{ form.getError('items') }}</div>
    </template>

    <transition name="fade" mode="out-in">
      <div class="relative" v-if="isloading">
        <div v-if="matchedProducts.length && productSearch.length" class="mt-1 bg-white box rounded-t-none z-[999]" key="matched">
          <ul :class="{'h-[350px] overflow-y-scroll overflow-hidden': matchedProducts.length > 7}" class="absolute top-0 w-full bg-white shadow-md rounded-b-md z-[999] ">
            <li v-for="product in matchedProducts" :key="product.id" class="border-t border-gray-200 py-2 px-3 hover:bg-[#f1f5f9] ">
              <div @click="addProductToInvoice(product)"
                   class="cursor-pointer font-medium text-sm flex justify-between items-center">
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
          <p class="text-gray-500">{{ $t('product.noProductsMatched') }}</p>
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
import Lucide from "@/components/Base/Lucide";
const emit = defineEmits(['add-product']);
const props = defineProps({
  addedProductIds: {
    type: Object,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
});

 

const productSearch = ref('');
const matchedProducts = ref([]);
const isloading = ref(false)
const isIconLoading = ref(false)
async function searchProduct() {
  if (!productSearch.value) {
    matchedProducts.value = [];
    return;
  }
  isIconLoading.value = true;
  try {
    const raw = localStorage.getItem('purchase_products');
    const allProducts = raw ? JSON.parse(raw) : [];
    isloading.value = true;

    // Filter the products based on the search term
    matchedProducts.value = allProducts.filter(product => {
      const nameMatches =
        product.name_en?.toLowerCase().includes(productSearch.value.toLowerCase()) ||
        product.name_ar?.toLowerCase().includes(productSearch.value) ||
        product.sku?.includes(productSearch.value);

      const barcodeMatches =
        product.barcode?.toLowerCase() === productSearch.value.toLowerCase();

      return nameMatches || barcodeMatches;
    });

    // Auto-add product if exact barcode match
    if (
      matchedProducts.value.length === 1 &&
      matchedProducts.value[0].barcode?.toLowerCase() === productSearch.value.toLowerCase()
    ) {
      addProductToInvoice(matchedProducts.value[0]);
    }
  } catch (error) {
    matchedProducts.value = [];
  } finally {
    isIconLoading.value = false;
  }
}

// function searchProduct() {
//   const allProducts = [
//     { id: 'a98c7d38-bb0e-4f0d-bbc5-dc8d02705c0e', name: "Cold Drink", price: 24 },
//     { id: '5fa81e4b-3a13-4091-a76f-b8426b1d4f88', name: "Chocolate Bar", price: 10 }
//   ];

//   if (!productSearch.value) {
//     matchedProducts.value = [];
//     return;
//   }

//   matchedProducts.value = allProducts.filter(product =>
//       product.name.toLowerCase().includes(productSearch.value.toLowerCase()) &&
//       !props.addedProductIds.has(product.id) // Exclude already added products
//   );
// }

function addProductToInvoice(product) {
  emit('add-product', product); // Notify parent to add product
  productSearch.value = "";
  isloading.value = false
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
