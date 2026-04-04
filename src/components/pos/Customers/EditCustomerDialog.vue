<template>
  <Dialog :open="show" @close="closeDialog">
    <Dialog.Panel>
      <div class="p-5">
        <h3 class="text-lg font-medium">{{ $t('customers.editCustomer') }}</h3>
        <div class="mt-6">
          <label for="name">{{ $t('customers.name') }}</label>
          <FormInput
              id="name"
              v-model="customer.name"
              type="text"
              class="w-full p-2 border"
              :class="{ 'border-red-500': form.invalid(`name`) }"
              :placeholder="$t('customers.enterCustomerName')"
          />
          <template v-if="form.invalid(`name`)">
            <div class="mt-0.5 text-red-600">
              {{ form.getError(`name`) }}
            </div>
          </template>
        </div>
        <div class="mt-4">
          <label for="phone">{{ $t('customers.phone') }}</label>
          <div :class="{ 'rtl-phone-input': locale === 'ar' }">
            <MazPhoneNumberInput
                id="phone"
                v-model="customer.phone"
                :noSearch="true"
                v-model:country-code="countryCode"
                :onlyCountries="['SA']"
                :error="form.invalid(`phone`)"
                :noValidationSuccess="true"
                class="w-full"
                @update="results = $event"
            />
          </div>
          <template v-if="form.invalid(`phone`)">
            <div class="mt-0.5 text-red-600">
              {{ form.getError(`phone`) }}
            </div>
          </template>
        </div>
        <div class="mt-6 flex justify-end" :class="{ 'space-x-2': locale !== 'ar', 'space-x-reverse space-x-2': locale === 'ar' }">
          <Button variant="outline-secondary" @click="closeDialog" class="w-24" :class="{ 'mr-1': locale !== 'ar', 'ml-1': locale === 'ar' }" :disabled="isLoading">
            {{ $t('customers.cancel') }}
          </Button>
          <Button variant="primary" @click="updateCustomer" class="w-24" :class="{ 'ml-4': locale !== 'ar', 'mr-4': locale === 'ar' }" :disabled="isLoading">
            <template v-if="isLoading">
              <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
            </template>
            <template v-else>
              {{ $t('customers.update') }}
            </template>
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from "vue";
import Button from "@/components/Base/Button";
import { Dialog } from '@/components/Base/Headless';
import { FormInput } from '@/components/Base/Form';
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput';
import LoadingIcon from "@/components/Base/LoadingIcon";
import httpClient from "@/network/api/httpClient";
import {handleResponse} from "@/network/api/responseHandler.js";
import {useAuthStore} from "@/stores/auth.js";
import ErrorHandler from "@/utils/validation";

const props = defineProps({
  show: Boolean,
  customer: Object,
});
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const locale = ref('en');
const emits = defineEmits(["close", "updated"]);

onMounted(() => {
  locale.value = localStorage.getItem('locale') || 'en';
});

const show = ref(props.show);
const customer = ref({ ...props.customer });
const isLoading = ref(false);
const countryCode = ref('SA');

const form = reactive(new ErrorHandler());

watch(
    () => props.show,
    (newVal) => {
      show.value = newVal;
      customer.value = { ...props.customer };
    }
);

const results = ref();

const updateCustomer = async () => {
  // if (!results.value?.isValid) {
  //   console.error("Phone number is invalid. Cannot update customer.");
  //   return;
  // }

  isLoading.value = true;
  try {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_URL_CRM;
    const endpoint = `${baseUrl}/customers/${customer.value.id}?user_id=${USER_ID}`;

    const payload = {
      name: customer.value.name,
      phone: results.value.nationalNumber,
      full_phone: results.value.formatInternational,
      country_code: `+${results.value.countryCallingCode}`,
      _method: "PUT",
    };
    const response  = await httpClient.post(endpoint, payload);

    const result = handleResponse(response);
    if(result.success)
    {
      emits("updated");
      closeDialog(true);
    }



  } catch (error) {
    form.setErrors(error.errors);
    console.error("Error updating customer:", error);
  } finally {
    isLoading.value = false;
  }
};

const closeDialog = (updated = false) => {
  emits("close", updated); // Pass the update flag to parent
  show.value = false;
  form.setErrors({})
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