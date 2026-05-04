<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Lucide from '../../components/Base/Lucide';
import Button from '../../components/Base/Button';
import LoadingIcon from '../../components/Base/LoadingIcon';
import toast from '../../stores/utility/toast';
import pan from '../../stores/pan';
import superAdminApi from '../../network/modules/superadmin';
import { handleResponse, handleError } from '../../network/api/responseHandler.js';

const route = useRoute();
const router = useRouter();

const isLoading = ref(false);
const superAdmin = ref<any>(null);

const fetchDetail = async () => {
  isLoading.value = true;
  try {
    const res = await superAdminApi.getSuperAdmin(route.params.id as string);
    const result = handleResponse(res);
    if (result.success) {
      superAdmin.value = result.data?.data ?? result.data;
    } else {
      toast().fry(pan.error(result.message || 'Failed to load super admin.'));
    }
  } catch (e) {
    handleError(e);
  } finally {
    isLoading.value = false;
  }
};

const getCreatedDate = (raw: string | null) => {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

onMounted(fetchDetail);
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="flex items-center gap-3 mb-6">
      <Button variant="outline-secondary" class="flex items-center gap-2 px-3 py-1.5" @click="router.back()">
        <Lucide icon="ArrowLeft" class="w-4 h-4" />
        Back
      </Button>
      <h2 class="text-lg font-medium">Super Admin Detail</h2>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <LoadingIcon icon="oval" class="w-8 h-8" />
    </div>

    <div v-else-if="superAdmin">
      <!-- Profile card -->
      <div class="box p-6 mb-5">
        <div class="flex items-start gap-5">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Lucide icon="User" class="w-8 h-8 text-blue-600" />
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold">{{ superAdmin.name }}</h3>
            <p class="text-slate-500">{{ superAdmin.email }}</p>
            <p v-if="superAdmin.account?.phone" class="text-slate-500 text-sm">{{ superAdmin.account.phone }}</p>
            <div class="flex items-center gap-3 mt-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="superAdmin.activated_at ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ superAdmin.activated_at ? 'Active' : 'Inactive' }}
              </span>
              <span class="text-xs text-slate-400">Joined {{ getCreatedDate(superAdmin.created_at) }}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-slate-600">Current Package</p>
            <p class="text-lg font-bold text-blue-600">{{ superAdmin.current_subscription?.package?.name ?? 'No Package' }}</p>
            <p v-if="superAdmin.current_subscription?.package?.max_shops" class="text-xs text-slate-400">
              Max {{ superAdmin.current_subscription.package.max_shops }} shop(s)
            </p>
            <span
              v-if="superAdmin.current_subscription"
              class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs"
              :class="{
                'bg-green-100 text-green-700': superAdmin.current_subscription.status === 'active',
                'bg-yellow-100 text-yellow-700': superAdmin.current_subscription.status === 'trial',
              }"
            >
              {{ superAdmin.current_subscription.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Shops -->
      <div class="box p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">
            Shops
            <span class="ml-2 text-sm font-normal text-slate-400">({{ superAdmin.shops_count ?? superAdmin.sub_users?.length ?? 0 }} total)</span>
          </h3>
        </div>

        <div v-if="!superAdmin.sub_users || superAdmin.sub_users.length === 0" class="text-center py-8 text-slate-400">
          <Lucide icon="Store" class="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No shops created yet.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th class="px-4 py-3">Shop Name</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Phone</th>
                <th class="px-4 py-3">Currency</th>
                <th class="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="shop in superAdmin.sub_users"
                :key="shop.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="px-4 py-3 font-medium">{{ shop.name }}</td>
                <td class="px-4 py-3 text-slate-500">{{ shop.email }}</td>
                <td class="px-4 py-3">{{ shop.account?.phone || '—' }}</td>
                <td class="px-4 py-3">{{ shop.settings?.currency_code || '—' }}</td>
                <td class="px-4 py-3">{{ getCreatedDate(shop.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
