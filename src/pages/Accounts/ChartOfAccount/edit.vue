<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
  FormSelect,
  FormCheck,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import httpClient from "@/network/api/httpClient";
import { ref, reactive, onMounted, watch } from "vue";
import { handleResponse } from "@/network/api/responseHandler.js";
import router from "@/router";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import ErrorHandler from "@/utils/validation";
import TomSelect from "../../../components/Base/TomSelect";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
 
const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;

 
const parentAccountOptions = ref([]);
const Accounttype = ["debit", "credit"];
const isloading = ref(false);
const form = reactive(new ErrorHandler());

const editFormData = ref({
  parent_id: "",
  code: "",
  name: "",
  description: "",
  type: "",
});

// Get account ID from route params
const route = useRoute();
const accountId = route.params.uuid;

// Fetch parent accounts for dropdown
const fetchParentAccounts = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/dropdown?user_id=${USER_ID}`);
    if (response.data) {
      parentAccountOptions.value = response.data.data.map(account => ({
        value: account.id,
        label: account.name,
        disabled: account.disabled,
        selected: false
      }));
      console.log('Parent Account Options:', parentAccountOptions.value);
    }
  } catch (error) {
    console.error('Error fetching parent accounts:', error);
    toast().fry(pan.error('Failed to load parent accounts'));
  } finally {
    isloading.value = false;
  }
};

// Fetch account details
const fetchAccountDetails = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(
      `${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/${accountId}?user_id=${USER_ID}&is_edit=true`
    );

    if (response.data) {
      const accountData = response.data.data;
      console.log('Account Data:', accountData);

      if (parentAccountOptions.value.length > 0) {
        parentAccountOptions.value = parentAccountOptions.value.map(option => ({
          ...option,
          selected: option.value === accountData.id
        }));
      }

      editFormData.value = {
        parent_id: accountData.id,
        code: accountData.code || "",
        name: accountData.name || "",
        description: accountData.description || "",
        type: accountData.type || "",
      };

      console.log('Updated Form Data:', editFormData.value);
    }
  } catch (error) {
    console.error('Error fetching account details:', error);
    toast().fry(pan.error('Failed to load account details'));
  } finally {
    isloading.value = false;
  }
};

// Watch for changes in parent account options
watch(
  () => parentAccountOptions.value,
  (newOptions) => {
    if (newOptions && newOptions.length > 0) {
      const selectedOption = newOptions.find(option => option.selected);
      if (selectedOption) {
        editFormData.value.parent_id = selectedOption.value;
        console.log('Selected Parent Account:', selectedOption);
      }
    }
  },
  { immediate: true, deep: true }
);

// Update account
const updateAccount = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.put(
      `${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/${accountId}?user_id=${USER_ID}`,
      editFormData.value
    );


      router.push("/account/chart-of-accounts");

  } catch (error) {
    console.error('Error updating account:', error);
    form.setErrors(error.response?.data?.errors || {});
    toast().fry(pan.error('Failed to update account'));
  } finally {
    isloading.value = false;
  }
};

onMounted(async () => {
  await fetchParentAccounts();
  await fetchAccountDetails();
});
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/account/chart-of-accounts">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('account.EditAccount') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 md:col-span-4 ">
            <FormLabel>{{ $t('account.ParentAccount') }} <span class="text-danger">*</span></FormLabel>
            <TomSelect
              v-model="editFormData.parent_id"
              disabled
              :options="{
                placeholder: $t('account.selectAccount'),
                allowEmptyOption: true,
                items: parentAccountOptions,
                valueField: 'value',
                labelField: 'label'
              }"
              class="w-full opacity-60"
              :class="{'border-red-500': form.invalid('parent_id')}"
            >
              <option value="">{{ $t('account.selectAccount') }}</option>
              <template v-for="option in parentAccountOptions" :key="option.value">
                <option
                  :value="option.value"
                  :selected="option.selected"
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
            <FormInput
              v-model="editFormData.code"
              type="text"
              :placeholder="$t('account.AccountCode')"
              :disabled="true"
              :class="{'border-red-500': form.invalid('code')}"
            />
            <template v-if="form.invalid('code')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('code') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-4 ">
            <FormLabel>{{ $t('account.AccountName') }} <span class="text-danger">*</span></FormLabel>
            <FormInput
              v-model="editFormData.name"
              type="text"
              :placeholder="$t('account.AccountName')"
              :class="{'border-red-500': form.invalid('name')}"
            />
            <template v-if="form.invalid('name')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('name') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-4 ">
            <FormLabel>{{ $t('account.AccountType') }} <span class="text-danger">*</span></FormLabel>
            <div>
              <TomSelect
                v-model="editFormData.type"
                :options="{
                  placeholder: $t('account.AccountType'),
                }"
                class="w-full"
                :class="{'border-red-500': form.invalid('type')}"
              >
                <option value="">{{ $t('account.AccountType') }}</option>
                <template v-for="type in Accounttype" :key="type">
                  <option :value="type">{{ type }}</option>
                </template>
              </TomSelect>
            </div>
            <template v-if="form.invalid('type')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('type') }}</div>
            </template>
          </div>
          <div class="col-span-12">
            <FormLabel>{{ $t('account.Description') }}</FormLabel>
            <FormTextarea
              v-model="editFormData.description"
              :placeholder="$t('account.descriptionPlaceholder')"
              rows="3"
            />
          </div>
          <div class="col-span-12">
            <Button
              variant="primary"
              class="mr-2 mt-2 shadow-md"
              @click="updateAccount"
              :disabled="isloading"
            >
              <template v-if="isloading">
                <ClipLoader :loading="true" :color="'#fff'" :size="'20px'" class="mr-2" />
                {{ $t('account.updating') }}
              </template>
              <template v-else>
                {{ $t('account.Update') }}
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
