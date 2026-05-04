<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Lucide from '../../../components/Base/Lucide';
import Button from '../../../components/Base/Button';
import { Dialog } from '../../../components/Base/Headless';
import LoadingIcon from '../../../components/Base/LoadingIcon';
import Pagination from '../../../components/Base/Pagination';
import toast from '../../../stores/utility/toast';
import pan from '../../../stores/pan';
import packagesApi from '../../../network/modules/packages';
import { handleResponse, handleError } from '../../../network/api/responseHandler.js';

const router = useRouter();

const isLoading = ref(false);
const isDeleting = ref<string | null>(null);
const packageToDelete = ref<any>(null);
const showDeleteConfirm = ref(false);
const search = ref('');
const limit = ref(10);
const packages = ref<any[]>([]);
const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0, links: [] as any[] });

const fetchPackages = async (page = 1) => {
  isLoading.value = true;
  try {
    const res = await packagesApi.listPackages({ search: search.value, limit: limit.value, page });
    const result = handleResponse(res);
    if (result.success) {
      const raw = result.data;
      packages.value = Array.isArray(raw?.data) ? raw.data : [];
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
      toast().fry(pan.error(result.message || 'Failed to load packages.'));
    }
  } catch (e) {
    handleError(e);
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = (pkg: any) => { packageToDelete.value = pkg; showDeleteConfirm.value = true; };

const confirmDelete = async () => {
  if (!packageToDelete.value) return;
  const id = packageToDelete.value.id;
  isDeleting.value = id;
  try {
    const res = await packagesApi.deletePackage({ id });
    const result = handleResponse(res);
    if (result.success) {
      toast().fry(pan.success('Package deleted successfully.'));
      showDeleteConfirm.value = false;
      packageToDelete.value = null;
      await fetchPackages();
    } else {
      toast().fry(pan.error(result.message || 'Failed to delete package.'));
    }
  } catch (e) {
    handleError(e);
  } finally {
    isDeleting.value = null;
  }
};

const handleSearch = () => { pagination.value.current_page = 1; fetchPackages(1); };

const getPageNumber = (url: string | null) => {
  if (!url) return null;
  const m = url.match(/[?&]page=(\d+)/);
  return m ? parseInt(m[1]) : null;
};

const handlePaginationClick = (link: any) => {
  if (!link.url || link.active || link.label === '...') return;
  const page = getPageNumber(link.url);
  if (page) fetchPackages(page);
};

onMounted(() => fetchPackages(1));
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-medium">Packages</h2>
      <Button variant="primary" class="flex items-center gap-2" @click="router.push({ name: 'ProductOwnerCreatePackage' })">
        <Lucide icon="Plus" class="w-4 h-4" />
        Create Package
      </Button>
    </div>

    <!-- Search -->
    <div class="box p-5 mb-5">
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="text"
          class="form-control !box flex-1"
          placeholder="Search packages…"
          @keyup.enter="handleSearch"
        />
        <Button variant="primary" @click="handleSearch">
          <Lucide icon="Search" class="w-4 h-4 mr-2" />Search
        </Button>
        <Button v-if="search" variant="secondary" @click="search = ''; handleSearch()">
          <Lucide icon="X" class="w-4 h-4 mr-2" />Clear
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="box p-5 relative">
      <div v-if="isLoading" class="absolute inset-0 bg-white/80 flex justify-center items-center z-10 rounded-lg">
        <LoadingIcon icon="oval" class="w-8 h-8" />
      </div>

      <div v-if="!isLoading && packages.length === 0" class="text-center py-12 text-gray-500">
        <Lucide icon="Package" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p class="text-lg font-medium">No packages found.</p>
        <p class="text-sm mt-1">Create your first subscription package.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-6 py-3">Name</th>
              <th class="px-6 py-3">Price</th>
              <th class="px-6 py-3">Duration</th>
              <th class="px-6 py-3">Max Shops</th>
              <th class="px-6 py-3">Modules</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pkg in packages"
              :key="pkg.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-6 py-4 font-medium">
                {{ pkg.name }}
                <p class="text-xs text-slate-400 font-normal">{{ pkg.description }}</p>
              </td>
              <td class="px-6 py-4 font-semibold">€{{ pkg.price }}</td>
              <td class="px-6 py-4">{{ pkg.duration_days }}d / {{ pkg.duration_type }}</td>
              <td class="px-6 py-4">{{ pkg.max_shops ?? 1 }}</td>
              <td class="px-6 py-4">
                <div v-if="pkg.allowed_modules && pkg.allowed_modules.length" class="flex flex-wrap gap-1">
                  <span
                    v-for="mod in pkg.allowed_modules"
                    :key="mod"
                    class="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {{ mod }}
                  </span>
                </div>
                <span v-else class="text-slate-400 text-xs">All modules</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ pkg.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <Button
                    variant="outline-secondary"
                    class="px-3 py-1.5 flex items-center gap-1 text-xs"
                    @click="router.push({ name: 'ProductOwnerEditPackage', params: { id: pkg.id } })"
                  >
                    <Lucide icon="Edit" class="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    class="px-3 py-1.5 flex items-center gap-1 text-xs"
                    :disabled="isDeleting === pkg.id"
                    @click="handleDelete(pkg)"
                  >
                    <LoadingIcon v-if="isDeleting === pkg.id" icon="oval" class="w-3 h-3" />
                    <Lucide v-else icon="Trash2" class="w-3 h-3" />
                    Delete
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

    <!-- Delete Confirmation -->
    <Dialog :open="showDeleteConfirm" @close="showDeleteConfirm = false; packageToDelete = null">
      <Dialog.Panel>
        <div class="p-5 text-center">
          <div class="w-16 h-16 rounded-full border-2 border-red-500 bg-white flex items-center justify-center mx-auto mt-3">
            <Lucide icon="AlertTriangle" class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="mt-5 text-2xl font-semibold">Delete Package?</h3>
          <p class="mt-2 text-slate-500">
            This will permanently delete <strong>{{ packageToDelete?.name }}</strong>.
            Packages with active subscriptions cannot be deleted.
          </p>
          <div class="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" @click="showDeleteConfirm = false; packageToDelete = null" :disabled="!!isDeleting">
              Cancel
            </Button>
            <Button variant="danger" @click="confirmDelete" :disabled="!!isDeleting">
              <LoadingIcon v-if="isDeleting" icon="oval" class="w-4 h-4 mr-2" />
              {{ isDeleting ? 'Deleting…' : 'Delete' }}
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  </div>
</template>

<style scoped>
.form-control { border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 0.5rem 0.75rem; }
</style>
