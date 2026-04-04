<template>
  <Dialog :open="isOpen" >
    <Dialog.Panel class="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg z-[999]">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('customers.addNewCustomer') }}</h3>
      <div class="relative z-[999]">
        <FormLabel for="customerName" class="block font-medium text-gray-700">{{ $t('customers.name') }}</FormLabel>
        <template v-if="form.invalid('name')">
          <div class="mt-2 text-sm text-red-600">{{ form.getError('name') }}</div>
        </template>
        <FormInput
            id="customerName"
            v-model="customerName"
            class="w-full px-4 py-2 border rounded-lg mb-4"
            :placeholder="$t('customers.enterCustomerName')"
        />
      </div>
      <div class="relative z-[999]">
        <FormLabel for="customerPhone" class="block font-medium text-gray-700">{{ $t('customers.phone') }}</FormLabel>
        <div :class="{ 'rtl-phone-input': locale === 'ar' }">
          <MazPhoneNumberInput
              id="phone"
              v-model="customerPhone"
              :noSearch="true"
              v-model:country-code="countryCode"
              :onlyCountries="['SA']"
              class="w-full"
              @update="results = $event"
          />
        </div>
      </div>
      <template v-if="form.invalid('phone')">
        <div class="mt-2 text-sm text-red-600">{{ form.getError('phone') }}</div>
      </template>
      <template v-if="form.invalid('country_code')">
        <div class="mt-2 text-sm text-red-600">{{ form.getError('country_code') }}</div>
      </template>
      <div class="mt-4 flex justify-end" :class="{ 'space-x-2': locale !== 'ar', 'space-x-reverse space-x-2': locale === 'ar' }">
        <Button variant="secondary" @click="closeDialog"> {{ $t('customers.cancel') }}</Button>
        <Button variant="primary" @click="addCustomer" :disabled="isLoading">
          <template v-if="isLoading">
            <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
          </template>
          <template v-else>
            {{ $t('customers.add') }}
          </template>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup>
import {reactive, ref, onMounted} from 'vue';
import { Dialog } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import { FormInput, FormLabel } from '@/components/Base/Form';
import LoadingIcon from '@/components/Base/LoadingIcon/LoadingIcon.vue';
import httpClient from '@/network/api/httpClient';
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput';
import {handleError, handleResponse} from "@/network/api/responseHandler.js";
import ErrorHandler from "@/utils/validation";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const locale = ref('en');

onMounted(() => {
  locale.value = localStorage.getItem('locale') || 'en';
});

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close', 'customer-added']);
const countryCode = ref("SA");
const results = ref();
// Customer form fields
const customerName = ref('');
const customerPhone = ref('');
const isLoading = ref(false);

const form = reactive(new ErrorHandler());

const addCustomer = async () => {
  isLoading.value = true;

  try {
    // Replace this with your actual user_id or retrieve it from props if necessary
    const user_id = USER_ID;

    const newCustomer = {
      name: customerName.value,
      phone: results.value.nationalNumber,
      full_phone: results.value.formatInternational,
      country_code: `+${results.value.countryCallingCode}`,
    };

    // Make the POST request to save the new customer
    const response = await httpClient.post(import.meta.env.VITE_PUBLIC_API_URL_CRM + `/customers?user_id=${user_id}`, newCustomer);
    const result = handleResponse(response);
    if(result.success)
    {
      const created = result.data?.data ?? result.data;
      emit('customer-added', created);
      closeDialog(); // Close the dialog after the customer is added

    }
  } catch (error)
  {
    form.setErrors(error.errors);
    // handleError(error);
    console.error('Error adding customer:', error);
  } finally {
    isLoading.value = false;
  }
};

// Close dialog
const closeDialog = () => {
  emit('close');
  form.clear({});
};
</script>

<style scoped>
/* RTL alignment for phone input in Arabic */
.rtl-phone-input :deep(.m-phone-number-input) {
  direction: rtl;
}

.rtl-phone-input :deep(.m-phone-number-input__wrapper) {
  flex-direction: row-reverse !important;
  direction: rtl;
}

/* Country code selector - reverse order */
.rtl-phone-input :deep(.m-phone-number-input__select-wrapper) {
  order: 2;
  direction: rtl;
}

.rtl-phone-input :deep(.m-phone-number-input__input-wrapper) {
  order: 1;
  direction: rtl;
}

/* Country code select styling */
.rtl-phone-input :deep(.m-phone-number-input__select) {
  direction: rtl;
  text-align: right;
  padding-right: 8px !important;
  padding-left: 32px !important;
}

.rtl-phone-input :deep(.m-phone-number-input__select-country) {
  direction: rtl;
  text-align: right;
  flex-direction: row-reverse;
}

/* Flag and arrow positioning in RTL */
.rtl-phone-input :deep(.m-phone-number-input__select-country-flag) {
  order: 2;
  margin-left: 8px !important;
  margin-right: 0 !important;
}

.rtl-phone-input :deep(.m-phone-number-input__select-country-code) {
  order: 1;
  margin-left: 0 !important;
  margin-right: 4px !important;
}

.rtl-phone-input :deep(.m-phone-number-input__select-arrow),
.rtl-phone-input :deep(.maz-select__arrow),
.rtl-phone-input :deep([class*="arrow"]) {
  left: 8px !important;
  right: auto !important;
}

/* Ensure select dropdown opens correctly in RTL */
.rtl-phone-input :deep(.maz-select) {
  direction: rtl;
}

.rtl-phone-input :deep(.maz-select__input) {
  direction: rtl;
  text-align: right;
  padding-right: 8px !important;
  padding-left: 32px !important;
}

/* Input field alignment */
.rtl-phone-input :deep(.m-phone-number-input__input) {
  direction: rtl;
  text-align: right;
  padding-right: 12px !important;
  padding-left: 12px !important;
}

.rtl-phone-input :deep(input) {
  direction: rtl;
  text-align: right;
}

.rtl-phone-input :deep(input::placeholder) {
  text-align: right;
  direction: rtl;
}

/* Additional selectors for MazPhoneNumberInput variations */
.rtl-phone-input :deep([class*="phone-number-input"]) {
  direction: rtl;
}

.rtl-phone-input :deep([class*="select-wrapper"]) {
  order: 2;
}

.rtl-phone-input :deep([class*="input-wrapper"]) {
  order: 1;
}

/* Fix any select element inside */
.rtl-phone-input :deep(select) {
  direction: rtl;
  text-align: right;
  padding-right: 8px !important;
  padding-left: 32px !important;
}

/* Fix any input element inside */
.rtl-phone-input :deep(input[type="text"]),
.rtl-phone-input :deep(input[type="tel"]) {
  direction: rtl;
  text-align: right;
  padding-right: 12px !important;
  padding-left: 12px !important;
}

/* Fix dropdown arrow positioning */
.rtl-phone-input :deep([class*="arrow"]),
.rtl-phone-input :deep(svg[class*="arrow"]),
.rtl-phone-input :deep(i[class*="arrow"]) {
  left: 8px !important;
  right: auto !important;
}

/* Fix flag icon positioning */
.rtl-phone-input :deep([class*="flag"]),
.rtl-phone-input :deep(img[class*="flag"]) {
  order: 2;
  margin-left: 8px !important;
  margin-right: 0 !important;
}
</style>
