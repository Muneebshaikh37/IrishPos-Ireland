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
import apiService from '../../../network/api/apiService';
import TomSelect from "@/components/Base/TomSelect";
import {  FormLabel  } from "@/components/Base/Form"; 
import stockNotFound from "@/assets/images/stockNotFound.svg"


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
	sort: "-initial_quantity",
	sort_direction: "desc",
	paginate: true,
	column_filters: [],
});
const {t} = useI18n();

// Columns for the table
const columns = [
	{ field: "name_en", title: t('dashboard.productName') },
	{ field: "initial_quantity", title: t('dashboard.quantity') },
	{ field: "actions", title: t('dashboard.actions'), sort: false },
];
const dummy = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let controller: any;
let timer: any;
const filterUsers = () => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		fetchProductLevel();
	}, 300);
}; 
const filterPayload = ref({
  category_id: "",
  sub_category_id: "",
  brand_id: ""
})
const CategoryList = ref()
const allSubCategory = ref()
const allBrand = ref()
const isCategoryList = async () => {
  try {
    const response = await apiService.product.categoryList();
    const result = handleResponse(response);
    if (result.success) {
      CategoryList.value = result.data.data
    }
  } catch (error) {
    const result = handleError(error);
  }
}
const isSubCategoryList = async () => {
  try {
    const response = await apiService.product.subCategoryList(filterPayload.value.category_id);
    const result = handleResponse(response);
    if (result.success) {
      allSubCategory.value = result.data.data
    }
  } catch (error) {
    handleError(error);
  }
}
const isBrandsList = async () => {
  try {
    const response = await apiService.product.brandsList();
    const result = handleResponse(response);
    if (result.success) {
      allBrand.value = result.data.data
    }
  } catch (error) {
    const result = handleError(error);
  }
}
watch(
    () => filterPayload.value.category_id,
    (newValue) => {
      if (newValue) {
        isSubCategoryList();
      }
    }
);
const FilterInventory = ()=>{
    fetchProductLevel()
}
const ResetInventory = () =>{
  allSubCategory.value = ""
  filterPayload.value.category_id= "",
  filterPayload.value.sub_category_id="",
  filterPayload.value.brand_id= ""
}
// Fetch data from the server
const fetchProductLevel = async () => { 
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
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/v1/dashboard/product-stock-level", {
			params: { ...params, user_id: USER_ID, category_id: filterPayload.value.category_id , sub_category_id:filterPayload.value.sub_category_id, brand_id:filterPayload.value.brand_id, signal: signal },
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
const ExportProduct = async() =>{
  try { 
		const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/v1/reporting/product-stock-level/export?user_id=${USER_ID}&search=${params.search}&category_id=${filterPayload.value.category_id}&sub_category_id=${filterPayload.value.sub_category_id}&brand_id=${filterPayload.value.brand_id}`, { responseType: 'blob'});
    if (response.status === 200) {
      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a temporary download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'Inventory Level Report.xlsx'); // Set file name
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
const changeServer = (data: any) => {
	params.page = data.current_page;
	params.limit = data.pagesize;
	params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`
	params.sort_direction = data.sort_direction;
	params.search = data.search;

	if (data.change_type === 'search') {
		filterUsers();
	} else {
		fetchProductLevel();
	}
}; 
// Initial data load
const locale = ref('en'); 

onMounted(()=>{
    isCategoryList()
    isBrandsList()
	fetchProductLevel()
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
        <h4 class="text-lg font-semibold text-gray-800">{{$t('reporting.InventoryLevelReport')}}</h4>
      </div>
      <div class="flex items-center sm:mt-0" :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
        <div class="relative w-56 text-slate-500  ">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('common.search')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
        <Button variant="primary" @click="ExportProduct()" class="flex items-center ml-3" :class="{ 'mr-3': locale === 'ar', 'ml-3': locale !== 'ar' }">
          <Lucide icon="FileText" class="hidden w-4 h-4  sm:block" :class="{ 'ml-3': locale === 'ar', 'mr-2': locale !== 'ar' }" />
          {{ $t('product.exportExcelButton') }}
        </Button>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-6 mb-8"> 
          <div class="col-span-3">
            <FormLabel for="category_id">{{ $t('category.category') }} </FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="filterPayload.category_id" :options="{ placeholder: $t('category.selectCategory'),}" 
                class="w-full" id="category_id">
                <option></option>
                <template v-for="list in CategoryList">
                  <option :value="list.id">{{ list.name }}</option>
                </template>
              </TomSelect> 
            </div> 
          </div>
          <div class="col-span-3">
            <FormLabel for="SubCategorySelect">{{ $t('category.subCategory') }}  </FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="filterPayload.sub_category_id"
                         :options="{ placeholder: $t('category.selectSubCategory') }" id="SubCategorySelect" class="w-full"  >
                <template v-for="sb in allSubCategory" :key="sb.id">
                  <option :value="sb.id">{{ sb.name }}</option>
                </template>
              </TomSelect>
             
            </div> 
          </div>
          <div class="col-span-3">
            <FormLabel for="brand_id">{{ $t('category.brand') }}  </FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="filterPayload.brand_id" :options="{
                                placeholder: $t('category.selectBrand'),
                            }" class="w-full" id="brand_id">
                <option></option>
                <template v-for="list in allBrand">
                  <option :value="list.id">{{ list.name }}</option>
                </template>
              </TomSelect> 
            </div> 
          </div>
          <div class="col-span-3">
            <Button variant="primary" :class="{ 'mr-3': locale === 'ar', 'ml-3 ': locale !== 'ar' }" class="shadow-md mt-7" @click="FilterInventory">
                 {{$t('reporting.Fillter')}}
              </Button>
              <Button variant="secondary" :class="{ 'mr-3': locale === 'ar', 'ml-3 ': locale !== 'ar' }" class="shadow-sm mt-7" @click="ResetInventory">
                {{$t('reporting.Reset')}}
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
            <RouterLink :to="`/inventory/products/${data.value.id}/edit`" class="bg-[#96837f33] p-2 rounded-md cursor-pointer">
              <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
            </RouterLink>




          </div>
        </template>
      </vue3-datatable>
    </div>
    <div v-else class="box p-8 rounded-lg">
      <img :src="stockNotFound" class="w-[140px] mx-auto">
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{ $t('dashboard.noDataAvailable') }}</h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">{{ $t('dashboard.noDataDescription') }}</p>
      <div class="flex justify-center">
        <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-40 py-2"
                @click="fetchProductLevel()">
          <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2 " /> {{ $t('dashboard.refreshNow') }}
        </Button>
      </div>
    </div> 
  </div>
</template>

