<script setup lang="ts">
import {ref, reactive, onMounted, computed, watch} from "vue";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import {handleResponse} from "../../../network/api/responseHandler.js";
import httpClient from '@/network/api/httpClient';
import Button from "@/components/Base/Button";
import {RouterLink} from "vue-router";
import Lucide from "@/components/Base/Lucide";
import axios from "axios";
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isloading: any = ref(true);
const hasAdminPower = computed(() => {
  const arr = [
    authStore.user?.role,
    ...(Array.isArray(authStore.user?.roles) ? authStore.user.roles : []),
  ]
    .filter(Boolean)
    .map((r: any) => String(r).toLowerCase());
  return arr.includes('admin') || arr.includes('superadmin');
});
const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "-id",
  sort_direction: "desc",
  paginate: true,
  column_filters: [],
});

const rows: any = ref(null);
const totalRows = ref(0);
const {t, locale: i18nLocale} = useI18n();

const cols: any = ref([
  {field: 'count_name', title: t('stock-adjustment.adjustmentName'), width: '350px'},
  {field: 'count_date', title: t('stock-adjustment.date'), width: '200px'},
  {field: 'approval_status', title: t('stock-adjustment.status'), width: '140px'},
  {field: 'notes', title: t('stock-adjustment.notes'), cellClass: 'line-clamp-3 break-words overflow-hidden max-h-[4.5rem]'},
  {field: 'actions', title: t('stock-adjustment.actions'), sort: false},
]);

// Function to update column titles based on locale
const updateColumnTitles = () => {
  cols.value = [
    {field: 'count_name', title: t('stock-adjustment.adjustmentName'), width: '350px'},
    {field: 'count_date', title: t('stock-adjustment.date'), width: '200px'},
    {field: 'approval_status', title: t('stock-adjustment.status'), width: '140px'},
    {field: 'notes', title: t('stock-adjustment.notes'), cellClass: 'line-clamp-3 break-words overflow-hidden max-h-[4.5rem]'},
    {field: 'actions', title: t('stock-adjustment.actions'), sort: false},
  ];
};

let controller: any;
let timer: any;
const filterUsers = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    getAdjustments();
  }, 300);
};
// Fetch data from the server
const getAdjustments = async () => {
  try {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;
    isloading.value = true;
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/stock-adjustments", {
      params: { ...params, user_id: USER_ID, scope: hasAdminPower.value ? 'all' : undefined, signal: signal },
    });
    const result = response.data;
     
    rows.value = result.data;
    totalRows.value = result.meta.total;
  } catch (error) {
    console.error("Error fetching  Adjustments:", error);
  } finally {
    isloading.value = false;
  }
};
const changeServer = (data: any) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`,
      params.sort_direction = data.sort_direction;
  params.search = data.search;

  if (data.change_type === 'search') {
    filterUsers();
  } else {
    getAdjustments();
  }
};
// Initial data load
const locale = ref('en'); // Default locale 

// Watch for locale changes
watch(i18nLocale, () => {
  locale.value = i18nLocale.value;
  updateColumnTitles();
});

onMounted(()=>{
  locale.value = localStorage.getItem('locale') || 'en';
  updateColumnTitles();
  getAdjustments()
});

const ability = useAbility();

const approveAdjustment = async (id: string) => {
  try {
    isloading.value = true;
    await httpClient.post(`${import.meta.env.VITE_PUBLIC_API_URL}/stock-adjustments/${id}/approve?user_id=${USER_ID}`);
    await getAdjustments();
  } catch (e) {
    console.error(e);
  } finally {
    isloading.value = false;
  }
};
const rejectAdjustment = async (id: string) => {
  try {
    isloading.value = true;
    await httpClient.post(`${import.meta.env.VITE_PUBLIC_API_URL}/stock-adjustments/${id}/reject?user_id=${USER_ID}`);
    await getAdjustments();
  } catch (e) {
    console.error(e);
  } finally {
    isloading.value = false;
  }
};
</script>

<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('stock-adjustment.stockAdjustments') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8" >
    <div class="col-span-12 flex justify-between intro-y">
      <div>
        <RouterLink v-if="ability.can('create', 'stockAdjustment')" to="/inventory/stock-adjustment/create">
          <Button variant="primary" class="mr-2 shadow-md">
            {{ $t('stock-adjustment.addStockAdjustment') }}
          </Button>
        </RouterLink>
      </div>
      <div class="flex items-center mt-3   sm:mt-0" :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
        <div class="relative w-56 text-slate-500 mr-3">
          <input v-model="params.search" type="text" class="w-56 pr-10 box" :placeholder="$t('stock-adjustment.search')"/> 
        </div>
        <RouterLink to="/inventory/stock-adjustment/import">
          <Button variant="outline-primary" class="flex items-center">
            <Lucide icon="Download" class="hidden w-4 h-4  sm:block" :class="{ 'ml-3': locale === 'ar', 'mr-2': locale !== 'ar' }" />
            {{ $t('product.importExcelButton') }}
          </Button>
        </RouterLink>
      </div>
    </div>

    <!-- BEGIN: Data List -->
    <div class="col-span-12" :class="{ 'ar-all-stock-ajustment all-data-table-ar': locale === 'ar', '': locale !== 'ar' }">
      <vue3-datatable
          :rows="rows"
          :columns="cols"
          :loading="isloading"
          :totalRows="totalRows"
          :isServerMode="true"
          :pageSize="params.limit"
          :sortable="true"
          :sort="params.sort"
          :sortDirection="params.sort_direction"
          :search="params.search"
          @change="changeServer"
      >
        <template #approval_status="data">
          <span
            class="px-2 py-1 rounded text-xs"
            :class="{
              'bg-yellow-100 text-yellow-700': data.value.approval_status === 'Pending',
              'bg-green-100 text-green-700': data.value.approval_status === 'Approved',
              'bg-red-100 text-red-700': data.value.approval_status === 'Rejected',
            }"
          >
            {{ data.value.approval_status || 'Pending' }}
          </span>
        </template>
        <template #actions="data">
          <div class="flex gap-2.5">
            <RouterLink v-if="ability.can('list', 'stockAdjustment')" :to="`/inventory/stock-adjustment/${data.value.id}`"  class="bg-[#96837f33] p-2 rounded-md cursor-pointer" >
              <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
            </RouterLink>
            <template v-if="hasAdminPower && (data.value.approval_status === 'Pending' || !data.value.approval_status)">
              <button class="bg-green-100 p-2 rounded-md" @click="approveAdjustment(data.value.id)">
                <Lucide icon="Check" class="w-4 h-4 text-green-600" />
              </button>
              <button class="bg-red-100 p-2 rounded-md" @click="rejectAdjustment(data.value.id)">
                <Lucide icon="X" class="w-4 h-4 text-red-600" />
              </button>
            </template>
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>
</template>


<style scoped>
</style>