<script setup>
import { ref, onMounted , reactive} from 'vue'; 
import pan from "@/stores/pan";
import { RouterLink } from 'vue-router';
import toast from "@/stores/utility/toast";
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import { useAuthStore } from '@/stores/auth.js';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { FormCheck, FormInput } from '@/components/Base/Form';
import LocaleSelector from "@/components/globel/LocaleSelector.vue";

const logoUrl = '/juldi.png';

import ErrorHandler from "@/utils/validation";

const authStore = useAuthStore();
const isLoading = ref(false);
const isPasswordVisible = ref(false);


const locale = ref('en'); // Default locale
const form = ref({
  email: '',
  password: '',
});

// Toggle password visibility
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const isValidForm = reactive(new ErrorHandler());

// Login function
const login = async () => {
  isLoading.value = true;
  isValidForm.clear(); // Clear previous errors
  try {
    await authStore.login(form.value);
    // toast().fry(pan.authin.success(authStore.user.name));
  } catch (error) {
    // Always show user-friendly message for login errors
    let errorMessage = 'Incorrect Credentials';
    
    // Check for validation errors first
    if (authStore.errors && authStore.errors.errors) {
      isValidForm.setErrors(authStore.errors.errors);
      // Extract user-friendly message from validation errors
      const validationError = authStore.errors.errors.email?.[0] || 
                             authStore.errors.errors.password?.[0];
      if (validationError) {
        errorMessage = validationError;
      }
    } else if (authStore.errors && authStore.errors.message) {
      // Check if it's a user-friendly message, otherwise use default
      const msg = authStore.errors.message;
      if (msg && !msg.includes('status code') && !msg.includes('Request failed')) {
        errorMessage = msg;
      }
    } else if (error?.response?.data?.message) {
      // Check if it's a user-friendly message from API
      const msg = error.response.data.message;
      if (msg && !msg.includes('status code') && !msg.includes('Request failed')) {
        errorMessage = msg;
      }
    }
    
    // Show user-friendly error message
    toast().fry(pan.authin.error(errorMessage));
  } finally {
    isLoading.value = false;
  }
}; 
onMounted(() => {
  locale.value = localStorage.getItem('locale') || 'en';
});
</script>

<template>
  <div class="bg-[#f4f4f4] flex justify-center items-center w-full h-[100vh]">
    <div class="w-[600px] mx-auto bg-white p-10 rounded-md">
      <div class="logo text-center flex justify-center mb-6">
        <img :src="logoUrl" alt="$t('logo.alt')" class="w-[180px] md:w-auto" />

      </div>
      <div class="form-parent pt-10 px-4">
        <div class="form-heading mb-4">
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-semibold text-black">{{ $t('auth.welcomeBack') }}</h1>
            <LocaleSelector />
          </div>
          <p class="text-base font-medium">{{ $t('auth.loginToAccount') }}</p>


        </div>
        <form @submit.prevent="login">
          <div class="form-group relative mb-6">
            <FormInput
                id="email"
                type="text"
                v-model="form.email"
                :placeholder="$t('auth.email')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('email') || isValidForm.invalid('is_active')}"
            />
            <Lucide icon="Mail" class="w-5 h-5 text-gray-500 absolute top-3" :class="{ 'left-3': locale === 'ar', 'right-3': locale !== 'ar' }" />
            <p v-if="isValidForm.invalid('email')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('email') }}
            </p>
            <p v-if="isValidForm.invalid('is_active')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('is_active') }}
            </p>
            <Lucide icon="Mail" class="w-5 h-5 text-gray-500 absolute top-3 right-3" />
          </div>
          <div class="form-group relative mb-4">
            <FormInput
                id="password"
                v-model="form.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :placeholder="$t('auth.password')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('password')}"
            />
            <p v-if="isValidForm.invalid('password')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('password') }}
            </p>
            <Lucide
                :icon="isPasswordVisible ? 'Eye' : 'EyeOff'"
                @click="togglePasswordVisibility"
                class="w-5 h-5 text-gray-500 absolute top-3 cursor-pointer" :class="{ 'left-3': locale === 'ar', 'right-3': locale !== 'ar' }"
            />
          </div>
          <div class="flex mb-4 text-xs text-slate-600 dark:text-slate-500 sm:text-sm">
            <div class="flex items-center " :class="{ 'ml-auto': locale === 'ar', 'mr-auto': locale !== 'ar' }">
              <FormCheck.Input id="remember-me" type="checkbox" class=" border" :class="{ 'ml-2': locale === 'ar', 'mr-2': locale !== 'ar' }" />
              <label class="cursor-pointer select-none" htmlFor="remember-me">{{ $t('auth.rememberMe') }}</label>
              <RouterLink to="/forget-password" class="text-primary mx-2">{{ $t('auth.forgotPassword') }}</RouterLink>
            </div>
           
          </div>
          <div class="mb-6 pt-8">
            <Button type="submit" variant="primary" class="w-full py-2.5 text-base">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-8 h-6 text-white" />
              </template>
              <template v-else>
                {{ $t('auth.signIn') }}
              </template>
            </Button>
          </div>
        </form>
        <!--<div>
          <h5 class="text-base text-center font-medium">
            {{ $t('auth.dontHaveAccount') }}
            <RouterLink to="/register" class="text-primary">{{ $t('auth.register') }}</RouterLink>
          </h5>
        </div>-->
      </div>
    </div>
  </div>
</template>
