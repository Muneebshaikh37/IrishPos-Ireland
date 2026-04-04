<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
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
const props = defineProps({
	start_date: {
		type: String,
		required: true,
	},
	end_date: {
		type: String,
		required: true,
	},
	fullHeight: {
		type: Boolean,
		default: true,
	}
});
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const loading = ref(false);
const totalRows = ref(0);
const rows = ref([]);
const openRegister = ref(null); 
const params = reactive({
	page: 1,
	limit: 10,
	search: "",
	// sort: " ",
	// sort_direction: "desc",
	paginate: true,
	column_filters: [],
});
const {t} = useI18n();

// Columns for the table
const columns = [ 
    { field: "name_en", title: t('stock-count.countName')},
	{ field: "count_date", title: t('stock-count.countDate')},
	{ field: "notes", title: t('stock-count.notes')},
	{ field: "actions", title: t('stock-count.actions'), sort: false , with:" 25%"},
]; 
const dummy = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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
		// const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/stock-counts", {
		// 	params: { ...params, user_id: USER_ID, signal: signal },
		// });
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/v1/dashboard/stock-count", {
			params: { ...params, user_id: USER_ID, signal: signal },
		});
		const result = response.data;
		 
	    rows.value = result.data;
		  totalRows.value = result.meta.total;
		  openRegister.value = result.meta.open_register_id || "";
		  // Debug: Log first row to check available fields
		  if (result.data && result.data.length > 0) {
			  console.log("Stock Count Report - First row data:", result.data[0]);
			  console.log("Stock Count Report - Available ID fields:", {
				  id: result.data[0].id,
				  stock_count_id: result.data[0].stock_count_id,
				  uuid: result.data[0].uuid,
				  count_id: result.data[0].count_id,
				  stock_count_uuid: result.data[0].stock_count_uuid,
				  allKeys: Object.keys(result.data[0])
			  });
		  }
	} catch (error) {
		console.error("Error fetching Stock Count:", error);
	} finally {
		loading.value = false;
	}
}; 
const ExportProduct = async() =>{
  try { 
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/v1/reporting/stock-count-report/export?user_id=${USER_ID}&search=${params.search}`, { responseType: 'blob'});
    if (response.status === 200) {
      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a temporary download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'Stock Count Level Report.xlsx'); // Set file name
      document.body.appendChild(link);
      link.click(); 
      // Cleanup: Remove the link after download
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }   
	} catch (error) {
		console.error("Error export file:", error);
	} finally {
		 
	}

}
// Helper function to get stock count ID from various possible field names
const getStockCountId = (row: any) => {
	if (!row) {
		console.warn('getStockCountId: row is null or undefined');
		return '';
	}
	// Try different possible field names - check all common variations
	const id = row.id || row.stock_count_id || row.uuid || row.count_id || row.stock_count_uuid || row.stock_count?.id || row.stock_count_id || '';
	
	// Debug: log if ID is not found
	if (!id) {
		console.warn('Stock Count ID not found. Row data:', row);
		console.warn('Available fields:', Object.keys(row));
	} else {
		console.log('Stock Count ID found:', id, 'from row:', row);
	}
	return id;
};

const changeServer = (data: any) => {
	params.page = data.current_page;
	params.limit = data.pagesize;
	// params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`
	// params.sort_direction = data.sort_direction;
	params.search = data.search;

	if (data.change_type === 'search') {
		filterUsers();
	} else {
		fetchInvoices();
	}
}; 
// Initial data load
const locale = ref('en'); 

onMounted(()=>{
     
	fetchInvoices()
	locale.value = localStorage.getItem('locale') || 'en';
}
);
const ability = useAbility();

</script>
<template>
  <div class="p-5 box" :class="{ 'h-full': fullHeight }">
    <div class="flex justify-between  mb-2">
      <div>
        <!-- <h4 class="text-lg font-semibold text-gray-800">{{ $t('dashboard.stockLevels') }}</h4> -->
        <h4 class="text-lg font-semibold text-gray-800">{{ $t('reporting.stockCountReport') }}</h4>
      </div>
      <div class="flex items-center sm:mt-0" :class="{ 'mr-auto': locale.value === 'ar', 'ml-auto': locale.value !== 'ar' }">
        <div class="relative w-56 text-slate-500  ">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('common.search')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
		<Button variant="primary" @click="ExportProduct()" class="flex items-center ml-3" :class="{ 'mr-3': locale.value === 'ar', 'ml-3': locale.value !== 'ar' }">
          <Lucide icon="FileText" class="hidden w-4 h-4  sm:block" :class="{ 'ml-3': locale.value === 'ar', 'mr-2': locale.value !== 'ar' }" />
          {{ $t('product.exportExcelButton') }}
        </Button>
      </div>
    </div>
     
    <div v-if="loading">
      <div class="mt-2">
        <div>
          <ul>
            <li
                class="flex justify-between py-2 mb-1.5   border animate-pulse h-10 bg-slate-200 border-[#EFF0F4] w-full rounded-lg"
                v-for="item in dummy" :key="item">
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else-if="rows?.length > 0">
      <!-- Invoice Table -->
      <vue3-datatable :rows="rows" :columns="columns" :loading="loading" :totalRows="totalRows" :isServerMode="true"
                      :pageSize="params.limit" :sortable="true" :sort="params.sort"
                      :sortDirection="params.sort_direction" :search="params.search" @change="changeServer">

        <template #actions="data">
          <div class="flex gap-2.5">
            <RouterLink 
              :to="`/inventory/stock-count/${getStockCountId(data.value)}`" 
              class="bg-[#96837f33] p-2 rounded-md cursor-pointer">
              <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
            </RouterLink>




          </div>
        </template>
      </vue3-datatable>
    </div>
    <!-- <div v-else>
      <img :src="stockNotFound" class="w-[140px] mx-auto">
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{ $t('dashboard.noDataAvailable') }}</h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">{{ $t('dashboard.noDataDescription') }}</p>
      <div class="flex justify-center">
        <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
                @click="fetchInvoices()">
          <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> {{ $t('dashboard.refreshNow') }}
        </Button>
      </div>
    </div> -->
  </div>
</template>

