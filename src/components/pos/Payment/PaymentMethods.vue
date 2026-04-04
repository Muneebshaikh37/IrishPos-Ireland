<template>
  <div class="grid grid-cols-2 gap-4">
    <!-- Cash Payment -->
    <div class="flex items-start space-x-4">
      <div class="flex items-center h-5 mt-1">
        <FormSwitch.Input id="cash" v-model="paymentMethods.cash.enabled"
                          class="ml-3 mr-0" type="checkbox" />
      </div>
      <div class="flex-grow">
        <label class="block text-gray-700 font-medium mb-2"> {{ $t('invoices.cashPayment') }}</label>
        <FormInput
            v-if="paymentMethods.cash.enabled"
            type="number"
            v-model="paymentMethods.cash.amount"
            placeholder="Enter cash amount"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            :class="{ 'border-red-500': hasError && paymentMethods.cash.enabled }"
        />
      </div>
    </div>

    <!-- Card Payment -->
    <div class="flex items-start space-x-4">
      <div class="flex items-center h-5 mt-1">
        <FormSwitch.Input id="card" v-model="paymentMethods.card.enabled"
                          class="ml-3 mr-0" type="checkbox" />
      </div>
      <div class="flex-grow">
        <label class="block text-gray-700 font-medium mb-2">{{ $t('invoices.cardPayment') }}</label>

        <FormInput
            v-if="paymentMethods.card.enabled"
            type="number"
            v-model="paymentMethods.card.amount"
            placeholder="Enter card amount"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            :class="{ 'border-red-500': hasError && paymentMethods.card.enabled }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { FormInput, FormSwitch } from "@/components/Base/Form";

defineProps({
  paymentMethods: {
    type: Object,
    required: true
  },
  hasError: {
    type: Boolean,
    required: true
  }
});
</script>