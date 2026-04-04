<template>
  <div>
    <h2 v-if="showHeading" class="mt-10 text-lg font-semibold intro-y">{{ $t('invoices.quotation') }}</h2>

    <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
      <div class="col-span-12 flex justify-between intro-y">
        <div class="col-span-12 flex justify-between items-center w-full">
          <div class="flex items-center col-span-6 ">
            <RouterLink v-if="!loading && openRegister && showContinueButton"
                        :to="{ name: 'RegisterInvoice', params: { registerId: openRegister }, query: { tab: 'quotation' } }">
            
            </RouterLink>
            <RouterLink v-else-if="!loading && showOpenRegisterButton" :to="{ name: 'Register Open' }">
              <Button variant="primary" class="mr-2 shadow-md">
                {{ $t('invoices.openRegister') }}
              </Button>
            </RouterLink>
          </div>
          <div class="relative w-56 text-slate-500 mr-3 ">
            <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('invoices.searchPlaceholder')"/>
            <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"/>
          </div>
        </div>
      </div>
      <div class="col-span-12">
        <vue3-datatable :rows="rows" :columns="columns" :loading="loading" :totalRows="rows.length" :isServerMode="true"
                        :pageSize="params.limit" :sortable="true" :sort="params.sort"
                        :sortDirection="params.sort_direction"
                        :search="params.search" @change="changeServer">
          <template #updated_at="data">
            {{ data.value.updated_at ?? '' }}
          </template>
          <template #quotation_status="data">
            <div class="quotation-status-wrapper max-w-[180px]" @click.stop>
              <QuotationStatusSelect 
                :model-value="mapBackendStatusToFrontend(data.value.quotation_status)"
                @update:model-value="updateQuotationStatus(data.value.id, $event)"
                placeholder="Select Status"
                :statuses="quotationStatuses"
              />
            </div>
          </template>
          <template #actions="slotProps">
            <div class="flex gap-2.5">
              <a href="#" v-if="ability.can('list','invoice')" class="bg-[#96837f33] p-2 rounded-md flex items-center justify-center"
                 @click="isOpenQuotationPrint(slotProps.value.id)">
                <Lucide icon="Eye" class="w-4 h-4 text-gray-600"/>
              </a>
            </div>
          </template>
        </vue3-datatable>
      </div>
    </div>

    <!-- Quotation View Dialog -->
    <Dialog :open="isQuotationPrint" @close="isCloseQuotationPrint">
      <Dialog.Panel class="md:w-[700px]">
        <!-- Skeleton Loader -->
        <InvoiceSkeleton v-if="isLoading" />
        <!-- Quotation Content -->
        <div class="p-8 invoice-container" v-else>
          <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
            
            <div class="flex justify-center mb-3">
              <img src="@/assets/images/jaldi.png" alt="Jaldi Logo" class="h-12" />
            </div>
              
            <h4 class="text-sm font-medium mb-2">{{ $t('invoices.date') }}: <span>{{ isDataQuotation.date }}</span></h4>
            <h4 class="text-sm font-medium">{{ $t('invoices.customer') }}: <span v-if="isDataQuotation && isDataQuotation.customer_name">{{ isDataQuotation.customer_name }}</span> <span v-else>{{ $t('invoices.na') }}</span></h4>
            <h1 class="text-md font-medium mb-2">{{ $t('invoices.receiptNumber') }}: {{ isDataQuotation.invoice_number }}</h1>
            
            <span class="absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printQuotation">
            <Lucide icon="Printer" class="w-5 h-5 text-white" />
          </span>
          </div>

          <!-- Items Table -->
          <div class="py-4 border-dashed border-b border-gray-500 items-list">
            <table class="w-full text-sm text-left rtl:text-right dark:">
              <thead>
              <tr>
                <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tl-lg">{{ $t('invoices.productName') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.qty') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.disc') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.price') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatExcl') }})</p></th>
                <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.vat') }}</th>
                <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.total') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatIncl') }})</p></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="list in isDataQuotation.items" :key="list.id">
                <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
                <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
                <td class="py-3 px-2 text-xs">{{ list.discount }}</td>
                <td class="py-3 px-2 text-xs">{{ getUnitPrice(list) }}</td>
                <td class="py-3 px-2 text-xs">{{ list.vat_amount }}</td>
                <td class="py-3 px-2 text-xs">{{ list.total }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Total and Grand Total -->
          <div class="py-4 border-dashed border-b border-gray-500">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatIncl') }})</h4>
              <h4>{{ isDataQuotation.grand_total }}</h4>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.additionalDiscount') }}</h4>
              <h4>{{ isDataQuotation.invoice_discount }}</h4>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-gray-800 font-medium">{{ $t('invoices.grandTotal') }}</h4>
              <h4>{{ isDataQuotation.grand_total }}</h4>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>

    <!-- Status Change Confirmation Dialog -->
    <Dialog :open="statusConfirmationModal" @close="closeStatusConfirmation">
      <Dialog.Panel>
        <div class="p-5 text-center">
          <Lucide icon="AlertCircle" class="w-16 h-16 mx-auto mt-3 text-warning" />
          <div class="mt-5 text-2xl font-medium">Confirm Status Change</div>
          <div class="mt-2 text-slate-500">
            Are you sure you want to change the status to 
            <span class="font-semibold">{{ pendingStatusChange.statusLabel }}</span>?
          </div>
        </div>
        <div class="px-5 pb-8 text-center flex justify-center items-center gap-4">
          <Button variant="outline-secondary" type="button" @click="closeStatusConfirmation" class="w-24" :disabled="isSubmittingStatus">
            Cancel
          </Button>
          <Button variant="primary" type="button" class="shadow-md w-28" @click="confirmStatusChange" :disabled="isSubmittingStatus">
            <template v-if="isSubmittingStatus">
              <LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
            </template>
            <template v-else>
              Submit
            </template>
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import {RouterLink, useRouter} from "vue-router";
import {FormInput} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import QuotationStatusSelect from "@/components/pos/QuotationStatusSelect.vue";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import httpClient from "@/network/api/httpClient";
import {handleError, handleResponse} from "@/network/api/responseHandler";
import Urlbarcode from "@/assets/images/landing-page/barcode.jpg";
import {Dialog} from "@/components/Base/Headless";
import {decimalFormat} from "@/helpers/commonHelper";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";
import {useAbility} from "@casl/vue";
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";

import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

// Props
const props = defineProps({
  registerId: {
    type: String,
    required: false,
  },
  showHeading: {
    type: Boolean,
    default: true,
  },
  showContinueButton: {
    type: Boolean,
    default: true,
  },
  showOpenRegisterButton: {
    type: Boolean,
    default: true,
  },
});

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const USER = authStore.getUser;
const router = useRouter();
const ability = useAbility();

const loading = ref(false);
const totalRows = ref(0);
const rawRows = ref([]);
const rows = computed(() => {
  // Filter to only show quotations (defensive check in case backend doesn't filter)
  return (rawRows.value || []).filter((item: any) => {
    return item.app_type === 'quotation' || item.type === 'quotation';
  });
});
const openRegister = ref(null);

const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "",
  sort_direction: "desc",
  paginate: true,
  column_filters: [],
});

const {t} = useI18n();
// Columns for the table - removed payment_type, added quotation_status
const columns = [
  {field: "invoice_number", title: t('invoices.invoiceNumber')},
  {field: "updated_at", title: t('invoices.date')},
  {field: "grand_total", title: t('invoices.invoiceTotal')},
  {field: "customer_name", title: t('invoices.customer'), sort: false},
  {field: "quotation_status", title: t('invoices.quotationStatus'), sort: false},
  {field: "actions", title: t('invoices.actions'), sort: false},
];

// Quotation statuses with translations
const quotationStatuses = computed(() => [
  { value: 'invoice', label: 'Mark as Paid' }
]);

// Map backend status to frontend status value
const mapBackendStatusToFrontend = (backendStatus: string | null | undefined): string => {
  if (!backendStatus) return '';
  // Backend returns "paid" when quotation is marked as paid, but frontend uses "invoice"
  if (backendStatus === 'paid' || backendStatus === 'invoice') {
    return 'invoice';
  }
  return backendStatus;
};

let controller: any;
let timer: any;
const filterUsers = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchQuotations();
  }, 300);
};

const printQuotation = () => {
  print();
};

// Show confirmation dialog for status change
const updateQuotationStatus = (quotationId: any, newStatus: string) => {
  const statusLabels = {
    'invoice': 'Mark as Paid'
  };
  
  pendingStatusChange.value = {
    quotationId: quotationId,
    newStatus: newStatus,
    statusLabel: statusLabels[newStatus] || newStatus
  };
  
  statusConfirmationModal.value = true;
};

// Close confirmation dialog
const closeStatusConfirmation = () => {
  statusConfirmationModal.value = false;
  pendingStatusChange.value = {
    quotationId: null,
    newStatus: '',
    statusLabel: ''
  };
};

// Confirm and submit status change
const confirmStatusChange = async () => {
  try {
    isSubmittingStatus.value = true;
    
    // Map frontend status to backend status
    const statusMap = {
      'invoice': 'paid'      // Mark as Paid -> status: "paid"
    };
    
    // Create payload - backend requires status field
    const payload = {
      invoiceId: pendingStatusChange.value.quotationId,
      status: statusMap[pendingStatusChange.value.newStatus]
    };
    
    // Log the payload to console
    console.log('Status Update Payload:', payload);
    
    // Use convert-quotation endpoint
    const endpoint = `${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${payload.invoiceId}/convert-quotation`;
    console.log('API Endpoint:', endpoint);
    
    const response = await httpClient.post(endpoint, payload);
    
    console.log('API Response:', response);
    const result = handleResponse(response);
    
    if (result.success) {
      console.log('Status updated successfully');
      toast().fry(pan.invoice.success("Quotation status updated successfully"));
      fetchQuotations(); // Refresh the list
      closeStatusConfirmation();
    } else {
      console.error('Update failed:', result);
      toast().fry(pan.invoice.error(result.message || "Failed to update quotation status"));
    }
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    handleError(error);
    toast().fry(pan.invoice.error("Failed to update quotation status"));
  } finally {
    isSubmittingStatus.value = false;
  }
};

// Fetch data from the server
const fetchQuotations = async () => {

  try {
    // cancel request if previous request still pending before next request fire
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;
    loading.value = true;

    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + "/invoices", {
      params: {...params, user_id: USER_ID, type: 'quotation', signal: signal},
    });
    const result = response.data;
    // Filter to only show quotations (defensive check in case backend doesn't filter)
    const filteredData = (result.data || []).filter((item: any) => {
      return item.type === 'quotation';
    });
    rawRows.value = filteredData;
    totalRows.value = filteredData.length;
    openRegister.value = result.meta.open_register_id || "";
  } catch (error) {
    console.error("Error fetching quotations:", error);
  } finally {
    loading.value = false;
  }
};

const changeServer = (data: any) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort = "",
  params.sort_direction = data.sort_direction;
  params.search = data.search;

  if (data.change_type === 'search') {
    filterUsers();
  } else {
    fetchQuotations();
  }
};

// Confirmation Dialog State
const statusConfirmationModal = ref(false);
const isSubmittingStatus = ref(false);
const pendingStatusChange = ref({
  quotationId: null,
  newStatus: '',
  statusLabel: ''
});

const isQuotationPrint = ref(false)
const isLoading = ref(false)
const isDataQuotation = ref()
const isOpenQuotationPrint = async (Uuid) => {
  isQuotationPrint.value = true
  isLoading.value = true;
  isDataQuotation.value = null; // Reset data before fetching new data
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${Uuid}`)
    const result = handleResponse(response);
    if (result.success) {
      isDataQuotation.value = result.data.data
    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isLoading.value = false; // Ensure loader hides after request
  }
}
const isCloseQuotationPrint = () => {
  isQuotationPrint.value = false
}

// Initial data load
onMounted(fetchQuotations);

const getUnitPrice = (list) => {
  return (parseFloat(list.total)) - (parseFloat(list.vat_amount));
};

</script>
<style scoped>
/* Ensure table cells don't clip dropdowns */
:deep(.vue3-datatable table td) {
  overflow: visible !important;
  position: relative;
}

:deep(.vue3-datatable table th) {
  overflow: visible !important;
  position: relative;
}

:deep(.vue3-datatable table tr) {
  overflow: visible !important;
}

:deep(.vue3-datatable table tbody) {
  overflow: visible !important;
}

:deep(.vue3-datatable table thead) {
  overflow: visible !important;
}

:deep(.vue3-datatable table) {
  overflow: visible !important;
}

:deep(.vue3-datatable) {
  overflow: visible !important;
}

/* Ensure parent containers don't clip */
.quotation-status-wrapper {
  overflow: visible !important;
  position: relative !important;
  z-index: 1;
}

/* Make sure the table wrapper doesn't clip */
:deep(.vue3-datatable-wrapper) {
  overflow: visible !important;
}

/* Ensure the box container doesn't clip */
:deep(.box) {
  overflow: visible !important;
}
</style>
<style>
@media print {
  /* Set page size and margins */
  @page {
    size: auto;
    margin: -10mm 0mm -10mm -6mm;
  }

  #app {
    display: none;
  }

  /* Enlarge the QR code image */
  .qr-code {
    width: 100% !important; /* Adjust this value as needed */
    height: auto;
  }

  /* Increase overall text size for the quotation */
  .invoice-container {
    font-size: 16px !important;
    font-weight: bold;
    page-break-before: always !important;
  }

  /* Specifically increase the text size for table cells in the items list */
  .items-list td, .items-list th {
    font-size: 12px !important;
  }
  .invoice-container .items-list {
   page-break-inside: avoid;
   page-break-after: auto;
  }
}
</style>
