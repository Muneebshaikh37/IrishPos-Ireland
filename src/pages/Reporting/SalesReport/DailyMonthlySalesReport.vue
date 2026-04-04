<template>
  <div class="px-6 max-w-7xl mx-auto">
  <div>
    <div class="relative mt-3 mb-6 ml-auto sm:mt-0 text-slate-500" :class="{ 'mr-2': locale === 'ar' }">
      <Lucide icon="Calendar" class="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3" />
      <Litepicker
          v-model="dateRange"
          :options="pickerOptions"
          class="pl-10 w-60 shadow-md"
      />
    </div>
    <div class="p-5 box h-full">
      <div class="flex flex-col md:flex-row md:items-center justify-between">
        <h4 class="text-lg font-semibold text-gray-800">{{$t('reporting.DailyMonthlySalesReport')}}</h4>
        <div class="flex items-center gap-3">
          <div class="tabs bg-[#F8F8FF] rounded-lg">
            <button  v-for="tab in tabs" :key="tab" :class="{ 'active-tab': selectedTab === tab }" @click="getDailyMonthly(tab)">
              {{ $t(`dashboard.tabs.${tab}`) }}
            </button>
          </div>
          <Button 
            v-if="PeakSaleHours?.line_chart_data?.length > 0"
            variant="outline-secondary" 
            class="flex items-center justify-center toggle-view-btn"
            style="height: 34px; padding: 7px 18px; margin: 0;"
            @click="toggleView"
          >
            <Lucide :icon="showChart ? 'List' : 'Activity'" class="w-4 h-4 mr-2" />
            {{ showChart ? 'Show Table' : 'Show Chart' }}
          </Button>
        </div>
      </div>
      <div v-if="isLoading" class="animate-pulse bg-slate-200 w-full h-56 rounded-lg"></div>
      <template v-else>
        <div v-if="PeakSaleHours?.line_chart_data?.length > 0">
          <apexchart
              v-if="showChart"
              id="chart"
              width="100%"
              height="450"
              type="line"
              :options="chartOptions"
              :series="series"
          />
          <div v-else class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b">
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ selectedTab === 'day' ? 'Date' : 'Month' }}</th>
                  <th class="text-right py-3 px-4 font-semibold text-gray-700">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in PeakSaleHours.line_chart_data" :key="index" class="border-b hover:bg-gray-50">
                  <td class="py-3 px-4 text-gray-800">{{ item.period }}</td>
                  <td class="py-3 px-4 text-right font-medium text-gray-800">{{ CurrencyFormatter(parseFloat(item.total_sales).toFixed(2)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-center">
          <img :src="NotFoundIcon" class="w-[160px] mx-auto" />
          <h3 class="text-xl font-semibold text-gray-400 pt-5">{{ $t('dashboard.noDataAvailable') }}</h3>
          <p class="text-base text-gray-400 font-normal pb-4">{{ $t('dashboard.noDataDescription') }}</p>
          <Button variant="outline-secondary" class="flex items-center hov-end hover:text-gray-700 justify-center mx-auto w-40 py-2"
              @click="getDailyMonthly">
            <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" />
            {{ $t('dashboard.refreshNow') }}
          </Button>
        </div>
      </template>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import httpClient from '@/network/api/httpClient';
import NotFoundIcon from '@/assets/images/notFoundIcon.svg';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import Litepicker from '@/components/Base/Litepicker';
import { handleError, handleResponse } from '@/network/api/responseHandler.js';
import { useAuthStore } from '@/stores/auth.js';
import CurrencyFormatter from '@/utils/currencyFormatter';

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const locale = ref(localStorage.getItem('locale') || 'en');
const tabs = ['day', 'month'];
const selectedTab = ref('day');
const PeakSaleHours = ref(null);
const isLoading = ref(false);
const showChart = ref(true);
const toggleView = () => {
  showChart.value = !showChart.value;
};
const dateRange = ref('1 Jan, 2025 - 31 Jan, 2025');
const start_date = ref('');
const end_date = ref('');
const labels = ref([]);
const series = ref([]);

const pickerOptions = {
  autoApply: false,
  singleMode: false,
  numberOfColumns: 2,
  numberOfMonths: 2,
  showWeekNumbers: true,
  dropdowns: {
    minYear: 1990,
    maxYear: null,
    months: true,
    years: true,
  },
};

const chartOptions = ref({
  chart: {
    id: 'chart',
    toolbar: { show: false },
    height: 450,
    type: 'line',
    fontFamily: 'Public Sans, sans-serif',
    zoom: { enabled: false },
  },
  stroke: { width: 3, curve: 'straight' },
  colors: ['#169B62', '#b2b2b2'],
  grid: {
    padding: { top: 30, bottom: 30, left: 30, right: 30 },
    borderColor: '#f4f4f4',
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    categories: labels.value,
    labels: { style: { colors: Array(12).fill('#989898') } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    tickAmount: 3,
    labels: {
      style: { fontFamily: 'Public Sans, sans-serif', fontSize: '13px', fontWeight: 400, colors: ['#989898'] },
      formatter: (val) => CurrencyFormatter(val.toFixed(1)),
    },
  },
  tooltip: {
    y: { formatter: (val) => CurrencyFormatter(val.toFixed(1)) },
  },
});

const parseDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) throw new Error('Invalid date format');
  return date.toISOString().split('T')[0];
};

watch(dateRange, (newValue) => {
  try {
    if (newValue) {
      const [start, end] = newValue.split(' - ');
      start_date.value = parseDate(start.trim());
      end_date.value = parseDate(end.trim());
      getDailyMonthly()
    }
  } catch (error) {
    console.error('Error converting date:', error.message);
  }
});

const updateChartData = (data) => {
  if (!data?.line_chart_data) return;

  labels.value = data.line_chart_data.map((item) => item.period);
  series.value = [{ name: 'Total Sales', data: data.line_chart_data.map((item) => parseFloat(item.total_sales)) }];

  chartOptions.value = {
    ...chartOptions.value,
    xaxis: { ...chartOptions.value.xaxis, categories: labels.value },
  };
};

const getDailyMonthly = async (tab = 'day') => {
  try {
    isLoading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/reporting/sales`, {
      params: {
        user_id: USER_ID,
        start_date: start_date.value,
        end_date: end_date.value,
        interval: tab === 'day' ? 'daily' : 'monthly',
      },
    });
    const result = handleResponse(response);
    if (result.success) {
      PeakSaleHours.value = result.data;
      updateChartData(result.data);
      selectedTab.value = tab;
    } else {
      console.error('API Response Error:', result.message);
    }
  } catch (error) {
    const result = handleError(error);
    console.error('API Error:', result.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getDailyMonthly('day');
});
</script>

<style scoped>
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 0;
}

button {
  margin: 6px;
  padding: 7px 18px;
  cursor: pointer;
  border-radius: 10px;
  font-weight: 400;
  font-size: 14px;
  text-transform: capitalize;
}

button.active-tab {
  background-color: #169B62;
  color: #fff;
}

button:hover {
  background-color: #169B62;
  color: #fff;
}

.hov-end:hover {
  color: #738192 !important;
}

.toggle-view-btn:hover {
  background-color: #169B62 !important;
  color: #fff !important;
  border-color: #169B62 !important;
}
</style>