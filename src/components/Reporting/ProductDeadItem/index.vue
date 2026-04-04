<script setup lang="ts">
import * as XLSX from 'xlsx';
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
const total_rows = ref(0);
const rows = ref([]);
const openRegister = ref(null); 
const params = reactive({
  current_page: 1,
  pagesize: 10,
  search: '',
  column_filters: [],
  sort_column: 'id',
  sort_direction: 'asc',
});
const {t, locale: i18nLocale} = useI18n();

// Columns for the table
const columns = ref([
	{ field: "name_en", title: t('dashboard.productName') },
	{ field: "initial_quantity", title: t('dashboard.quantity') },
	{ field: "actions", title: t('dashboard.actions'), sort: false },
]);

// Function to update column titles based on locale
const updateColumnTitles = () => {
  columns.value = [
    { field: "name_en", title: t('dashboard.productName') },
    { field: "initial_quantity", title: t('dashboard.quantity') },
    { field: "actions", title: t('dashboard.actions'), sort: false },
  ];
};

// Function to update pagination text
const updatePaginationText = () => {
  setTimeout(() => {
    const paginationElements = document.querySelectorAll('.dt-pagination-left');
    paginationElements.forEach((el: any) => {
      if (el.textContent && el.textContent.includes('Showing')) {
        const match = el.textContent.match(/Showing (\d+) to (\d+) of (\d+) entries/);
        if (match) {
          const [, start, end, total] = match;
          el.textContent = `${t('common.pagination.showing')} ${start} ${t('common.pagination.to')} ${end} ${t('common.pagination.of')} ${total} ${t('common.pagination.entries')}`;
        }
      }
    });
  }, 100);
};

// Watch for locale changes
watch(i18nLocale, () => {
  locale.value = i18nLocale.value;
  updateColumnTitles();
  updatePaginationText();
});
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
// const fetchInvoices = async () => { 
// 	try { 
// 		if (controller) {
// 			controller.abort();
// 		}
// 		controller = new AbortController();
// 		const signal = controller.signal;
// 		loading.value = true; 
		 
// 		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_REPORTING + "/v1/reporting/dead-items", {
// 			params: { ...params, user_id: USER_ID, signal: signal },
// 		});
// 		const result = response.data;
// 		console.log("eqrqerqer",result.data)
// 	    rows.value = result.data;
// 		  totalRows.value = result.meta.total;
// 		  openRegister.value = result.meta.open_register_id || "";
// 	} catch (error) {
// 		console.error("Error fetching Stock Count:", error);
// 	} finally {
// 		loading.value = false;
// 	}
// }; 
const paginate = (rows: any[], params: any) => {
	if (!Array.isArray(rows)) {
		console.error("Rows is not a valid array.");
		return {
			data: [],
			meta: {
				current_page: params.current_page || 1,
				per_page: params.pagesize || 10,
				first_page: 1,
				last_page: 1,
				total_pages: 1,
				total: 0,
			},
		};
	}
	const total = rows.length;
	const current_page = Math.max(1, params.current_page);
	const pagesize = Math.max(1, params.pagesize);
	const offset = (current_page - 1) * pagesize;
	const limit = offset + pagesize;
	const paginatedRows = rows.slice(offset, limit);
	const total_pages = Math.ceil(total / pagesize);

	return {
		data: paginatedRows,
		meta: {
			current_page,
			per_page: pagesize,
			first_page: 1,
			last_page: total_pages,
			total_pages,
			total,
		},
	};
};

 
const fetchInvoices = async () => {
	try {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController(); 
		loading.value = true;
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_REPORTING + "/v1/reporting/dead-items", {
  			params: { ...params, user_id: USER_ID,  },
 		});
		const result = response.data.data;

		let filteredData = result;
		if (params.search) {
			const searchTerm = params.search.toLowerCase();
			filteredData = filteredData.filter((item: any) =>
				`${item.category?.id} ${item.category?.name} ${item.sub_category?.name} ${item.sale_price} ${item.initial_quantity} ${item.name_ar} ${item.name_en}`
					.toLowerCase()
					.includes(searchTerm)
			);
		}
		if (params.sort_column) {
			filteredData.sort((a: any, b: any) => {
				if (params.sort_direction === "asc") {
					return a[params.sort_column] > b[params.sort_column] ? 1 : -1;
				}
				return a[params.sort_column] < b[params.sort_column] ? 1 : -1;
			});
		}
		const paginatedResult = paginate(filteredData, params);
		rows.value = paginatedResult.data.map(item => ({
			...item,
			id: item.id, 
		}));
		total_rows.value = paginatedResult.meta.total;
	} catch { }

	loading.value = false;
};


const datatable: any = ref(null);
const exportTable = (type: string) => {
  // Check if there are any rows to export
  if (!rows.value || rows.value.length === 0) {
    // Show a message or toast that there's no data to export
    return;
  }

  // Check if datatable is initialized before calling getSelectedRows
  let records = [];
  if (datatable.value && typeof datatable.value.getSelectedRows === 'function') {
    records = datatable.value.getSelectedRows();
  }
  
  if (!records?.length) {
    records = rows.value; // Use all rows if no specific rows are selected
  }

  // Double check we have records before proceeding
  if (!records || records.length === 0) {
    return;
  }

  const filename = t('reporting.productDeadItem');

  // Helper to extract value even for nested fields
  const getValue = (item: any, field: string) => {
    return field.split('.').reduce((acc: any, part: any) => acc && acc[part], item) || '';
  };

  // Filter columns excluding hidden and "Actions" for CSV/TXT
  const filteredColsForExport = columns.filter(
    (col: any) => !col.hide && col.title.toLowerCase() !== 'action'
  );

  if (type === 'csv' || type === 'txt') {
    const coldelimiter = ','; // Column delimiter
    const linedelimiter = '\n'; // Line delimiter
    let result = filteredColsForExport.map((col: any) => col.title).join(coldelimiter);
    result += linedelimiter;

    records.forEach((item: any) => {
      result += filteredColsForExport
        .map((col: any) => {
          const val = getValue(item, col.field); // Fetch nested value
          return val;
        })
        .join(coldelimiter);
      result += linedelimiter;
    });

    if (type === 'csv') {
      const data = 'data:application/csv;charset=utf-8,' + encodeURIComponent(result);
      const link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', filename + '.csv');
      link.click();
    }
  } else if (type === 'xlsx') {
    const data = records.map((item: any) =>
      columns 
        .filter((col: any) => !col.hide)
        .reduce((acc: any, col: any) => {
          acc[col.title] = getValue(item, col.field); // Handle nested fields
          return acc;
        }, {})
    );

    const ws = XLSX.utils.json_to_sheet(data); // Convert data to worksheet
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1'); // Append worksheet to workbook

    // Write the workbook to file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
};





const changeServer = (data) => {
   
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.column_filters = data.column_filters;
  params.search = data.search;
  params.sort_column = data.sort_column;
  params.sort_direction = data.sort_direction;
  if (data.change_type === 'search') {
    filterUsers();
  } else {
    fetchInvoices();
  }
  updatePaginationText();
};

// Initial data load
const locale = ref('en'); 

onMounted(()=>{
	locale.value = localStorage.getItem('locale') || 'en';
	updateColumnTitles();
	fetchInvoices();
	updatePaginationText();
}
);
const ability = useAbility();

</script>
<style scoped>
/* RTL Pagination Alignment */
:deep(.rtl-pagination .dt-pagination) {
  direction: rtl;
}

:deep(.rtl-pagination .dt-pagination .dt-pagination-left) {
  direction: ltr;
  text-align: right;
}

:deep(.rtl-pagination .dt-pagination .dt-pagination-right) {
  direction: ltr;
  text-align: left;
}

:deep(.rtl-pagination .dt-pagination select) {
  direction: ltr;
  text-align: left;
  padding-right: 8px;
  padding-left: 24px;
}
</style>
<template>
  <div class="p-5 box" :class="{ 'h-full': fullHeight }">
    <div class="flex justify-between  mb-6">
      <div>
        <!-- <h4 class="text-lg font-semibold text-gray-800">{{ $t('dashboard.stockLevels') }}</h4> -->
        <h4 class="text-lg font-semibold text-gray-800">{{ $t('reporting.productDeadItem') }}</h4>
      </div>
      <div class="flex items-center sm:mt-0" :class="{ 'mr-auto': locale.value === 'ar', 'ml-auto': locale.value !== 'ar' }">
        <div class="relative w-56 text-slate-500  ">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('common.search')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
		<Button variant="primary" @click="exportTable('xlsx')" class="flex items-center ml-3" :class="{ 'mr-3': locale.value === 'ar', 'ml-3': locale.value !== 'ar' }"><Lucide icon="FileText" class="hidden w-4 h-4  sm:block" :class="{ 'ml-3': locale.value === 'ar', 'mr-2': locale.value !== 'ar' }" />
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
       
      <vue3-datatable  ref="datatable" :rows="rows" :columns="columns" :loading="loading" :totalRows="total_rows"
				:isServerMode="true" :pageSize="params.pagesize" :sortable="true" :sortColumn="params.sort_column"
				:sortDirection="params.sort_direction" :search="params.search" @change="changeServer"
				:class="{ 'rtl-pagination': locale.value === 'ar' }">

        <template #actions="data">
          <div class="flex gap-2.5">
            <RouterLink :to="`/inventory/products/${data.value.id}/edit`" class="bg-[#96837f33] p-2 rounded-md cursor-pointer">
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

