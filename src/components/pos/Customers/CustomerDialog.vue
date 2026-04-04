<template>
  <Dialog :open="show" @close="closeDialog">
    <Dialog.Panel>
      <div class="p-5">
        <h3 class="text-lg font-medium">{{ $t('customers.addNewCustomer') }}</h3>
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
          <MazPhoneNumberInput
              id="phone"
              v-model="customer.phone"
              :noSearch="true"
              v-model:country-code="countryCode"
              :error="form.invalid('phone')"
              :noValidationSuccess="true"
              :onlyCountries="['SA']"
              class="w-full"
              @update="results = $event"
          />
          <template v-if="form.invalid(`phone`)">
            <div class="mt-0.5 text-red-600">
              {{ form.getError(`phone`) }}
            </div>
          </template>
        </div>

        <div class="mt-6 flex justify-end">
          <Button variant="outline-secondary" @click="closeDialog" class="w-24 mr-1" :disabled="isLoading">
            {{ $t('customers.cancel') }}
          </Button>
          <Button variant="primary" @click="saveCustomer" class="ml-4 w-24" :disabled="isLoading">
            <template v-if="isLoading">
              <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
            </template>
            <template v-else>
              {{ $t('customers.create') }}
            </template>
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
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
});
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const emits = defineEmits(["close", "created"]);

const show = ref(props.show);
const customer = ref({ name: "", phone: "" });
const countryCode = ref("SA");
const results = ref();
const isLoading = ref(false);

const form = reactive(new ErrorHandler());

watch(
    () => props.show,
    (newVal) => {
      show.value = newVal;
      resetForm(); // Reset the form when dialog is opened
    }
);

const resetForm = () => {
  customer.value = { name: "", phone: "" };
  results.value = null;
};

const saveCustomer = async () => {
 
  isLoading.value = true;
  try {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_URL_CRM;
    const endpoint = `${baseUrl}/customers?user_id=${USER_ID}`;

    const payload = {
      name: customer.value.name,
      phone: results.value.nationalNumber,
      full_phone: results.value.formatInternational,
      country_code: `+${results.value.countryCallingCode}`,
    };
    const response = await httpClient.post(endpoint, payload);
    const result = handleResponse(response);
    if(result.success)
    {
      emits("created");
      closeDialog();
    }

  } catch (error) {
    form.setErrors(error.errors);
    console.error("Error saving customer:", error);
  } finally {
    isLoading.value = false;
  }
};

const closeDialog = () => {
  emits("close");
  show.value = false;
  form.setErrors({})
};
</script>
