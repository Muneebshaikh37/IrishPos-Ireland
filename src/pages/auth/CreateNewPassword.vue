<script setup>
import {FormInput} from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
const logoUrl = '/juldi.png';
import Button from "@/components/Base/Button";
import {reactive, ref} from 'vue';
import router from "@/router";
import {RouterLink, useRoute} from "vue-router";
import {decrypt} from "@/utils/crypto.js";
import {useAuthStore} from "@/stores/auth.js";
import toast from "@/stores/utility/toast.js";
import pan from "@/stores/pan.js"
import {handleResponse} from "@/network/api/responseHandler.js";
import LoadingIcon from '@/components/Base/LoadingIcon';
import ErrorHandler from "@/utils/validation";


const route = useRoute();
const email = decrypt(route.params.email);
const signature = route.params.signature;
const expires = route.params.expires;
console.log(expires);
const isLoading = ref(false);

const form = ref({
  email: email,
  password: '',
  password_confirmation: '',
  signature: signature,
  expires: expires
});

// Password visibility toggle
const password = ref('');
const isPasswordVisible = ref(false);
const ConfirmPasswordVisible = ref(false);
const createPasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};
const confirmPasswordVisibility = () => {
  ConfirmPasswordVisible.value = !ConfirmPasswordVisible.value;
};

const authStore = useAuthStore();

const isValidForm = reactive(new ErrorHandler());

const submit = async () => {
  isLoading.value = true;
  isValidForm.clear(); // Clear previous errors

  try {
    const response = await authStore.resetPassword(form.value);
    const result = handleResponse(response);
    console.log(result.success);
    if (result.success) {
      toast().fry(pan.resetPassword.success("Password reset successfully!"));
      router.push({name: 'login'});
    } else {
      toast().fry(pan.resetPassword.error("something went wrong. Please try again."));
    }
  } catch (error) {
    if (authStore.errors.errors)
    {
      console.log(authStore.errors.errors);
      isValidForm.setErrors(authStore.errors.errors);
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
        <img :src="logoUrl" alt="juldi offical logo" class="w-40 md:w-auto">
      </div>
      <div class="form-parent pt-8 px-4">
        <div class="form-heading mb-4">
          <h1 class="text-xl font-semibold text-black ">Create New Password</h1>
        </div>
        <form @submit.prevent="submit">
          <div class="from-group relative mb-6">
            <FormInput id="password" v-model="form.password" :type="isPasswordVisible ? 'text' : 'password'"
                       placeholder="Create New Password" class="pe-10 py-3"/>
            <Lucide :icon="isPasswordVisible ? 'Eye' : 'EyeOff'" @click="createPasswordVisibility"
                    class="w-4 h-4 text-gray-500 absolute top-3.5 right-3 cursor-pointer"/>
            <p v-if="isValidForm.invalid('password')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('password') }}
            </p>
          </div>
          <div class="from-group relative mb-6">
            <FormInput id="password" v-model="form.password_confirmation"
                       :type="ConfirmPasswordVisible ? 'text' : 'password'" placeholder="Confirm Password"
                       class="pe-10 py-3"/>

            <Lucide :icon="ConfirmPasswordVisible ? 'Eye' : 'EyeOff'" @click="confirmPasswordVisibility"
                    class="w-4 h-4 text-gray-500 absolute top-3.5 right-3 cursor-pointer"/>
            <p v-if="isValidForm.invalid('password_confirmation')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('password_confirmation') }}
            </p>
          </div>
          <div class="mb-6 pt-4">
            <Button :disabled="isLoading" variant="pending" class="w-full py-2.5 text-base">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-8 h-6 text-white"/>
              </template>
              <template v-else>
                Create Password
              </template>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>

</template>