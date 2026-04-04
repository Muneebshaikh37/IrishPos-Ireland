<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
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
const params = reactive({
  page: 1,
  limit: 10,
  search: "",
  sort: "",
  sort_direction: "asc",
  paginate: true,
  column_filters: [],
});
const {t} = useI18n();
const rows: any = ref(null);
const cols: any = ref([ 
	{ field: 'category', title: t('category.heading') },
	{ field: 'sub_category', title: t('category.subCategories') },
	{ field: 'is_active', title: t('category.status'), sort: false },
	{ field: 'actions', title: t('category.actions'), sort: false },
]) || [];
 

const datatable: any = ref(null);

let controller: any;
let timer: any;
const filterUsers = () => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		fetchCategoriesList();
	}, 300);
}; 
// Fetch data from the server
const fetchCategoriesList = async () => { 
	try { 
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		const signal = controller.signal;
		isloading.value = true; 
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/categories", {
			params: { ...params, user_id: USER_ID, signal: signal },
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
		fetchCategoriesList();
	}
}; 
const locale = ref('en'); // Default locale 
// Initial data load
onMounted(()=>{
	locale.value = localStorage.getItem('locale') || 'en';
	fetchCategoriesList()
});
 
const toggleActive = async (row: any) => {
  if (!row || !row.id) {
    return;
  }
  try { 
    row.is_active = !row.is_active;
   console.log("row",row)
    const response = await apiService.category.activation(row.id);
		const result = handleResponse(response);
		console.log('toggle', result)

    if (result.success) { 
      fetchCategoriesList(); 
      const successEl = document
        .querySelector("#success-notification-content")
        ?.cloneNode(true) as HTMLElement;

      if (successEl) {
        successEl.classList.remove("hidden");
        successEl.querySelector(".font-medium")!.textContent = "Category Status";
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
const isCategoryId = ref(null);  
const openDeleteModal = (Uuid: any) => {
	isCategoryId.value = Uuid;
	deleteConfirmationModal.value = true;
};  
const closeDeleteModal = () => {
	deleteConfirmationModal.value = false;
	isCategoryId.value = null;
};
const deleteUser = (Uuid: any) => { openDeleteModal(Uuid); }; 
const confirmDelete = async()=>{
	try { 
		const response = await apiService.category.delete(isCategoryId.value);
		const result = handleResponse(response); 
		if (result.success) {
			 closeDeleteModal();
	     fetchCategoriesList();  
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
	<h2 class="mt-10 text-lg font-semibold intro-y">  {{ $t('category.productsCategory') }}</h2>
	<div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
		<div class="col-span-12 flex justify-between  ">
			<div>
				<RouterLink to="/inventory/categories/create">
					<Button v-if="ability.can('create', 'category')" variant="primary" class="mr-2 shadow-md">
            {{ $t('category.addNewCategory') }}
					</Button>
				</RouterLink>
			</div>
			<div class="flex items-center mt-3   sm:mt-0" :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }"> 
				<div class="relative w-56 text-slate-500 mr-3">
					<FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('category.searchPlaceholder')" />
					<Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
				</div> 
			</div>
		</div>
 
		<div class="col-span-12  " :class="{ 'ar-all-category all-data-table-ar': locale === 'ar', '': locale !== 'ar' }">
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

				<template #is_active="data">
					<div class="flex w-[80px]" id="fix">
						<label class="switch" @click="toggleActive(data.value.category)">
							<input type="checkbox" :checked="data.value.category.is_active">
							<span class="slider round"></span>
						</label> 
					</div> 
					 
				</template>
				 
				<template #category="data">
					{{data.value?.category?.name}}
				</template>
				<template #sub_category="data">
					{{data.value?.sub_category?.name}}
				</template>
				
				<template #actions="data">
					<div class="flex gap-2.5"> 
						<a href="#" v-if="ability.can('delete', 'category')" class="bg-red-100  p-2 rounded-md" @click="deleteUser(data.value.category.id)">
							<Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" /> 
						</a>
						<RouterLink v-if="ability.can('update', 'category')" :to="`/inventory/categories/${data.value.category.id}/edit`" class="bg-blue-100  p-2 rounded-md cursor-pointer ">
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
        <div class="mt-5 text-3xl">{{ $t('category.deleteConfirmation') }}</div>
        <div class="mt-2 text-slate-500">
          {{ $t('category.deleteWarning') }} <br />
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1">
          {{ $t('category.cancel') }}
        </Button>
        <Button variant="danger" type="button" class="ml-4 w-24" @click="confirmDelete">
          {{ $t('category.delete') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Notification id="success-notification-content" class="flex hidden">
    <Lucide icon="CheckCircle" class="text-success" />
    <div class="ml-4 mr-4">
      <div class="font-medium">{{ $t('category.categoryCreatedSuccess') }}</div>
      <div class="mt-1 text-slate-500">
        {{ $t('category.checkCategoryListing') }}
      </div>
    </div>
  </Notification>
</template>
<style scoped>
.switch {
	position: relative;
	display: inline-block;
	width: 50px;
	height: 24px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	-webkit-transition: .4s;
	transition: .4s;
}

.slider:before {
	position: absolute;
	content: "";
	height: 20px;
	width: 20px;
	left: 1px;
	bottom: 2px;
	background-color: white;
	-webkit-transition: .4s;
	transition: .4s;
}

input:checked+.slider {
	background-color: #F96F01;
}

input:focus+.slider {
	box-shadow: 0 0 1px #F96F01;
}

input:checked+.slider:before {
	-webkit-transform: translateX(26px);
	-ms-transform: translateX(26px);
	transform: translateX(26px);
}
 
.slider.round {
	border-radius: 34px;
}

.slider.round:before {
	border-radius: 50%;
}
</style>