<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';
import httpClient from '@/network/api/httpClient';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from '../../../components/Base/Button';
import Lucide from '../../../components/Base/Lucide';
import Litepicker from "@/components/Base/Litepicker";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import { FormInput } from "@/components/Base/Form";
import { useAuthStore } from "@/stores/auth.js"; 
const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;
const route = useRoute();
 
const ledgerId = computed(() => route.params.uuid);
const accountData = ref({});
const loading = ref(false);

// Add computed property for query parameters
const queryDates = computed(() => ({
  from_date: route.query.from_date,
  to_date: route.query.to_date
}));

const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "-entry_date",
  sort_direction: "desc",
  paginate: true,
});

const dateRangeObj = ref({  start: '2025-01-01',
  end: '2025-12-31'});

const { t } = useI18n();

const columns = [
  { field: "entry_date", title: t('account.Date'), width: "160px" },
  { field: "transaction_type", title: t('account.Type') }, 
  { field: "entry_number", title: t('account.EntryNumber') },
  { field: "accountName", title: t('account.accountName') },
  { field: "debit", title: t('account.debit') },
  { field: "credit", title: t('account.credit') },
  { field: "description", title: t('account.description') },
  { field: "balance", title: t('account.Balance') },
];

let controller;
let timer;

const filterTransactions = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchLedgerTransactions();
  }, 300);
};

const handleApplyFilter = () => {
  if (!dateRangeObj.value.start || !dateRangeObj.value.end) {
    alert('Please select both start and end dates');
    return;
  }
  fetchLedgerTransactions();
};

const fetchLedgerTransactions = async () => {
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const signal = controller.signal;
  
  loading.value = true;
  try {
    const res = await httpClient.get(
      `${import.meta.env.VITE_ACCOUNTING_API}/general-ledger/${ledgerId.value}`, {
        params: { 
          user_id: USER_ID,
          search: params.search,
          from_date: dateRangeObj.value.start,
          to_date: dateRangeObj.value.end,
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          sort_direction: params.sort_direction,
          signal: signal
        }
      }
    );
    accountData.value = res.data.data || {};
  } catch (e) {
    if (e.name !== 'AbortError') {
      accountData.value = {};
      console.error('Error fetching ledger transactions:', e);
    }
  }
  loading.value = false;
};

const changeServer = (data) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`;
  params.sort_direction = data.sort_direction;
  params.search = data.search;

  if (data.change_type === 'search') {
    filterTransactions();
  } else {
    fetchLedgerTransactions();
  }
};

onMounted(() => {
  // Set dates from URL query if they exist
  if (queryDates.value.from_date && queryDates.value.to_date) {
    dateRangeObj.value = {
      start: queryDates.value.from_date,
      end: queryDates.value.to_date
    };
    // Automatically fetch with the dates from URL
    fetchLedgerTransactions();
  } else {
    // If no dates in URL, fetch with default dates
    fetchLedgerTransactions();
  }
});

// Add watcher for route query changes
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.from_date && newQuery.to_date) {
      dateRangeObj.value = {
        start: newQuery.from_date,
        end: newQuery.to_date
      };
      fetchLedgerTransactions();
    }
  }
);
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/account/general-ledger">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ t('account.ViewGeneralLedger') }}</h2>
  </div>
  
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8 coa-style">
    <div class="col-span-12">
      <div class="w-full">
        <div class="flex items-center justify-end gap-4 mb-4">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
              <p>{{ t('account.From') }}</p>
              <div class="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500">
                <Lucide icon="Calendar" class="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3" />
                <Litepicker 
                  :modelValue="dateRangeObj.start"
                  @update:modelValue="val => dateRangeObj.start = val"
                  :options="{ 
                    autoApply: true, 
                    singleMode: true, 
                    format: 'YYYY-MM-DD',
                    dropdowns: {
                      minYear: 2000,
                      maxYear: new Date().getFullYear() + 10,
                      months: true,
                      years: true
                    }
                  }" 
                  class="w-full pl-10" 
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <p>{{ t('account.To') }}</p>
              <div class="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500">
                <Lucide icon="Calendar" class="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3" />
                <Litepicker 
                  :modelValue="dateRangeObj.end"
                  @update:modelValue="val => dateRangeObj.end = val"
                  :options="{ 
                    autoApply: true, 
                    singleMode: true, 
                    format: 'YYYY-MM-DD',
                    dropdowns: {
                      minYear: 2000,
                      maxYear: new Date().getFullYear() + 10,
                      months: true,
                      years: true
                    }
                  }" 
                  class="w-full pl-10" 
                />
              </div>
            </div>
            <Button 
              variant="primary" 
              size="md" 
              class="mr-4" 
              @click="handleApplyFilter"
            >
              {{ t('account.Apply') }}
            </Button>
          </div>
          
          
        </div>

        <div class="bg-blue-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <div class="flex text-center justify-center items-center">
            <div class="text-center">
              <!-- <div class="text-base text-gray-700">Scrappers</div> -->
              <div class="text-xl font-bold text-gray-800 mt-1">{{ t('account.AccountTransactions') }}</div>
              <h4 class="text-sm text-gray-900 font-bold">{{ accountData?.name }}</h4>
              <div class="flex items-center justify-center gap-2 mt-2"> 
                <p class="text-sm text-gray-700"> {{ dateRangeObj.start }} — {{ dateRangeObj.end }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12">
        <div class="flex items-center justify-between gap-4 mb-4">
            <h2 class="text-lg font-semibold">{{ t('account.LatestTransactions') }}</h2>
            <div class="relative w-56 text-slate-500">
            <FormInput 
              v-model="params.search" 
              type="text" 
              class="w-56 pr-10 !box" 
              :placeholder="t('account.Search')" 
            />
            <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
          </div>
        </div>
      <vue3-datatable
        :rows="accountData?.transactions?.data || []"
        :columns="columns"
        :loading="loading"
        :total-rows="accountData?.transactions?.meta?.total ?? accountData?.transactions?.total ?? 0"
        :is-server-mode="true"
        :page-size="params.limit"
        :sortable="true"
        :sort="params.sort"
        :sort-direction="params.sort_direction"
        :search="params.search"
        @change="changeServer"
      >
        <template #entry_date="{ value }">
          <div class="text-sm text-gray-700">{{ value.entry_date }}</div>
        </template>

        <template #accountName="{ value }">
          <div class="text-sm text-gray-700">{{ value.account?.name }}</div>
        </template>

        <template #debit="{ value }">
          <div class="text-sm text-gray-700">{{ value.debit }}</div>
        </template>

        <template #credit="{ value }">
          <div class="text-sm text-gray-700">{{ value.credit }}</div>
        </template>

        <template #balance="{ value }">
          <div class="text-sm text-gray-700">{{ Math.abs(value.debit - value.credit) }}</div>
        </template>
      </vue3-datatable>

      <!-- Summary Row --> 
       
      <div class="bg-blue-50 rounded-xl p-6 flex flex-col gap-4 mt-2 shadow-sm">
          <div class=" ">
            <div class="  flex justify-between"> 
               <h3 class="text-base font-bold">{{ t('account.TotalForDebitsAndCredits') }}</h3>
               <div class="text-base font-medium">
                 <p class="text-base font-semibold">{{ t('account.debit') }}</p> 
                 {{ Number(accountData?.debit || 0).toFixed(2) }}
               </div>
               <div class="text-base font-medium">
                 <p class="text-base font-semibold">{{ t('account.credit') }}</p>  
                 {{ Number(accountData?.credit || 0).toFixed(2) }}
               </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm mt-6">
          <div class=" ">
            <div class="flex justify-between">
              <!-- <div class="text-base text-gray-700">Scrappers</div> -->
               <h3 class="text-base font-bold">{{ t('account.ClosingBalance') }}</h3>
               <div class="text-base font-semibold">
                 {{ Math.abs(Number(accountData?.balance || 0)).toFixed(2) }}
                 <span v-if="Number(accountData?.balance || 0) !== 0" class="ml-2 text-sm font-medium">
                   ({{ Number(accountData?.debit || 0) > Number(accountData?.credit || 0) ? 'Debit' : 'Credit' }})
                 </span>
               </div> 
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<style>
.coa-style th {
  border: none !important;
  padding: 18px 14px;
  background: #f6f7fa;
  font-weight: 600;
  color: #1e293b;
}

.coa-style td {
  padding: 14px;
  border-bottom: 1px solid #e9e8e8;
}

.coa-style tr:hover {
  background-color: #f8fafc;
}

.coa-style .litepicker {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.coa-style .litepicker .container__months {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 0.5rem;
}
</style>
