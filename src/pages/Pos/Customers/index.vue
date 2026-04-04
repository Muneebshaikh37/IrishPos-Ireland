<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('customers.customers') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between intro-y">
      <div>
        <Button v-if="ability.can('create', 'customer')" variant="primary" class="mr-2 shadow-md" @click="openAddCustomerDialog">
          {{ $t('customers.addNewCustomer') }}
        </Button>
      </div>
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('customers.search')"/>
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"/>
        </div>
      </div>
    </div>
    <div class="col-span-12">
      <CustomerTable :data="rows"
                     :loading="loading"
                     :total_rows="total_rows"
                     :params="params"
                     @change="changeServer"
                     @toggleActive="toggleActive"
                     @deleteUser="deleteUser"
                     @editUser="openEditCustomerDialog"
      />
    </div>
  </div>

  <!-- CustomerDialog for Adding Customers -->
  <CustomerDialog
      v-model:show="isAddCustomerDialogOpen"
      @updated="getCustomers"
      @close="closeAddCustomerDialog"
      @created="getCustomers"
  />

  <!-- EditCustomerDialog for Editing Customers -->
  <EditCustomerDialog
      v-model:show="isEditCustomerDialogOpen"
      :customer="selectedCustomer"
      @updated="getCustomers"
      @close="closeEditCustomerDialog"
  />

  <Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger"/>
        <div class="mt-5 text-3xl">{{ $t('customers.areYouSure') }}</div>
        <div class="mt-2 text-slate-500">
          {{ $t('customers.deleteConfirmation') }}
        </div>
      </div>
      <div class="px-5 pb-8 flex text-center justify-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1">
          {{ $t('customers.cancel') }}
        </Button>
        <Button variant="danger" type="button" class="ml-4 shadow-md w-28" @click="confirmDelete">
          <template v-if="isDeleting">
            <LoadingIcon icon="three-dots" class="w-5 h-5 text-white"/>
          </template>
          <template v-else>
            {{ $t('customers.delete') }}
          </template>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import CustomerTable from "@/components/pos/Customers/CustomerTable.vue";
import CustomerDialog from "@/components/pos/Customers/CustomerDialog.vue";
import EditCustomerDialog from "@/components/pos/Customers/EditCustomerDialog.vue";
import Button from "../../../components/Base/Button";
import { FormInput } from "../../../components/Base/Form";
import { Dialog } from "../../../components/Base/Headless";
import Lucide from "../../../components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import httpClient from '@/network/api/httpClient';
import { handleResponse, handleError } from "../../../network/api/responseHandler";
import {useAbility} from "@casl/vue";
import { useAuthStore } from "@/stores/auth";
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"

const form = reactive(new ErrorHandler());
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const loading = ref(true);
const total_rows = ref(0);
const params = reactive({
  current_page: 1,
  pagesize: 10,
  search: '',
  column_filters: [],
  sort_column: '-full_phone',
  sort_direction: 'desc',
});

const paginate = (rows, params) => {
  const total = rows.length;
  const current_page = Math.max(1, params.current_page);
  const pagesize = Math.max(1, params.pagesize);
  const offset = (current_page - 1) * pagesize;
  const limit = offset + pagesize;
  const paginatedRows = rows.slice(offset, limit);
  const total_pages = Math.ceil(total / pagesize);

  return {
    data: paginatedRows,
    meta: {
      current_page,
      per_page: pagesize,
      first_page: 1,
      last_page: total_pages,
      total_pages,
      total,
    },
  };
};


const rows = ref([]);


// Separate state for dialogs
const isAddCustomerDialogOpen = ref(false);
const isEditCustomerDialogOpen = ref(false);
const selectedCustomer = ref(null);
let controller: any;
let timer: any;
const getCustomers = async () => {
  if (controller) {
			controller.abort();
		}
		controller = new AbortController();
  loading.value = true;
  try {
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_CRM + "/customers", {
      params: { user_id: USER_ID, status: true },
      signal: controller.signal,
    });
    const result = handleResponse(response);
    const body = result.data;
    const nestedData = Array.isArray(body?.data) ? body.data : [];
    let filteredData = nestedData;
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredData = filteredData.filter((item) => item.name.toLowerCase().includes(searchTerm));
    }
    const paginatedResult = paginate(filteredData, params);
    // console.log(paginatedResult.data)
    rows.value = paginatedResult.data;
    total_rows.value = paginatedResult.meta.total;
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

// Handlers for adding customers
const openAddCustomerDialog = () => {
  isAddCustomerDialogOpen.value = true;
};
const closeAddCustomerDialog = () => {
  isAddCustomerDialogOpen.value = false;
};

// Handlers for editing customers
const openEditCustomerDialog = (customer) => {
  selectedCustomer.value = customer;
  isEditCustomerDialogOpen.value = true;
};
const closeEditCustomerDialog = () => {
  isEditCustomerDialogOpen.value = false;
  selectedCustomer.value = null;
  // getCustomers();
};

const changeServer = (data) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.search = data.search;
  params.sort_column =  data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`;
  params.sort_direction = data.sort_direction;
  if (data.change_type === 'search') {
    getCustomers();
  } else {
    getCustomers();
  }
};

const toggleActive = async (row) => {
  row.is_active = !row.is_active;
  try {
    const response = await httpClient.patch(import.meta.env.VITE_PUBLIC_API_URL_CRM + `/customers/${row.id}/toggle-activation`,
    {
      params: {
        status: row.is_active,
      },
    }
  );
    handleResponse(response);
  } catch (error) {
    row.is_active = !row.is_active; // revert change on error
    handleError(error);
  }
};

const deleteConfirmationModal = ref(false);
const isCustomerId = ref(null);
const openDeleteModal = (id) => {
  isCustomerId.value = id;
  deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  isCustomerId.value = null;
};
const deleteUser = (id) => {
  openDeleteModal(id);
};
const isDeleting = ref(false);

const confirmDelete = async () => {
  try {
    isDeleting.value = true;
    const response = await httpClient.delete(import.meta.env.VITE_PUBLIC_API_URL_CRM + `/customers/${isCustomerId.value}`);
    const result = handleResponse(response);
    if(result.status == 200 ){
      closeDeleteModal();
      getCustomers();
      toast().fry(pan.customer.success(result.message))
    }


  } catch (error) {
    handleError(error);
    form.setErrors(error.message)
    toast().fry(pan.customer.error(error.message))
  } finally {
    isDeleting.value = false;
    closeDeleteModal();
  }
};


onMounted(() => {
  getCustomers();
});

const ability = useAbility();

</script>
