<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import superAdminApi from '@/network/modules/superadmin';
import { handleResponse, handleError } from '@/network/api/responseHandler.js';
import LoadingIcon from '@/components/Base/LoadingIcon';
import Lucide from '@/components/Base/Lucide';
import Chart from '@/components/Base/Chart';
import Button from '@/components/Base/Button';
import { type ChartData, type ChartOptions } from 'chart.js/auto';
import { getColor } from '@/utils/colors';
import { useColorSchemeStore } from '@/stores/color-scheme';
import { useDarkModeStore } from '@/stores/dark-mode';
import toast from '@/stores/utility/toast';
import pan from '@/stores/pan';
import { formatMoney, getCurrencyCode } from '@/utils/currency';

const authStore = useAuthStore();
const { t, locale } = useI18n();
const superAdminId = computed<string | ''>(() => (authStore.getUserId as any) || (authStore.user as any)?.id || '');

const isLoading = ref(false);
const analytics = ref<any>({
  total_shops: 0,
  active_subscriptions: 0,
  trial_subscriptions: 0,
  expired_subscriptions: 0,
  revenue_summary: {
    total: 0,
    monthly: 0,
    today: 0,
  },
  package_distribution: [],
  trial_conversion_rate: 0,
  recent_subscriptions: [],
});

const colorScheme = computed(() => useColorSchemeStore().colorScheme);
const darkMode = computed(() => useDarkModeStore().darkMode);

const formatPrice = (price: number) => {
  return formatMoney(price || 0);
};

const fetchAnalytics = async () => {
  if (!superAdminId.value) {
    console.warn('[SuperAdmin] Missing superAdminId; cannot fetch analytics.');
    return;
  }
  try {
    isLoading.value = true;
    const response = await superAdminApi.getDashboardAnalytics({ superAdminId: superAdminId.value });
    const result = handleResponse(response);
    if (result.success) {
      analytics.value = result.data || analytics.value;
    } else {
      console.error('[SuperAdmin] Failed to load analytics:', result);
      toast().fry(pan.error(result.message || 'Failed to load analytics.'));
    }
  } catch (e) {
    handleError(e);
    toast().fry(pan.error('Error loading analytics.'));
  } finally {
    isLoading.value = false;
  }
};

// Package Distribution Chart Data
const packageChartData = computed<ChartData>(() => {
  const distribution = analytics.value.package_distribution || [];
  const labels = distribution.map((pkg: any) => pkg.package_name || 'Unknown');
  const data = distribution.map((pkg: any) => pkg.subscriber_count || 0);

  // Define a proper color palette for packages
  const colorPalette = [
    '#169B62', // Primary green
    '#4A3AFF', // Deep blue
    '#2D5BFF', // Bright blue
    '#93AAFD', // Light blue
    '#8176f9', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
  ];

  // Map colors to each data point
  const backgroundColor = labels.map((_, index) => colorPalette[index % colorPalette.length]);
  const hoverBackgroundColor = backgroundColor.map(color => {
    // Make hover color slightly brighter by adjusting opacity if it's a hex color
    return color;
  });

  return {
    labels,
    datasets: [
      {
        label: 'Subscribers',
        data,
        backgroundColor,
        hoverBackgroundColor,
        borderWidth: 3,
        borderColor: darkMode.value ? getColor('darkmode.700') : getColor('white'),
      },
    ],
  };
});

const packageChartOptions = computed<ChartOptions>(() => {
  return {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: getColor('slate.600', 1),
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            weight: '500',
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label} (${value})`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} subscribers (${percentage}%)`;
          },
        },
      },
    },
  };
});

// Revenue Chart Data (for monthly trend)
const revenueChartData = computed<ChartData>(() => {
  const revenue = analytics.value.revenue_summary || {};
  const today = revenue.today || 0;
  const monthly = revenue.monthly || 0;
  const total = revenue.total || 0;
  const pending = revenue.pending || 0;

  // Define vibrant gradient colors for each bar
  const gradients = [
    { start: '#22c55e', end: '#169B62' }, // Today - Green gradient
    { start: '#4A90E2', end: '#2D5BFF' }, // This Month - Blue gradient
    { start: '#10B981', end: '#059669' }, // Total - Green gradient
    { start: '#16a34a', end: '#15803d' }, // Pending - Dark green gradient
  ];

  return {
    labels: ['Today', 'This Month', 'Total', 'Pending'],
    datasets: [
      {
        label: `Revenue (${getCurrencyCode()})`,
        data: [today, monthly, total, pending],
        backgroundColor: gradients.map(g => g.start),
        hoverBackgroundColor: gradients.map(g => g.end),
        borderColor: gradients.map(g => g.end),
        borderWidth: 3,
        borderRadius: {
          topLeft: 12,
          topRight: 12,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        barThickness: 55,
        maxBarThickness: 65,
        categoryPercentage: 0.65,
        barPercentage: 0.85,
      },
    ],
  };
});

const revenueChartOptions = computed<ChartOptions>(() => {
  return {
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 16,
        titleFont: {
          size: 15,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
          weight: '500',
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            return context[0].label || '';
          },
          label: (context: any) => {
            const value = context.parsed.y || 0;
            return `Revenue: ${formatPrice(value)}`;
          },
          labelColor: (context: any) => {
            const colors = ['#22c55e', '#4A90E2', '#10B981'];
            return {
              borderColor: colors[context.dataIndex] || '#169B62',
              backgroundColor: colors[context.dataIndex] || '#169B62',
              borderWidth: 2,
            };
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: getColor('slate.600', 1),
          font: {
            size: 12,
            weight: '600',
          },
          padding: 10,
          callback: (value: any) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            if (numValue >= 1000000) {
              return `${(numValue / 1000000).toFixed(1)}M`;
            } else if (numValue >= 1000) {
              return `${(numValue / 1000).toFixed(1)}K`;
            }
            return numValue.toLocaleString('en-SA');
          },
        },
        grid: {
          color: getColor('slate.200', 0.6),
          drawBorder: false,
          lineWidth: 1,
        },
      },
      x: {
        ticks: {
          color: getColor('slate.700', 1),
          font: {
            size: 13,
            weight: '600',
          },
          padding: 12,
        },
        grid: {
          display: false,
        },
      },
    },
  };
});

onMounted(() => {
  fetchAnalytics();
});
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="grid grid-cols-2 items-center mb-6 gap-4">
      <h2 class="text-2xl font-semibold" :class="locale === 'ar' ? 'text-right col-start-1' : 'text-left col-start-1'">{{ $t('superadmin.dashboard.title') }}</h2>
      <Button variant="primary" @click="fetchAnalytics" :disabled="isLoading" class="flex items-center gap-2 w-auto justify-self-end" :class="locale === 'ar' ? 'col-start-2' : 'col-start-2'">
        <Lucide icon="RefreshCw" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        {{ $t('superadmin.dashboard.refresh') }}
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <LoadingIcon icon="oval" class="w-10 h-10" />
    </div>

    <!-- Dashboard Content -->
    <div v-else class="grid grid-cols-12 gap-6">
      <!-- Metrics Cards -->
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5 w-full">
          <div class="flex items-center" :class="{ 'flex-row-reverse': locale === 'ar' }">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0" :class="locale === 'ar' ? 'ml-4' : 'mr-4'">
              <Lucide icon="Store" class="w-6 h-6 text-primary" />
            </div>
            <div class="flex-1 min-w-0" :class="{ 'text-right': locale === 'ar' }">
              <div class="text-xs text-gray-500 mb-1 truncate">{{ $t('superadmin.dashboard.totalShops') }}</div>
              <div class="text-2xl font-bold text-gray-800">{{ analytics.total_shops || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5 w-full">
          <div class="flex items-center" :class="{ 'flex-row-reverse': locale === 'ar' }">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0" :class="locale === 'ar' ? 'ml-4' : 'mr-4'">
              <Lucide icon="CheckCircle" class="w-6 h-6 text-green-600" />
            </div>
            <div class="flex-1 min-w-0" :class="{ 'text-right': locale === 'ar' }">
              <div class="text-xs text-gray-500 mb-1 truncate">{{ $t('superadmin.dashboard.activeSubscriptions') }}</div>
              <div class="text-2xl font-bold text-gray-800">{{ analytics.active_subscriptions || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5 w-full">
          <div class="flex items-center" :class="{ 'flex-row-reverse': locale === 'ar' }">
            <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0" :class="locale === 'ar' ? 'ml-4' : 'mr-4'">
              <Lucide icon="Clock" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="flex-1 min-w-0" :class="{ 'text-right': locale === 'ar' }">
              <div class="text-xs text-gray-500 mb-1 truncate">{{ $t('superadmin.dashboard.trialSubscriptions') }}</div>
              <div class="text-2xl font-bold text-gray-800">{{ analytics.trial_subscriptions || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5 w-full">
          <div class="flex items-center" :class="{ 'flex-row-reverse': locale === 'ar' }">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0" :class="locale === 'ar' ? 'ml-4' : 'mr-4'">
              <Lucide icon="XCircle" class="w-6 h-6 text-red-600" />
            </div>
            <div class="flex-1 min-w-0" :class="{ 'text-right': locale === 'ar' }">
              <div class="text-xs text-gray-500 mb-1 truncate">{{ $t('superadmin.dashboard.expiredSubscriptions') }}</div>
              <div class="text-2xl font-bold text-gray-800">{{ analytics.expired_subscriptions || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Summary Cards (4 in a single row on large screens) -->
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5">
          <div class="flex items-center mb-4">
            <Lucide icon="DollarSign" class="w-5 h-5 text-primary" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
            <h3 class="text-lg font-semibold">{{ $t('superadmin.dashboard.totalRevenue') }}</h3>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">
            {{ formatPrice(analytics.revenue_summary?.total || 0) }}
          </div>
          <div class="text-sm text-gray-500">{{ $t('superadmin.dashboard.allTimeRevenue') }}</div>
        </div>
      </div>

      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5">
          <div class="flex items-center mb-4">
            <Lucide icon="TrendingUp" class="w-5 h-5 text-green-600" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
            <h3 class="text-lg font-semibold">{{ $t('superadmin.dashboard.monthlyRevenue') }}</h3>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">
            {{ formatPrice(analytics.revenue_summary?.monthly || 0) }}
          </div>
          <div class="text-sm text-gray-500">{{ $t('superadmin.dashboard.thisMonth') }}</div>
        </div>
      </div>

      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5">
          <div class="flex items-center mb-4">
            <Lucide icon="Calendar" class="w-5 h-5 text-primary" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
            <h3 class="text-lg font-semibold">{{ $t('superadmin.dashboard.todaysRevenue') }}</h3>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">
            {{ formatPrice(analytics.revenue_summary?.today || 0) }}
          </div>
          <div class="text-sm text-gray-500">{{ $t('superadmin.dashboard.today') }}</div>
        </div>
      </div>

      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="box p-5">
          <div class="flex items-center mb-4">
            <Lucide icon="Clock" class="w-5 h-5 text-amber-600" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
            <h3 class="text-lg font-semibold">{{ $t('superadmin.dashboard.pendingRevenue') }}</h3>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">
            {{ formatPrice(analytics.revenue_summary?.pending || 0) }}
          </div>
          <div class="text-sm text-gray-500">{{ $t('superadmin.dashboard.awaitingPayment') }}</div>
        </div>
      </div>


      <!-- Package Distribution Chart -->
      <div class="col-span-12 lg:col-span-6">
        <div class="box p-5">
          <div class="flex items-center mb-4">
            <Lucide icon="PieChart" class="w-5 h-5 text-primary mr-2" />
            <h3 class="text-lg font-semibold">{{ $t('superadmin.dashboard.packageDistribution') }}</h3>
          </div>
          <div v-if="analytics.package_distribution?.length > 0 && packageChartData.labels.length > 0" class="h-80">
            <Chart
              type="pie"
              :data="packageChartData"
              :options="packageChartOptions"
              class="h-full"
            />
          </div>
          <div v-else class="h-80 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Lucide icon="Package" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p class="text-sm">{{ $t('superadmin.dashboard.noPackageDistributionData') }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ $t('superadmin.dashboard.packagesWillAppear') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Subscriptions -->
      <div class="col-span-12 lg:col-span-6">
        <div class="box p-5">
          <div class="flex items-center mb-4" :class="locale === 'ar' ? 'flex-row-reverse justify-between' : 'justify-between'">
            <div class="flex items-center" :class="{ 'flex-row-reverse': locale === 'ar' }">
              <Lucide icon="Activity" class="w-5 h-5 text-primary" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
              <h3 class="text-lg font-semibold">{{ $t('superadmin.dashboard.recentSubscriptions') }}</h3>
            </div>
            <!-- <router-link :to="{ name: 'SuperAdminPackages' }" class="text-sm text-primary hover:underline">
              {{ $t('superadmin.dashboard.viewAll') }}
            </router-link> -->
          </div>
          <div v-if="analytics.recent_subscriptions?.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="py-3 px-3 text-gray-700 font-semibold text-xs uppercase tracking-wider" :class="locale === 'ar' ? 'text-right' : 'text-left'">{{ $t('superadmin.dashboard.user') }}</th>
                  <th class="py-3 px-3 text-gray-700 font-semibold text-xs uppercase tracking-wider" :class="locale === 'ar' ? 'text-right' : 'text-left'">{{ $t('superadmin.dashboard.package') }}</th>
                  <th class="py-3 px-3 text-gray-700 font-semibold text-xs uppercase tracking-wider" :class="locale === 'ar' ? 'text-right' : 'text-left'">{{ $t('superadmin.dashboard.status') }}</th>
                  <th class="py-3 px-3 text-gray-700 font-semibold text-xs uppercase tracking-wider text-right">{{ $t('superadmin.dashboard.amount') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="subscription in analytics.recent_subscriptions"
                  :key="subscription.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-3 font-medium text-gray-900" :class="locale === 'ar' ? 'text-right' : 'text-left'">{{ subscription.user_name || '—' }}</td>
                  <td class="py-3 px-3 text-gray-600" :class="locale === 'ar' ? 'text-right' : 'text-left'">{{ subscription.package_name || 'Trial' }}</td>
                  <td class="py-3 px-3" :class="locale === 'ar' ? 'text-right' : 'text-left'">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : subscription.status === 'trial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : subscription.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ subscription.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : '—' }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-right font-semibold text-gray-900">
                    {{ subscription.paid_amount ? formatPrice(subscription.paid_amount) : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            <Lucide icon="Activity" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No recent subscriptions</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
