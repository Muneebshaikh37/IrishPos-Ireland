<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { FormInput } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import Lucide from "@/components/Base/Lucide";
import axios from "axios";
import { handleError, handleResponse } from "@/network/api/responseHandler";
import httpClient from '@/network/api/httpClient';
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const hasAdminPower = computed(() => {
  const arr = [
    authStore.user?.role,
    ...(Array.isArray(authStore.user?.roles) ? authStore.user.roles : []),
  ]
    .filter(Boolean)
    .map((r: any) => String(r).toLowerCase());
  return arr.includes('admin') || arr.includes('superadmin');
});
const loading = ref(false);
const totalRows = ref(0);
const rows = ref([]);
const openRegister = ref(null); 
const params = reactive({
	page: 1,
	limit: 10,
	search: "",
	sort: "-id",
	sort_direction: "desc",
	paginate: true,
	column_filters: [],
});
const { t, locale: i18nLocale } = useI18n();

// Columns for the table
const columns = ref([ 
    { field: "count_name", title: t('stock-count.countName')},
	{ field: "count_date", title: t('stock-count.countDate'), width: "200px"},
  { field: "approval_status", title: t('stock-count.status'), width: "140px"},
	{ field: "notes", title: t('stock-count.notes')},
	{ field: "actions", title: t('stock-count.actions'), sort: false , with:" 25%"},
]);

// Function to update column titles based on locale
const updateColumnTitles = () => {
  columns.value = [ 
    { field: "count_name", title: t('stock-count.countName')},
    { field: "count_date", title: t('stock-count.countDate'), width: "200px"},
    { field: "approval_status", title: t('stock-count.status'), width: "140px"},
    { field: "notes", title: t('stock-count.notes')},
    { field: "actions", title: t('stock-count.actions'), sort: false , with:" 25%"},
  ];
};

// Watch for locale changes
watch(i18nLocale, () => {
  updateColumnTitles();
}); 
let controller: any;
let timer: any;
const filterUsers = () => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		fetchInvoices();
	}, 300);
}; 
// Fetch data from the server
const fetchInvoices = async () => { 
	try { 
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		const signal = controller.signal;
		loading.value = true; 
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/stock-counts", {
			params: { ...params, user_id: USER_ID, scope: hasAdminPower.value ? 'all' : undefined, signal: signal },
		});
		const result = response.data;
		 
	    rows.value = result.data;
		  totalRows.value = result.meta.total;
		  openRegister.value = result.meta.open_register_id || "";
	} catch (error) {
		console.error("Error fetching Stock Count:", error);
	} finally {
		loading.value = false;
	}
}; 
const changeServer = (data: any) => {
	params.page = data.current_page;
	params.limit = data.pagesize;
	params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`
	params.sort_direction = data.sort_direction;
	params.search = data.search;

	if (data.change_type === 'search') {
		filterUsers();
	} else {
		fetchInvoices();
	}
}; 
// Initial data load
onMounted(() => {
  updateColumnTitles();
  fetchInvoices();
});
const ability = useAbility();

const approveCount = async (id: string) => {
  try {
    loading.value = true;
    await httpClient.post(`stock-counts/${id}/approve?user_id=${USER_ID}`);
    await fetchInvoices();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
const rejectCount = async (id: string) => {
  try {
    loading.value = true;
    await httpClient.post(`stock-counts/${id}/reject?user_id=${USER_ID}`);
    await fetchInvoices();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
	<h2 class="mt-10 text-lg font-semibold intro-y"> {{ $t('stock-count.heading') }}</h2>
	<div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
		<div class="col-span-12 flex justify-between intro-y">
			<div>
				<RouterLink v-if="ability.can('create', 'stockCount')" to="/inventory/stock-count/create">
					<Button variant="primary" class="mr-2 shadow-md">
            {{ $t('stock-count.createNew') }}
					</Button>
				</RouterLink> 
			</div>
			<div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
				<div class="relative w-56 text-slate-500 mr-3">
					<FormInput v-if="ability.can('list', 'stockCount')" v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('stock-count.searchPlaceholder')" />
					<Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
				</div>
				<RouterLink to="/inventory/stock-count/import">
          <Button variant="outline-primary" class="flex items-center gap-3">
            <Lucide icon="Download" class="hidden w-4 h-4  sm:block"   />
            {{ $t('product.importExcelButton') }}
          </Button>
        </RouterLink>
			</div>
		</div>
		<div class="col-span-12  ">
			<!-- Invoice Table -->
			<vue3-datatable :rows="rows" :columns="columns" :loading="loading" 
			:totalRows="totalRows" :isServerMode="true"
				:pageSize="params.limit" :sortable="true" :sort="params.sort"
				:sortDirection="params.sort_direction" :search="params.search" @change="changeServer">
				<template #count_name="data">
					<div class="flex items-center gap-4">
						<p>{{data.value.count_name}}</p>
						<span v-if="data.value.is_draft === 1" class="bg-yellow-100 text-yellow-800 text-xs font-medium me-2  px-2.5 py-1 rounded dark:bg-yellow-900 dark:text-yellow-300"> Draft</span>
					</div>
				</template>
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
						<RouterLink :to="`/inventory/stock-count/${data.value.id}`"  class="bg-[#96837f33] p-2 rounded-md cursor-pointer" >
							<Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
						</RouterLink>
						 <template v-if="data.value.is_draft === 1">
							<RouterLink :to="`/inventory/stock-count/${data.value.id}/edit`" class="bg-blue-100  p-2 rounded-md cursor-pointer">
							<Lucide icon="PencilLine" class="w-4 h-4 text-blue-500" />
						</RouterLink> 
						 </template> 
             <template v-if="hasAdminPower && (data.value.approval_status === 'Pending' || !data.value.approval_status)">
               <button class="bg-green-100 p-2 rounded-md" @click="approveCount(data.value.id)">
                 <Lucide icon="Check" class="w-4 h-4 text-green-600" />
               </button>
               <button class="bg-red-100 p-2 rounded-md" @click="rejectCount(data.value.id)">
                 <Lucide icon="X" class="w-4 h-4 text-red-600" />
               </button>
             </template>
					</div>
				</template> 
			</vue3-datatable>
		</div>
	</div> 
</template>

