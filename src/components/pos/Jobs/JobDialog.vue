<template>
  <Dialog :open="show" @close="closeDialog">
    <Dialog.Panel>
      <div class="p-5">
        <h3 class="text-lg font-medium">{{ $t('jobs.addNewJob') }}</h3>
        <div class="mt-6">
          <label for="title">{{ $t('jobs.title') }}</label>
          <FormInput
            id="title"
            v-model="job.title"
            type="text"
            class="w-full p-2 border"
            :class="{ 'border-red-500': form.invalid('title') }"
            :placeholder="$t('jobs.enterJobTitle')"
          />
          <template v-if="form.invalid('title')">
            <div class="mt-0.5 text-red-600">
              {{ form.getError('title') }}
            </div>
          </template>
        </div>
        <div class="mt-4">
          <label for="description">{{ $t('jobs.description') }}</label>
          <textarea
            id="description"
            v-model="job.description"
            class="w-full p-2 border rounded-md"
            :class="{ 'border-red-500': form.invalid('description') }"
            rows="3"
            :placeholder="$t('jobs.enterJobDescription')"
          />
          <template v-if="form.invalid('description')">
            <div class="mt-0.5 text-red-600">
              {{ form.getError('description') }}
            </div>
          </template>
        </div>

        <div class="mt-6 flex justify-end">
          <Button variant="outline-secondary" @click="closeDialog" class="w-24 mr-1" :disabled="isLoading">
            {{ $t('jobs.cancel') }}
          </Button>
          <Button variant="primary" @click="saveJob" class="ml-4 w-24" :disabled="isLoading">
            <template v-if="isLoading">
              <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
            </template>
            <template v-else>
              {{ $t('jobs.create') }}
            </template>
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import Button from "@/components/Base/Button";
import { Dialog } from "@/components/Base/Headless";
import { FormInput } from "@/components/Base/Form";
import LoadingIcon from "@/components/Base/LoadingIcon";
import httpClient from "@/network/api/httpClient";
import { handleResponse } from "@/network/api/responseHandler.js";
import { useAuthStore } from "@/stores/auth.js";
import ErrorHandler from "@/utils/validation";

const props = defineProps({
  show: Boolean,
});

const emits = defineEmits(["close", "created"]);
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const show = ref(props.show);
const job = ref({ title: "", description: "" });
const isLoading = ref(false);
const form = reactive(new ErrorHandler());

watch(
  () => props.show,
  (newVal) => {
    show.value = newVal;
    resetForm();
  }
);

const resetForm = () => {
  job.value = { title: "", description: "" };
};

const saveJob = async () => {
  isLoading.value = true;
  try {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_URL_POS;
    const endpoint = `${baseUrl}/api/tasks?user_id=${USER_ID}`;

    const payload = {
      title: job.value.title,
      description: job.value.description,
    };

    const response = await httpClient.post(endpoint, payload);
    const result = handleResponse(response);
    if (result.success) {
      emits("created");
      closeDialog();
    }
  } catch (error: any) {
    form.setErrors(error.errors);
    console.error("Error saving job:", error);
  } finally {
    isLoading.value = false;
  }
};

const closeDialog = () => {
  emits("close");
  show.value = false;
  form.setErrors({});
};
</script>

