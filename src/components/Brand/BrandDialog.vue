<template>
  <Dialog :open="show" @close="closeDialog">
    <Dialog.Panel>
      <div class="p-5">
        <div class="text-lg font-medium">
          {{ brand.isEdit ? $t('brand.editBrand') : $t('brand.addNewBrand') }}
        </div>
        <BrandForm :initialBrand="brand" :form="form" @update:brand="updateBrand" />
        <div class="mt-6 flex gap-2 " :class="{ 'justify-end flex-row-reverse': locale === 'ar', 'justify-end': locale !== 'ar' }">
          <Button
              variant="outline-secondary"
              type="button"
              @click="closeDialog"
              class="w-24 mr-1"
              :disabled="isLoading"
          >
            {{ $t('common.cancel') }}
          </Button>
          <Button
              variant="primary"
              type="button"
              class="ml-4 w-24"
              @click="saveBrand"
              :disabled="isLoading"
          >
            <template v-if="isLoading">
              <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
            </template>
            <template v-else>
              {{ brand.isEdit ? $t('common.update') : $t('common.create') }}
            </template>
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup lang="ts">
import {reactive, ref, watch, onMounted} from "vue";
import BrandForm from "./BrandForm.vue";
import Button from "../../components/Base/Button";
import { Dialog } from "../../components/Base/Headless";
import LoadingIcon from "../../components/Base/LoadingIcon";
import apiService from "../../network/api/apiService";
import { handleResponse, handleError } from "../../network/api/responseHandler";
import ErrorHandler from "@/utils/validation";

// Props and emits
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  editBrand: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(["close", "updated"]);

// Component state
const show = ref(props.showDialog);
const brand = ref({ ...props.editBrand });
const isLoading = ref(false);

// Watch for prop changes and sync state
watch(
    () => props.showDialog,
    (newVal) => {
      if (show.value !== newVal) {
        show.value = newVal;
        brand.value = { ...props.editBrand };
      }
    }
);

// Close the dialog
const closeDialog = () => {
  console.log(isLoading.value);
  if (!isLoading.value) {
    show.value = false; // Internal state
    emits("close"); // Notify parent to update `editDialog`
  }
  form.clear();
};

const form = reactive(new ErrorHandler());
const saveBrand = async () => {
  try {
    isLoading.value = true;
    let response;
    if (brand.value.id) {
      // Update brand
      response = await apiService.brand.update(brand.value.id, brand.value);
    } else {
      // Create brand
      response = await apiService.brand.create(brand.value);
    }

    const result = handleResponse(response);
    emits("updated"); // Notify parent about the update
    isLoading.value = false; // Ensure loading state is reset before closing
    closeDialog();
  } catch (error) {
    form.setErrors(error.errors);
    handleError(error);
  } finally {
    isLoading.value = false;
  }
};

// Update brand data from form
const updateBrand = (updatedBrand) => {
  brand.value = { ...updatedBrand };
};
const locale = ref('en'); // Default locale 
onMounted(()=>{
  locale.value = localStorage.getItem('locale') || 'en';
})
</script>
