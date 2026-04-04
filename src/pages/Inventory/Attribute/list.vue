<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import Button from "../../../components/Base/Button";
import { FormInput  } from "../../../components/Base/Form";
import { Dialog } from "../../../components/Base/Headless";
import Lucide from "../../../components/Base/Lucide";
import { RouterLink } from "vue-router";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import Toastify from "toastify-js";
import Notification from "../../../components/Base/Notification";
import httpClient from '@/network/api/httpClient';
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth";
import {useI18n} from "vue-i18n";
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"


const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isloading: any = ref(true);
const totalRows = ref(0);
const categoryMap = ref<Record<string, string>>({});
const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "",
  sort_direction: "asc",
  paginate: true,
  column_filters: [],
});
const {t, locale: i18nLocale} = useI18n();
const rows: any = ref(null);
const cols: any = ref([
  { field: 'name_en', title: t('category.nameEnglish') },
  { field: 'name_ar', title: t('category.nameArabic') },
  { field: 'category', title: t('category.category') },
  { field: 'data_type', title: t('category.dataType') },
  { field: 'unit', title: t('category.unit') },
  { field: 'actions', title: t('category.actions'), sort: false },
]) || [];

// Function to update column titles based on locale
const updateColumnTitles = () => {
  cols.value = [
    { field: 'name_en', title: t('category.nameEnglish') },
    { field: 'name_ar', title: t('category.nameArabic') },
    { field: 'category', title: t('category.category') },
    { field: 'data_type', title: t('category.dataType') },
    { field: 'unit', title: t('category.unit') },
    { field: 'actions', title: t('category.actions'), sort: false },
  ];
};


const datatable: any = ref(null);

let controller: any;
let timer: any;
const filterUsers = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchAttributesList();
  }, 300);
};
// Fetch data from the server
const fetchAttributesList = async (pageOverride?: number) => {
  try {
    // Ensure USER_ID is present before making the request
    if (!USER_ID) {
      console.warn("USER_ID is missing. Cannot fetch attributes.");
      rows.value = [];
      totalRows.value = 0;
      return;
    }

    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;
    isloading.value = true;
    
    // Use pageOverride if provided, otherwise use params.page
    const currentPage = pageOverride !== undefined ? pageOverride : params.page;
    
    // Ensure params are properly structured
    const requestParams = {
      page: currentPage,
      limit: params.limit,
      search: params.search,
      sort: params.sort,
      sort_direction: params.sort_direction,
      paginate: params.paginate,
      user_id: USER_ID,
    };
    
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/attributes", {
      params: requestParams,
      signal: signal,
    });
    const result = response.data;
    
    // Server-side pagination - use data directly from API
    // Defensive check: Filter out any data that doesn't belong to current user
    const filteredData = (result.data || []).filter((item: any) => {
      // If item has user_id, ensure it matches current user
      if (item.user_id) {
        return item.user_id === USER_ID || item.user_id === parseInt(USER_ID);
      }
      // If no user_id field, include it (backend should handle filtering)
      return true;
    });
    
    rows.value = filteredData;
    totalRows.value = filteredData.length;
  } catch (error: any) {
    // Ignore aborted requests (they're intentional when new requests are made)
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED' || error.message?.includes('canceled')) {
      return;
    }
    console.error("Error fetching Attributes:", error);
  } finally {
    isloading.value = false;
  }
};
const changeServer = (data: any) => {
  // Update params object
  const newPage = data.current_page || params.page;
  const newLimit = data.pagesize || params.limit;
  const newSearch = data.search !== undefined ? data.search : params.search;
  const searchChanged = newSearch !== params.search;
  
  params.page = newPage;
  params.limit = newLimit;
  params.sort = data.sort_column ? (data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`) : "";
  params.sort_direction = data.sort_direction || params.sort_direction;
  params.search = newSearch;

  // Always fetch from server for server-side pagination
  if (data.change_type === 'search' || searchChanged) {
    // Search changed - reset to page 1 and fetch
    params.page = 1;
    filterUsers();
  } else {
    // Page, limit, or sort changed - fetch from backend
    fetchAttributesList(newPage);
  }
};
const locale = ref('en'); // Default locale

// Fetch categories and build a map for lookup
const fetchCategories = async () => {
  try {
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/categories", {
      params: { user_id: USER_ID },
    });
    const result = response.data;
    if (result.data) {
      // Extract unique categories from the nested structure
      result.data.forEach((item: any) => {
        if (item.category && item.category.id && !categoryMap.value[item.category.id]) {
          categoryMap.value[item.category.id] = item.category.name || 'Unnamed Category';
        }
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

// Watch for locale changes
watch(i18nLocale, () => {
  locale.value = i18nLocale.value;
  updateColumnTitles();
});

// Initial data load
onMounted(()=>{
  locale.value = localStorage.getItem('locale') || 'en';
  updateColumnTitles();
  fetchCategories();
  fetchAttributesList();
});

const toggleActive = async (row: any) => {
  if (!row || !row.id) {
    return;
  }
  try {
    row.is_active = !row.is_active;
   console.log("row",row)
    const response = await apiService.attribute.activation(row.id);
    const result = handleResponse(response);
    console.log('toggle', result)

    if (result.success) {
      fetchAttributesList();
      const successEl = document
        .querySelector("#success-notification-content")
        ?.cloneNode(true) as HTMLElement;

      if (successEl) {
        successEl.classList.remove("hidden");
        successEl.querySelector(".font-medium")!.textContent = "Attribute Status";
        successEl.querySelector(".text-slate-500")!.textContent = `${result.message}`;
        Toastify({
          node: successEl,
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
        }).showToast();
      }
    } else {
      row.is_active = !row.is_active;
      console.error("Failed to toggle activation state");
    }
  } catch (error) {
  const result = handleError(error);
    row.is_active = !row.is_active;
  }
};

const deleteConfirmationModal = ref(false);
const isAttributeId = ref(null);
const openDeleteModal = (Uuid: any) => {
  isAttributeId.value = Uuid;
  deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  isAttributeId.value = null;
};
const deleteUser = (Uuid: any) => { openDeleteModal(Uuid); };
const confirmDelete = async()=>{
  try {
    const response = await apiService.attribute.delete(isAttributeId.value);
    const result = handleResponse(response);
    if (result.success) {
       closeDeleteModal();
       fetchAttributesList();
    }
  } catch (error) {
    const result = handleError(error);
    closeDeleteModal()
    toast().fry(pan.category.error(error.message))
  }
}
const ability = useAbility();
</script>
<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('category.attribute') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between  ">
      <div>
        <RouterLink to="/inventory/attributes/create">
          <Button v-if="ability.can('create', 'category')" variant="primary" class="mr-2 shadow-md">
            {{ $t('category.addNewAttribute') }}
          </Button>
        </RouterLink>
      </div>
      <div class="flex items-center mt-3   sm:mt-0" :class="{ 'mr-auto': locale.value === 'ar', 'ml-auto': locale.value !== 'ar' }">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('category.searchPlaceholder')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>

    <div class="col-span-12  " :class="{ 'ar-all-category all-data-table-ar': locale.value === 'ar', '': locale.value !== 'ar' }">
      <vue3-datatable ref="datatable" :rows="rows"
          :columns="cols"
          :loading="isloading"
          :totalRows="totalRows"
          :isServerMode="true"
          :pageSize="params.limit"
          :sortable="true"
          :sort="params.sort"
          :sortDirection="params.sort_direction"
          :search="params.search"
          @change="changeServer">

        <template #name_en="data">
          {{data.value?.name_en}}
        </template>
        <template #name_ar="data">
          {{data.value?.name_ar}}
        </template>
        <template #category="category">
          {{ category.value.category?.name }}
        </template> 
        <template #data_type="data">
          {{data.value?.data_type || '-'}}
        </template>
        <template #unit="data">
          {{data.value?.unit || '-'}}
        </template>

        <template #actions="data">
          <div class="flex gap-2.5">
            <a href="#" v-if="ability.can('delete', 'category')" class="bg-red-100  p-2 rounded-md" @click="deleteUser(data.value.id)">
              <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
            </a>
            <RouterLink v-if="ability.can('update', 'category')" :to="`/inventory/attributes/${data.value.id}/edit`" class="bg-blue-100  p-2 rounded-md cursor-pointer ">
              <Lucide icon="PencilLine" class="w-4 h-4 text-blue-500 " />
            </RouterLink>
          </div>
        </template>

      </vue3-datatable>
    </div>
  </div>
  <!-- BEGIN: Delete Confirmation Modal -->
  <Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl">Delete Confirmation</div>
        <div class="mt-2 text-slate-500">
          Are you sure you want to delete this attribute? <br />
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1">
          Cancel
        </Button>
        <Button variant="danger" type="button" class="ml-4 w-24" @click="confirmDelete">
          Delete
        </Button>
      </div> 
    </Dialog.Panel>
  </Dialog>

  <Notification id="success-notification-content" class="flex hidden">
    <Lucide icon="CheckCircle" class="text-success" />
    <div class="ml-4 mr-4">
      <div class="font-medium">Attribute Status Updated</div>
      <div class="mt-1 text-slate-500">
        The attribute status has been updated successfully
      </div>
    </div>
  </Notification>
</template>

