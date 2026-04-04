<script setup>
import {reactive, ref} from "vue";
import {useAuthStore} from "@/stores/auth";
import {RouterLink, useRouter} from "vue-router";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import {FormInput} from "@/components/Base/Form";
import toast from "@/stores/utility/toast.js";
import pan from "@/stores/pan.js";
import LoadingIcon from '@/components/Base/LoadingIcon';
import ErrorHandler from "@/utils/validation";
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput';

const logoUrl = '/juldi.png';
import LocaleSelector from "@/components/globel/LocaleSelector.vue";
import {handleResponse, handleError} from "@/network/api/responseHandler.js";


// Form state
const authStore = useAuthStore();
const router = useRouter();
const form = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  vat_number: '',
  password: '',
  password_confirmation: '',
});

// Loading and error handling
const isLoading = ref(false);
const termsAccepted = ref(false);
const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const countryCode = ref("SA");
const results = ref();

// Toggle password visibility
const togglePasswordVisibility = (field) => {
  if (field === 'password') {
    isPasswordVisible.value = !isPasswordVisible.value;
  } else if (field === 'confirmPassword') {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
  }
};

// Register function
const isValidForm = reactive(new ErrorHandler());
const register = async () => {
  isLoading.value = true;
  isValidForm.clear(); // Clear previous errors
  try {
    const result = await authStore.register(form.value);
    if (result && result.success) {
      // Registration successful - navigate to OTP verification
      const { encrypt } = await import('@/utils/crypto');
      const encryptedEmail = encrypt(result.email);
      router.push({ path: `/verify-otp/${encryptedEmail}`, query: { type: 'registration' } });
    }
  } catch (error) {
    // Display errors for form fields
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
  <div class="bg-[#f4f4f4] flex justify-center items-center w-full py-14">
    <div class="w-[600px] mx-auto bg-white p-10 rounded-md">
      <div class="logo text-center flex justify-center mb-6">
        <img :src="logoUrl" alt="juldi official logo" class="w-40 md:w-auto"/>
      </div>
      <div class="form-parent pt-8 px-4">
        <div class="form-heading mb-4">
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-semibold text-black">{{$t('auth.registerTitle')}}</h1>
            <LocaleSelector />
          </div>

        </div>
        <form @submit.prevent="register">
          <!-- Name Field -->
          <div class="form-group relative mb-6">
            <FormInput
                id="name"
                v-model="form.name"
                type="text"
                :placeholder="$t('auth.namePlaceholder')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('name')}"
            />
            <p v-if="isValidForm.invalid('name')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('name') }}
            </p>
            <Lucide icon="UserRound" class="w-4 h-4 text-gray-500 absolute top-3.5 right-3"/>
          </div>

          <!-- Phone Field -->
          <div class="form-group relative mb-6">
            <MazPhoneNumberInput
                id="phone"
                v-model="form.phone"
                :noSearch="true"
                :noFlags="true"
                :noExample="true"
                :fetchCountry="false"
                :default-country="'SA'"
                :block="true"
                v-model:country-code="countryCode"
                :onlyCountries="['SA']"
                class="w-full"
                @update="results = $event"
            />
            <p v-if="isValidForm.invalid('phone')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('phone') }}
            </p>
            <Lucide icon="Phone" class="w-4 h-4 text-gray-500 absolute top-3.5 right-3 z-[99999] "/>
          </div>

          <!-- Email Field -->
          <div class="form-group relative mb-6">
            <FormInput
                id="email"
                v-model="form.email"
                type="text"
                :placeholder="$t('auth.emailPlaceholder')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('email')}"
            />
            <p v-if="isValidForm.invalid('email')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('email') }}
            </p>
            <Lucide icon="Mail" class="w-4 h-4 text-gray-500 absolute top-3.5 right-3"/>
          </div>

          <!-- Address Field -->
          <div class="form-group relative mb-6">
            <FormInput
                id="address"
                v-model="form.address"
                type="text"
                :placeholder="$t('auth.addressPlaceholder')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('address')}"
            />
            <p v-if="isValidForm.invalid('address')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('address') }}
            </p>
            <Lucide icon="MapPin" class="w-4 h-4 text-gray-500 absolute top-3.5 right-3"/>
          </div>

          <!-- VAT Number Field -->
          <div class="form-group relative mb-6">
            <FormInput
                id="vat_number"
                v-model="form.vat_number"
                type="text"
                :placeholder="$t('auth.vatNumberPlaceholder')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('vat_number')}"
            />
            <p v-if="isValidForm.invalid('vat_number')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('vat_number') }}
            </p>
            <Lucide icon="Percent" class="w-4 h-4 text-gray-500 absolute top-3.5 right-3"/>
          </div>

          <!-- Password Field -->
          <div class="form-group relative mb-6">
            <FormInput
                id="password"
                v-model="form.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :placeholder="$t('auth.passwordPlaceholder')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('password')}"
            />
            <p v-if="isValidForm.invalid('password')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('password') }}
            </p>
            <Lucide
                :icon="isPasswordVisible ? 'Eye' : 'EyeOff'"
                @click="togglePasswordVisibility('password')"
                class="w-4 h-4 text-gray-500 absolute top-3.5 right-3 cursor-pointer"
            />
          </div>

          <!-- Confirm Password Field -->
          <div class="form-group relative mb-6">
            <FormInput
                id="password_confirmation"
                v-model="form.password_confirmation"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                :placeholder="$t('auth.confirmPasswordPlaceholder')"
                class="pe-10 py-3"
                :class="{'border-red-500': isValidForm.invalid('password_confirmation')}"
            />

            <p v-if="isValidForm.invalid('password_confirmation')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('password_confirmation') }}
            </p>
            <Lucide
                :icon="isConfirmPasswordVisible ? 'Eye' : 'EyeOff'"
                @click="togglePasswordVisibility('confirmPassword')"
                class="w-4 h-4 text-gray-500 absolute top-3.5 right-3 cursor-pointer"
            />
          </div>

          <!-- Terms Checkbox -->
          <div class="form-group mb-6 flex items-center">
            <input id="terms" type="checkbox" v-model="termsAccepted" class="mr-2"/>
            <label for="terms" class="text-sm text-gray-600">
              {{$t('auth.termsText')}}
              <RouterLink to="/terms" class="text-primary">{{$t('auth.termsLinkText')}}</RouterLink>.
            </label>
          </div>

          <!-- Submit Button -->
          <div class="mb-6 pt-4">
            <Button :disabled="!termsAccepted || isLoading" variant="primary" class="w-full py-2.5 text-base">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-8 h-6 text-white"/>
              </template>
              <template v-else>
                {{$t('auth.signUpButton')}}
              </template>
            </Button>
          </div>
        </form>
        <div>
          <h5 class="text-base text-center font-medium">
            {{$t('auth.alreadyHaveAccount')}}
            <RouterLink to="/login" class="text-primary">{{$t('auth.signInLinkText')}}</RouterLink>
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.m-input-wrapper.m-reset-css.--default-border.maz-rounded {
  border-radius: 6px !important;
}

.m-input-wrapper-input.--md, .m-input-wrapper.m-reset-css.--default-border.maz-rounded, .m-input-wrapper.m-reset-css.--default-border.maz-rounded {
  width: 100% !important;
}

.m-input-wrapper-input.--md input.m-input-input {
  width: 100% !important;
}

.m-phone-number-input.--responsive .m-phone-input.--border-radius .m-input-wrapper {
  width: 100% !important;
}

</style>
