<template>
  <div class="flex items-center mt-8 pt-14 intro-y box p-8">
    <div class="min-h-screen px-5">
      <h2 class="text-lg font-semibold mb-4">{{ registerDetails.name }}</h2>
      <div class="max-w-4xl mx-auto rounded-lg">
        <div class="bg-[#fff2e8] px-10 pt-10 pb-5 rounded-md">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <!-- Closing Balance Field -->
            <div>
              <label for="closingBalance" class="block text-gray-700 font-medium mb-2">
                {{$t('pos-registers.closingBalance')}} <span class="text-red-500">*</span>
              </label>
              <div class="relative bg-primary/10 rounded-lg">
                <FormInput
                    type="number"
                    id="closingBalance"
                    v-model.number="closingBalance"
                    class="w-full px-4 py-2 border rounded-lg bg-white"
                />
              </div>
            </div>

            <!-- Expected Amount Field -->
            <div>
              <label for="expectedAmount" class="block text-gray-700 font-medium mb-2">
                {{$t('pos-registers.expectedAmount')}} <span class="text-red-500">*</span>
              </label>
              <div class="relative bg-primary/10 rounded-lg">
                <FormInput
                    type="number"
                    id="expectedAmount"
                    :model-value="expectedCash"
                    class="w-full px-4 py-2 border rounded-lg bg-white"
                    disabled
                />
              </div>
            </div>

            <!-- Close Register Button -->
            <div class="col-span-2 flex justify-center mt-4">
              <Button variant="primary"
                      class="bg-primary w-[250px] hover:bg-primary/90 text-white font-semibold px-4 py-3 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                      @click="closeRegister">
                <template v-if="isLoading">
                  <LoadingIcon icon="three-dots" class="w-8 h-6 text-white"/>
                </template>
                <template v-else>
                  {{$t('pos-registers.closeRegister')}}
                </template>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router"
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import httpClient from "@/network/api/httpClient";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import LoadingIcon from "@/components/Base/LoadingIcon";

const props = defineProps({
  registerDetails: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const closingBalance = ref(0);
const errors = ref({});
const expectedCash = computed(() => props.registerDetails?.totals?.expected_cash ?? 0);

watch(
  expectedCash,
  (value) => {
    if (closingBalance.value === null || closingBalance.value === 0) {
      closingBalance.value = Number(value ?? 0);
    }
  },
  { immediate: true }
);


const isLoading = ref(false)
const closeRegister = async () => {

  isLoading.value = true
  try {
    const payload = {
      closing_balance: closingBalance.value,
      register_id: props.registerDetails.id,
    };
    const response = await httpClient.post(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/registers/${props.registerDetails.id}/close`, payload);
    const result = handleResponse(response);
    if (result.success) {
      router.push({ path: "/pos/register" });
    } else {
      console.error(result.message);
      alert(result.message);
    }
  } catch (error) {
    const result = handleError(error);
    if (result.status === 422) {
      errors.value = result.errors;
    } else {
      alert(result.message);
    }
  }finally {
    isLoading.value = false;
  }
};
</script>
