<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Litepicker from "@/components/Base/Litepicker";
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import accountingHttpClient from '@/network/modules/accounting';
import { useAuthStore } from '@/stores/auth';
import toast from '@/stores/utility/toast';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const loading = ref(false);
const dateRangeObj = ref({
  start: '2025-01-01',
  end: '2025-12-31'
});

const profitLossData = ref([]);
const rawApiResponse = ref(null);
const showExportDropdown = ref(false);

// Transform API response to flat structure for table display
const transformApiData = (apiData) => {
  const flatData = [];
  
  apiData.forEach((rootItem, index) => {
    // Add root header
    flatData.push({
      name: rootItem.name,
      value: rootItem.total,
      isHeader: true,
      level: rootItem.level,
      isLeaf: rootItem.is_leaf,
      ColorGrantTotal: rootItem.grant_total,
      key: rootItem.id
    });
    
    // Process children recursively
    const processChildren = (children, parentLevel = 1) => {
      children.forEach((child) => {
        // Add child item
        flatData.push({
          name: child.name,
          value: child.total,
          indent: child.level - 1, 
          level: child.level,
          isLeaf: child.is_leaf,
          key: child.id
        });
        
        // If it's a branch (has children), process children first
        if (child.is_branch && child.children && child.children.length > 0) {
          processChildren(child.children, child.level + 1);
          
          // Add total row for this branch
          flatData.push({
            name: `Total ${child.name}`,
            value: child.total, 
            isBold: true,
            grant_total: child.grant_total,
            indent: child.level - 1,
            key: child.id
          });
        }
      });
    };
    
    // Process root children
    if (rootItem.children && rootItem.children.length > 0) {
      processChildren(rootItem.children, rootItem.level + 1);
    }
    
    // Add total for root item
    flatData.push({
      name: `Total ${rootItem.name}`,
      value: rootItem.total, 
      isTotal: true,
      grant_total: rootItem.grant_total,
      key: rootItem.id
    });
  });
  
  return flatData;
};

const fetchProfitLoss = async () => {
  try {
    loading.value = true;
    const params = {
      user_id: USER_ID,
      from_date: dateRangeObj.value.start,
      to_date: dateRangeObj.value.end,
    };
    const response = await accountingHttpClient.get('/profit-and-loss', { params });
    rawApiResponse.value = response.data;

    if (response.data?.data && Array.isArray(response.data.data)) {
      profitLossData.value = transformApiData(response.data.data);
    } else if (Array.isArray(response.data)) {
      profitLossData.value = transformApiData(response.data);
    } else {
      profitLossData.value = [];
    }
  } catch (error) {
    console.error('Error fetching profit & loss:', error);
    toast.error(t('common.errorLoadingData') || 'Could not load profit and loss');
    profitLossData.value = [];
  } finally {
    loading.value = false;
  }
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00';
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 0 });
};

const handleApplyFilter = () => {
  fetchProfitLoss();
};

const downloadReport = async (format) => {
  try {
    const params = {
      user_id: USER_ID,
      from_date: dateRangeObj.value.start,
      to_date: dateRangeObj.value.end,
      format,
    };
    const response = await accountingHttpClient.get('/exports/profit-and-loss/export', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profit-loss-report-${dateRangeObj.value.start}-to-${dateRangeObj.value.end}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report:', error);
    toast.error(t('common.exportFailed') || 'Export is not available for profit and loss yet');
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchProfitLoss();
  
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
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/reporting">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide :icon="locale === 'ar' ? 'ChevronRight' : 'ChevronLeft'" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ t('reporting.ProfitLoss') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8 coa-style">
    <!-- Date Filters -->
    <div class="col-span-12 flex justify-between intro-y gap-6">
      <div></div>
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
              {{ $t('reporting.exportAsPdf') }}
            </div>
            <div 
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              @click="downloadReport('excel'); showExportDropdown = false"
            >
              <Lucide icon="FileSpreadsheet" class="w-4 h-4 mr-2" />
              {{ $t('reporting.exportAsExcel') }}
            </div>
          </div>
        </div>
        
      </div>
    </div>
    <!-- Table -->
    <div class="col-span-12">
      <div v-if="loading" class="py-10 text-center text-gray-400">Loading...</div>
      <div v-else-if="profitLossData.length === 0" class="py-10 text-center text-gray-400">
        {{ $t('reporting.noProfitLossData') }}
         
        <div v-if="rawApiResponse" class="mt-4 p-4 bg-gray-100 rounded text-left">
          <h4 class="font-bold mb-2">Raw API Response:</h4>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(rawApiResponse, null, 2) }}</pre>
        </div>
      </div>
      <div v-else>
         
        <table class="min-w-full bg-white rounded-xl overflow-hidden shadow-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left px-6 py-3 text-gray-700 font-semibold">Account Name</th>
              <th class="text-right px-6 py-3 text-gray-700 font-semibold">Total</th>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(row, idx) in profitLossData" :key="idx"
                :class="[
                  row.isHeader ? 'bg-gray-50 text-gray-700 font-semibold' : '',
                  row.isBold ? 'font-bold' : '',
                  row.isTotal ? 'bg-blue-50 font-bold text-blue-900' : '',
                  row.ColorGrantTotal ? 'font-extrabold text-xl  p-2' : ''
                ]">
                
                <td v-if="!row.grant_total" :class="'px-6 py-2'" :style="row.indent ? `padding-left: ${row.indent * 2}rem` : ''">
                  <span v-if="row.isHeader">{{ row.name }}</span>
                  <span v-else>{{ row.name }}</span>
                </td>
                <td v-if="!row.grant_total" class="px-6 py-2 text-right">
                  <template v-if="row.isLeaf || row.ColorGrantTotal || row.isBold || row.isTotal">
                    <RouterLink
                      v-if="row.isLeaf && row.key"
                      class="text-blue-500 underline"
                      :to="{
                        path: `/account/general-ledger/${row.key}/view`,
                        query: {
                          from_date: dateRangeObj.start,
                          to_date: dateRangeObj.end
                        }
                      }"
                    >
                      <span v-if="row.value < 0">({{ formatNumber(Math.abs(row.value)) }})</span>
                      <span v-else>{{ formatNumber(row.value) }}</span>
                    </RouterLink>
                    <span v-else>
                      <span v-if="row.value < 0">({{ formatNumber(Math.abs(row.value)) }})</span>
                      <span v-else>{{ formatNumber(row.value) }}</span>
                    </span>
                  </template>
                </td>
            </tr>
          </tbody>
        </table>
      </div>
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