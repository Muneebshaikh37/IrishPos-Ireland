<template>
  <div class="p-6 intro-y box bg-gray-50 min-h-screen">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <RouterLink to="/pos/register/">
          <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
            <Lucide icon="ChevronLeft" class="w-5 h-5"/>
          </Button>
        </RouterLink>
        <h1 class="text-lg font-medium">{{ registerDetails.name }}</h1>
      </div>
    </div>

    <div v-if="showCloseRegister">
      <CloseRegister :register-details="registerDetails" />
    </div>

    <div v-else class="border rounded-lg max-w-lg intro-y box p-4 border-primary">
      <div class="bg-gray-100 p-4 rounded-lg mb-8">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-600 font-medium text-sm">{{$t('pos-registers.openAt')}}:</span>
          <div class="flex items-center space-x-2 gap-4">
            <span class="text-gray-800 flex items-center gap-2">
              <Lucide icon="Clock" class="w-4 h-4 text-primary"/>
              {{ formatDate(registerDetails.opened_at, 'time') }}
            </span>
            <span class="text-gray-800 flex items-center gap-2">
              <Lucide icon="CalendarDays" class="w-4 h-4 text-primary"/>
              {{ formatDate(registerDetails.opened_at, 'date') }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 font-medium text-sm">{{$t('pos-registers.closedAt')}}:</span>
          <div class="flex items-center space-x-2 gap-4">
            <span class="text-gray-800 flex items-center gap-2">
              <Lucide icon="Clock" class="w-4 h-4 text-primary"/>
              {{ registerDetails.closed_at ? formatDate(registerDetails.closed_at, 'time') : $t('common.notAvailable') }}
            </span>
            <span class="text-gray-800 flex items-center gap-2">
              <Lucide icon="CalendarDays" class="w-4 h-4 text-primary"/>
              {{ registerDetails.closed_at ? formatDate(registerDetails.closed_at, 'date') : $t('common.notAvailable') }}
            </span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-6">
          <Button v-if="ability.can('close', 'register')" variant="danger" @click="showCloseRegister = true" class="w-full text-white py-2 px-4 rounded-lg">{{$t('pos-registers.closeRegister')}}</Button>
        </div>
        <div class="col-span-6">
          <RouterLink :to="{ name: 'RegisterInvoice', params: { registerId: registerId.value } }">
            <Button variant="primary" class="w-full py-2 px-4 rounded-lg">{{$t('pos-registers.continueSelling')}}</Button>
          </RouterLink>
        </div>
      </div>
      <Button variant="primary" @click="showRecordCashDialog = true" class="w-full py-2 px-4 rounded-lg mt-2">
        {{$t('pos-registers.recordCash')}}
      </Button>
    </div>

    <!-- Record Cash Dialog -->
    <Dialog :open="showRecordCashDialog" @close="closeRecordCashDialog">
      <Dialog.Panel>
        <div class="py-5">
          <div class="border-b border-gray-300 mb-4">
            <h4 class="text-lg text-gray-800 font-semibold pb-3 px-6">{{$t('pos-registers.recordCash')}}</h4>
          </div>

          <div class="mt-4 px-5">
            <FormLabel class="font-medium">{{$t('pos-registers.cashAmount')}}</FormLabel>
            <FormInput
                type="number"
                v-model="cashAmount"
                class="mt-1 block w-full rounded-md"
            />
            <p v-if="form.errors.cashAmount" class="text-red-600 text-sm mt-1">{{ form.errors.cashAmount }}</p>
          </div>

          <div class="mt-10 flex justify-end px-5">
            <Button
                variant="outline-secondary"
                type="button"
                @click="closeRecordCashDialog"
                class="w-24 mr-1"
                :disabled="isLoading"
            >
              {{$t('common.cancel')}}
            </Button>
            <Button
                variant="primary"
                type="button"
                class="ml-4 w-24"
                @click="submitRecordCash"
                :disabled="isLoading"
            >
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-5 h-5 text-white"/>
              </template>
              <template v-else>{{$t('common.submit')}}</template>
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { Dialog } from "@/components/Base/Headless";
import Button from "@/components/Base/Button";
import LoadingIcon from "@/components/Base/LoadingIcon";
import ErrorHandler from "@/utils/validation";
import httpClient from "@/network/api/httpClient";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import { useRoute } from "vue-router";
import toast from "../../stores/utility/toast";
import pan from "../../stores/pan";
import Lucide from "@/components/Base/Lucide";
import { FormInput, FormLabel } from "@/components/Base/Form";
import CloseRegister from "@/components/pos/CloseRegister.vue";
import {useAbility} from "@casl/vue";

import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const recorded_by_id = authStore.getUser.id;
const showRecordCashDialog = ref(false);
const cashAmount = ref(null);
const isLoading = ref(false);
const form = reactive(new ErrorHandler());
const route = useRoute();
const registerId = ref(route.params.registerId);
const registerDetails = ref({});
const showCloseRegister = ref(false);

// Close the "Record Cash" dialog
const closeRecordCashDialog = () => {
  showRecordCashDialog.value = false;
  form.clear();
};

// Fetch register details from API on page load
onMounted(async () => {
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/registers/${registerId.value}`);
    const result = handleResponse(response);
    if (result.success) {
      registerDetails.value = result.data.data;
    }
  } catch (error) {
    console.error("Error fetching register details:", error);
    alert("Failed to fetch register details. Please try again.");
  }
});

// Function to format date
function formatDate(date, type) {
  const options = type === 'time' ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric', month: 'short', day: '2-digit' };
  return new Date(date).toLocaleString('en-US', options);
}

// Submit the cash record
const submitRecordCash = async () => {
  form.clear();

  if (!cashAmount.value || cashAmount.value <= 0) {
    form.errors.cashAmount = "Cash amount must be greater than 0.";
    return;
  }

  try {
    isLoading.value = true;
    const payload = {
      register_id: registerId.value,
      amount: cashAmount.value,
      user_id: USER_ID,
      recorded_by_id
    };

    const response = await httpClient.post(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/registers/cash-record`, payload);
    const result = handleResponse(response);
    if (result.success) {
      toast().fry(pan.recordCash.success("Cash Recorded Successfully"));
    }
    closeRecordCashDialog();
  } catch (error) {
    if (error.response && error.response.data.errors) {
      form.setErrors(error.response.data.errors);
    } else {
      handleError(error);
      alert("Failed to record cash. Please try again.");
    }
  } finally {
    isLoading.value = false;
    cashAmount.value = null
  }
};

const ability = useAbility();

</script>
