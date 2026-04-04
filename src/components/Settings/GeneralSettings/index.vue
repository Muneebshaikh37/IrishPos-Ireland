<script setup>

import {
	FormInput,
	FormLabel,
	FormSwitch,
} from "@/components/Base/Form";
import { authHttpClient } from "@/network/modules/auth";
import Button from "@/components/Base/Button";
import { RouterLink } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import TomSelect from "@/components/Base/TomSelect";
import { onMounted, ref, reactive, computed } from "vue";
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import router from "../../../router";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import ErrorHandler from "@/utils/validation";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import {useAuthStore} from "@/stores/auth.js";
import { setCurrencyCode, getCurrencySymbol } from "@/utils/currency";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const createFormData = ref({
	date_time_format: null ? 0: "dd/MM/yyyy HH:mm:ss",
	default_payment_method: null ? 0 : "",
	currency_code: "EUR",
	weight_unit: null ? 0 : "",
	weight_decimal_places: 0,
	price_decimal_places:0,
	allow_sale_if_cost_price_met: 1,
	allow_sale_if_qty_zero: 1,
	low_stock_threshold: 0,
})
const isAllowSaleChecked = computed({
  get() {
    return createFormData.value.allow_sale_if_cost_price_met === 1;
  },
  set(value) {
    createFormData.value.allow_sale_if_cost_price_met = value ? 1 : 0;
  },
});
const isQtyZeroChecked = computed({
  get() {
    return createFormData.value.allow_sale_if_qty_zero === 1;
  },
  set(value) {
    createFormData.value.allow_sale_if_qty_zero = value ? 1 : 0;
  },
});
const isloading = ref(false)
const form = reactive(new ErrorHandler());
const currencyDisplayLabel = computed(() => {
  const code = (createFormData.value.currency_code || "EUR").toUpperCase();
  return `${code} (${getCurrencySymbol(code)})`;
});

const submitCreate = async () => {
	try {
		isloading.value = true;
    const payload = { ...createFormData.value };
    if (payload.default_payment_method === "Credit Card") {
      payload.default_payment_method = "Cc";
    }
    delete payload.currency_code
		delete payload.vat_number
		delete payload.vat
		const response = await authHttpClient.put(`/settings?user_id=${USER_ID}`, payload)
		// const response = await apiService.supplier.create(createFormData.value);
		const result = handleResponse(response);

		if (result.success) {
      setCurrencyCode(createFormData.value.currency_code);
      await isfetchSettings();
			isloading.value = false;
			toast().fry(pan.general.success(result.message))
			console.log(result.message)
		}
	} catch (error) {

		// console.log(error.response.data.errors)
		form.setErrors(error.response.data.errors);
		toast().fry(pan.general.error(error.message))
		isloading.value = false;
	}
}
const isfetchSettings = async () => {
  try {
    const response = await authHttpClient.get(`/settings?user_id=${USER_ID}`);
    const result = handleResponse(response);
    if (result.success) {
      createFormData.value = result.data;
      if (!createFormData.value.currency_code) createFormData.value.currency_code = "EUR";
      setCurrencyCode(createFormData.value.currency_code);
      createFormData.value.default_payment_method =
        (result.data.default_payment_method === "Cc" || result.data.default_payment_method === "CC")
          ? "Credit Card"
          : result.data.default_payment_method;
      console.log("result", result.data);
    }
  } catch (error) {
    handleError(error);
  }
};

onMounted(()=>{
	isfetchSettings()
})

const dateFormats = [
	"dd/MM/yyyy HH:mm:ss",
	"yyyy-MM-dd HH:mm:ss",
	"dd/MM/yyyy hh:mm:ss a",
	"yyyy-MM-dd hh:mm:ss a",
	"dd/MM/yyyy",
	"hh:mm:ss a",
	"dd MMMM yyyy, HH:mm:ss",
	"dd-MM-yyyy HH:mm",
	"MMMM dd, yyyy hh:mm a"
];
const paymentMethod = ["Cash", "Credit Card"]
const weightUnit = ["Kg", "Lb", "Oz"]
</script>

<template>
	<div class="grid grid-cols-12 gap-6">
		<div class="col-span-12 lg:col-span-12">
			<div class="px-6 py-5">
				<div class=" ">
					<form @submit.prevent="submitCreate" class="grid grid-cols-12 gap-6">
					<div class="col-span-12 mb-2">
						<h2 class="mr-auto text-lg font-semibold">{{$t('general-settings.generalSetting')}}</h2>
					</div>
					<div class="col-span-4">
						<FormLabel for="date_time_format"> {{$t('general-settings.dateTimeFormat')}} </FormLabel>
						<div class="flex items-center flex-row-reverse">
							<TomSelect id="date_time_format" v-model="createFormData.date_time_format" :options="{
								placeholder: $t('general-settings.searchDateTimeFormat'),
							}" class="w-full" :class="{ 'border-red-500': form.invalid('date_time_format') }">

								<template v-for="date in dateFormats">
									<option :value="date">{{ date }}</option>
								</template>
							</TomSelect>
						</div>
						<template v-if="form.invalid('date_time_format')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('date_time_format') }}</div>
						</template>
					</div>

					<div class="col-span-4">
            <FormLabel for="vat_number">{{$t('general-settings.defaultPaymentMethod')}}</FormLabel>
						<div class="flex items-center flex-row-reverse">
							<TomSelect id="vat_number" v-model="createFormData.default_payment_method" :options="{
							placeholder: $t('general-settings.searchPaymentType'),
							}" class="w-full" :class="{ 'border-red-500': form.invalid('default_payment_method') }">

								<template v-for="paymentType in paymentMethod">
									<option :value="paymentType">{{ paymentType }}</option>
								</template>
							</TomSelect>
						</div>
						<template v-if="form.invalid('default_payment_method')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('default_payment_method') }}</div>
						</template>
					</div>

          <div class="col-span-4">
            <FormLabel for="currency_code">{{$t('general-settings.currency')}}</FormLabel>
            <input
              id="currency_code"
              :value="currencyDisplayLabel"
              type="text"
              readonly
              disabled
              class="form-control w-full cursor-not-allowed bg-slate-100"
            />
            <p class="mt-2 text-xs text-slate-500">{{$t('general-settings.currencyManagedBySuperAdmin')}}</p>
          </div>

					<div class="col-span-4">
            <FormLabel htmlFor="weight_unit">{{$t('general-settings.weightUnit')}}</FormLabel>
						<div class="flex items-center flex-row-reverse">
							<TomSelect id="weight_unit"  v-model="createFormData.weight_unit" :options="{
								placeholder: $t('general-settings.searchWeightUnit'),
							}" class="w-full" :class="{ 'border-red-500': form.invalid('weight_unit') }">

								<template v-for="weightUnit in weightUnit">
									<option :value="weightUnit">{{ weightUnit }}</option>
								</template>
							</TomSelect>
						</div>
						<template v-if="form.invalid('weight_unit')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('weight_unit') }}</div>
						</template>
					</div>

					<div class="col-span-6">
            <FormLabel htmlFor="weight">{{$t('general-settings.weightDecimalPlaces')}}</FormLabel>
						<FormInput id="weight" v-model="createFormData.weight_decimal_places" type="number" :placeholder="$t('general-settings.weightDecimalPlaces')"
							:class="{ 'border-red-500': form.invalid('weight_decimal_places') }" />
						<template v-if="form.invalid('weight_decimal_places')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('weight_decimal_places') }}</div>
						</template>
					</div>
            <div class="col-span-6">
              <FormLabel htmlFor="price_decimal_places">{{$t('general-settings.priceDecimalPlaces')}}</FormLabel>
              <FormInput id="price_decimal_places" v-model="createFormData.price_decimal_places" type="number" :placeholder="$t('general-settings.priceDecimalPlaces')"
                         :class="{ 'border-red-500': form.invalid('price_decimal_places') }" />
              <template v-if="form.invalid('price_decimal_places')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('price_decimal_places') }}</div>
              </template>
            </div>

            <div class="col-span-6">
              <FormLabel htmlFor="low_stock_threshold">{{$t('general-settings.lowStockThreshold')}}</FormLabel>
              <FormInput id="low_stock_threshold" v-model="createFormData.low_stock_threshold" type="number" :placeholder="$t('general-settings.lowStockThreshold')"
                         :class="{ 'border-red-500': form.invalid('low_stock_threshold') }" />
              <template v-if="form.invalid('low_stock_threshold')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('low_stock_threshold') }}</div>
              </template>
            </div>

            <div class="col-span-6"></div>

            <div class="col-span-4">
              <FormSwitch.Label htmlFor="allow_sale_if_cost_price_met" class="text-sm text-gray-500">{{$t('general-settings.allowSaleIfCostPriceMet')}}</FormSwitch.Label>
              <FormSwitch.Input id="allow_sale_if_cost_price_met" v-model="isAllowSaleChecked" :checked="createFormData.allow_sale_if_cost_price_met === 1"
                                class="ml-3 mr-0" type="checkbox" />
            </div>
            <div class="col-span-4">
              <FormSwitch.Label htmlFor="allow_sale_if_qty_zero" class="text-sm text-gray-500">{{$t('general-settings.allowSaleIfQtyZero')}}</FormSwitch.Label>
              <FormSwitch.Input id="allow_sale_if_qty_zero" v-model="isQtyZeroChecked" :checked="createFormData.allow_sale_if_qty_zero === 1"
                                class="ml-3 mr-0" type="checkbox" />
            </div>

            <div class="col-span-12">
              <Button variant="primary" class="mr-2 mt-2 shadow-md" type="submit">
                <template v-if="isloading">
                  <LoadingIcon icon="three-dots" class="w-6 h-5 text-white" />
                </template>
                <template v-else>
                  {{$t('general-settings.save')}}
                </template>
              </Button>

					</div>
				</form>
				</div>
			</div>
		</div>
	</div>



</template>
