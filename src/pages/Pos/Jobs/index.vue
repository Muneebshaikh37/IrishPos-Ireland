<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('jobs.jobs') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <div class="col-span-12 flex justify-end intro-y">
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput
            v-model="params.search"
            type="text"
            class="w-56 pr-10 !box"
            :placeholder="$t('jobs.search')"
          />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"/>
        </div>
      </div>
    </div>
    <div class="col-span-12">
      <JobTable
        :data="rows"
        :loading="loading"
        :total_rows="total_rows"
        :params="params"
        @change="changeServer"
        @deleteJob="deleteJob"
        @editJob="openViewJobDialog"
      />
    </div>
  </div>

  <JobDialog
    v-model:show="isAddJobDialogOpen"
    @created="fetchDataSafe"
    @close="closeAddJobDialog"
  />

  <JobViewDialog
    v-model:show="isViewJobDialogOpen"
    :job="selectedJob"
    @close="closeViewJobDialog"
  />

  <Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger"/>
        <div class="mt-5 text-3xl">{{ $t('jobs.areYouSure') }}</div>
        <div class="mt-2 text-slate-500">
          {{ $t('jobs.deleteConfirmation') }}
        </div>
      </div>
      <div class="px-5 pb-8 flex text-center justify-center">
        <Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1">
          {{ $t('jobs.cancel') }}
        </Button>
        <Button variant="danger" type="button" class="ml-4 shadow-md w-28" @click="confirmDelete">
          <template v-if="isDeleting">
            <LoadingIcon icon="three-dots" class="w-5 h-5 text-white"/>
          </template>
          <template v-else>
            {{ $t('jobs.delete') }}
          </template>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import JobTable from "@/components/pos/Jobs/JobTable.vue";
import JobDialog from "@/components/pos/Jobs/JobDialog.vue";
import JobViewDialog from "@/components/pos/Jobs/JobViewDialog.vue";
import Button from "../../../components/Base/Button";
import { FormInput } from "../../../components/Base/Form";
import { Dialog } from "../../../components/Base/Headless";
import Lucide from "../../../components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import httpClient from "@/network/api/httpClient";
import { handleResponse, handleError } from "../../../network/api/responseHandler";
import { useAbility } from "@casl/vue";
import { useAuthStore } from "@/stores/auth";
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import { useDatatable } from "@/composables/useDatatable";

const form = reactive(new ErrorHandler());
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

// Ensure USER_ID is present
if (!USER_ID) {
  console.warn("USER_ID is missing. Jobs data may not load correctly.");
}

const POS_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL_POS;

const { rows, totalRows, loading, params, fetchData, changeServer: onTableChange } = useDatatable(
  `${POS_BASE_URL}/tasks`,
  { user_id: USER_ID }
);

const fetchDataSafe = async () => {
  if (!USER_ID) {
    console.warn("USER_ID is missing. Cannot fetch jobs.");
    rows.value = [];
    return;
  }
  await fetchData();
};

const total_rows = computed(() => totalRows.value);

const isAddJobDialogOpen = ref(false);
const isViewJobDialogOpen = ref(false);
const selectedJob = ref<any>(null);

const openAddJobDialog = () => {
  isAddJobDialogOpen.value = true;
};
const closeAddJobDialog = () => {
  isAddJobDialogOpen.value = false;
};

const openViewJobDialog = (job: any) => {
  selectedJob.value = job;
  isViewJobDialogOpen.value = true;
};
const closeViewJobDialog = () => {
  isViewJobDialogOpen.value = false;
  selectedJob.value = null;
};

const changeServer = (data: any) => {
  onTableChange(data);
};

const deleteConfirmationModal = ref(false);
const jobIdToDelete = ref<number | null>(null);
const deleteJob = (id: number) => {
  jobIdToDelete.value = id;
  deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  jobIdToDelete.value = null;
};
const isDeleting = ref(false);

const confirmDelete = async () => {
  try {
    isDeleting.value = true;
    const response = await httpClient.delete(
      `${POS_BASE_URL}/tasks/${jobIdToDelete.value}`
    );
    const result = handleResponse(response);
    if (result.status === 200) {
      closeDeleteModal();
      fetchDataSafe();
      toast().fry(pan.customer.success(result.message));
    }
  } catch (error: any) {
    handleError(error);
    form.setErrors(error.message);
    toast().fry(pan.customer.error(error.message));
  } finally {
    isDeleting.value = false;
    closeDeleteModal();
  }
};

onMounted(() => {
  fetchDataSafe();
});

const ability = useAbility();
</script>

