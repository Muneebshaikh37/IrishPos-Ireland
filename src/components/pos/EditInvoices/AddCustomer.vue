<template>
  <div class="mb-4 hidden">
    <Button variant="primary" type="button" class=" mr-2 " @click="showCustomerPopup=true" ref="deleteButtonRef">
      Add Customer
    </button>
    <Dialog :open="showCustomerPopup" @close="showCustomerPopup = false">
      <Dialog.Panel>
        <div class="p-5">
          <div class="text-xl text-black my-4 font-medium text-center">Add New Customer</div>
          <div class="pt-2">
            <FormLabel htmlFor="vertical-form-1">Customer Name </FormLabel>
            <FormInput v-model="customerName" type="text" placeholder="" />
          </div>
          <div class="pt-2">
            <FormLabel htmlFor="vertical-form-1">Phone Number </FormLabel>
            <FormInput v-model="phoneNumber" type="number" placeholder="" />
          </div>
        </div>
        <div class="px-5 pt-6 pb-8 text-center">
          <Button variant="outline-secondary" type="button" @click="showCustomerPopup = false" class="w-24 mr-4">
            Cancel
          </Button>
          <Button variant="primary" type="button" class="" @click="addCustomer" ref="deleteButtonRef">
            Create
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import {FormInput, FormLabel} from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import Button from "@/components/Base/Button";

const showCustomerPopup = ref(false);
const customerName = ref('');
const phoneNumber = ref('');

function addCustomer() {
  // Implement add customer functionality here
  showCustomerPopup.value = false;
}
</script>
