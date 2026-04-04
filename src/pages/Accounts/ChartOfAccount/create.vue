<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
  FormSelect,
  FormCheck,
} from "@/components/Base/Form";
import httpClient from "@/network/api/httpClient";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Litepicker from "@/components/Base/Litepicker";
import { ref, reactive, onMounted, watch } from "vue";
import { handleResponse } from "@/network/api/responseHandler.js";
import router from "@/router";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import ErrorHandler from "@/utils/validation";
import { useAuthStore } from "@/stores/auth.js";
import TomSelect from "../../../components/Base/TomSelect";
const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;

const createFormData = ref({
  parent_id: "",
  code: "",
  name: "", 
  description: "",
  type: "",
});
 
const parentAccountOptions = ref([]);
const Accounttype = ["debit", "credit"]
const isloading = ref(false);
const form = reactive(new ErrorHandler());
const isTypeAutoSelected = ref(false);

const fetchParentAccounts = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/dropdown?user_id=${USER_ID}`);
    if (response.data) {
      parentAccountOptions.value = response.data.data.map(account => ({
        value: account.id,
        label: account.name,
        disabled: account.disabled,
        type: account.type
      }));
    }
  } catch (error) {
    console.error('Error fetching parent accounts:', error);
    
  } finally {
    isloading.value = false;
  }
};

onMounted(() => {
  fetchParentAccounts();
});

// Add watch on parent_id to update type
watch(() => createFormData.value.parent_id, (newParentId) => {
  if (newParentId) {
    const selectedParent = parentAccountOptions.value.find(account => account.value === newParentId);
    if (selectedParent) {
      createFormData.value.type = selectedParent.type;
      isTypeAutoSelected.value = true;
    }
  } else {
    isTypeAutoSelected.value = false;
  }
});

const submitCreate = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.post(
      `${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts?user_id=${USER_ID}`, 
      createFormData.value
    );
  
      router.push("/account/chart-of-accounts");
   
  } catch (error) {
    console.error('Error creating account:', error);
    form.setErrors(error.response.data.errors);
    toast().fry(pan.error('Failed to create account'));
  } finally {
    isloading.value = false;
  }
};

</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/account/chart-of-accounts">
        <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
          <Lucide icon="ChevronLeft" class="w-5 h-5" />
        </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('account.CreateAccount') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 md:col-span-4 ">
            <FormLabel>{{ $t('account.ParentAccount') }}</FormLabel> 
            <TomSelect 
              v-model="createFormData.parent_id" 
              :options="{
                placeholder: $t('account.selectAccount'),
                allowEmptyOption: true,
                items: parentAccountOptions
              }" 
              class="w-full" 
              :class="{'border-red-500': form.invalid('parent_id')}"
            >
              <template v-for="option in parentAccountOptions" :key="option.value">
                <option 
                  :value="option.value" 
                  :disabled="option.disabled"
                  :class="{'text-gray-400': option.disabled}"
                >
                  {{ option.label }}
                </option>
              </template>
            </TomSelect>
            <template v-if="form.invalid('parent_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('parent_id') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-4 ">
            <FormLabel>{{ $t('account.AccountCode') }} <span class="text-danger">*</span></FormLabel>
            <FormInput v-model="createFormData.code" type="text" :placeholder="$t('account.AccountCode')" :class="{'border-red-500': form.invalid('code')}" />
            <template v-if="form.invalid('code')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('code') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-4 ">
            <FormLabel>{{ $t('account.AccountName') }} <span class="text-danger">*</span></FormLabel>
            <FormInput v-model="createFormData.name" type="text" :placeholder="$t('account.AccountName')" :class="{'border-red-500': form.invalid('name')}" />
            <template v-if="form.invalid('name')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('name') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-4 ">
            <FormLabel>{{ $t('account.AccountType') }} <span class="text-danger">*</span></FormLabel>
             
            <div>
               
              <TomSelect 
                v-model="createFormData.type" 
                :options="{
                  placeholder: $t('account.AccountType'),
                  disabled: isTypeAutoSelected, 
                }" 
                class="w-full" 
                :class="{'border-red-500': form.invalid('type'), 'bg-gray-100': isTypeAutoSelected}" 
                :disabled="isTypeAutoSelected"
              >
                <option value=""></option>
                <template v-for="type in Accounttype">
                  <option :value="type" :disabled="isTypeAutoSelected">{{ type }}</option>
                </template> 
              </TomSelect>
            </div>
            <template v-if="form.invalid('type')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('type') }}</div>
            </template>
          </div>
          <div class="col-span-12">
            <FormLabel>{{ $t('account.Description') }}</FormLabel>
            <FormTextarea v-model="createFormData.description" :placeholder="$t('account.descriptionPlaceholder')" rows="3" />
          </div>
          <div class="col-span-12">
            <Button 
              variant="primary" 
              class="mr-2 mt-2 shadow-md" 
              @click="submitCreate"
              :disabled="isloading"
            >
              <template v-if="isloading"> 
                {{ $t('account.creating') }}
              </template>
              <template v-else>
                {{ $t('account.Create') }}
              </template>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isloading" class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true" :color="'#fff'" :size="'50px'"></clip-loader>
  </div>
</template>
