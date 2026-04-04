<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth';
import superAdminApi from '../../network/modules/superadmin';
import { handleResponse, handleError } from '../../network/api/responseHandler.js';
import { useRouter } from 'vue-router';
import Lucide from '../../components/Base/Lucide';
import Button from '../../components/Base/Button';
import { Dialog } from '../../components/Base/Headless';
import LoadingIcon from '../../components/Base/LoadingIcon';
import Pagination from '../../components/Base/Pagination';
import toast from '../../stores/utility/toast';
import pan from '../../stores/pan';

const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useI18n();
// Prefer user_id, fallback to user.id if present
const superAdminId = computed<string | ''>(() => (authStore.getUserId as any) || (authStore.user as any)?.id || '');

const isLoading = ref(false);
const isDeleting = ref<string | null>(null);
const shopToDelete = ref<any>(null);
const showDeleteConfirm = ref(false);
const search = ref<string>('');
const limit = ref<number>(10);
const shops = ref<any[]>([]);
const pagination = ref<any>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
  links: [],
});

const getShopName = (shop: any) => {
  return (shop?.name || shop?.store_name || 'Unnamed Shop').toString();
};

const getShopEmail = (shop: any) => {
  return shop?.email || shop?.account?.email || '';
};

const getShopPhone = (shop: any) => {
  return shop?.phone || shop?.account?.phone || '';
};

const getShopAddress = (shop: any) => {
  return shop?.address || shop?.account?.address || shop?.full_address || shop?.location || shop?.city || '—';
};

const getCreatedDate = (shop: any) => {
  const raw = shop?.created_at || shop?.createdAt || shop?.joined_at || null;
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const getVatNumber = (shop: any) => {
  return shop?.vat_number || shop?.settings?.vat_number || '—';
};

const translatePaginationLabel = (label: string) => {
  if (!label) return label;
  // Translate "Next" and "Previous" while preserving HTML entities
  let translated = label;
  translated = translated.replace(/Next/gi, t('common.pagination.next'));
  translated = translated.replace(/Previous/gi, t('common.pagination.previous'));
  return translated;
};

const fetchShops = async (page: number = 1) => {
  if (!superAdminId.value) {
    console.warn('[SuperAdmin] Missing superAdminId; cannot fetch shops.');
    return;
  }
  try {
    isLoading.value = true;
    const response = await superAdminApi.listShops({
      superAdminId: superAdminId.value,
      search: search.value,
      limit: limit.value,
      page: page,
    });
    const result = handleResponse(response);
    if (result.success) {
      // Accept common envelope shapes
      const data = Array.isArray(result.data?.data) ? result.data.data : (result.data?.shops || result.data || []);
      shops.value = Array.isArray(data) ? data : [];
      
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
      console.error('[SuperAdmin] Failed to load shops:', result);
      toast().fry(pan.error(result.message || t('superadmin.shops.failedToLoad')));
    }
  } catch (e) {
    handleError(e);
    toast().fry(pan.error(t('superadmin.shops.errorLoading')));
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = (shop: any) => {
  shopToDelete.value = shop;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (!shopToDelete.value || !superAdminId.value) {
    return;
  }

  const shopId = shopToDelete.value.id || shopToDelete.value.uuid;
  isDeleting.value = shopId;

  try {
    const response = await superAdminApi.deleteShop({
      id: shopId,
      superAdminId: superAdminId.value,
    });
    const result = handleResponse(response);

    if (result.success) {
      toast().fry(pan.success(t('superadmin.shops.shopDeletedSuccess')));
      showDeleteConfirm.value = false;
      shopToDelete.value = null;
      await fetchShops(); // Refresh list
    } else {
      toast().fry(pan.error(result.message || t('superadmin.shops.failedToDelete')));
    }
  } catch (error) {
    handleError(error);
    toast().fry(pan.error(t('superadmin.shops.failedToDelete')));
  } finally {
    isDeleting.value = null;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  shopToDelete.value = null;
};

const handleSearch = () => {
  pagination.value.current_page = 1; // Reset to first page on search
  fetchShops(1);
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page && page !== pagination.value.current_page) {
    fetchShops(page);
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

onMounted(() => {
  fetchShops(1);
});
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="grid grid-cols-2 items-center gap-4">
      <h2 class="text-lg font-medium" :class="locale === 'ar' ? 'text-right col-start-1' : 'text-left col-start-1'">{{ $t('superadmin.shops.title') }}</h2>
      <Button variant="primary" @click="router.push({ name: 'SuperAdminCreateShop' })" class="flex items-center gap-2 w-auto justify-self-end" :class="locale === 'ar' ? 'col-start-2' : 'col-start-2'">
        <Lucide icon="Plus" class="w-4 h-4" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
        {{ $t('superadmin.shops.createShop') }}
      </Button>
    </div>

    <!-- Search Bar -->
    <div class="box p-5 mt-5">
      <div class="flex items-center gap-3" :class="{ 'flex-row-reverse': locale === 'ar' }">
        <input
          v-model="search"
          type="text"
          class="form-control !box flex-1"
          :placeholder="$t('superadmin.shops.searchPlaceholder')"
          @keyup.enter="handleSearch"
        />
        <Button variant="primary" @click="handleSearch">
          <Lucide icon="Search" class="w-4 h-4" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
          {{ $t('superadmin.shops.search') }}
        </Button>
        <Button v-if="search" variant="secondary" @click="search = ''; handleSearch()">
          <Lucide icon="X" class="w-4 h-4" :class="locale === 'ar' ? 'ml-2' : 'mr-2'" />
          {{ $t('superadmin.shops.clear') }}
        </Button>
      </div>
    </div>

    <!-- Shops Table -->
    <div class="box p-5 mt-5 relative">
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex justify-center items-center z-10 rounded-lg">
        <LoadingIcon icon="oval" class="w-8 h-8" />
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && shops.length === 0" class="text-center py-12 text-gray-500">
        <Lucide icon="Store" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p class="text-lg font-medium">{{ $t('superadmin.shops.noShopsFound') }}</p>
        <p class="text-sm mt-1">{{ $t('superadmin.shops.createFirstShop') }}</p>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.shops.shopName') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.shops.email') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.shops.phone') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.shops.address') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.shops.vatNumber') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold">{{ $t('superadmin.shops.createdDate') }}</th>
              <th scope="col" class="px-6 py-3 font-semibold text-center">{{ $t('superadmin.shops.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="shop in shops"
              :key="shop.id || shop.uuid"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {{ getShopName(shop) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <Lucide icon="Mail" class="w-4 h-4 text-gray-400" />
                  <span>{{ getShopEmail(shop) || '—' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <Lucide icon="Phone" class="w-4 h-4 text-emerald-600" />
                  <span>{{ getShopPhone(shop) || '—' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="max-w-xs truncate block">{{ getShopAddress(shop) }}</span>
              </td>
              <td class="px-6 py-4">
                {{ getVatNumber(shop) }}
              </td>
              <td class="px-6 py-4">
                {{ getCreatedDate(shop) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <router-link
                    :to="{ name: 'SuperAdminEditShop', params: { id: shop.id || shop.uuid } }"
                  >
                    <Button variant="outline-secondary" class="px-3 py-1.5 flex items-center gap-2">
                      <Lucide icon="Edit" class="w-4 h-4" />
                      {{ $t('superadmin.shops.edit') }}
                    </Button>
                  </router-link>
                  <Button
                    variant="danger"
                    class="px-3 py-1.5 flex items-center gap-2"
                    :disabled="isDeleting === (shop.id || shop.uuid)"
                    @click="handleDelete(shop)"
                  >
                    <Lucide icon="Trash2" class="w-4 h-4" />
                    <span v-if="isDeleting === (shop.id || shop.uuid)">{{ $t('common.deleting') }}</span>
                    <span v-else>{{ $t('superadmin.shops.delete') }}</span>
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
          <h3 class="mt-5 text-3xl font-semibold text-gray-800">{{ $t('superadmin.shops.areYouSure') }}</h3>
          <p class="mt-2 text-slate-500">{{ $t('superadmin.shops.deleteMessage') }}</p>
          <div class="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" @click="cancelDelete" :disabled="!!isDeleting">
              {{ $t('superadmin.shops.cancel') }}
            </Button>
            <Button
              variant="danger"
              @click="confirmDelete"
              :disabled="!!isDeleting"
            >
              <LoadingIcon v-if="isDeleting" icon="oval" class="w-4 h-4 mr-2" />
              {{ isDeleting ? $t('common.deleting') : $t('superadmin.shops.delete') }}
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

/* Ensure table is responsive */
@media (max-width: 768px) {
  .overflow-x-auto {
    overflow-x: scroll;
  }
}
</style>
