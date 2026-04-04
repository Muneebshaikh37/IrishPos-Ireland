<template>
  <div class="bg-[#f4f4f4] flex justify-center items-center w-full  h-[100vh]">
    <div class="w-[600px] mx-auto bg-white p-10 rounded-md">
      <div class="logo text-center flex justify-center mb-6">
        <img :src="logoUrl" alt="juldi offical logo" class="w-40 md:w-auto">
      </div>
      <div class="form-parent pt-10 w-[354px] mx-auto">
        <div class="form-heading mb-8">
          <h1 class="text-xl font-semibold text-black ">Enter OTP </h1>
          <p class="text-base font-medium text-black">Enter your <span class="font-semibold">Authenticator App</span>
            code.</p>
        </div>
        <form @submit.prevent="submitOtp">
          <div class="w-full flex gap-3 justify-left my-5">
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
          <p v-if="isValidForm.invalid('otp')" class="text-red-500 text-sm mt-1">
            {{ isValidForm.getError('otp') }}
          </p>
          <div class="mb-6 pt-2">
            <Button :disabled="isLoading" variant="pending" class="w-full py-2.5 text-base">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-8 h-6 text-white"/>
              </template>
              <template v-else>
                Enter OTP
              </template>
            </Button>
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
import {useRoute} from "vue-router";
import {decrypt, encrypt} from "@/utils/crypto";
import {RouterLink} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";
import {handleResponse} from "@/network/api/responseHandler.js";
import router from "@/router";
import ErrorHandler from "@/utils/validation";
import LoadingIcon from '@/components/Base/LoadingIcon';
import MazInputCode from 'maz-ui/components/MazInputCode'
import toast from "@/stores/utility/toast.js";
import pan from "@/stores/pan.js";

const route = useRoute();
const email = decrypt(route.params.email);
console.log(email);
const form = ref({
  email: email,
  otp: "",
});

const otp = ref("");
const errorText = ref("");
const authStore = useAuthStore();

const isLoading = ref(false);
const isValidForm = reactive(new ErrorHandler());

// Method to submit OTP and email
const submitOtp = async () => {
  isLoading.value = true;
  isValidForm.clear(); // Clear previous errors
  try {
    const response = await authStore.verifyOtp(form.value);
    const result = handleResponse(response);
    if (result.success) {
      const encryptedEmail = encrypt(form.value.email);
      const signature = result.data.signature;
      const expires = result.data.expires;
      toast().fry(pan.otp.success('OTP verified successfully!'));
      router.push({ path: `/create-new-password/${encryptedEmail}/${signature}/${expires}` });
    }
  } catch (error) {
    if (authStore.errors.errors) {
      console.log(authStore.errors.errors);
      isValidForm.setErrors(authStore.errors.errors);
    } else {
      // isValidForm.setErrors("OTP does not exist");
      // toast().fry(pan.otp.error('OTP does not exist'));
      // toast().fry(pan.forgotPassword.success('Password reset OTP sent successfully!'));

    }
  } finally {
    isLoading.value = false;
  }
};

</script>