<template>
  <div class="mb-4">
    <!-- Button to open the dialog -->
    <Button
        variant="primary"
        type="button"
        class="mr-2"
        @click="showTransactionPopup = true"
    >
      Add/Withdraw Cash
    </Button>

    <!-- Dialog for Add/Withdraw -->
    <Dialog :open="showTransactionPopup" @close="showTransactionPopup = false">
      <Dialog.Panel>
        <div class="p-5">
          <div class="text-xl text-black my-4 font-medium text-center">Add/Withdraw Amount</div>
          <div class="pt-2">
            <FormLabel htmlFor="amount">Amount* </FormLabel>
            <FormInput
                id="amount"
                v-model="transactionAmount"
                type="number"
                placeholder="Enter amount"
                :class="{ 'border-red-500': form.invalid('amount') }"
            />
            <template v-if="form.invalid('amount')">
              <div class="mt-2 text-sm text-red-600">{{ form.getError('amount') }}</div>
            </template>
          </div>
          <div class="pt-2">
            <FormLabel htmlFor="notes">Notes </FormLabel>
            <FormTextarea
                id="notes"
                v-model="Notes"
                placeholder="Optional notes"
            />
            <span v-if="errors.notes" class="text-red-500 text-sm">{{ errors.notes[0] }}</span>
          </div>
        </div>
        <div class="px-5 pt-6 pb-8 text-center flex justify-center gap-4">
          <Button
              variant="outline-secondary"
              type="button"
              @click="showTransactionPopup = false"
              class="w-24"
          >
            Cancel
          </Button>
          <!-- Withdraw Button -->
          <Button
              variant="primary"
              type="button"
              class="w-24"
              :disabled="withdrawLoading"
              @click="handleTransaction('withdrawal')"
          >
            <template v-if="withdrawLoading">
              <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
            </template>
            <template v-else>
              Withdraw
            </template>
          </Button>
          <!-- Add Button -->
          <Button
              variant="primary"
              type="button"
              class="w-24"
              :disabled="addLoading"
              @click="handleTransaction('deposit')"
          >
            <template v-if="addLoading">
              <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
            </template>
            <template v-else>
              Add
            </template>
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import Button from "@/components/Base/Button";
import FormTextarea from "@/components/Base/Form/FormTextarea.vue";
import ApiService from "@/network/api/apiService.js";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import ErrorHandler from "@/utils/validation";
import httpClient from '@/network/api/httpClient';
import { useRoute } from "vue-router";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import toast from "@/stores/utility/toast.js";
import pan from "@/stores/pan.js";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const showTransactionPopup = ref(false);
const transactionType = ref("deposit"); // Default transaction type
const transactionAmount = ref(0);
const Notes = ref("");
const errors = ref({}); // To store validation errors

// Loading states for buttons
const addLoading = ref(false);
const withdrawLoading = ref(false);

const route = useRoute();
const registerId = route.params.registerId;

const form = reactive(new ErrorHandler());
async function handleTransaction(type) {
  // Set the loading state based on the button clicked
  if (type === "deposit") addLoading.value = true;
  else if (type === "withdrawal") withdrawLoading.value = true;

  errors.value = {};
  const USERID = USER_ID;
  const user_id = USERID;

  try {
    const payload = {
      type,
      register_id: registerId,
      amount: transactionAmount.value,
      payment_method: "cash",
      user_id,
      notes: Notes.value,
    };

    const response = await httpClient.post(
        import.meta.env.VITE_PUBLIC_API_URL_POS + "/registers/transaction",
        payload
    );

    const result = handleResponse(response);

    if (result.success)
    {
      console.log(type);

      const message = type === "deposit" ? "Amount Added" : "Amount Withdrawal";
      toast().fry(pan.transactions.success(message))
      resetForm(); // Reset the form on success
    }
  } catch (error) {
    form.setErrors(error.errors);
    handleError(error);
  } finally {
    // Reset loading states
    addLoading.value = false;
    withdrawLoading.value = false;
  }
}

// Reset form fields
function resetForm() {
  showTransactionPopup.value = false;
  transactionType.value = "deposit";
  transactionAmount.value = 0;
  Notes.value = "";
}
</script>
