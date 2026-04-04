<script setup>
import {reactive, ref} from 'vue';
import router from "@/router";
import pan from "@/stores/pan";
import { RouterLink } from 'vue-router';
import toast from "@/stores/utility/toast";
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import { useAuthStore } from '@/stores/auth.js';
import { FormCheck, FormInput } from '@/components/Base/Form';
import ErrorHandler from "@/utils/validation";

const logoUrl = '/juldi.png';
import LoadingIcon from '@/components/Base/LoadingIcon';
import {handleResponse} from "@/network/api/responseHandler.js";
import { encrypt } from "@/utils/crypto";

const authStore = useAuthStore();
const email = ref("");
const isLoading = ref(false);

const isValidForm = reactive(new ErrorHandler());

const sendPasswordResetEmail = async () => {
  isLoading.value = true;
  isValidForm.clear(); // Clear previous errors
  try {
    const response = await authStore.forgotPassword(email.value);
    const result = handleResponse(response);
    if (result.success) {
      const encryptedEmail = encrypt(email.value);
      toast().fry(pan.resetPassword.success('Password reset OTP sent successfully!'));
      router.push({ path: `/enter-otp/${encryptedEmail}` });
    }
  } catch (error) {
    if (authStore.errors.errors) {
      isValidForm.setErrors(authStore.errors.errors);
    } else {
      toast().fry("An unexpected error occurred. Please try again.");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-[#f4f4f4] flex justify-center items-center w-full h-[100vh]">
    <div class="w-[600px] mx-auto bg-white p-10 rounded-md">
      <div class="logo text-center flex justify-center mb-6">
        <img :src="logoUrl" alt="Juldi official logo" class="w-40 md:w-auto" />
      </div>
      <div class="form-parent pt-10 px-4">
        <div class="form-heading mb-4">
          <h1 class="text-xl font-semibold text-black">Forgot Password?</h1>
          <p class="text-base font-medium">Enter your email address.</p>
        </div>
        <div class="form-group relative mb-6">
          <FormInput
              v-model="email"
              id="email"
              type="text"
              placeholder="Email"
              class="pe-10 py-3"
              :class="{'border-red-500': isValidForm.invalid('email')}"
          />
          <Lucide icon="Mail" class="w-5 h-5 text-gray-500 absolute top-3 right-3" />
          <p v-if="isValidForm.invalid('email')" class="text-red-500 text-sm mt-1">
            {{ isValidForm.getError('email') }}
          </p>
        </div>
        <div class="mb-6 pt-8">
          <Button @click="sendPasswordResetEmail" variant="pending" class="w-full py-2.5 text-base">
            <template v-if="isLoading">
              <LoadingIcon icon="three-dots" class="w-8 h-6 text-white" />
            </template>
            <template v-else>
              Send
            </template>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
