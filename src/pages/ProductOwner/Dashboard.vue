<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Lucide from '../../components/Base/Lucide';
import LoadingIcon from '../../components/Base/LoadingIcon';
import superAdminApi from '../../network/modules/superadmin';
import { handleResponse } from '../../network/api/responseHandler.js';

const router = useRouter();

const stats = ref({ total_super_admins: 0, total_shops: 0, active_packages: 0 });
const recentSuperAdmins = ref<any[]>([]);
const isLoading = ref(false);

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

onMounted(fetchStats);
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
