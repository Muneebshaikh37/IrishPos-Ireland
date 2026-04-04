<script setup>
import { ref, reactive, onMounted } from 'vue';
import Button from '@/components/Base/Button';
import UserCreate from './Create.vue';
import UserEdit from './Edit.vue';
import toast from '@/stores/utility/toast';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import Lucide from '@/components/Base/Lucide';
import { useDatatable } from '@/composables/useDatatable';
import httpClient from '@/network/api/httpClient';
import { FormInput } from '@/components/Base/Form';
import { handleResponse, handleError } from "@/network/api/responseHandler";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const currentView = ref('list'); // Manage view state with a single variable
const editUserData = reactive({});
const {t} = useI18n();
const columns = [
  { field: 'name', title: t('users.name') },
  { field: 'email', title: t('users.email') },
  { field: 'phone', title: t('users.phone'), sort: false },
  { field: 'role', title: t('users.role'), sort: false },
  { field: 'is_active', title: t('users.status'), sort: false },
  { field: 'actions', title: t('users.actions'), sort: false },
];

const { rows, totalRows, loading, params, fetchData, changeServer } = useDatatable(
    import.meta.env.VITE_PUBLIC_AUTH_API_URL + '/users',
    { user_id: USER_ID }
);

const openEditView = (user) => {
  Object.assign(editUserData, user);
  currentView.value = 'edit';
};

const handleCreateSuccess = () => {
  currentView.value = 'list';
  fetchData();
};

const handleUpdateSuccess = () => {
  currentView.value = 'list';
  fetchData();
};

onMounted(() => {
  fetchData();
});

const toggleActive = async (row) => {
  row.is_active = !row.is_active;
  console.log(row.is_active);
  try {
    const response = await httpClient.post(import.meta.env.VITE_PUBLIC_AUTH_API_URL + `/user-toggle/${row.id}`, {
      status: row.is_active ? 1 : 0,
      _method: "PATCH",
    });
    const result = handleResponse(response);
  } catch (error) {
    row.is_active = !row.is_active; // Revert change on error
    handleError(error);
  }
};
</script>

<template>
  <div class="px-0 pb-6 w-full intro-y">
    <div v-if="currentView === 'list'">
      <div class="col-span-12 flex justify-between intro-y mb-3">
        <Button variant="primary" class="mr-2 shadow-md" @click="currentView = 'create'">{{ $t('users.createButton') }}</Button>
        <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
          <div class="relative w-56 text-slate-500 mr-3">
            <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('users.searchPlaceholder')" />
            <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
          </div>
        </div>
      </div>
      <vue3-datatable
          :rows="rows"
          :columns="columns"
          :loading="loading"
          :totalRows="totalRows"
          :isServerMode="true"
          :pageSize="params.limit"
          :sortable="true"
          :sort="params.sort"
          :sortDirection="params.sort_direction"
          :search="params.search"
          @change="changeServer"
      >
        <template #role="data">
          <span class="capitalize">{{ data.value.roles?.[0]?.name || 'N/A' }}</span>
        </template>
        <template #actions="data">
          <div class="flex gap-2.5">
            <span class="bg-[#96837f33] p-2 rounded-md cursor-pointer" @click="openEditView(data.value)">
              <Lucide icon="Pencil" class="w-4 h-4 text-gray-600" />
            </span>
          </div>
        </template>
        <template #is_active="data">
          <div class="flex w-[80px]">
            <label class="switch" @click="toggleActive(data.value)">
              <input type="checkbox" :checked="data.value.is_active" />
              <span class="slider round"></span>
            </label>
          </div>
        </template>
      </vue3-datatable>
    </div>

    <div v-else-if="currentView === 'create'">
      <div class="flex items-center mt-8 intro-y">
        <Button variant="primary" size="sm" @click="currentView = 'list'" class="shadow-md mr-4 h-8 w-9">
          <Lucide icon="ChevronLeft" class="w-5 h-5" />
        </Button>
        <h2 class="mr-auto text-lg font-medium">{{ $t('users.backToUsers') }}</h2>
      </div>
      <UserCreate @created="handleCreateSuccess" />
    </div>

    <div v-else-if="currentView === 'edit'">
      <div class="flex items-center mt-8 intro-y">
        <Button variant="primary" size="sm" @click="currentView = 'list'" class="shadow-md mr-4 h-8 w-9">
          <Lucide icon="ChevronLeft" class="w-5 h-5" />
        </Button>
        <h2 class="mr-auto text-lg font-medium">{{ $t('users.backToUsers') }}</h2>
      </div>
      <UserEdit :user="editUserData" @updated="handleUpdateSuccess" />
    </div>
  </div>
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

input:checked + .slider {
  background-color: #F96F01;
}

input:focus + .slider {
  box-shadow: 0 0 1px #F96F01;
}

input:checked + .slider:before {
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