<template>
  <div class="mt-8 overflow-y-auto">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mb-[100px]">
      <thead>
      <tr class="bg-gray-100 border-b">
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium w-[150px]">{{ $t('product.productName') }}</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium ">
          <p class="-mb-1">{{ $t('product.unitCost') }}</p>
          <span class="text-[10px] leading-4">{{ $t('product.taxExclusive') }}</span>
        </th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('product.qty') }}</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium uppercase">{{ $t('product.vat') }}</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium ">
          <p class="-mb-1">{{ $t('product.totalPriceExclusive') }}</p>
          <span class="text-[10px] leading-4">{{ $t('product.taxExclusive') }}</span>
        </th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium ">
          <p class="-mb-1">{{ $t('product.totalPriceInclusive') }}</p>
          <span class="text-[10px] leading-4">{{ $t('product.taxInclusive') }}</span>
        </th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('product.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(product, index) in products" :key="product.id || index"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
        <td class="pt-4 pb-5 px-4">{{ product.name_en }}</td>
        <td class="pt-4 pb-5 px-4 relative">
          <FormInput type="number" v-model.number="product.cost_price" min="1"
                     class="w-[85px] px-4 py-2 border rounded-lg " 
                     @input="calculateTotalPrice(product)" />
        </td>
        <td class="pt-4 pb-5 px-4 relative">
          <div>
            <FormInput type="number" v-model.number="product.quantity" min="1"
                       class="w-[85px] px-4 py-2 border rounded-lg "
                       :class="{'border-red-500': form.invalid(`items.${index}.quantity`)}"
                       @input="calculateTotalPrice(product)" />
            <template v-if="form.invalid(`items.${index}.quantity`)">
              <div class="mt-0 flex text-[9px] text-red-600 absolute">{{ $t('product.lowStockInventory') }}</div>
            </template>
          </div>
        </td>
        <td class="pt-4 pb-5 px-4">{{ Number(product.vat).toFixed(2) }}</td>
        <td class="pt-4 pb-5 px-4">{{ Number(product.totalPrice).toFixed(2) }}</td>
        <td class="pt-4 pb-5 px-4">{{ Number(product.totalPrice + product.vat).toFixed(2) }}</td>
        <td class="pt-4 pb-5 px-4">
          <button @click="removeProduct(index)" class="bg-red-100 p-2 rounded-md">
            <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { FormInput } from "@/components/Base/Form";
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();
const vatValue = authStore.getVatValue;

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['updateTotals', 'removeProduct']);

// Watch for products array changes
watch(() => props.products, () => {
  props.products.forEach(calculateTotalPrice);
}, { deep: true });

// Simplified calculation without packaging logic
const calculateTotalPrice = (product) => {
  // Simple calculation: cost_price * quantity
  product.totalPrice = product.cost_price * product.quantity;
  
  // Calculate VAT
  product.vat = parseFloat((product.totalPrice * vatValue).toFixed(2));

  console.log("Updated Product:", {
    name: product.name_en,
    cost_price: product.cost_price,
    quantity: product.quantity,
    totalPrice: product.totalPrice,
    vat: product.vat
  });

  // Emit the update event
  emit("updateTotals");
};

function removeProduct(index) {
  emit('removeProduct', index);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>