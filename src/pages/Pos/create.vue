<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/pos/register">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5"/>
      </Button>
    </RouterLink>
    <h1 class="text-lg font-medium">Open Register</h1>
  </div>

  <div class="flex items-center mt-8 pt- 14 intro-y box p-8">
    <div class=" min-h-screen px-5">
      <!-- Header Section -->
      <div class="max-w-4xl mx-auto rounded-lg">
        <!-- Opening Amount Section -->
        <div class="bg-[#fff2e8] px-10 pt-10 pb-5 rounded-md">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <!-- Register Name Field -->
            <div>
              <label for="registerName" class="block text-gray-700 font-medium mb-2">
                Register Name <span class="text-red-500">*</span>
              </label>
              <FormInput
                  type="text"
                  id="registerName"
                  v-model="registerName"
                  placeholder="Enter register name"
                  class="w-full px-4 py-2 border rounded-lg bg-white"
                  @input="validateForm"
              />
              <template v-if="form.invalid('name')">
                <div class="mt-2 text-sm text-red-600">{{ form.getError('name') }}</div>
              </template>
            </div>

            <!-- Opening Amount Field -->
            <div>
              <label for="openingAmount" class="block text-gray-700 font-medium mb-2">
                Opening Balance <span class="text-red-500">*</span>
              </label>
              <div class="relative bg-primary/10 rounded-lg">
                <FormInput
                    type="number"
                    id="openingAmount"
                    v-model.number="manualOpeningAmount"
                    class="w-full px-4 py-2 border rounded-lg   bg-white"
                    @input="handleManualAmountInput"
                />
                <template v-if="form.invalid('opening_balance')">
                  <div class="mt-2 text-sm text-red-600">{{ form.getError('opening_balance') }}</div>
                </template>
              </div>
            </div>

            <!-- Open Register Button -->
            <div class="col-span-2 flex justify-center mt-4">
              <button
                  @click="submitRegister"
                  :disabled="!isValid"
                  class="bg-primary w-[250px] hover:bg-primary/90 text-white font-semibold px-4 py-3 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <template v-if="isLoading">
                  <LoadingIcon icon="three-dots" class="w-10 h-5 text-white flex mx-auto "/>
                </template>
                <template v-else>
                  Open Register
                </template>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<script setup>
import {reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {useFormUtils} from "@/pages/Pos/__helpers/formUtils.js";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import {FormInput} from "@/components/Base/Form";
import ApiService from "@/network/api/apiService.js";
import {handleResponse, handleError} from "@/network/api/responseHandler.js";
import httpClient from '@/network/api/httpClient';
import { useToast } from 'maz-ui'
import ErrorHandler from "@/utils/validation";
import LoadingIcon from "@/components/Base/LoadingIcon";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const {
  registerName,
  manualOpeningAmount,
  isValid,
  validateForm,
  handleManualAmountInput,
} = useFormUtils();

const errors = ref({});
const router = useRouter();
const toast = useToast()
const isLoading = ref(false)

const form = reactive(new ErrorHandler());

async function submitRegister() {
  isLoading.value = true
  const payload = {
    name: registerName.value,
    user_id: USER_ID,
    opening_balance: manualOpeningAmount.value,
  }
  try {
    const response = await httpClient.post(import.meta.env.VITE_PUBLIC_API_URL_POS + '/registers/open', payload);
    const result = handleResponse(response);

    console.log('result',result)
    if (result.success) {
      router.push({path: "/pos/register/" + result.data.data.id});
    } else {
      // toast.error(result.message || "An unexpected error occurred.");

    }
  } catch (error) {

    form.setErrors(error.errors);
    handleError(error);
    const checkErrors = handleError(error);
    if (checkErrors.status === "error") {
      // Show a toast notification for non-validation errors
      toast.error(checkErrors.message);
    }

  }finally {
    isLoading.value = false;
  }
}
</script>