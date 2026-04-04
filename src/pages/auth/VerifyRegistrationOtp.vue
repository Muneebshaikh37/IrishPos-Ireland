<template>
  <div class="bg-[#f4f4f4] flex justify-center items-center w-full h-[100vh]">
    <div class="w-[600px] mx-auto bg-white p-10 rounded-md">
      <div class="logo text-center flex justify-center mb-6">
        <img :src="logoUrl" alt="jaldi official logo" class="w-40 md:w-auto">
      </div>
      <div class="form-parent pt-10 w-[354px] mx-auto">
        <div class="form-heading mb-8">
          <h1 class="text-xl font-semibold text-black">Verify Your Email</h1>
          <p class="text-base font-medium text-black mt-2">
            We've sent a verification code to <span class="font-semibold text-primary">{{ email }}</span>
          </p>
          <p class="text-sm text-gray-600 mt-2">
            Please enter the 6-digit code from your email to complete your registration.
          </p>
        </div>
        <form @submit.prevent="submitOtp">
          <div class="w-full flex gap-3 justify-center my-5">
            <div class="flex gap-3 items-center otpMain">
              <MazInputCode
                  class="bg-theme-gray border-slate-300 p-1 bg-none"
                  size="sm"
                  type="number"
                  :codeLength="6"
                  :error="isValidForm.invalid('otp')"
                  v-model="form.otp" />
            </div>
          </div>
          <p v-if="isValidForm.invalid('otp')" class="text-red-500 text-sm mt-1 text-center">
            {{ isValidForm.getError('otp') }}
          </p>
          <div class="mb-6 pt-2">
            <Button :disabled="isLoading" variant="primary" class="w-full py-2.5 text-base">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-8 h-6 text-white"/>
              </template>
              <template v-else>
                Verify Email
              </template>
            </Button>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Didn't receive the code?
              <button
                type="button"
                @click="resendOtp"
                :disabled="isResending"
                class="text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isResending ? 'Sending...' : 'Resend OTP' }}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.otpMain input[type="text"] {
  border-color: transparent !important;
  text-align: center;
  padding: 0.25rem;
  border-width: 1px;
  border-radius: 0.375rem;
  height: 48px;
}
.otpMain .input-wrapper {
  height: 48px !important;
  width: 48px !important;
  border-radius: 0.375rem;
}
</style>

<script setup>
const logoUrl = '/juldi.png';
import Button from "@/components/Base/Button";
import {reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {decrypt, encrypt} from "@/utils/crypto";
import {useAuthStore} from "@/stores/auth.js";
import {handleResponse, handleError} from "@/network/api/responseHandler.js";
import router from "@/router";
import ErrorHandler from "@/utils/validation";
import LoadingIcon from '@/components/Base/LoadingIcon';
import MazInputCode from 'maz-ui/components/MazInputCode'
import toast from "@/stores/utility/toast.js";
import pan from "@/stores/pan.js";
import httpClient from "@/network/api/httpClient.js";

const route = useRoute();
const routerInstance = useRouter();
const email = ref(decrypt(route.params.email));
const form = ref({
  email: email.value,
  otp: "",
});

const authStore = useAuthStore();
const isLoading = ref(false);
const isResending = ref(false);
const isValidForm = reactive(new ErrorHandler());

// Method to submit OTP and email
const submitOtp = async () => {
  isLoading.value = true;
  isValidForm.clear(); // Clear previous errors
  try {
    const response = await authStore.verifyRegistrationOtp(form.value);
    const result = handleResponse(response);
    if (result.success) {
      // User will be automatically redirected to /admin by the auth store
    }
  } catch (error) {
    if (authStore.errors.errors) {
      isValidForm.setErrors(authStore.errors.errors);
    } else {
      toast().fry(pan.checkcode.error('Invalid OTP. Please try again.'));
    }
  } finally {
    isLoading.value = false;
  }
};

// Method to resend OTP
const resendOtp = async () => {
  isResending.value = true;
  isValidForm.clear();
  try {
    const response = await authStore.resendRegistrationOtp(form.value.email);
    const result = handleResponse(response);
    if (result.success) {
      toast().fry(pan.checkcode.success('OTP sent successfully! Please check your email.'));
    }
  } catch (error) {
    if (authStore.errors.errors) {
      isValidForm.setErrors(authStore.errors.errors);
    } else {
      toast().fry(pan.checkcode.error('Failed to resend OTP. Please try again.'));
    }
  } finally {
    isResending.value = false;
  }
};
</script>

