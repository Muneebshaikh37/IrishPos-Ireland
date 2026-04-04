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
import Litepicker from "@/components/Base/Litepicker";
import { ref, reactive, onMounted } from "vue";
import { handleResponse } from "@/network/api/responseHandler.js";
import router from "@/router";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import ErrorHandler from "@/utils/validation";
import { useAuthStore } from "@/stores/auth.js";
import TomSelect from "../../../components/Base/TomSelect";
import LatestTranscation from "../../../components/Accounts/LatestTranscation.vue";
import httpClient from "@/network/api/httpClient";
import { useRoute } from "vue-router";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isloading = ref(false);
const route = useRoute();
const accountId = route.params.uuid;

const accountData = ref({
  parent_id: "",
  code: "",
  name: "",
  description: "",
  type: "",
  balance: "",
  transactions: [],
});

// Fetch account details
const fetchAccountDetails = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(
      `${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/${accountId}?user_id=${USER_ID}`
    );

    if (response.data) {
      const data = response.data.data;
      console.log('Account Data:', data);

      accountData.value = {
        parent_id: data.id || "",
        code: data.code || "",
        name: data.name || "",
        description: data.description || "",
        type: data.type || "",
        balance: data.balance || "0.00",
        transactions: data.transactions || [],
      };
    }
  } catch (error) {
    console.error('Error fetching account details:', error);
    toast().fry(pan.error('Failed to load account details'));
  } finally {
    isloading.value = false;
  }
};

onMounted(() => {
  fetchAccountDetails();
});

// Static data for now. Replace with props or API data as needed.
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/account/chart-of-accounts">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('account.ViewAccount') }}</h2>
  </div>

  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12">
      <div class="intro-y box p-8 w-full">
        <div class="w-full">
          <div class="bg-blue-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-base font-semibold text-gray-700">{{ accountData.name }}</div>
                <div class="text-3xl font-bold text-gray-800 mt-1">{{ accountData.balance }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ $t('account.ClosingBalance') }}</div>
              </div>
              <RouterLink :to="`/account/general-ledger/${accountId}/view`" class="text-sm font-medium text-primary hover:underline mt-1">
                {{ $t('account.ViewGeneralLedger') }}
              </RouterLink>
            </div>
            <hr class="border-dashed border-gray-400 my-2" />
            <div>
              <div class="text-xl font-bold text-gray-700 mb-1">{{ $t('account.Description') }}</div>
              <div class="text-base text-gray-600">
                {{ accountData.description }}
              </div>
            </div>
            <!-- <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div class="text-sm font-semibold text-gray-600">{{ $t('account.AccountCode') }}</div>
                <div class="text-base text-gray-800">{{ accountData.code }}</div>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-600">{{ $t('account.AccountType') }}</div>
                <div class="text-base text-gray-800 capitalize">{{ accountData.type }}</div>
              </div>
            </div> -->
          </div>
          <LatestTranscation :transactions="accountData.transactions" />
        </div>
      </div>
    </div>
  </div>

  <div v-if="isloading" class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true" :color="'#fff'" :size="'50px'"></clip-loader>
  </div>
</template>



<style scoped>
/* No extra styles needed, Tailwind handles all */
</style>
