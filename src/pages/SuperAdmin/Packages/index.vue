<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../../stores/auth';
import packagesApi from '../../../network/modules/packages';
import { handleResponse, handleError } from '../../../network/api/responseHandler.js';
import { useRouter } from 'vue-router';
import Lucide from '../../../components/Base/Lucide';
import Button from '../../../components/Base/Button';
import { Dialog } from '../../../components/Base/Headless';
import LoadingIcon from '../../../components/Base/LoadingIcon';
import Pagination from '../../../components/Base/Pagination';
import toast from '../../../stores/utility/toast';
import pan from '../../../stores/pan';
import { formatMoney } from '@/utils/currency';

const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useI18n();
const superAdminId = computed<string | ''>(() => (authStore.getUserId as any) || (authStore.user as any)?.id || '');

// Helper function to get localized package name
const getPackageName = (packageItem: any) => {
  if (!packageItem) return '—';
  const currentLocale = locale.value || 'en';
  if (currentLocale === 'ar' && packageItem.name_ar) {
    return packageItem.name_ar;
  }
  return packageItem.name_en || packageItem.name || '—';
};

// Helper function to get localized package description
const getPackageDescription = (packageItem: any) => {
  if (!packageItem) return '—';
  return packageItem.description_en || packageItem.description || '—';
};

const isLoading = ref(false);
const isDeleting = ref<string | null>(null);
const packageToDelete = ref<any>(null);
const showDeleteConfirm = ref(false);
const search = ref<string>('');
const limit = ref<number>(10);
const packages = ref<any[]>([]);
const pagination = ref<any>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
  links: [],
});

const formatPrice = (price: number) => {
  return formatMoney(price || 0);
};

const getDurationDisplay = (packageItem: any) => {
  const type = packageItem.duration_type || 'monthly';
  const days = packageItem.duration_days || 1;
  const typeMap: Record<string, string> = {
    daily: 'Day',
    weekly: 'Week',
    monthly: 'Month',
    annual: 'Year',
  };
  const typeLabel = typeMap[type] || 'Month';
  return `${days} ${typeLabel}${days > 1 ? 's' : ''}`;
};

const translatePaginationLabel = (label: string) => {
  if (!label) return label;
  // Translate "Next" and "Previous" while preserving HTML entities
  let translated = label;
  translated = translated.replace(/Next/gi, t('common.pagination.next'));
  translated = translated.replace(/Previous/gi, t('common.pagination.previous'));
  return translated;
};

const fetchPackages = async (page: number = 1) => {
  if (!superAdminId.value) {
    console.warn('[SuperAdmin] Missing superAdminId; cannot fetch packages.');
    return;
  }
  try {
    isLoading.value = true;
    const response = await packagesApi.listPackages({
      superAdminId: superAdminId.value,
      search: search.value,
      limit: limit.value,
      page: page,
    });
    const result = handleResponse(response);
    if (result.success) {
      const data = Array.isArray(result.data?.data) ? result.data.data : [];
      packages.value = data;

      // Parse pagination metadata
      if (result.data?.meta) {
        pagination.value = {
          current_page: result.data.meta.current_page || 1,
          last_page: result.data.meta.last_page || 1,
          per_page: result.data.meta.per_page || 10,
          total: result.data.meta.total || 0,
          from: result.data.meta.from || 0,
          to: result.data.meta.to || 0,
          links: result.data.meta.links || [],
        };
      }
    } else {
      console.error('[SuperAdmin] Failed to load packages:', result);
      toast().fry(pan.error(result.message || t('superadmin.packages.failedToLoad')));
    }
  } catch (e) {
    handleError(e);
    toast().fry(pan.error(t('superadmin.packages.errorLoading')));
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current_page = 1;
  fetchPackages(1);
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page && page !== pagination.value.current_page) {
    fetchPackages(page);
  }
};

const getPageNumber = (url: string | null): number | null => {
  if (!url) return null;
  const match = url.match(/[?&]page=(\d+)/);
  return match ? parseInt(match[1]) : null;
};

const handlePaginationClick = (link: any) => {
  if (!link.url || link.active || link.label === '...') {
    return;
  }
  const pageNumber = getPageNumber(link.url);
  if (pageNumber) {
    goToPage(pageNumber);
  }
};

const handleDelete = (packageItem: any) => {
  packageToDelete.value = packageItem;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (!packageToDelete.value || !superAdminId.value) {
    return;
  }

  const packageId = packageToDelete.value.id;
  isDeleting.value = packageId;

  try {
    const response = await packagesApi.deletePackage({
      id: packageId,
      superAdminId: superAdminId.value,
    });
    const result = handleResponse(response);

    if (result.success) {
      toast().fry(pan.success(t('superadmin.packages.packageDeletedSuccess')));
      showDeleteConfirm.value = false;
      packageToDelete.value = null;
      await fetchPackages(pagination.value.current_page);
    } else {
      toast().fry(pan.error(result.message || t('superadmin.packages.failedToDelete')));
    }
  } catch (error) {
    handleError(error);
    toast().fry(pan.error(t('superadmin.packages.failedToDelete')));
  } finally {
    isDeleting.value = null;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  packageToDelete.value = null;
};

onMounted(() => {
  fetchPackages(1);
});
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="grid grid-cols-2 items-center gap-4">
      <h2 class="text-lg font-medium" :class="locale === 'ar' ? 'text-right col-start-1' : 'text-left col-start-1'">{{ $t('superadmin.packages.title') }}</h2>
      <Button variant="primary" @click="router.push({ name: 'SuperAdminCreatePackage' })" class="flex items-center gap-2 w-auto justify-self-end" :class="locale === 'ar' ? 'col-start-2' : 'col-start-2'">
        <Lucide icon="Plus" class="w-4 h-4" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
        {{ $t('superadmin.packages.createPackage') }}
      </Button>
    </div>

    <!-- Search Bar -->
    <div class="box p-5 mt-5">
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="text"
          class="form-control !box flex-1"
          :placeholder="$t('superadmin.packages.searchPlaceholder')"
          @keyup.enter="handleSearch"
        />
        <Button variant="primary" @click="handleSearch">
          <Lucide icon="Search" class="w-4 h-4 mr-2" />
          {{ $t('superadmin.packages.search') }}
        </Button>
        <Button v-if="search" variant="secondary" @click="search = ''; handleSearch()">
          <Lucide icon="X" class="w-4 h-4 mr-2" />
          {{ $t('superadmin.packages.clear') }}
        </Button>
      </div>
    </div>

    <!-- Packages Table -->
    <div class="box p-5 mt-5 relative">
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex justify-center items-center z-10 rounded-lg">
        <LoadingIcon icon="oval" class="w-8 h-8" />
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && packages.length === 0" class="text-center py-12 text-gray-500">
        <Lucide icon="Package" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p class="text-lg font-medium">{{ $t('superadmin.packages.noPackagesFound') }}</p>
        <p class="text-sm mt-1">{{ $t('superadmin.packages.createFirstPackage') }}</p>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.packages.packageName') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.packages.description') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.packages.price') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.packages.duration') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.packages.status') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.packages.createdDate') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold text-center">{{ $t('superadmin.packages.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="packageItem in packages"
              :key="packageItem.id"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {{ getPackageName(packageItem) }}
              </td>
              <td class="px-6 py-4">
                <span class="max-w-xs truncate block">{{ getPackageDescription(packageItem) }}</span>
              </td>
              <td class="px-6 py-4 font-semibold">
                {{ formatPrice(packageItem.price) }}
              </td>
              <td class="px-6 py-4">
                {{ getDurationDisplay(packageItem) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    packageItem.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ packageItem.is_active ? $t('superadmin.packages.active') : $t('superadmin.packages.inactive') }}
                </span>
              </td>
              <td class="px-6 py-4">
                {{ new Date(packageItem.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <router-link
                    :to="{ name: 'SuperAdminEditPackage', params: { id: packageItem.id } }"
                  >
                    <Button variant="outline-secondary" class="px-3 py-1.5 flex items-center gap-2">
                      <Lucide icon="Edit" class="w-4 h-4" />
                      {{ $t('superadmin.packages.edit') }}
                    </Button>
                  </router-link>
                  <Button
                    variant="danger"
                    class="px-3 py-1.5 flex items-center gap-2"
                    :disabled="isDeleting === packageItem.id"
                    @click="handleDelete(packageItem)"
                  >
                    <Lucide icon="Trash2" class="w-4 h-4" />
                    <span v-if="isDeleting === packageItem.id">{{ $t('common.deleting') }}</span>
                    <span v-else>{{ $t('superadmin.packages.delete') }}</span>
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0 && pagination.last_page > 1" class="flex flex-col sm:flex-row items-center justify-between mt-5 pt-5 border-t border-slate-200/60">
        <div class="text-sm text-gray-700 dark:text-gray-400 mb-3 sm:mb-0">
          {{ $t('common.pagination.showing') }} <span class="font-medium">{{ pagination.from }}</span> {{ $t('common.pagination.to') }} <span class="font-medium">{{ pagination.to }}</span> {{ $t('common.pagination.of') }} <span class="font-medium">{{ pagination.total }}</span> {{ $t('common.pagination.results') }}
        </div>
        <Pagination>
          <Pagination.Link
            v-for="(link, index) in pagination.links"
            :key="`${link.label}-${index}`"
            :active="link.active"
            :class="{
              'cursor-not-allowed opacity-50 pointer-events-none': !link.url || link.label === '...',
              'cursor-pointer': link.url && !link.active && link.label !== '...'
            }"
            @click.prevent="handlePaginationClick(link)"
          >
            <span v-html="translatePaginationLabel(link.label)"></span>
          </Pagination.Link>
        </Pagination>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteConfirm" @close="cancelDelete">
      <Dialog.Panel>
        <div class="p-5 text-center">
          <div class="w-16 h-16 rounded-full border-2 border-red-500 bg-white flex items-center justify-center mx-auto mt-3">
            <Lucide icon="X" class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="mt-5 text-3xl font-semibold text-gray-800">{{ $t('superadmin.packages.areYouSure') }}</h3>
          <p class="mt-2 text-slate-500">{{ $t('superadmin.packages.deleteMessage') }}</p>
          <div class="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" @click="cancelDelete" :disabled="!!isDeleting">
              {{ $t('superadmin.packages.cancel') }}
            </Button>
            <Button
              variant="danger"
              @click="confirmDelete"
              :disabled="!!isDeleting"
            >
              <LoadingIcon v-if="isDeleting" icon="oval" class="w-4 h-4 mr-2" />
              {{ isDeleting ? $t('common.deleting') : $t('superadmin.packages.delete') }}
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  </div>
</template>

<style scoped>
.form-control {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}

@media (max-width: 768px) {
  .overflow-x-auto {
    overflow-x: scroll;
  }
}
</style>
