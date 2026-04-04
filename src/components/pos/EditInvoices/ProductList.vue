<template>
  <div class="mt-8">
    <h3 class="text-lg font-medium mb-4">{{ $t('invoices.products') }}</h3>
    <div class="border border-gray-200 rounded-lg">
      <table class="w-full text-sm text-left text-gray-500">
      <thead>
      <tr class="bg-gray-100 border-b">
        <th class="px-2 py-3 text-gray-700 font-medium w-[200px]">{{$t('product.productName')}}</th>
        <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.price')}}</th>
        <th class="px-2 py-3 text-gray-700 font-medium min-w-[80px]">{{$t('product.qty')}}</th>
        <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.disc')}} (%)</th>
        <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.vat')}}</th>
        <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.totalPrice')}}</th>
        <th class="px-2 py-3 text-gray-700 font-medium"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(product, index) in filteredProducts" :key="product.id || index" class="border-b">
        <td class="py-3 px-2 ">  {{ product.name_en }}</td>
        <td class="py-3 px-2">{{ decimalFormat(product.sale_price || 0) }}</td>
        <td class="py-3 px-2">
          <FormInput
              type="number"
              v-model.number="product.quantity"
              min="1"
              class="w-[50px] px-2 py-2 border rounded-lg"
              @input="updateProductTotal(product, index)"
          />
        </td>
        <td class="py-3 px-2">
          <FormInput
              type="number"
              v-model.number="product.discount"
              min="0"
              max="100"
              class="w-[50px] px-2 py-2 border rounded-lg"
              @input="updateProductTotal(product, index)"
          />
        </td>
        <!-- Display VAT (Tax) -->
        <td class="py-3 px-2">
          {{ (product.vat !== 0 && product.vat !== "0.00" ) ? (calculateVatAmountAfterDiscount(product) * product.quantity).toFixed(2) : '0.00' }}
        </td>
        <td class="py-3 px-2">
          {{ formatPrice(calculateProductTotal(product)) }}
        </td>
        <td class="py-3 px-2">
          <button @click="removeProduct(index)" class="bg-red-100 p-2 rounded-md">
            <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    </div>
   
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FormInput from "@/components/Base/Form/FormInput.vue";
import Lucide from "@/components/Base/Lucide";
import {useAuthStore} from "@/stores/auth.js";
import { useI18n } from "vue-i18n";
import { formatPrice, decimalFormat } from "@/helpers/commonHelper.js";

const authStore = useAuthStore();
const vatValue = authStore.getVatValue;
// Define props
const props = defineProps({
  products: {
    type: Array,
    required: true
  }
});

// Filter out services to ensure only products are shown
const filteredProducts = computed(() => {
  return props.products.filter(product => {
    // Explicitly exclude services
    return product.is_service !== true && product.is_service !== 1;
  });
});

const emit = defineEmits(["remove-product"]);

// Method to remove a product from the list
function removeProduct(index) {
  // Get the actual product from filtered list
  const productToRemove = filteredProducts.value[index];
  // Find the actual index in the original products array
  const actualIndex = props.products.findIndex(p => p.id === productToRemove.id);
  if (actualIndex !== -1) {
    emit("remove-product", actualIndex);
  }
}
function calculateProductTotal(product) {
  const price = product.sale_price || 0;
  const quantity = product.quantity || 1;
  const discount = product.discount || 0; // Default discount to 0 if undefined
  const discountAmount = (price * quantity) * (discount / 100);

  // Calculate total price after discount
  const totalBeforeDiscount = price * quantity;
  const totalAfterDiscount = totalBeforeDiscount - discountAmount;
  
  // Calculate VAT if applicable
  const vatAmount = (product.vat !== 0 && product.vat !== "0.00") ? calculateVatAmountAfterDiscount(product) * quantity : 0;

  return totalAfterDiscount + vatAmount; // Return total including VAT
}


// Calculate the VAT amount after applying discount (15%)
function calculateVatAmountAfterDiscount(product)
{
  const price = product.sale_price || 0;
  const discount = product.discount || 0;
  const discountedPrice = price - (price * (discount / 100)); // Apply discount
  return discountedPrice > 0 ? discountedPrice * vatValue : 0; // VAT is 15%, ensure no negative VAT
}

function updateProductTotal(product, index) {
  product.totalPrice = calculateProductTotal(product);
}

</script>
