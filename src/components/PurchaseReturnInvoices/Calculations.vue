<template>
  <div class="col-span-6 z-10"></div>
  <div class="col-span-6 z-10">
    <div class=" intro-y box p-6 rounded-lg h-fit bg-[#e6ebf0] w-full z-10">
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium">{{ $t('invoices.subtotal') }} <span class="text-xs font-medium text-gray-500">({{ $t('invoices.taxExclusive') }})</span> </label>
      <p>{{ subtotal.toFixed(2) }}</p>
    </div>
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium uppercase"> {{ $t('invoices.vat') }}</label>
      <p>{{ discountAmount }}</p>
    </div>
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium">  {{ $t('invoices.total') }} <span class="text-xs font-medium text-gray-500"> ({{ $t('invoices.taxInclusive') }}) </span>  </label>
      <p>{{formatPrice(total)  }}</p>
    </div>
    <div class="mb-4">
    <div class="flex justify-between items-center ">
      <label class="text-gray-700 font-medium w-1/2  ">{{ $t('invoices.amountReceived') }}</label>
      <FormInput v-model="SupplierFields.amount_paid"  min="0" class="w-[150px] px-4 py-2 border rounded-lg" :class="{'border-red-500': form.invalid('amount_paid')}"
      />
    </div>
    <template v-if="form.invalid('amount_paid')">
		 <div class="text-end mt-1 text-xs text-red-600">{{ form.getError('amount_paid') }}</div>
		</template>
  </div>
    <div class="flex justify-between mb-4">
						<FormLabel class="text-gray-700 font-medium">{{ $t('invoices.paymentType') }}</FormLabel>
						<div class="flex items-center w-[150px]"> 
							<TomSelect v-model="SupplierFields.payment_type" :options="{
								placeholder: $t('invoices.selectPayment'),
							}" class="w-full bg-white serach-remove" :class="{'border-red-500': form.invalid('payment_type')}">
                <option> </option>
								<option value="CC">CC</option>
                <option value="Cash">Cash</option> 
							</TomSelect> 
						</div> 
					</div>
          <template v-if="form.invalid('payment_type')">
		       <div class="text-end mt-1 text-xs text-red-600">{{ form.getError('payment_type') }}</div>
		      </template>

  </div>
  </div>
   

</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import Button from "@/components/Base/Button";
import { FormInput , FormLabel} from "@/components/Base/Form";
import {formatPrice} from "@/helpers/commonHelper.js";
import TomSelect from "@/components/Base/TomSelect"; 
const props = defineProps({
  subtotal: Number,
  discountAmount: Number,
  tax: Number,
  additionalDiscountPercent: Object,
  additionalDiscountFixed: Object,
  total: Number,
  SupplierFields:{
    type: Object,
    required: true,
  },
  form:{
    type: Object,
    required: true,
  }
});
const payment_type = ref(1)

// Emits
const emit = defineEmits([
  "update:additionalDiscountPercent",
  "update:additionalDiscountFixed",
  "payNow",
]);

function payNow() {
  emit("payNow");
}
 
</script>
