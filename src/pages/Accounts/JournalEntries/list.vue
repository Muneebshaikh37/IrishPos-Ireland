<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { FormInput } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import Lucide from "@/components/Base/Lucide";
import httpClient from '@/network/api/httpClient';
import { handleError, handleResponse } from "@/network/api/responseHandler";
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";
import { Dialog } from "@/components/Base/Headless";
import Toastify from "toastify-js";
import Notification from "@/components/Base/Notification";
import LoadingIcon from "@/components/Base/LoadingIcon";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const loading = ref(false);
const totalRows = ref(0);
const rows = ref([]);

const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "-entry_date",
  sort_direction: "desc",
  paginate: true,
  column_filters: [],
});
 
const { t } = useI18n();

// Columns for the table
const columns = [
  { field: "entry_number", title: t('account.entryNumber') },
  { field: "entry_date", title: t('account.entryDate') },
  { field: "status", title: t('account.status') },
 
  { field: "transaction_type", title: t('account.transactionType') },
  { field: "amount", title: t('account.amount') },
   { field: "notes", title: t('account.notes') },
  { field: "actions", title: t('account.actions'), sort: false, width: '120px' },
];

let controller: any;
let timer: any;

const filterEntries = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchJournalEntries();
  }, 300);
};

// Fetch data from the server
const fetchJournalEntries = async () => {
  try {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    loading.value = true;
    
    const response = await httpClient.get(import.meta.env.VITE_ACCOUNTING_API + "/journal-entries", {
      params: { ...params, user_id: USER_ID, per_page: params.limit },
      signal: controller.signal,
    });

    const result = response.data;
    rows.value = Array.isArray(result.data) ? result.data : [];
    totalRows.value = result.meta?.total ?? result.total ?? 0;
  } catch (error) {
    console.error("Error fetching Journal Entries:", error);
  } finally {
    loading.value = false;
  }
};

const changeServer = (data: any) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`
  params.sort_direction = data.sort_direction;
  params.search = data.search;

  if (data.change_type === 'search') {
    filterEntries();
  } else {
    fetchJournalEntries();
  }
};

// Initial data load
onMounted(fetchJournalEntries);
const ability = useAbility();

const deleteConfirmationModal = ref(false);
const isJournalEntryId = ref(null);
const openDeleteModal = (Uuid: any) => {
  isJournalEntryId.value = Uuid;
  deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  isJournalEntryId.value = null;
};
const deleteJournalEntry = (Uuid: any) => { openDeleteModal(Uuid); };
const confirmDelete = async () => {
  try {
    loading.value = true;
    const response = await httpClient.delete(`${import.meta.env.VITE_ACCOUNTING_API}/journal-entries/${isJournalEntryId.value}`, {
      params: { user_id: USER_ID }
    });
    
    fetchJournalEntries();
    closeDeleteModal();
    loading.value = false;
   
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    loading.value = false;
    closeDeleteModal();
    
  }finally{
    loading.value = false;
    closeDeleteModal();
  }
};
</script>

<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('account.JournalEntries') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between intro-y">
      <div>
        <RouterLink  to="/account/journal-entries/create">
          <Button variant="primary" class="mr-2 shadow-md">
            {{ $t('account.NewJournalEntry') }}
          </Button>
        </RouterLink> 
      </div>
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
            <!-- v-if="ability.can('list', 'journalEntry')"  -->
          <FormInput 
           
            v-model="params.search" 
            type="text" 
            class="w-56 pr-10 !box" 
            :placeholder="$t('product.searchPlaceholder')" 
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
        <template #status="{ value }">
          <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
            {{ value.status }}
          </span>
        </template>
        <template #actions="data">
          <div class="flex gap-2">
            <button v-if="data.value.is_deletable"   @click="deleteJournalEntry(data.value.id)" class="bg-red-100 p-2 rounded-md">
              <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
            </button> 
           <RouterLink 
              :to="`/account/journal-entries/${data.value.id}/view`"   
              class="bg-[#96837f33] p-2 rounded-md cursor-pointer"
            >
              <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
            </RouterLink> 
            <RouterLink  
              :to="`/account/journal-entries/${data.value.id}/edit`" 
              class="bg-blue-100 p-2 rounded-md cursor-pointer"
            >
             
              <Lucide icon="PencilLine" class="w-4 h-4 text-blue-500" />
            </RouterLink>  
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl">Delete Journal Entry</div>
        <div class="mt-2 text-slate-500">
          Are you sure you want to delete this journal entry? This action cannot be undone.
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
</template>

<style scoped>
</style>
