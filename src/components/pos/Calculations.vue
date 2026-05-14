<template>
  <div class="intro-y box p-6 rounded-lg h-fit bg-[#e6ebf0]">
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium"> {{ $t('invoices.subtotal') }} {{ $t('invoices.taxExclusive') }}</label>
      <p>{{ subtotal.toFixed(2) }}</p>
    </div>
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium">{{ $t('invoices.discountAmount') }}</label>
      <p>{{ discountAmount.toFixed(2) }}</p>
    </div>
    <div class="flex justify-between mb-4 border-b border-gray-300 pb-4">
      <label class="text-gray-700 font-medium">{{ $t('invoices.tax') }}</label>
      <p>{{ tax.toFixed(2) }}</p>
    </div>
    <!-- <div class="flex justify-between items-center mb-4">
      <label class="text-gray-700 font-medium">{{ $t('invoices.additionalDiscount') }} (%)</label>
      <FormInput
          type="number"
          :value="props.additionalDiscountPercent.value"
          @input="$emit('update:additionalDiscountPercent', $event.target.value)"
          min="0"
          max="100"
          class="w-[80px] px-4 py-2 border rounded-lg"
      />
    </div> -->
    <div class="flex justify-between items-center mb-4">
      <label class="text-gray-700 font-medium w-2/3">{{ $t('invoices.additionalDiscount') }} ({{ currencySymbol }})</label>
      <FormInput
          type="number"
          :value="props.additionalDiscountFixed.value"
          @input="$emit('update:additionalDiscountFixed', +$event.target.value)"
          min="0"
          class="w-[80px] px-4 py-2 border rounded-lg"
      />
    </div>
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium"> {{ $t('invoices.total') }} {{ $t('invoices.taxInclusive') }}</label>
      <p>{{  formatPrice(total) }}</p>
    </div>
    <Button
        variant="primary"
        type="button"
        class="mr-2 w-full mt-4"
        @click="payNow"
        :disabled="!hasProducts"
    >
      {{ $t('invoices.payNow') }} {{ formatPrice(total) }}
    </Button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { formatPrice } from "@/helpers/commonHelper.js";
import { getCurrencySymbol } from "@/utils/currency";

const props = defineProps({
  subtotal: Number,
  discountAmount: Number,
  tax: Number,
  additionalDiscountPercent: Object,
  additionalDiscountFixed: Object,
  total: Number,
  hasProducts: Boolean, // New prop to check if products exist
});


// Emits
const emit = defineEmits([
  "update:additionalDiscountPercent",
  "update:additionalDiscountFixed",
  "payNow",
]);
// const totalAfterDiscount = computed(() => {
//   // Start with subtotal
//   let discountedSubtotal = props.subtotal;
//
//   // Apply percentage discount if it exists (based on subtotal + tax)
//   if (props.additionalDiscountPercent.value) {
//     const percentageDiscount = (props.additionalDiscountPercent.value / 100) * (discountedSubtotal + props.tax);
//     discountedSubtotal -= percentageDiscount;
//   }
//   // Apply fixed discount if it exists
//   if (props.additionalDiscountFixed.value) {
//     const fixedDiscount = props.additionalDiscountFixed.value;
//     discountedSubtotal -= fixedDiscount;
//   }
//   // Add tax after applying discounts
//   const finalTotal = discountedSubtotal + props.tax;
//
//   return finalTotal;
// });
//
// // Total including tax
// const total = computed(() => {
//   return totalAfterDiscount.value;
// });

// Use the total computed in the parent (SellingComponent / EditInvoice).
// The parent already accounts for line discounts, additional discount, and
// tax — re-deriving it here was double-counting / missing the line discount.
const total = computed(() => props.total ?? 0);
const currencySymbol = computed(() => getCurrencySymbol());


// Trigger payment action
function payNow() {
  emit("payNow");
}
</script>
