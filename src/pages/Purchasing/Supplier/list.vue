<script setup lang="ts">
import _ from "lodash";
import httpClient from "@/network/api/httpClient";
import { ref, reactive, onMounted } from "vue";
import Button from "../../../components/Base/Button";
import { FormInput } from "../../../components/Base/Form";
import Lucide from "../../../components/Base/Lucide";
import { RouterLink, useRoute } from "vue-router";
import { Dialog } from "../../../components/Base/Headless";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import LoadingIcon from "../../../components/Base/LoadingIcon";
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

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
const rows: any = ref([]);
const {t} = useI18n();
const columns: any = ref([
  { field: 'supplier_name', title: t('suppliers.supplier') },
  { field: 'name', title: t('suppliers.contactName'), width: '250px' },
  { field: 'full_phone', title: t('suppliers.phone'), width: '200px' },
  { field: 'email', title: t('suppliers.email'), width: '200px' },
  { field: 'address', title: t('suppliers.address'), hide: true },
  { field: 'is_active', title: t('suppliers.status'), sort: false },
  { field: 'actions', title: t('suppliers.actions'), sort: false },
]) || [];
const datatable: any = ref(null);
let controller: any;
let timer: any;
const filterUsers = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    getUsers();
  }, 100);
};

const getUsers = async () => {
  try {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;
    isloading.value = true;
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL + "/suppliers", {
      params: { ...params, user_id: USER_ID },
      signal,
    });
    // Support multiple backend payload shapes:
    // 1) { data: [...], meta: { total } }
    // 2) { data: { data: [...], meta: { total } } }
    // 3) { suppliers: [...], total: n }
    const payload = response?.data ?? {};
    const collectionRoot = payload?.data && !Array.isArray(payload.data) ? payload.data : payload;
    const list =
      (Array.isArray(payload?.data) && payload.data) ||
      (Array.isArray(collectionRoot?.data) && collectionRoot.data) ||
      (Array.isArray(payload?.suppliers) && payload.suppliers) ||
      [];

    const total =
      payload?.meta?.total ??
      collectionRoot?.meta?.total ??
      payload?.total ??
      list.length;

    rows.value = list;
    totalRows.value = Number(total) || 0;

  } catch (error) {
    console.error("Error fetching invoices:", error);
    rows.value = [];
    totalRows.value = 0;
  } finally {
    isloading.value = false;
  }
};
const changeServer = (data: any) => {
  params.page = data.current_page;
  params.limit = data.pagesize;
  params.sort = "",
  params.sort_direction = "desc";
  params.search = data.search;

  if (data.change_type === 'search') {
    filterUsers();
  } else {
    getUsers();
  }
};
onMounted(() => {
  getUsers();
});

const deleteConfirmationModal = ref(false);
const isSupplierId = ref(null);
const openDeleteModal = (Uuid: any) => {
  isSupplierId.value = Uuid;
  deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  isSupplierId.value = null;
};
const deleteUser = (Uuid: any) => { openDeleteModal(Uuid); };
const confirmDelete = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.delete(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/suppliers/${isSupplierId.value}`)
    // const response = await apiService.supplier.delete(isSupplierId.value);
    const result = handleResponse(response);
    console.log('login response', result)
    if (result.success) {
      closeDeleteModal();
      getUsers();
      isloading.value = false;
      toast().fry(pan.supplier.success(result.message))

    }
  } catch (error) {
    const result = handleError(error);
    toast().fry(pan.supplier.error(result.message))

    isloading.value = false;
    deleteConfirmationModal.value = false;
  }
}
const toggleActive = async (row: any) => {
  if (!row || !row.id) {
    return;
  }
  // Save the initial state
  const originalState = row.is_active;
  try {
    row.is_active = !row.is_active;
    const response = await httpClient.patch(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/suppliers/${row.id}/toggle-activation`)
    // const response = await apiService.supplier.activation(row.id);
    const result = handleResponse(response);
    if (result.success) {
      toast().fry(pan.supplier.success(result.data.message))
    } else {
      row.is_active = originalState;
      console.error("Failed to toggle activation state");
    }
  } catch (error) {
    row.is_active = originalState;
    const result = handleError(error);
    toast().fry(pan.supplier.error(error.message))
  }
};

const ability = useAbility();

</script>

<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('suppliers.supplier') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-between intro-y">
      <div>
        <RouterLink v-if="ability.can('create', 'supplier')" to="/purchasing/supplier/create">
          <Button variant="primary" class="mr-2 shadow-md">
            {{ $t('suppliers.addNewSupplier') }}
          </Button>
        </RouterLink>
      </div>
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('suppliers.search')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>

      </div>
    </div>

    <!-- BEGIN: Data List -->
    <div class="col-span-12  ">
      <vue3-datatable ref="datatable" :rows="rows" :columns="columns" :loading="isloading" :totalRows="totalRows"
                      :isServerMode="true" :pageSize="params.limit" :sortable="true" :sort="params.sort"
                      :sortDirection="params.sort_direction" :search="params.search" @change="changeServer">
        <template #is_active="data">
          <div class="flex w-[80px]" id="fix">
            <label class="switch" @click="toggleActive(data.value)">
              <input type="checkbox" :checked="data.value.is_active">
              <span class="slider round"></span>
            </label>
          </div>
        </template>
        <template #actions="data">
          <div class="flex gap-2.5">
            <a href="#" v-if="ability.can('delete', 'supplier')" class="bg-red-100  p-2 rounded-md" @click="deleteUser(data.value.id)">
              <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
            </a>
            <RouterLink v-if="ability.can('update', 'supplier')" :to="`/purchasing/supplier/${data.value.id}/edit`" class="bg-blue-100  p-2 rounded-md">
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
        <div class="mt-5 text-3xl">{{ $t('suppliers.areYouSure') }}</div>
        <div class="mt-2 text-slate-500">
          {{ $t('suppliers.deleteConfirmation') }} <br />
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1  h-10">
          {{ $t('suppliers.cancel') }}
        </Button>
        <Button variant="danger" type="button" class="ml-4 w-24 h-10" @click="confirmDelete">
          <template v-if="isloading">
            <LoadingIcon icon="three-dots" class="w-8 h-5 text-white " />
          </template>
          <template v-else>
            {{ $t('suppliers.delete') }}
          </template>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>


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
