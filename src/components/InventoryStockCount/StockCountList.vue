<template>
  <div class="mt-8">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead>
      <tr class="bg-gray-100 border-b">
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium w-[150px]">{{ $t('stock-count.productsList.productName') }}</th>
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{ $t('stock-count.productsList.systemInventory') }}</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('stock-count.productsList.physicalStock') }}</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('stock-count.productsList.variance') }}</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('stock-count.productsList.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(product, index) in products" :key="product.id || index"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">

        <td class="py-3 px-4">{{ product.name_en }}</td>
        <td class="py-3 px-6"> {{ product.initial_quantity }} </td>
        <td class="py-3 px-4">
          <FormInput type="number" v-model.number="product.counted" min="1"
                     class="w-[85px] px-4 py-2 border rounded-lg " />
        </td>
        <td class="py-3 px-4">{{ Number(product.initial_quantity - product.counted) }}</td>
        <td class="py-3 px-4">
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

const props = defineProps({
  products: {
    type: Array,
    required: true,
  }
});
const emit = defineEmits(['updateTotals', 'removeProduct']);

watch(props.products, () => {
  props.products.forEach(calculateTotalPrice);
});

const calculateTotalPrice = (product) => {
  let quantity = 1;
  product.totalPrice = (quantity * product.cost_price * product.quantity);
  product.packing_quantity = (quantity * product.quantity);
  product.vat = parseFloat((product.totalPrice * 0.15).toFixed(2));
  emit("updateTotals");
};

function removeProduct(index) {
  emit('removeProduct', index);
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
