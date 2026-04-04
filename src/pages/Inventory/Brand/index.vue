<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('brand.brands') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between">
      <div>
        <Button v-if="ability.can('create', 'brand')" variant="primary" class="mr-2 shadow-md" @click="() => openEditDialog(null)">
          {{ $t('brand.addNewBrand') }}
        </Button>
      </div>
      <div class="flex items-center mt-3   sm:mt-0" :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('brand.labels.search')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>
    <div class="col-span-12">
      <BrandTable :data="rows"
                  :loading="isloading"
                  :totalRows="totalRows"
                  :params="params"
                  @change="changeServer"
                  @toggleActive="toggleActive" @deleteUser="deleteUser" @editUser="openEditDialog"/>
    </div>
  </div>
  <BrandDialog
      :showDialog="editDialog"
      :editBrand="editBrand"
      @close="editDialog = false"
      @updated="fetchBrandListing"
  />
  <Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl">{{ $t('brand.labels.areYouSure') }}</div>
        <div class="mt-2 text-slate-500">
          {{ $t('brand.labels.deleteConfirmation') }}
        </div>
      </div>
      <div class="px-5 pb-8 text-center flex justify-center items-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1">
          {{ $t('brand.labels.cancel') }}
        </Button>
        <Button variant="danger" type="button" class="ml-4 shadow-md w-28" @click="confirmDelete">
          <template v-if="isDeleting">
            <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
          </template>
          <template v-else>
            {{ $t('brand.labels.delete') }}
          </template>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Notification id="success-notification-content" class="flex hidden">
    <Lucide icon="CheckCircle" class="text-success" />
    <div class="ml-4 mr-4">
      <div class="font-medium">{{ $t('brand.brandCreatedSuccess') }}</div>
      <div class="mt-1 text-slate-500">{{ $t('brand.checkBrandListing') }}</div>
    </div>
  </Notification>
</template>


<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import BrandTable from "@/components/Brand/BrandTable.vue";
import BrandDialog from "@/components/Brand/BrandDialog.vue";
import Button from "../../../components/Base/Button";
import { FormInput } from "../../../components/Base/Form";
import { Dialog } from "../../../components/Base/Headless";
import Lucide from "../../../components/Base/Lucide";
import Notification from "../../../components/Base/Notification";
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler";
import LoadingIcon from "@/components/Base/LoadingIcon";
import httpClient from '@/network/api/httpClient';
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isloading: any = ref(true); 
const totalRows = ref(0);
const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "",
  sort_direction: "desc",
  paginate: true,
  column_filters: [],
});
const rows = ref([]);

const editDialog = ref(false);

const editBrand = reactive({
  id: null,
  name: '',
  is_active: true,
  isEdit: false
});
const deleteConfirmationModal = ref(false);
const isBrandId = ref(null);

const filterBrands = () => {
  fetchBrandListing();
};

let controller: any;
let timer: any;
const filterUsers = () => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		fetchBrandListing();
	}, 300);
}; 
// Fetch data from the server
const fetchBrandListing = async () => { 
	try { 
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		const signal = controller.signal;
		isloading.value = true; 
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/brands", {
			params: { ...params, user_id: USER_ID, signal: signal , product_count:1},
		});
		const result = response.data; 
	  rows.value = result.data;
		totalRows.value = result.meta.total; 
	} catch (error) {
		console.error("Error fetching Stock Count:", error);
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
		filterBrands();
	}
}; 
const locale = ref('en'); // Default locale 
// Initial data load
onMounted(()=>{
  locale.value = localStorage.getItem('locale') || 'en';
  fetchBrandListing()
});

const openEditDialog = (brand = null) => {
  if (brand) {
    editBrand.isEdit = true;
    editBrand.id = brand.id;
    editBrand.name = brand.name;
    editBrand.is_active = brand.is_active;
  } else {
    editBrand.isEdit = false;
    editBrand.id = null;
    editBrand.name = '';
    editBrand.is_active = true;
  }
  editDialog.value = true;
};
const user_id = "92fb9c48-61c9-4189-b029-5de3cf999f0d";

const toggleActive = async (row) => {
  row.is_active = !row.is_active;
  try {
    const response = await apiService.brand.activation(row.id);
    handleResponse(response);
  } catch (error) {
    row.is_active = !row.is_active; // revert change on error
    handleError(error);
  }
};

const openDeleteModal = (id) => {
  isBrandId.value = id;
  deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  isBrandId.value = null;
};
const deleteUser = (id) => { openDeleteModal(id); };

const isDeleting = ref(false);

const confirmDelete = async () => {
  try {
    isDeleting.value = true;
    const response = await apiService.brand.delete(isBrandId.value);
    console.log("response",response)
      toast().fry(pan.brand.success(response.data.message))
    handleResponse(response);
    closeDeleteModal();
    fetchBrandListing();
  } catch (error) {
    // handleError(error);
    toast().fry(pan.brand.error(error.message))
    deleteConfirmationModal.value = false;
  } finally {
    isDeleting.value = false;
  }
};
const ability = useAbility();


</script>

