<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { RouterLink } from "vue-router";
import FormInput from "@/components/Base/Form/FormInput.vue";
import Button from "@/components/Base/Button/Button.vue";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import Lucide from "@/components/Base/Lucide/Lucide.vue";
import { Dialog } from "@/components/Base/Headless";
import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";
import LoadingIcon from "@/components/Base/LoadingIcon";
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import { useAbility } from "@casl/vue";


const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const ability = useAbility();
const loading = ref(false);
const totalRows = ref(0);
const rows = ref([]);

const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "expense_type",
  sort_direction: "asc",
  paginate: true,
  column_filters: [],
});

const columns = [
  { field: "entry_number", title: "Expense Number" },
  { field: "expense_type", title: "Expense Name" },
  { field: "expense_category", title: "Expense Category" },
  { field: "amount", title: "Amount" },
  { field: "actions", title: "Action", sort: false, width: '120px' },
];

let controller: any;
let timer: any;

const filterExpenses = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchExpenses();
  }, 300);
};

const fetchExpenses = async () => {
  try {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    loading.value = true;
    
    // const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/expenses`, {
    //   params: { ...params, user_id: USER_ID, signal: signal },
    // });
    const response = await httpClient.get(import.meta.env.VITE_ACCOUNTING_API + "/expenses", {
      params: { ...params, user_id: USER_ID, per_page: params.limit },
      signal: controller.signal,
    });

    const result = response.data;
    rows.value = Array.isArray(result.data) ? result.data : [];
    totalRows.value = result.meta?.total ?? result.total ?? 0;
  } catch (error) {
    console.error("Error fetching Expenses:", error);
    toast().fry(pan.error('Failed to fetch expenses'));
  } finally {
    loading.value = false;
  }
};

const changeServer = (data: any) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`;
  params.sort_direction = data.sort_direction;
  params.search = data.search;

  if (data.change_type === 'search') {
    filterExpenses();
  } else {
    fetchExpenses();
  }
};

// Delete functionality
const deleteConfirmationModal = ref(false);
const selectedExpenseId = ref(null);

const openDeleteModal = (id: string) => {
  selectedExpenseId.value = id;
  deleteConfirmationModal.value = true;
};

const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  selectedExpenseId.value = null;
};

const deleteExpense = (id: string) => {
  openDeleteModal(id);
};

const confirmDelete = async () => {
  try {
    loading.value = true;
    await httpClient.delete(`${import.meta.env.VITE_ACCOUNTING_API}/expenses/${selectedExpenseId.value}`, {
      params: { user_id: USER_ID }
    });
    fetchExpenses();
    closeDeleteModal();
    
    toast().fry(pan.success('Expense deleted successfully'));
  } catch (error) {
    console.error("Error deleting expense:", error);
    toast().fry(pan.error('Failed to delete expense'));
  } finally {
    loading.value = false;
    closeDeleteModal();
  }
};

// Initial data load
onMounted(fetchExpenses);

const showViewModal = ref(false);
const selectedExpense = ref(null);
const loadingExpenseDetails = ref(false);

const fetchExpenseDetails = async (id: string) => {
  try {
    loadingExpenseDetails.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/expenses/${id}`, {
      params: { user_id: USER_ID }
    });
    const body = response.data;
    selectedExpense.value = body?.data !== undefined ? body : { data: body };
  } catch (error) {
    console.error("Error fetching expense details:", error);
    toast().fry(pan.error('Failed to fetch expense details'));
  } finally {
    loadingExpenseDetails.value = false;
  }
};

const openViewModal = async (expense) => {
  await fetchExpenseDetails(expense.id);
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedExpense.value = null;
};
</script>

<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">Expense List</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between intro-y">
      <div>
        <RouterLink to="/account/expenses/create">
          <Button variant="primary" class="mr-2 shadow-md">
            New Expense
          </Button>
        </RouterLink>
      </div>
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput 
            v-model="params.search" 
            type="text" 
            class="w-56 pr-10 !box" 
            placeholder="Search..." 
          />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>
    <div class="col-span-12">
      <vue3-datatable 
        :rows="rows" 
        :columns="columns" 
        :loading="loading" 
        :totalRows="totalRows" 
        :isServerMode="true"
        :pageSize="params.limit" 
        :sortable="true" 
        :sort="params.sort"
        :sortDirection="params.sort_direction" 
        :search="params.search" 
        @change="changeServer"
      >
       <template #expense_category="data">
        {{ data.value.account.name }}
      </template> 
      <template #amount="data">  
        {{ Number(data.value.amount_paid_via_cash) + Number(data.value.amount_paid_via_bank) }}
      </template>
      <template #actions="data">
        <div class="flex gap-2">
          <button @click="deleteExpense(data.value.id)" class="bg-red-100 p-2 rounded-md">
            <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
          </button>
          <button @click="openViewModal(data.value)" class="bg-[#96837f33] p-2 rounded-md cursor-pointer">
            <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
          </button>
           
        </div>
      </template>
      </vue3-datatable>
      <Dialog :open="showViewModal" @close="closeViewModal">
        <Dialog.Panel class="md:w-[700px] bg-white shadow-none">
          <div class="flex flex-col items-center justify-center w-full">
            <div v-if="loadingExpenseDetails" class="flex justify-center items-center p-8">
              <LoadingIcon icon="three-dots" class="w-8 h-5" />
            </div>
            <template v-else-if="selectedExpense">
              <div class="text-center mt-4">
                
                <h2 class="text-xl font-bold text-[#2d3958] capitalize mb-4">{{ selectedExpense?.data.expense_type }}</h2>
              </div>
              <div class="w-full bg-[#f5f8fc] rounded-xl p-8">
                <div class="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div class="font-bold text-[#2d3958] mb-1">Expense Category <span class="font-normal text-[#2d3958]">: {{ selectedExpense?.data.account?.name || '--' }}</span></div>
                    <div class="font-bold text-[#2d3958] mb-1 mt-4">Amount Pay Cash <span class="font-normal text-[#2d3958]">: {{ selectedExpense?.data.amount_paid_via_cash || '--' }}</span></div>
                    
                    
                  </div>
                  <div>
                     
                    <div class="font-bold text-[#2d3958]  ">Reference Number <span class="font-normal text-[#2d3958]">: {{ selectedExpense?.data.reference_number || '--' }}</span></div>
                    <div class="font-bold text-[#2d3958] mb-1 mt-4">Amount Pay Bank <span class="font-normal text-[#2d3958]">: {{ selectedExpense?.data.amount_paid_via_bank || '--' }}</span></div>
                  </div>
                </div>
                <template v-if="selectedExpense?.data.attachment_url">
                <a :href="selectedExpense?.data.attachment_url" target="_blank" class="text-blue-500 font-bold mb-4 cursor-pointer">View File</a>
                </template>
                <div class="bg-white rounded-xl p-4 mt-2">
                  <table class="w-full text-sm text-left">
                    <thead>
                      <tr class="bg-[#f5f8fc] text-[#2d3958]">
                        <th class="py-2 px-4 font-medium">Date</th>
                        <th class="py-2 px-4 font-medium">Amount</th>
                        <th class="py-2 px-4 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="border-t border-dashed border-[#e5e7eb]">
                        <td class="py-2 px-4">{{ selectedExpense?.data.entry_date }}</td>
                        <td class="py-2 px-4">{{ Number(selectedExpense?.data.amount_paid_via_cash) + Number(selectedExpense?.data.amount_paid_via_bank) || 0 }}</td>
                        <td class="py-2 px-4">{{ selectedExpense?.data.notes || "N/A"}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
          </div>
          <span @click="closeViewModal"
            class="flex justify-center items-center absolute top-4 right-4 cursor-pointer border border-gray-500 rounded-full p-0.5 bg-white">
            <Lucide icon="X" class="w-5 h-5 text-gray-700" />
          </span>
        </Dialog.Panel>
      </Dialog>
      <!-- Delete Confirmation Modal -->
      <Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
        <Dialog.Panel>
          <div class="p-5 text-center">
            <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
            <div class="mt-5 text-3xl">Delete Expense</div>
            <div class="mt-2 text-slate-500">
              Are you sure you want to delete this expense? This action cannot be undone.
            </div>
          </div>
          <div class="px-5 pb-8 text-center flex items-center justify-center">
            <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1 h-10">
              Cancel
            </Button>
            <Button variant="danger" type="button" class="ml-4 w-24 h-10" @click="confirmDelete">
              <template v-if="loading">
                <LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
              </template>
              <template v-else>
                Delete
              </template>
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
</style>
