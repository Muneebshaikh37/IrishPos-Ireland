<script setup>

import { FormInput, FormLabel } from "@/components/Base/Form";
import { authHttpClient } from "@/network/modules/auth";
import Button from "@/components/Base/Button";
import { ref, reactive, onMounted, computed } from "vue";
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import ErrorHandler from "@/utils/validation";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const createFormData = ref({
	name: "",
	email: "",
	address: "",
	vat_number: "",
	country_code: "+966",
	phone: "",
})

const isloading = ref(false)
const form = reactive(new ErrorHandler());

const submitCreate = async () => {
	try {
		isloading.value = true;
		const response = await authHttpClient.put(`/profile?user_id=${USER_ID}`, createFormData.value)
		// const response = await apiService.supplier.create(createFormData.value);
		const result = handleResponse(response);
		if (result.success) {
			isloading.value = false;
      form.clear();
			toast().fry(pan.profile.success(result.message))
		}
	} catch (error) {
		isloading.value = false;
		form.setErrors(error.response.data.errors);
		toast().fry(pan.profile.error(error.message))
	}

}
const isfetchProfile = async () => {
	try {
		const response = await authHttpClient.get(`/profile?user_id=${USER_ID}`)
		// const response = await apiService.product.brandsList();
		const result = handleResponse(response);
		if (result.success) {
			createFormData.value = result.data[0]
			console.log("result", result.data)
		}
	} catch (error) {
		const result = handleError(error);
		toast().fry(pan.profile.error(result.message))
	}
}
const isFormattedPhone = computed({
  get: () => {
    return createFormData.value.phone.replace(/^\+966/, "");
  },
  set: (value) => {
    createFormData.value.phone = value;
  },
});
onMounted(() => {
	isfetchProfile()
})



</script>

<template>

  <div class="grid grid-cols-12 gap-6">
    <div class="col-span-12 lg:col-span-12">
      <div class="px-6 py-5">
        <div class=" ">
          <form @submit.prevent="submitCreate" class="grid grid-cols-12 gap-6">
            <div class="col-span-12 mb-2">
              <h2 class="mr-auto text-lg font-semibold">{{ $t('company-profile.profile') }}</h2>
            </div>
            <div class="col-span-6">
              <FormLabel for="name">{{ $t('company-profile.name') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput id="name" v-model="createFormData.name" type="text" :placeholder="$t('company-profile.enterName')"
                         :class="{ 'border-red-500': form.invalid('name') }" />
              <template v-if="form.invalid('name')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('name') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel for="vat_number">{{ $t('company-profile.vatNumber') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput v-model="createFormData.vat_number" id="vat_number" type="text" :placeholder="$t('company-profile.enterVatNumber')"
                         :class="{ 'border-red-500': form.invalid('vat_number') }" />
              <template v-if="form.invalid('vat_number')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('vat_number') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel for="email">{{ $t('company-profile.email') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput id="email" v-model="createFormData.email" type="email" :placeholder="$t('company-profile.enterEmail')"
                         :class="{ 'border-red-500': form.invalid('email') }" />
              <template v-if="form.invalid('email')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('email') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel for="phone">{{ $t('company-profile.phone') }} <span class="text-danger"> *</span></FormLabel>
              <div class="flex item-center justify-center">
                <p
                    class="bg-gray-100 flex items-center justify-center w-[55px] text-sm border border-slate-200 shadow-sm rounded-l-md rounded-r-none">
                  +966</p>
                <FormInput id="phone" v-model="isFormattedPhone" class="rounded-l-none" type="text"
                           :placeholder="$t('company-profile.enterPhone')" :class="{ 'border-red-500': form.invalid('phone') }" />
              </div>
              <template v-if="form.invalid('phone')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('phone') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel for="address">{{ $t('company-profile.address') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput id="address" v-model="createFormData.address" type="text" :placeholder="$t('company-profile.enterAddress')"
                         :class="{ 'border-red-500': form.invalid('address') }" />
              <template v-if="form.invalid('address')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('address') }}</div>
              </template>
            </div>
            <div class="col-span-12">
              <Button variant="primary" class="mr-2 px-6 mt-2 shadow-md" type="submit">
                <template v-if="isloading">
                  <LoadingIcon icon="three-dots" class="w-6 h-5 text-white" />
                </template>
                <template v-else>
                  {{ $t('company-profile.save') }}
                </template>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
