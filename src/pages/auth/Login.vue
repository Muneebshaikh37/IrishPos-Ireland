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
  <div class="min-h-screen w-full bg-[#f4f4f4] px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
      <div class="hidden w-full max-w-md flex-col justify-between bg-primary px-10 py-12 text-white lg:flex">
        <div>
          <img :src="logoUrl" alt="$t('logo.alt')" class=" max-w-full object-contain" />
          <h2 class="mt-8 text-3xl font-semibold leading-tight">{{ $t('auth.welcomeBack') }}</h2>
          <p class="mt-4 text-sm leading-6 text-slate-200">
            {{ $t('auth.loginToAccount') }}
            Access your dashboard to manage sales, inventory, purchasing, and reports in one place.
            Stay in control of day-to-day operations with secure and reliable sign in.
          </p>
        </div>
        <p class="text-xs text-slate-300">Secure access for your team and business operations.</p>
      </div>

      <div class="flex w-full items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div class="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div class="mb-8 space-y-4">
            <div class="flex items-center justify-between">
              <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.signIn') }}</h1>
            </div>
            <p class="text-sm text-slate-600">{{ $t('auth.loginToAccount') }}</p>
          </div>

          <form @submit.prevent="login">
            <div class="form-group relative mb-5">
              <FormInput
                id="email"
                type="text"
                v-model="form.email"
                :placeholder="$t('auth.email')"
                class="h-12 pe-10 rounded-lg border-slate-200"
                :class="{ 'border-red-500': isValidForm.invalid('email') || isValidForm.invalid('is_active') }"
              />
              <Lucide icon="Mail" class="absolute top-3.5 h-5 w-5 text-slate-400" :class="{ 'left-3': locale === 'ar', 'right-3': locale !== 'ar' }" />
              <p v-if="isValidForm.invalid('email')" class="mt-1 text-sm text-red-500">
                {{ isValidForm.getError('email') }}
              </p>
              <p v-if="isValidForm.invalid('is_active')" class="mt-1 text-sm text-red-500">
                {{ isValidForm.getError('is_active') }}
              </p>
            </div>

            <div class="form-group relative mb-4">
              <FormInput
                id="password"
                v-model="form.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :placeholder="$t('auth.password')"
                class="h-12 pe-10 rounded-lg border-slate-200"
                :class="{ 'border-red-500': isValidForm.invalid('password') }"
              />
              <p v-if="isValidForm.invalid('password')" class="mt-1 text-sm text-red-500">
                {{ isValidForm.getError('password') }}
              </p>
              <Lucide
                :icon="isPasswordVisible ? 'Eye' : 'EyeOff'"
                @click="togglePasswordVisibility"
                class="absolute top-3.5 h-5 w-5 cursor-pointer text-slate-400"
                :class="{ 'left-3': locale === 'ar', 'right-3': locale !== 'ar' }"
              />
            </div>

            <div class="mb-6 flex items-center justify-between gap-3 text-xs text-slate-600 sm:text-sm">
              <label class="flex cursor-pointer select-none items-center" :class="{ 'order-2': locale === 'ar' }" for="remember-me">
                <FormCheck.Input id="remember-me" type="checkbox" class="border" :class="{ 'ml-2': locale === 'ar', 'mr-2': locale !== 'ar' }" />
                {{ $t('auth.rememberMe') }}
              </label>
              <RouterLink to="/forget-password" class="text-primary hover:underline">
                {{ $t('auth.forgotPassword') }}
              </RouterLink>
            </div>

            <Button type="submit" variant="primary" class="h-12 w-full rounded-lg text-base font-medium">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="h-6 w-8 text-white" />
              </template>
              <template v-else>
                {{ $t('auth.signIn') }}
              </template>
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
