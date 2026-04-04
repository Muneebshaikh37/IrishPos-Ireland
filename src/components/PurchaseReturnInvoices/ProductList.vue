<template>
  <div class="mt-8 overflow-y-auto">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mb-[100px]">
      <thead>
      <tr class="bg-gray-100 border-b">
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium w-[180px]">{{$t('product.productName')}}</th>
        <!-- <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{$t('product.unit')}}</th> -->
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium "><p class="-mb-1">{{$t('product.returnCost')}}</p>   <span class="text-[10px] leading-4">(Tax Exclusive)</span></th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{$t('product.returnQty')}}</th>
        <!-- <th scope="col" class="px-4 py-3 text-gray-700 font-medium">Discount  </th> -->
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium uppercase">{{$t('product.vat')}}</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium"> <p class="-mb-1">{{$t('product.totalPriceTaxExclusive')}}</p> <span class="text-[10px] leading-4">(Tax Exclusive)</span></th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">
          <p class="-mb-1">{{$t('product.totalPriceTaxInclusive')}}</p>
          <span class="text-[10px] leading-4">(Tax Inclusive)</span>
        </th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{$t('product.actions')}}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(product, index) in products" :key="product.id || index"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
        <td class="pt-4 pb-5 px-4">{{ product.name_en }}</td>
      
        <td class="pt-4 pb-5 px-4">
          <FormInput type="number" v-model.number="product.cost_price" min="1"
                     class="w-[140px] px-4 py-2 border rounded-lg " />
        </td>
        <td class="pt-4 pb-5 px-2 relative">
          <div>
            <FormInput type="number" v-model.number="product.quantity"    min="1"
                       class="w-[85px] px-4 py-2 border rounded-lg " :class="{'border-red-500': form.invalid(`items.${index}.quantity`)}" />

            <template v-if="form.invalid(`items.${index}.quantity`)">
              <div class="mt-0 flex text-[9px] text-red-600 absolute">{{$t('product.lowStock')}}</div>
            </template>
          </div>
        </td>
        <td class="pt-4 pb-5 px-4">{{ product.vat }}</td>
        <td class="pt-4 pb-5 px-4">{{ Number(product.totalPrice).toFixed(2) }}</td>
        <td class="pt-4 pb-5 px-4">{{ Number(product.totalPrice + product.vat).toFixed(2) }}</td>
        <td class="pt-4 pb-5 px-4">
          <button @click="removeProduct(index)" class="bg-red-100  p-2 rounded-md">
            <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
          </button>
        </td>
      </tr>
      </tbody>
    </table>

  </div>


</template>

<script setup>
import { ref, watch , computed} from 'vue';
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { FormInput } from "@/components/Base/Form";
// TomSelect removed - packing logic removed, no tom-select needed
import {useAuthStore} from "@/stores/auth.js";

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
  },
});
// packing/unit removed from payload
// console.log("isProductList", props)
console.log("products payload", props)

const emit = defineEmits(['updateTotals', 'removeProduct']);

watch(props.products, () => {
  props.products.forEach(calculateTotalPrice);
}, { deep: true });



// Handle unit selection change


const products = props.products; // Assuming this is passed from parent 


 


// handle the change event
const calculateTotalPrice = (product) => {
  // Simple calculation now that packing is removed: cost_price * quantity
  product.totalPrice = product.cost_price * product.quantity;
  product.vat = parseFloat((product.totalPrice * vatValue).toFixed(2));

  // Emit the update event
  emit("updateTotals");
};


// function calculateTotalPrice(product) {
//   product.totalPrice = (product.cost_price * product.quantity - product.discount) + product.vat;
//   console.log("product", product);
//   emit('updateTotals');
// }
//  



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
