<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Lucide from '../../components/Base/Lucide';
import Button from '../../components/Base/Button';
import LoadingIcon from '../../components/Base/LoadingIcon';
import Pagination from '../../components/Base/Pagination';
import { Dialog } from '../../components/Base/Headless';
import toast from '../../stores/utility/toast';
import pan from '../../stores/pan';
import superAdminApi from '../../network/modules/superadmin';
import { handleResponse, handleError } from '../../network/api/responseHandler.js';

const router = useRouter();

const isLoading = ref(false);
const isToggling = ref<string | null>(null);
const superAdmins = ref<any[]>([]);
const search = ref('');
const limit = ref(10);
const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0, links: [] as any[] });

const fetchSuperAdmins = async (page = 1) => {
  isLoading.value = true;
  try {
    const res = await superAdminApi.listSuperAdmins({ search: search.value, limit: limit.value, page });
    const result = handleResponse(res);
    if (result.success) {
      const raw = result.data;
      superAdmins.value = Array.isArray(raw?.data) ? raw.data : [];
      if (raw?.meta) {
        pagination.value = {
          current_page: raw.meta.current_page || 1,
          last_page: raw.meta.last_page || 1,
          per_page: raw.meta.per_page || 10,
          total: raw.meta.total || 0,
          from: raw.meta.from || 0,
          to: raw.meta.to || 0,
          links: raw.meta.links || [],
        };
      }
    } else {
      toast().fry(pan.error(result.message || 'Failed to load super admins.'));
    }
  } catch (e) {
    handleError(e);
  } finally {
    isLoading.value = false;
  }
};

const handleToggleActivation = async (sa: any) => {
  isToggling.value = sa.id;
  try {
    const res = await superAdminApi.toggleSuperAdminActivation(sa.id);
    const result = handleResponse(res);
    if (result.success) {
      toast().fry(pan.success(result.data?.message || 'Status updated.'));
      await fetchSuperAdmins(pagination.value.current_page);
    } else {
      toast().fry(pan.error(result.message || 'Failed to update status.'));
    }
  } catch (e) {
    handleError(e);
  } finally {
    isToggling.value = null;
  }
};

const handleSearch = () => { pagination.value.current_page = 1; fetchSuperAdmins(1); };

const getPageNumber = (url: string | null) => {
  if (!url) return null;
  const m = url.match(/[?&]page=(\d+)/);
  return m ? parseInt(m[1]) : null;
};

const handlePaginationClick = (link: any) => {
  if (!link.url || link.active || link.label === '...') return;
  const page = getPageNumber(link.url);
  if (page) fetchSuperAdmins(page);
};

onMounted(() => fetchSuperAdmins(1));
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-medium">Super Admins</h2>
      <Button variant="primary" @click="router.push({ name: 'ProductOwnerCreateSuperAdmin' })" class="flex items-center gap-2">
        <Lucide icon="Plus" class="w-4 h-4" />
        Create Super Admin
      </Button>
    </div>

    <!-- Search -->
    <div class="box p-5 mb-5">
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="text"
          class="form-control !box flex-1"
          placeholder="Search by name or email…"
          @keyup.enter="handleSearch"
        />
        <Button variant="primary" @click="handleSearch">
          <Lucide icon="Search" class="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button v-if="search" variant="secondary" @click="search = ''; handleSearch()">
          <Lucide icon="X" class="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="box p-5 relative">
      <div v-if="isLoading" class="absolute inset-0 bg-white/80 flex justify-center items-center z-10 rounded-lg">
        <LoadingIcon icon="oval" class="w-8 h-8" />
      </div>

      <div v-if="!isLoading && superAdmins.length === 0" class="text-center py-12 text-gray-500">
        <Lucide icon="Users" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p class="text-lg font-medium">No super admins found.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-6 py-3">Name</th>
              <th class="px-6 py-3">Email</th>
              <th class="px-6 py-3">Shops</th>
              <th class="px-6 py-3">Package</th>
              <th class="px-6 py-3">Subscription</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sa in superAdmins"
              :key="sa.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-6 py-4 font-medium">{{ sa.name }}</td>
              <td class="px-6 py-4 text-slate-500">{{ sa.email }}</td>
              <td class="px-6 py-4">{{ sa.shops_count ?? 0 }}</td>
              <td class="px-6 py-4">
                {{ sa.current_subscription?.package?.name ?? '—' }}
                <span v-if="sa.current_subscription?.package?.max_shops" class="text-xs text-slate-400">
                  (max {{ sa.current_subscription.package.max_shops }})
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="sa.current_subscription"
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-700': sa.current_subscription.status === 'active',
                    'bg-yellow-100 text-yellow-700': sa.current_subscription.status === 'trial',
                    'bg-red-100 text-red-700': sa.current_subscription.status === 'cancelled',
                  }"
                >
                  {{ sa.current_subscription.status }}
                </span>
                <span v-else class="text-slate-400 text-xs">No subscription</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="sa.activated_at ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ sa.activated_at ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <Button
                    variant="outline-secondary"
                    class="px-3 py-1.5 flex items-center gap-1 text-xs"
                    @click="router.push({ name: 'ProductOwnerSuperAdminDetail', params: { id: sa.id } })"
                  >
                    <Lucide icon="Eye" class="w-3 h-3" />
                    View
                  </Button>
                  <Button
                    variant="outline-primary"
                    class="px-3 py-1.5 flex items-center gap-1 text-xs"
                    @click="router.push({ name: 'ProductOwnerEditSuperAdmin', params: { id: sa.id } })"
                  >
                    <Lucide icon="Edit" class="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    class="px-3 py-1.5 flex items-center gap-1 text-xs"
                    :variant="sa.activated_at ? 'danger' : 'success'"
                    :disabled="isToggling === sa.id"
                    @click="handleToggleActivation(sa)"
                  >
                    <LoadingIcon v-if="isToggling === sa.id" icon="oval" class="w-3 h-3" />
                    <Lucide v-else :icon="sa.activated_at ? 'UserX' : 'UserCheck'" class="w-3 h-3" />
                    {{ sa.activated_at ? 'Deactivate' : 'Activate' }}
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.total > 0 && pagination.last_page > 1" class="flex items-center justify-between mt-5 pt-5 border-t border-slate-200/60">
        <div class="text-sm text-gray-500">
          Showing {{ pagination.from }}–{{ pagination.to }} of {{ pagination.total }}
        </div>
        <Pagination>
          <Pagination.Link
            v-for="(link, i) in pagination.links"
            :key="i"
            :active="link.active"
            :class="{ 'cursor-not-allowed opacity-50 pointer-events-none': !link.url || link.label === '...' }"
            @click.prevent="handlePaginationClick(link)"
          >
            <span v-html="link.label"></span>
          </Pagination.Link>
        </Pagination>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-control { border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 0.5rem 0.75rem; }
</style>
