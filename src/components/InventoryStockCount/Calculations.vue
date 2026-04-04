<template>
  <div class="col-span-6 z-10"></div>
  <div class="col-span-6 z-10">
    <div class=" intro-y box p-6 rounded-lg h-fit bg-[#e6ebf0] w-full z-10">
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium">Subtotal <span class="text-xs font-medium text-gray-500">(Tax Exclusive)</span> </label>
      <p>{{ subtotal.toFixed(2) }}</p>
    </div>
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium uppercase"> Vat</label>
      <p>{{ discountAmount }}</p>
    </div>
    <!-- <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium">Tax</label>
      <p>{{ tax }}</p>
    </div> -->
    <!-- <div class="flex justify-between items-center mb-4">
      <label class="text-gray-700 font-medium">Additional Discount %</label>
      <FormInput
          type="number"
          :value="props.additionalDiscountPercent.value"
          @input="$emit('update:additionalDiscountPercent', $event.target.value)"
          min="0"
          max="100"
          class="w-[80px] px-4 py-2 border rounded-lg"
      />
    </div> -->
    <!-- <div class="flex justify-between items-center mb-4">
      <label class="text-gray-700 font-medium w-1/2  ">Additional Discount (SAR)</label>
      <FormInput
          type="number"
          :value="props.additionalDiscountFixed.value"
          @input="$emit('update:additionalDiscountFixed', +$event.target.value)"
          min="0"
          class="w-[80px] px-4 py-2 border rounded-lg"
      />
    </div> -->
    <div class="flex justify-between mb-4">
      <label class="text-gray-700 font-medium">  Total <span class="text-xs font-medium text-gray-500"> (Tax Inclusive) </span>  </label>
      <p>{{formatPrice(total)  }}</p>
    </div>
    <div class="mb-4">
    <div class="flex justify-between items-center ">
      <label class="text-gray-700 font-medium w-1/2  ">Amount Paid</label> 
      <FormInput
      
          type="number" 
          min="0"
           
          class="w-[80px] px-4 py-2 border rounded-lg" :class="{'border-red-500': form.invalid('amount_paid')}"
      />
    </div>
    <template v-if="form.invalid('amount_paid')">
		 <div class="text-end mt-1 text-xs text-red-600">{{ form.getError('amount_paid') }}</div>
		</template>
  </div>
    <div class="flex justify-between mb-4">
						<FormLabel class="text-gray-700 font-medium">Payment Type </FormLabel>
						<div class="flex items-center w-[150px]"> 
							<TomSelect  :options="{
								placeholder: 'Select Payment',
							}" class="w-full bg-white" :class="{'border-red-500': form.invalid('payment_type')}">
                <option> </option>
								<option value="CC">CC</option>
                <option value="Cash">Cash</option> 
							</TomSelect> 
						</div> 
					</div>
          <template v-if="form.invalid('payment_type')">
		       <div class="text-end mt-1 text-xs text-red-600">{{ form.getError('payment_type') }}</div>
		      </template>

    <!-- <Button variant="primary" type="button" class=" mr-2 w-full mt-4" @click="payNow" ref="deleteButtonRef">
      Create Purchase {{ total.toFixed(2) }} SAR
    </button> -->
  </div>
  </div>
   

</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
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
  createStockCountForm:{
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
