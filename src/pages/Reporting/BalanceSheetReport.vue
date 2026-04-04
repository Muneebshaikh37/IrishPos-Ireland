<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Litepicker from "@/components/Base/Litepicker";
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import accountingHttpClient from '@/network/modules/accounting';
import { handleResponse, handleError } from '@/network/api/responseHandler';
import { useAuthStore } from '@/stores/auth';
import toast from '@/stores/utility/toast';
import pan from '@/stores/pan';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const loading = ref(false);
const dateRangeObj = ref({
  start: '2025-01-01',
  end: '2025-12-31'
});

const balanceSheetData = ref([]);
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
      key: rootItem.id
    });
  });

  return flatData;
};

// Test function to verify data transformation
const testDataTransformation = () => {
  const testData = [
    {
      "id": "test1",
      "is_root": true,
      "is_branch": false,
      "is_leaf": false,
      "level": 1,
      "name": "Assets",
      "total": 50150,
      "children": [
        {
          "id": "test2",
          "is_root": false,
          "is_branch": true,
          "is_leaf": false,
          "level": 2,
          "name": "Current Assets",
          "total": 47650,
          "children": [
            {
              "id": "test3",
              "is_root": false,
              "is_branch": false,
              "is_leaf": true,
              "level": 3,
              "name": "Bank",
              "total": 10000,
              "children": []
            }
          ]
        }
      ]
    }
  ];

  console.log('Testing with sample data:', testData);
  const transformed = transformApiData(testData);
  console.log('Transformed test data:', transformed);
  return transformed;
};



const fetchBalanceSheet = async () => {
  try {
    loading.value = true;
    const params = {
      user_id: USER_ID,
      from_date: dateRangeObj.value.start,
      to_date: dateRangeObj.value.end
    };
    console.log('Fetching balance sheet with params:', params);

    const response = await accountingHttpClient.get('/balance-sheet', { params });
    rawApiResponse.value = response.data;

    // Test the transformation function first
    const testResult = testDataTransformation();

    // Check if response.data has the expected structure
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      balanceSheetData.value = transformApiData(response.data.data);
    } else if (response.data && Array.isArray(response.data)) {
      // Direct array response
      balanceSheetData.value = transformApiData(response.data);
    } else {
      console.log('Unexpected response structure:', response.data);
      // Fallback: try to create a simple structure from the response
      if (response.data && typeof response.data === 'object') {
        balanceSheetData.value = [{
          name: 'Raw Data Available',
          value: 'Check Console',
          isHeader: true
        }];
      } else {
        balanceSheetData.value = [];
      }
    }
  } catch (error) {
    console.error('Error fetching balance sheet:', error);
    balanceSheetData.value = [];
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
  fetchBalanceSheet();
};

const downloadReport = async (format) => {
  try {
    const params = {
      user_id: USER_ID,
      from_date: dateRangeObj.value.start,
      to_date: dateRangeObj.value.end,
      format: format
    };
    console.log('Downloading balance sheet report with params:', params);

    // Use accountingHttpClient to get the file with authentication
    const response = await accountingHttpClient.get('/exports/balance-sheet/export', {
      params,
      responseType: 'blob' // Important for file downloads
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance-sheet-report-${dateRangeObj.value.start}-to-${dateRangeObj.value.end}.${format}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Clean up

    // toast.success(`Balance Sheet report download started as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Error downloading balance sheet report:', error);
    // toast.error('Failed to download balance sheet report');
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchBalanceSheet();

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
    <h2 class="mr-auto text-lg font-semibold">{{ t('reporting.BalanceSheet') }}</h2>
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
      <div v-else-if="balanceSheetData.length === 0" class="py-10 text-center text-gray-400">
        {{ $t('reporting.noBalanceSheetData') }}

        <div v-if="rawApiResponse" class=" ">

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
            <tr v-for="(row, idx) in balanceSheetData" :key="idx"
                :class="[
                  row.isHeader ? 'bg-gray-50 text-gray-700 font-semibold' : '',
                  row.isBold ? 'font-bold' : '',
                  row.isTotal ? 'bg-blue-50 font-bold text-blue-900' : '',
                ]">
              <td :class="'px-6 py-2'" :style="row.indent ? `padding-left: ${row.indent * 2}rem` : ''">

                <span v-if="row.isHeader">{{ row.name }}</span>
                <span v-else>{{ row.name }}</span>
              </td>
              <td class="px-6 py-2 text-right"  >

                <template v-if="row.isLeaf || row.isBold || row.isTotal">
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
                <!-- <span v-else>{{ row.value !== undefined ? formatNumber(row.value) : '' }}</span> -->
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
