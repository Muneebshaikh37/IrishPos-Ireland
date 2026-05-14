<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Lucide from '../../components/Base/Lucide';
import LoadingIcon from '../../components/Base/LoadingIcon';
import Chart from '../../components/Base/Chart';
import superAdminApi from '../../network/modules/superadmin';
import { handleResponse } from '../../network/api/responseHandler.js';
import { formatMoney } from '../../utils/currency';
import { type ChartData, type ChartOptions } from 'chart.js/auto';
import { getColor } from '../../utils/colors';

const router = useRouter();

const stats = ref({ total_super_admins: 0, total_shops: 0, active_packages: 0 });
const recentSuperAdmins = ref<any[]>([]);
const isLoading = ref(false);

const analytics = ref<any>({
  package_distribution: [],
  recent_subscriptions: [],
});
const isLoadingAnalytics = ref(false);

const formatPrice = (price: number) => formatMoney(price || 0);

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const res = await superAdminApi.listSuperAdmins({ limit: 5, page: 1 });
    const result = handleResponse(res);
    if (result.success) {
      const data = result.data;
      stats.value.total_super_admins = data?.total || data?.meta?.total || 0;
      recentSuperAdmins.value = Array.isArray(data?.data) ? data.data : [];
    }
  } catch {
    // non-critical
  } finally {
    isLoading.value = false;
  }
};

const fetchAnalytics = async () => {
  isLoadingAnalytics.value = true;
  try {
    // Product Owner sees platform-wide stats; no super_admin_id needed.
    const res = await superAdminApi.getDashboardAnalytics();
    const result = handleResponse(res);
    if (result.success) {
      analytics.value = result.data || analytics.value;
    }
  } catch {
    // non-critical
  } finally {
    isLoadingAnalytics.value = false;
  }
};

const packageChartData = computed<ChartData>(() => {
  const distribution = analytics.value.package_distribution || [];
  const labels = distribution.map((pkg: any) => pkg.package_name || 'Unknown');
  const data = distribution.map((pkg: any) => pkg.subscriber_count || 0);
  const colorPalette = ['#169B62', '#4A3AFF', '#2D5BFF', '#93AAFD', '#8176f9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const backgroundColor = labels.map((_: any, i: number) => colorPalette[i % colorPalette.length]);
  return {
    labels,
    datasets: [
      {
        label: 'Subscribers',
        data,
        backgroundColor,
        hoverBackgroundColor: backgroundColor,
        borderWidth: 3,
        borderColor: getColor('white'),
      },
    ],
  };
});

const packageChartOptions = computed<ChartOptions>(() => ({
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
        font: { size: 13, weight: '500' },
        generateLabels: (chart: any) => {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label: string, i: number) => {
              const dataset = data.datasets[0];
              const value = dataset.data[i];
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
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
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
}));

onMounted(() => {
  fetchStats();
  fetchAnalytics();
});
</script>

<template>
  <div class="mt-6 intro-y">
    <h2 class="text-xl font-semibold mb-6">Product Owner Dashboard</h2>

    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingIcon icon="oval" class="w-8 h-8" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      <div class="box p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Lucide icon="Users" class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p class="text-2xl font-bold">{{ stats.total_super_admins }}</p>
          <p class="text-sm text-slate-500">Super Admins</p>
        </div>
      </div>
      <div class="box p-5 flex items-center gap-4 cursor-pointer" @click="router.push({ name: 'ProductOwnerSuperAdmins' })">
        <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <Lucide icon="Store" class="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-emerald-600">Manage Super Admins →</p>
          <p class="text-sm text-slate-500">View all accounts & shops</p>
        </div>
      </div>
      <div class="box p-5 flex items-center gap-4 cursor-pointer" @click="router.push({ name: 'ProductOwnerPackages' })">
        <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <Lucide icon="Package" class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-purple-600">Manage Packages →</p>
          <p class="text-sm text-slate-500">Create & edit subscription plans</p>
        </div>
      </div>
    </div>

    <!-- Package Distribution & Recent Subscriptions -->
    <div v-if="isLoadingAnalytics" class="flex justify-center py-10">
      <LoadingIcon icon="oval" class="w-8 h-8" />
    </div>
    <div v-else class="grid grid-cols-12 gap-6 mb-8">
      <!-- Package Distribution Chart -->
      <div class="col-span-12 lg:col-span-6">
        <div class="box p-5">
          <div class="flex items-center mb-4">
            <Lucide icon="PieChart" class="w-5 h-5 text-primary mr-2" />
            <h3 class="text-lg font-semibold">Package Distribution</h3>
          </div>
          <div v-if="analytics.package_distribution?.length > 0 && packageChartData.labels.length > 0" class="h-80">
            <Chart type="pie" :data="packageChartData" :options="packageChartOptions" class="h-full" />
          </div>
          <div v-else class="h-80 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Lucide icon="Package" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p class="text-sm">No package distribution data yet</p>
              <p class="text-xs text-gray-400 mt-1">Subscriptions will appear here once super admins sign up.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Subscriptions -->
      <div class="col-span-12 lg:col-span-6">
        <div class="box p-5">
          <div class="flex items-center mb-4">
            <Lucide icon="Activity" class="w-5 h-5 text-primary mr-2" />
            <h3 class="text-lg font-semibold">Recent Subscriptions</h3>
          </div>
          <div v-if="analytics.recent_subscriptions?.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="py-3 px-3 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">User</th>
                  <th class="py-3 px-3 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Package</th>
                  <th class="py-3 px-3 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th class="py-3 px-3 text-right text-gray-700 font-semibold text-xs uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="subscription in analytics.recent_subscriptions"
                  :key="subscription.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-3 font-medium text-gray-900">{{ subscription.user_name || '—' }}</td>
                  <td class="py-3 px-3 text-gray-600">{{ subscription.package_name || 'Trial' }}</td>
                  <td class="py-3 px-3">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                        subscription.status === 'active' ? 'bg-green-100 text-green-800'
                          : subscription.status === 'trial' ? 'bg-yellow-100 text-yellow-800'
                          : subscription.status === 'expired' ? 'bg-red-100 text-red-800'
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

    <!-- Recent Super Admins -->
    <div class="box p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-base">Recent Super Admins</h3>
        <button class="text-sm text-blue-600 hover:underline" @click="router.push({ name: 'ProductOwnerSuperAdmins' })">
          View all
        </button>
      </div>
      <div v-if="recentSuperAdmins.length === 0" class="text-center py-8 text-slate-400">
        <Lucide icon="Users" class="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>No super admins yet.</p>
      </div>
      <table v-else class="w-full text-sm text-left">
        <thead class="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Shops</th>
            <th class="px-4 py-3">Package</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sa in recentSuperAdmins"
            :key="sa.id"
            class="border-b hover:bg-gray-50 cursor-pointer"
            @click="router.push({ name: 'ProductOwnerSuperAdminDetail', params: { id: sa.id } })"
          >
            <td class="px-4 py-3 font-medium">{{ sa.name }}</td>
            <td class="px-4 py-3 text-slate-500">{{ sa.email }}</td>
            <td class="px-4 py-3">{{ sa.shops_count ?? 0 }}</td>
            <td class="px-4 py-3">{{ sa.current_subscription?.package?.name ?? '—' }}</td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="sa.activated_at ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ sa.activated_at ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
