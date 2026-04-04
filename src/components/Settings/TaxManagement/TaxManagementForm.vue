<script setup lang="ts">
import Button from "@/components/Base/Button";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import {FormSwitch, FormLabel, FormInput} from "@/components/Base/Form";
import {computed, onMounted, reactive, ref, watch} from "vue";
import ErrorHandler from "@/utils/validation";
import { authHttpClient } from "@/network/modules/auth.js";
import {handleError, handleResponse} from "@/network/api/responseHandler";
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import {useAuthStore} from "@/stores/auth";
// import {updateVat} from "@/config/constants.js";
import {useAbility} from "@casl/vue";
import AccessDeined from "../../AccessDenied/index.vue"

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const ability = useAbility();
console.log("ability", ability)
const TexFormData: any = ref({
  is_zatca: "",
  subject_to_vat: "",
  subject_to_no_vat: "",
  _method: "PUT",
});

const isloading = ref(false);
const form = reactive(new ErrorHandler());
const saveVat = async () => {
  try {
    isloading.value = true;
    const { subject_to_no_vat, ...rest } = TexFormData.value;
    const Payload = { ...rest, _method: "PUT" };
    const response = await authHttpClient.put(`/user-taxes?user_id=${USER_ID}`, Payload);
    const result = handleResponse(response);
    if (result.success) {
      isloading.value = false;
      form.clear();
      toast().fry(pan.tax.success(result.message));
      await authStore.updateVat(); // Call updateVat with await
      // await updateVat();
    }
  } catch (error) {
    const result = handleError(error.response);
    isloading.value = false;
    form.setErrors(error.response.data.errors);
    toast().fry(pan.tax.error(error.message));
  }
};
const isfetchVat = async () => {
  try {
    const response = await authHttpClient.get(`/user-taxes?user_id=${USER_ID}`);
    const result = handleResponse(response);
    if (result.success) {
      TexFormData.value = result.data;
    }
  } catch (error) {
    handleError(error);
  }
};
onMounted(() => {
  const ability = useAbility(); 
  console.log("ability", ability)
  // if (ability.can('update', 'taxmanagement')) { 
  //   isfetchVat();
  // }  
  isfetchVat();
});

const isZatcaChecked = computed({
  get() {
    return TexFormData.value.is_zatca === 1;
  },
  set(value) {
    TexFormData.value.is_zatca = value ? 1 : 0;
  },
});

watch(
    () => TexFormData.value.is_zatca,
    (newValue) => {
      console.log("Payload updated:", { is_zatca: newValue });
    }
);
</script>
<template>
  <div class="mt-12"  v-if="ability.can('update', 'taxManagement')">
    <div class="mb-4 grid grid-cols-12 gap-6 px-4 pb-5 mt-4 border border-slate-200 rounded-md relative">
    <div class="col-span-12 mb-2  ">
				<h2 class="mr-auto text-lg font-semibold absolute -top-3.5 bg-white px-2">{{ $t('tax-management.headingTax') }}</h2>
		</div>
    <div class="col-span-6">
      <FormLabel> {{ $t('tax-management.vat') }} <span class="text-danger "> *</span></FormLabel>
      <div class="flex item-center justify-center">
        <FormInput id="subject_to_vat" type="number" min="0" step="0.01" v-model="TexFormData.subject_to_vat" placeholder=""
                   class="rounded-r-none" :class="{'border-red-500': form.invalid('subject_to_vat')}" />
        <p class="bg-gray-100 flex text-base items-center justify-center w-[55px]   border border-slate-200 shadow-sm rounded-r-md rounded-l-none"> % </p>
      </div>
      <template v-if="form.invalid('subject_to_vat')">
        <div class="mt-2 text-xs text-red-600">{{ form.getError('subject_to_vat') }}</div>
      </template>
    </div>
    <div class="col-span-6">
      <FormLabel>{{ $t('tax-management.subjectToNoTax') }}</FormLabel>
      <div class="flex item-center justify-center">
        <FormInput id="name_en" v-model="TexFormData.subject_to_no_vat" type="text" placeholder=""
                   disabled="" class="rounded-r-none" :class="{'border-red-500': form.invalid('subject_to_no_vat')}" />
        <p class="bg-gray-100 flex text-base items-center justify-center w-[55px]   border border-slate-200 shadow-sm rounded-r-md rounded-l-none"> % </p>
      </div>
      <template v-if="form.invalid('subject_to_no_vat')">
        <div class="mt-2 text-xs text-red-600">{{ form.getError('subject_to_no_vat') }}</div>
      </template>

    </div>

    <div class="col-span-3">

      <FormSwitch.Label htmlFor="zatca" class="text-sm text-gray-500"> {{ $t('tax-management.zatca') }} </FormSwitch.Label>
      <FormSwitch.Input id="zatca" v-model="isZatcaChecked" :checked="TexFormData.is_zatca === 1" class="ml-3 mr-0" type="checkbox" disabled />
    </div>
    <div class="mt-3 col-span-12">
      <div class="flex items-center gap-6">
        <Button variant="primary" type="button" class="  mt-4" @click="saveVat" :disabled="isloading">
        <template v-if="isloading">
          <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
        </template>
        <template v-else>
          {{ $t('tax-management.save') }}
        </template>
      </Button>
    

      </div>
    </div>
  </div>
  <div class="border border-slate-200 rounded-md relative px-4 pb-5 mt-10">
    <h2 class="mr-auto text-lg font-semibold absolute -top-4 bg-white px-2">{{ $t('tax-management.vatFilling') }}</h2>
    <div class="mt-6">
      <Button variant="primary" type="button" class="  mt-4"  >
        <a href="https://zatca.gov.sa/en/eServices/Pages/eServices_009.aspx" target="_blank">
          {{ $t('tax-management.vatFilling') }}
        </a>
      </Button>
    </div>
  </div>
  </div>
  <div v-else>
<AccessDeined/>
  </div>
 

</template>