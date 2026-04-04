<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import { FormInput } from '@/components/Base/Form';
import Litepicker from "@/components/Base/Litepicker";
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import accountingHttpClient from '@/network/modules/accounting';
import { useAuthStore } from "@/stores/auth.js";
import GeneralLedgerSkeleton from '@/components/Skeletons/GeneralLedgerSkeleton.vue';
import toast from '@/stores/utility/toast';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

// Add formatNumber function for accounting style formatting
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00';
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00';
  return num < 0 ? `${Math.abs(num).toFixed(2)}` : num.toFixed(2);
};

const loading = ref(false);
const expandedKeys = ref({});
const trialBalanceData = ref([]);
const searchQuery = ref('');
const totals = ref({ debit: 0, credit: 0 });
const showExportDropdown = ref(false);

// Date range filters
const dateRangeObj = ref({
  start: '2025-01-01',
  end: '2025-12-31'
});

// Transform API data to TreeTable format

function transformData(data) {
  if (!data.accounts) return [];
  
  // Create a map to store accounts by their code
  const accountMap = new Map();
  const rootAccounts = [];

  // First pass: Create all account nodes
  data.accounts.forEach(account => {
    const accountNode = {
      key: account.id,
      data: {
        name: `${account.account_name} - ${account.account_code}`,
        opening_balance: account.opening_balance || 0,
        net_debit: account.net_debit || 0,
        net_credit: account.net_credit || 0,
        closing_balance: account.closing_balance || 0,
        isTransaction: false,
      },
      children: []
    };
    accountMap.set(account.account_code, accountNode);
  });

  // Second pass: Build the hierarchy
  data.accounts.forEach(account => {
    const code = account.account_code;
    const node = accountMap.get(code);
    
    // If it's a root account (single digit)
    if (code.length === 1) {
      rootAccounts.push(node);
    } else {
      // Find parent account code (all digits except last)
      const parentCode = code.slice(0, -1);
      const parentNode = accountMap.get(parentCode);
      
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // If parent not found, add to root
        rootAccounts.push(node);
      }
    }
  });

  return rootAccounts;
}

async function fetchTrialBalance() {
  loading.value = true;
  try {
    const params = {
      user_id: USER_ID,
      from_date: dateRangeObj.value.start,
      to_date: dateRangeObj.value.end,
      search: searchQuery.value
    };
    const response = await accountingHttpClient.get('/trial-balance', { params });
    const payload = response.data?.data ?? response.data;
    trialBalanceData.value = transformData(payload);
    totals.value = payload.totals || { debit: 0, credit: 0 };
  } catch (error) {
    console.error('Error fetching trial balance data:', error);
    toast.error(t('common.errorLoadingData') || 'Could not load trial balance');
    trialBalanceData.value = [];
    totals.value = { debit: 0, credit: 0 };
  } finally {
    loading.value = false;
  }
}

const handleSearch = () => {
  fetchTrialBalance();
};

const handleApplyFilter = () => {
  if (!dateRangeObj.value.start || !dateRangeObj.value.end) {
    alert(t('common.pleaseSelectDates'));
    return;
  }
  fetchTrialBalance();
};

const downloadReport = async (format) => {
  try {
    const params = {
      user_id: USER_ID,
      from_date: dateRangeObj.value.start,
      to_date: dateRangeObj.value.end,
      format,
    };
    const response = await accountingHttpClient.get('/exports/trial-balance/export', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trial-balance-report-${dateRangeObj.value.start}-to-${dateRangeObj.value.end}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading trial balance report:', error);
    toast.error(t('common.exportFailed') || 'Export is not available for trial balance yet');
  }
};

onMounted(() => {
  fetchTrialBalance();
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.export-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      showExportDropdown.value = false;
    }
  });
});
</script>

<template>
  <!-- <h2 class="mt-10 text-xl font-semibold intro-y">{{ t('reporting.TrialBalance') }}</h2> -->
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/reporting">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide :icon="locale === 'ar' ? 'ChevronRight' : 'ChevronLeft'" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ t('reporting.TrialBalance') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8 coa-style">
    <!-- Date Filters -->
    <div class="col-span-12 flex justify-between intro-y gap-6">
      <div class="relative w-56 text-slate-500">
          <FormInput 
            v-model="searchQuery" 
            type="text" 
            class="w-56 pr-10 !box" 
            :placeholder="$t('product.searchPlaceholder')" 
            @input="handleSearch"
          />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <p>{{ t('common.fromDate') }}</p>
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
          <p>{{ t('common.toDate') }}</p>
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
          {{ t('common.apply') }}
        </Button>
        
        <!-- Export Dropdown -->
        <div class="relative export-dropdown">
          <Button 
            variant="outline-secondary" 
            size="md" 
            :disabled="loading"
            class="flex items-center gap-2"
            @click="showExportDropdown = !showExportDropdown"
          >
            <Lucide icon="Download" class="w-4 h-4" />
            {{ $t('reporting.export') }}
            <Lucide icon="ChevronDown" class="w-4 h-4" />
          </Button>
          
          <!-- Dropdown Menu -->
          <div 
            v-if="showExportDropdown"
            class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[160px]"
          >
            <div 
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              @click="downloadReport('pdf'); showExportDropdown = false"
            >
              <Lucide icon="FileText" class="w-4 h-4 mr-2" />
              {{ $t('reporting.export') }} PDF
            </div>
            <div 
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              @click="downloadReport('excel'); showExportDropdown = false"
            >
              <Lucide icon="FileSpreadsheet" class="w-4 h-4 mr-2" />
              {{ $t('reporting.export') }} Excel
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="col-span-12">
      <div v-if="loading">
        <GeneralLedgerSkeleton :rows="5" />
      </div>
      <TreeTable 
        v-else 
        :value="trialBalanceData" 
        :expandedKeys="expandedKeys" 
        @update:expandedKeys="val => expandedKeys = val" 
        :tableStyle="{ minWidth: '60rem' }"
      >
        <Column field="name" :header="$t('reporting.accountName')" class="p-treetable-header" expander>
          <template #body="slotProps">
            <span v-if="!slotProps.node.data.isTransaction">{{ slotProps.node.data.name }}</span>
            <span v-else class="ml-6 text-sm text-gray-500">{{ slotProps.node.data.name }}</span>
          </template>
        </Column>
        <Column field="opening_balance" :header="$t('reporting.openingBalance')" class="p-treetable-header">
          <template #body="slotProps">
            <RouterLink 
              class="text-blue-500 underline" 
              :to="{
                path: `/account/general-ledger/${slotProps.node.key}/view`,
                query: {
                  from_date: dateRangeObj.start,
                  to_date: dateRangeObj.end
                }
              }"
            >
              <span>
                {{ formatNumber(slotProps.node.data.opening_balance) }}
              </span>
            </RouterLink>
          </template>
        </Column>
        <Column field="net_debit" :header="$t('reporting.netDebit')" class="p-treetable-header"> 
          <template #body="slotProps"> 
            <RouterLink 
              class="text-blue-500 underline" 
              :to="{
                path: `/account/general-ledger/${slotProps.node.key}/view`,
                query: {
                  from_date: dateRangeObj.start,
                  to_date: dateRangeObj.end
                }
              }"
            >
              <span>{{ formatNumber(slotProps.node.data.net_debit) }}</span>
            </RouterLink>
          </template>
        </Column>
        <Column field="net_credit" :header="$t('reporting.netCredit')" class="p-treetable-header">
          <template #body="slotProps">
            <RouterLink 
              class="text-blue-500 underline" 
              :to="{
                path: `/account/general-ledger/${slotProps.node.key}/view`,
                query: {
                  from_date: dateRangeObj.start,
                  to_date: dateRangeObj.end
                }
              }"
            >
              <span>{{ formatNumber(slotProps.node.data.net_credit) }}</span>
            </RouterLink>
          </template>
        </Column>
        <Column field="closing_balance" :header="$t('reporting.closingBalance')" class="p-treetable-header">
          <template #body="slotProps">
            <RouterLink 
              class="text-blue-500 underline" 
              :to="{
                path: `/account/general-ledger/${slotProps.node.key}/view`,
                query: {
                  from_date: dateRangeObj.start,
                  to_date: dateRangeObj.end
                }
              }"
            >
              <span>
                {{ formatNumber(slotProps.node.data.closing_balance) }}
              </span>
            </RouterLink> 
          </template>
        </Column>
      </TreeTable> 
      
      <!-- Totals Section -->
      <div class="bg-blue-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm mt-6">
          <div class=" ">
            <div class="flex justify-between">
              <!-- <div class="text-base text-gray-700">Scrappers</div> -->
               <div>
                <h2 class="text-base font-bold">{{ t('account.TotalForDebitsAndCredits') }}</h2>
               </div>
               <div></div>
              <div>
                <h3 class="text-base font-bold">{{ t('account.debit') }}</h3>
                <p class="text-base font-semibold">{{ formatNumber(totals.debit) }}</p> 
              </div>
              <div>
                <h3 class="text-base font-bold">{{ t('account.credit') }}</h3>
                <p class="text-base font-semibold">{{ formatNumber(totals.credit) }}</p> 
              </div>
              <div></div>
              
            </div>
          </div>
        </div>
      <!-- <div class="flex justify-end mt-4 gap-8 font-semibold">
        <div class="flex items-center gap-2">
          <span>{{ t('common.totalDebit') }}:</span>
          <span class="text-lg">{{ formatNumber(trialBalanceData.reduce((sum, account) => sum + (account.data.net_debit || 0), 0)) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span>{{ t('common.totalCredit') }}:</span>
          <span class="text-lg">{{ formatNumber(trialBalanceData.reduce((sum, account) => sum + (account.data.net_credit || 0), 0)) }}</span>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style>
.coa-style th.p-treetable-header-cell {
  border: none !important;
  padding: 18px 14px;
  background: #f6f7fa;
}
.coa-style .p-treetable-header {
  border-bottom: 1px solid #e9e8e8 !important;
  padding: 18px 14px;
}
.coa-style button.p-treetable-node-toggle-button {
  margin-right: 20px;
}
</style> 