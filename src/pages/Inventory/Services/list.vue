<script setup lang="ts">
import _ from "lodash";
import { ref, reactive, onMounted, watch } from "vue";
import Button from "../../../components/Base/Button";
import { FormInput } from "../../../components/Base/Form";
import Lucide from "../../../components/Base/Lucide";
import { RouterLink } from "vue-router";
import { Dialog } from "../../../components/Base/Headless";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import Toastify from "toastify-js";
import Notification from "../../../components/Base/Notification";
import LoadingIcon from "../../../components/Base/LoadingIcon";
import httpClient from '@/network/api/httpClient';
import {useAbility} from "@casl/vue";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isloading: any = ref(true);
const totalRows = ref(0);
const datatable: any = ref(null);
const params = reactive({
	page: 1,
	limit: 10,
	search: "",
	sort: "",
  is_service: true,
	sort_direction: "asc",
	paginate: true,
	column_filters: [],
});
const rows: any = ref(null);

const { t, locale: i18nLocale } = useI18n();

const cols: any = ref([
	{ field: 'name', title: t('services.serviceNameColumn') },
	{ field: 'sale_price', title: t('services.price') },
	{ field: 'is_active', title: t('services.status'), sort: false },
	{ field: 'actions', title: t('services.actions'), sort: false },
]) || [];

let controller: any;
let timer: any;
const filterUsers = () => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		fetchServicesList();
	}, 300);
};
// Fetch data from the server
const fetchServicesList = async () => {
	try {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		const signal = controller.signal;
		isloading.value = true;
		// NOTE: Using products endpoint until dedicated services API exists
		const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/products", {
			params: { ...params, user_id: USER_ID, signal: signal },
		});
		const result = response.data;

		rows.value = result.data;
		totalRows.value = result.meta.total;
	} catch (error) {
		console.error("Error fetching Services:", error);
	} finally {
		isloading.value = false;
	}
};
const changeServer = (data: any) => {
	params.page = data.current_page;
	params.limit = data.pagesize;
	params.sort = "",
	params.sort_direction = data.sort_direction;
	params.search = data.search;

	if (data.change_type === 'search') {
		filterUsers();
	} else {
		fetchServicesList();
	}
};
// Initial data load
const locale = ref('en'); // Default locale

// Function to update column titles based on locale
const updateColumnTitles = () => {
	cols.value = [
		{ field: 'name', title: t('services.serviceNameColumn') },
		{ field: 'sale_price', title: t('services.price') },
		{ field: 'is_active', title: t('services.status'), sort: false },
		{ field: 'actions', title: t('services.actions'), sort: false },
	];
};

// Watch for locale changes
watch(i18nLocale, () => {
	locale.value = i18nLocale.value;
	updateColumnTitles();
});

onMounted(()=>{
	locale.value = localStorage.getItem('locale') || 'en';
	updateColumnTitles();
	fetchServicesList()
});

const deleteConfirmationModal = ref(false);
const isServiceId = ref(null);
const openDeleteModal = (Uuid: any) => {
	isServiceId.value = Uuid;
	deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
	deleteConfirmationModal.value = false;
	isServiceId.value = null;
};
const deleteService = (Uuid: any) => { openDeleteModal(Uuid); };
const confirmDelete = async () => {
	try {
		isloading.value = true;
		const response = await apiService.product.delete(isServiceId.value);
		const result = handleResponse(response);

		if (result.success) {
			closeDeleteModal();
			fetchServicesList();
			isloading.value = false;
			const successEl = document
				.querySelector("#success-notification-content")
				?.cloneNode(true) as HTMLElement;

			if (successEl) {
				successEl.classList.remove("hidden");
				successEl.querySelector(".font-medium")!.textContent = t('services.serviceStatus');
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
		}
	} catch (error) {
		const result = handleError(error);
		isloading.value = false;
	}
}
const toggleActive = async (row: any) => {
	if (!row || !row.id) {
		return;
	}
	// Save the initial state
	const originalState = row.is_active;
	try {
		// Optimistically toggle the state for the UI
		row.is_active = !row.is_active;

		// Call the API to toggle the activation state
		const response = await apiService.product.activation(row.id);
		const result = handleResponse(response);

		if (result.success) {
			// Successful response, proceed
			fetchServicesList();

			// Display a success toast
			const successEl = document
				.querySelector("#success-notification-content")
				?.cloneNode(true) as HTMLElement;

			if (successEl) {
				successEl.classList.remove("hidden");
				successEl.querySelector(".font-medium")!.textContent = t('services.serviceStatus');
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
			// Restore the original state if the API response fails
			row.is_active = originalState;
			console.error("Failed to toggle activation state");
		}
	} catch (error) {
		// Restore the original state on error
		row.is_active = originalState;
		const result = handleError(error);
		console.error("Error toggling activation state:", result);
	}
};

const ability = useAbility();

</script>

<template>
	<h2 class="mt-10 text-xl font-semibold intro-y">{{ $t('services.servicesHeading') }}</h2>
	<div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
		<div class="col-span-12 flex justify-between intro-y">
			<div>
				<RouterLink to="/inventory/services/create">
					<Button v-if="ability.can('create', 'product')" variant="primary" class="mr-2 shadow-md">
						{{ $t('services.addService') }}
					</Button>
				</RouterLink>
			</div>
			<div class="flex items-center mt-3 sm:mt-0" :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
				<div class="relative w-56 text-slate-500 " :class="{ 'ml-3': locale === 'ar', 'mr-3': locale !== 'ar' }">
					<FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('services.searchServices')" />
					<Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
				</div>
				<!-- Import/Export removed for Services -->
			</div>
		</div>

		<!-- BEGIN: Data List -->
		<div class="col-span-12" :class="{ 'ar-all-product all-data-table-ar': locale === 'ar', '': locale !== 'ar' }">
			<vue3-datatable
				ref="datatable"
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
				<template #is_active="data">
					<div class="flex w-[80px]" id="fix">
						<label class="switch" @click="toggleActive(data.value)">
							<input type="checkbox" :checked="data.value.is_active" />
							<span class="slider round"></span>
						</label>
					</div>
				</template>
				<template #actions="data">
					<div class="flex gap-2.5" v-if="ability.can('delete', 'product') || ability.can('update', 'product')">
						<a href="#" v-if="ability.can('delete', 'product')" class="bg-red-100 p-2 rounded-md" @click="deleteService(data.value.id)">
							<Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
						</a>
						<RouterLink :to="`/inventory/services/${data.value.id}/edit`" class="bg-blue-100 p-2 rounded-md">
							<Lucide v-if="ability.can('update', 'product')" icon="PencilLine" class="w-4 h-4 text-blue-500" />
						</RouterLink>
					</div>
				</template>
			</vue3-datatable>
		</div>
	</div>

	<!-- Delete Confirmation Modal -->
	<Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
		<Dialog.Panel>
			<div class="p-5 text-center">
				<Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
				<div class="mt-5 text-3xl">{{ $t('services.deleteConfirmation') }}</div>
				<div class="mt-2 text-slate-500">
					{{ $t('services.deleteConfirmationMessage') }}
				</div>
			</div>
			<div class="px-5 pb-8 text-center flex items-center justify-center">
				<Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1 h-10">
					{{ $t('services.cancel') }}
				</Button>
				<Button variant="danger" type="button" class="ml-4 w-24 h-10" @click="confirmDelete">
					<template v-if="isloading">
						<LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
					</template>
					<template v-else>
						{{ $t('services.delete') }}
					</template>
				</Button>
			</div>
		</Dialog.Panel>
	</Dialog>

	<Notification id="success-notification-content" class="flex hidden">
		<Lucide icon="CheckCircle" class="text-success" />
		<div class="ml-4 mr-4">
			<div class="font-medium">{{ $t('services.success') }}</div>
			<div class="mt-1 text-slate-500">
				{{ $t('services.actionCompletedSuccessfully') }}
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


