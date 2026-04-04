<template>
  <Dialog :open="props.open" class="align-middle">
    <Dialog.Panel class="md:w-[800px]">
      <div class="w-full md:w-[800px] px-4 py-4 sm:px-0">
        <div class="border-b border-gray-300 mb-4 flex items-center justify-between">
          <h4 class="text-lg text-gray-800 font-semibold pb-3 px-6">
            {{ $t('invoices.checkout') }}
          </h4>

          <!-- Close Button on Right Side -->
          <button @click="closePaymentDialog" class="text-gray-500 hover:text-gray-800 p-2 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-6 pb-6">
          <div class="rounded-xl bg-[#F1F5F9] p-5">
            <div class="mb-4 flex justify-between">
              <label class="text-gray-700 font-medium">{{ $t('invoices.totalSale') }}</label>
              <p class="text-primary font-medium">{{ formatPrice(totalSale) }}</p>
            </div>
            <!-- Payment Methods -->
           <PaymentMethods
             :payment-methods="paymentMethods"
             :has-error="hasError"
             />
            <!-- Total Paid Amount -->
            <div class="mt-4 flex justify-between items-center">
              <label class="text-gray-700 font-medium">{{ $t('invoices.totalPaid') }}</label>
              <p class="text-primary font-medium">{{ formatPrice(totalPaidAmount) }}</p>
            </div>
            <!-- Customer Selection Section -->
            <div class="mt-4 border-t border-gray-200 pt-4">
              <label class="block text-gray-700 font-medium mb-2" for="customerSearch">
                {{ $t('invoices.selectCustomer') }} <span class="text-red-500" v-if="requireCustomer">*</span>
              </label>
              <div class="flex items-center space-x-2">
                <input
                    id="customerSearch"
                    type="text"
                    :placeholder="$t('customers.enterCustomerName')"
                    v-model="customerQuery"
                    @input="fetchCustomers"
                    :class="[
                      'flex-1 px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary',
                      { 'border-red-500': customerError }
                    ]"
                />
                <Button
                    variant="secondary"
                    class="bg-primary text-white hover:bg-primary/90"
                    @click="openAddCustomerDialog"
                >
                  + {{ $t('customers.add') }}
                </Button>
              </div>
              <div v-if="customerError" class="mt-1 text-red-500 text-sm">
                Please select a customer
              </div>
            </div>
            <!-- Customer Suggestions Dropdown -->
            <div class="relative">
              <div
                  v-if="filteredCustomers.length > 0"
                  class="absolute mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto w-full z-10"
              >
                <ul>
                  <li
                      v-for="customer in filteredCustomers"
                      :key="customer.id"
                      @click="selectCustomer(customer)"
                      class="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {{ customer.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- Action Buttons -->
          <div class="flex justify-end gap-2 mt-4">
            <Button
                v-if="!isEditInvoice"
                variant="secondary"
                type="button"
                @click="holdInvoice"
                :disabled="isLoading || isHoldingInvoice || isConfirmingPayment"
                class="min-w-[140px]"
            >
              <span class="flex items-center justify-center gap-2">
                <LoadingIcon v-if="isHoldingInvoice" icon="three-dots" class="w-5 h-5 text-white"/>
                <span>{{ $t('invoices.holeInvoice') }}</span>
              </span>
            </Button>
            <Button
                variant="primary"
                type="button"
                @click="confirmPayment"
                :disabled="isLoading || isConfirmingPayment || isHoldingInvoice || hasError || !isAnyMethodSelected || customerError"
                class="min-w-[160px]"
            >
              <span class="flex items-center justify-center gap-2">
                <LoadingIcon v-if="isConfirmingPayment" icon="three-dots" class="w-5 h-5 text-white"/>
                <span>{{ $t('invoices.confirmPayment') }}</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog.Panel>
    <CustomerAddDialog
        :isOpen="isAddCustomerDialogOpen"
        @close="handleCustomerDialogClose"
        @customer-added="handleCustomerAdded"

    />
    <!-- Hold Invoice Confirmation Modal -->
    <Dialog :open="showHoldInvoiceConfirm" @close="closeHoldInvoiceConfirm">
      <Dialog.Panel>
        <div class="p-5 text-center">
          <Lucide icon="FileText" class="w-16 h-16 mx-auto mt-3 text-primary" />
          <div class="mt-5 text-3xl">{{ $t('invoices.holeInvoice') }}</div>
          <div class="mt-2 text-slate-500">
            Are you sure you want to hold this invoice?
          </div>
        </div>
        <div class="px-5 pb-8 text-center flex items-center justify-center">
          <Button variant="outline-secondary" type="button" @click="closeHoldInvoiceConfirm" class="w-24 mr-1 h-10">
            Cancel
          </Button>
          <Button variant="primary" type="button" class="ml-4 w-24 h-10" @click="confirmHoldInvoice">
            Confirm
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
    <!-- Confirm Payment Confirmation Modal -->
    <Dialog :open="showConfirmPaymentConfirm" @close="closeConfirmPaymentConfirm">
      <Dialog.Panel>
        <div class="p-5 text-center">
          <Lucide icon="CheckCircle" class="w-16 h-16 mx-auto mt-3 text-success" />
          <div class="mt-5 text-3xl">{{ $t('invoices.confirmPayment') }}</div>
          <div class="mt-2 text-slate-500">
            Are you sure you want to confirm this payment?
          </div>
        </div>
        <div class="px-5 pb-8 text-center flex items-center justify-center">
          <Button variant="outline-secondary" type="button" @click="closeConfirmPaymentConfirm" class="w-24 mr-1 h-10">
            Cancel
          </Button>
          <Button variant="primary" type="button" class="ml-4 w-24 h-10" @click="confirmPaymentAction">
            Confirm
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
    <!-- Worker Incomplete Job Modal -->
    <Dialog :open="showWorkerIncompleteModal" @close="closeWorkerIncompleteModal">
      <Dialog.Panel>
        <div class="p-5 text-center">
          <Lucide icon="AlertCircle" class="w-16 h-16 mx-auto mt-3 text-warning" />
          <div class="mt-5 text-3xl">{{ $t('invoices.actionRequired') }}</div>
          <div class="mt-2 text-slate-500">
            {{ $t('invoices.workerIncompleteMessage') }}
          </div>
        </div>
        <div class="px-5 pb-8 text-center flex items-center justify-center">
          <Button variant="outline-secondary" type="button" @click="closeWorkerIncompleteModal" class="w-24 mr-1 h-10">
            {{ $t('invoices.cancel') }}
          </Button>
          <Button variant="primary" type="button" class="ml-4 w-24 h-10" @click="proceedWithPayment">
            {{ $t('invoices.proceed') }}
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  </Dialog>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { Dialog } from "@/components/Base/Headless";
import Button from "@/components/Base/Button";
import { formatPrice } from "@/helpers/commonHelper.js";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import httpClient from '@/network/api/httpClient';
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import CustomerAddDialog from "@/components/pos/Customers/CustomerAddDialog.vue";
import PaymentMethods from "@/components/pos/Payment/PaymentMethods.vue";
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import {useAuthStore} from "@/stores/auth.js";
import Lucide from "@/components/Base/Lucide";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const props = defineProps({
  open: Boolean,
  totalSale: Number,
  isLoading: Boolean,
  isEditInvoice: {
    type: Boolean,
    default: false,
  },
  services: {
    type: Array,
    default: () => [],
  },
  invoiceId: {
    type: String,
    default: null,
  },
});
const emit = defineEmits(['close', 'confirm', 'select-customer', 'holdInvoice']);
const isPaymentDialogOpen = ref(props.open);
const isAddCustomerDialogOpen = ref(false);
const customerQuery = ref("");
const selectedCustomerId = ref(null);
const filteredCustomers = ref([]);
const loading = ref(false);
const customerError = ref(false);
const isHoldingInvoice = ref(false);
const isConfirmingPayment = ref(false);
const requireCustomer = ref(false);
const showHoldInvoiceConfirm = ref(false);
const showConfirmPaymentConfirm = ref(false);
const showWorkerIncompleteModal = ref(false);
// Payment methods state
const paymentMethods = ref({
  cash: {
    enabled: false,
    amount: 0
  },
  card: {
    enabled: false,
    amount: 0
  }
});
// Computed properties
const totalPaidAmount = computed(() => {
  return (
      (paymentMethods.value.cash.enabled ? Number(paymentMethods.value.cash.amount) : 0) +
      (paymentMethods.value.card.enabled ? Number(paymentMethods.value.card.amount) : 0)
  );
});
const hasError = computed(() => {
  // Allow payment amounts greater than or equal to totalSale
  return totalPaidAmount.value < props.totalSale &&
      (paymentMethods.value.cash.enabled || paymentMethods.value.card.enabled);
});

const isAnyMethodSelected = computed(() => {
  return paymentMethods.value.cash.enabled || paymentMethods.value.card.enabled;
});

const validateCustomer = () => {
  customerError.value = !selectedCustomerId.value || !customerQuery.value.trim();
  return !customerError.value;
};

watch(
    () => props.open,
    (newValue) => {
      if (newValue) {
        // Reset payment methods when the dialog opens
        paymentMethods.value = {
          cash: {
            enabled: false,
            amount: 0
          },
          card: {
            enabled: false,
            amount: 0
          }
        };
        // Reset customer selection
        customerQuery.value = "";
        selectedCustomerId.value = null;
        customerError.value = false;
        filteredCustomers.value = [];
        requireCustomer.value = false;
        isHoldingInvoice.value = false;
        isConfirmingPayment.value = false;
        showHoldInvoiceConfirm.value = false;
        showConfirmPaymentConfirm.value = false;
      } else {
        // Reset when dialog closes
        isHoldingInvoice.value = false;
        isConfirmingPayment.value = false;
        showHoldInvoiceConfirm.value = false;
        showConfirmPaymentConfirm.value = false;
      }
    }
);

// Watch for when parent's isLoading becomes false to reset local loading states
watch(
    () => props.isLoading,
    (newValue) => {
      if (!newValue) {
        // When parent loading completes, reset all local loading states
        isHoldingInvoice.value = false;
        isConfirmingPayment.value = false;
      }
    }
);
// Watch for changes in payment methods
watch(
    () => paymentMethods.value,
    (newVal, oldVal) => {
      // Clear amount if the method is toggled off
      if (!newVal.cash.enabled) paymentMethods.value.cash.amount = 0;
      if (!newVal.card.enabled) paymentMethods.value.card.amount = 0;

      // Validate total payment and set payment type
      updatePaymentType();
    },
    { deep: true }
);

// Method to update payment type dynamically
const updatePaymentType = () => {
  const cashEnabled = paymentMethods.value.cash.enabled;
  const cardEnabled = paymentMethods.value.card.enabled;

  if (cashEnabled && cardEnabled) {
    paymentMethods.value.type = "both";
  } else if (cashEnabled) {
    paymentMethods.value.type = "cash";
  } else if (cardEnabled) {
    paymentMethods.value.type = "card";
  } else {
    paymentMethods.value.type = null;
  }
};
// Methods
const closePaymentDialog = () => {
  isPaymentDialogOpen.value = false;
  emit("close");
};
const checkWorkerStatus = async () => {
  if (!props.isEditInvoice || !props.invoiceId) {
    return true; // If not edit invoice, skip check
  }

  try {
    // First, get the invoice to find services with assigned workers
    const invoiceResponse = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + `/invoices/${props.invoiceId}`, {
      params: { user_id: USER_ID },
    });
    const invoiceResult = handleResponse(invoiceResponse);
    const inv = invoiceResult.data?.data ?? invoiceResult.data;

    if (!invoiceResult.success || !inv || !inv.items) {
      return true; // If invoice fetch fails, allow payment
    }

    const taskIds = new Set();

    // Collect all task_ids from services
    for (const item of inv.items) {
      if (item.is_service === 1 || item.is_service === true || item.is_service === "1" || item.type === "service" || item.type === "Service") {
        // Extract task_id from assigned_worker
        if (item.assigned_worker) {
          let taskId = null;
          if (typeof item.assigned_worker === 'object' && item.assigned_worker.task_id) {
            taskId = item.assigned_worker.task_id;
          }
          
          if (taskId) {
            taskIds.add(taskId);
          }
        }
      }
    }

    // If no tasks found, allow payment
    if (taskIds.size === 0) {
      return true;
    }

    // Fetch each task to check worker status
    for (const taskId of taskIds) {
      try {
        const taskResponse = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + `/tasks/${taskId}`);
        const taskResult = handleResponse(taskResponse);
        
        if (taskResult.success && taskResult.data.data) {
          const task = taskResult.data.data;
          
          // Check if task has workers array
          if (task.workers && Array.isArray(task.workers)) {
            // Check each worker's status
            for (const worker of task.workers) {
              // If any worker has status that is not "completed", return false
              if (worker.status && worker.status.toLowerCase() !== 'completed') {
                return false;
              }
            }
          }
        }
      } catch (taskError) {
        console.error(`Error fetching task ${taskId}:`, taskError);
        // Continue checking other tasks even if one fails
      }
    }
    
    return true; // All workers completed
  } catch (error) {
    console.error('Error checking worker status:', error);
    // On error, allow payment to proceed (fail open)
    return true;
  }
};

const confirmPayment = async () => {
  // Customer is required for confirm payment
  requireCustomer.value = true;
  if (!validateCustomer()) {
    toast().fry(pan.invoice.error("Please select a customer"));
    return;
  }
  
  if (hasError.value) {
    toast().fry(pan.invoice.error("Total payment amount must equal the total sale amount"));
    return;
  }

  // Check worker status for edit invoice
  if (props.isEditInvoice) {
    const allWorkersCompleted = await checkWorkerStatus();
    if (!allWorkersCompleted) {
      // Show worker incomplete modal instead of payment confirmation
      showWorkerIncompleteModal.value = true;
      return;
    }
  }

  // Show confirmation modal
  showConfirmPaymentConfirm.value = true;
};

const confirmPaymentAction = () => {
  // Set loading state for this button
  isConfirmingPayment.value = true;
  showConfirmPaymentConfirm.value = false;

  // Prepare the payment details without type or methods keys
  const paymentDetails = {};

  if (paymentMethods.value.cash.enabled) {
    paymentDetails.cash = paymentMethods.value.cash.amount;
  }

  if (paymentMethods.value.card.enabled) {
    paymentDetails.card = paymentMethods.value.card.amount;
  }

  // Emitting only the cash and card amounts
  emit("confirm", paymentDetails);
};

const closeConfirmPaymentConfirm = () => {
  showConfirmPaymentConfirm.value = false;
};

const closeWorkerIncompleteModal = () => {
  showWorkerIncompleteModal.value = false;
};

const proceedWithPayment = () => {
  // Close the worker incomplete modal and proceed directly with payment
  showWorkerIncompleteModal.value = false;
  
  // Set loading state
  isConfirmingPayment.value = true;
  
  // Prepare the payment details without type or methods keys
  const paymentDetails = {};
  
  if (paymentMethods.value.cash.enabled) {
    paymentDetails.cash = paymentMethods.value.cash.amount;
  }
  
  if (paymentMethods.value.card.enabled) {
    paymentDetails.card = paymentMethods.value.card.amount;
  }
  
  // Emit the payment confirmation directly
  emit("confirm", paymentDetails);
};

const holdInvoice = () => {
  // Show confirmation modal
  showHoldInvoiceConfirm.value = true;
};

const confirmHoldInvoice = () => {
  // Set loading state for this button
  isHoldingInvoice.value = true;
  showHoldInvoiceConfirm.value = false;
  
  // Customer is optional for hold invoice
  emit('holdInvoice', {
    paymentMethods: paymentMethods.value,
    customerId: selectedCustomerId.value
  });
  closePaymentDialog();
};

const closeHoldInvoiceConfirm = () => {
  showHoldInvoiceConfirm.value = false;
};
const handleCustomerDialogClose = () => {
  isAddCustomerDialogOpen.value = false;
  isPaymentDialogOpen.value = true;
};
const openAddCustomerDialog = () => {
  isPaymentDialogOpen.value = false;
  isAddCustomerDialogOpen.value = true;
};
const handleCustomerAdded = (newCustomer) => {
  filteredCustomers.value.push(newCustomer);
  selectCustomer(newCustomer);
  isAddCustomerDialogOpen.value = false;
};
const fetchCustomers = async () => {
  if (!customerQuery.value.trim()) {
    filteredCustomers.value = [];
    return;
  }
  loading.value = true;
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_CRM}/customers`, {
      params: {
        user_id: USER_ID,
        status: true,
      },
    });
    const result = handleResponse(response);
    if (result.success) {
      const raw = result.data?.data;
      const nestedData = Array.isArray(raw) ? raw : [];
      const searchTerm = customerQuery.value.toLowerCase();
      filteredCustomers.value = nestedData.filter((item) => {
        return (
            item.name.toLowerCase().includes(searchTerm) ||
            (item.phone && item.phone.toLowerCase().includes(searchTerm))
        );
      });
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
  } finally {
    loading.value = false;
  }
};
const selectCustomer = (customer) => {
  customerQuery.value = customer.name;
  selectedCustomerId.value = customer.id;
  filteredCustomers.value = [];
  customerError.value = false;
  emit("select-customer", customer.id);
};
</script>