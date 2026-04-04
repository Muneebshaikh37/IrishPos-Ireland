<script setup>
import { FormInput, FormLabel } from "@/components/Base/Form";
import Toastify from "toastify-js";
import Button from "@/components/Base/Button";
import { RouterLink, useRoute } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import { ref, onMounted, reactive, watch, nextTick } from "vue";
import Notification from "../../../components/Base/Notification";
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import LoadingIcon from "@/components/Base/LoadingIcon";
import router from "../../../router";
import { Dialog } from "../../../components/Base/Headless";
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";
import TomSelect from "@/components/Base/TomSelect";
import httpClient from '@/network/api/httpClient';

const {t} = useI18n();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const route = useRoute();
const Uuid = route.params.uuid;
const form = reactive(new ErrorHandler());
const isloading = ref(false);
const validationErrors = ref({
  name: "",
  category_id: "",
  data_type: "",
  unit: "",
});

const createFormData = ref({
  user_id: USER_ID,
  name: "",
  category_id: "",
  key_name: "",
  data_type: "string",
  unit: "none",
  options: null,
  _method: "PUT",
});

const categoryList = ref([]);

const dataTypeOptions = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
];

const unitOptions = [
  { value: "none", label: "None" },
  { value: "inch", label: "Inch" },
  { value: "mm", label: "mm (millimeter)" },
  { value: "cm", label: "cm (centimeter)" },
  { value: "m", label: "m (meter)" },
  { value: "kg", label: "kg (kilogram)" },
  { value: "g", label: "g (gram)" },
];

watch(() => createFormData.value.name, (newVal) => {
  if (newVal && !createFormData.value.key_name) {
    createFormData.value.key_name = newVal
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
});

// Fetch categories list
const fetchCategories = async () => {
  try {
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/categories", {
      params: { user_id: USER_ID },
    });
    const result = response.data;
    if (result.data) {
      // Extract unique categories from the nested structure
      const categoriesMap = new Map();
      result.data.forEach(item => {
        if (item.category && item.category.id && !categoriesMap.has(item.category.id)) {
          categoriesMap.set(item.category.id, {
            value: item.category.id,
            label: item.category.name || 'Unnamed Category'
          });
        }
      });
      categoryList.value = Array.from(categoriesMap.values());
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const validateForm = () => {
  let isValid = true;

  if (!createFormData.value.name.trim()) {
    validationErrors.value.name = t('category.attributeNameRequired');
    isValid = false;
  } else {
    validationErrors.value.name = "";
  }

  // Validate category
  if (!createFormData.value.category_id) {
    validationErrors.value.category_id = t('category.categoryRequired');
    isValid = false;
  } else {
    validationErrors.value.category_id = "";
  }

  // Validate data type
  if (!createFormData.value.data_type) {
    validationErrors.value.data_type = t('category.dataTypeRequired');
    isValid = false;
  } else {
    validationErrors.value.data_type = "";
  }

  return isValid;
};

const submitEditAttribute = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    isloading.value = true;
    const response = await apiService.attribute.edit(route.params.uuid, createFormData.value);
    const result = handleResponse(response);
    if (result.success) {
      isloading.value = false;
      toast().fry(pan.category.success(result.message))
      router.push("/inventory/attributes");
      modelCloseConfirm()
    }
  } catch (error) {
    form.setErrors(error.errors);
    toast().fry(pan.category.error(error.message))
    isloading.value = false;
    isOpenConfirmation.value = false;
  }
};

const fetchAttribute = async () => {
  try {
    isloading.value = true;
    const response = await apiService.attribute.show(route.params.uuid);
    const result = handleResponse(response);
    if (result.success) {
      const data = result.data.data;
      createFormData.value.name = data.name ?? data.name_en ?? data.name_ar ?? "";
      createFormData.value.key_name = data.key_name || "";
      createFormData.value.data_type = data.data_type || "string";
      createFormData.value.unit = data.unit || "none";
      createFormData.value.options = data.options || null;
      
      // Add the category from the response to the categoryList if it's not already there
      if (data.category && data.category.id) {
        const categoryExists = categoryList.value.some(cat => cat.value === data.category.id);
        if (!categoryExists) {
          categoryList.value.push({
            value: data.category.id,
            label: data.category.name || 'Unnamed Category'
          });
        }
      }
      
      // Set category_id after ensuring the category is in the list
      // Use nextTick to ensure TomSelect has the option available
      await nextTick();
      createFormData.value.category_id = data.category_id || "";
    }
    isloading.value = false;
  } catch (error) {
    handleError(error);
    isloading.value = false;
  }
};

onMounted(async () => {
  // Fetch categories first, then fetch attribute to ensure category list is populated
  await fetchCategories();
  await fetchAttribute();
});

const isOpenConfirmation = ref(false)
const modelOpenConfirm = () => {
  // Run validation before opening confirmation modal
  if (validateForm()) {
    isOpenConfirmation.value = true;
  }
};
const modelCloseConfirm = () => {
  isOpenConfirmation.value = false;
  fetchAttribute()
}

</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/inventory/attributes">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5   "/>
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('category.editAttribute') }}</h2>
  </div>

  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">

          <div class="col-span-6">
            <FormLabel>{{ $t('category.nameLabel') }} <span class="text-danger"> *</span></FormLabel>
            <div class="flex items-center  ">
              <FormInput v-model="createFormData.name" id="attr-name-edit" type="text" class="w-full"
                         :placeholder="$t('category.enterName')"
                         :class="{ 'border-red-500': form.invalid('name') || form.invalid('name_en') || validationErrors.name }"/>
            </div>
            <template v-if="form.invalid('name') || form.invalid('name_en')">
              <div class="mt-1 text-xs text-red-600">{{ form.getError('name') || form.getError('name_en') }}</div>
            </template>
            <p v-if="validationErrors.name" class="text-red-500 text-sm mt-1">
              {{ validationErrors.name }}
            </p>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.category') }} <span class="text-danger"> *</span></FormLabel>
            <div>
              <TomSelect
                v-model="createFormData.category_id"
                :options="{
                  placeholder: $t('category.selectCategory'),
                }"
                class="w-full"
                :class="{ 'border-red-500': form.invalid('category_id') || validationErrors.category_id }">
                <option value="">{{ $t('category.selectCategory') }}</option>
                <template v-for="category in categoryList">
                  <option :value="category.value">{{ category.label }}</option>
                </template>
              </TomSelect>
            </div>
            <template v-if="form.invalid('category_id')">
              <div class="mt-1 text-xs text-red-600">{{ form.getError('category_id') }}</div>
            </template>
            <p v-if="validationErrors.category_id" class="text-red-500 text-sm mt-1">
              {{ validationErrors.category_id }}
            </p>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.keyName') }}</FormLabel>
            <FormInput v-model="createFormData.key_name" id="key_name" type="text" class="w-full" :placeholder="$t('category.autoGeneratedFromName')" />
            <p class="text-xs text-slate-500 mt-1">{{ $t('category.autoGeneratedEditable') }}</p>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.dataType') }} <span class="text-danger"> *</span></FormLabel>
            <TomSelect
              v-model="createFormData.data_type"
              :options="{
                placeholder: $t('category.selectDataType'),
              }"
              class="w-full"
              :class="{ 'border-red-500': form.invalid('data_type') || validationErrors.data_type }">
              <template v-for="option in dataTypeOptions">
                <option :value="option.value">{{ option.label }}</option>
              </template>
            </TomSelect>
            <template v-if="form.invalid('data_type')">
              <div class="mt-1 text-xs text-red-600">{{ form.getError('data_type') }}</div>
            </template>
            <p v-if="validationErrors.data_type" class="text-red-500 text-sm mt-1">
              {{ validationErrors.data_type }}
            </p>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.unit') }}</FormLabel>
            <TomSelect
              v-model="createFormData.unit"
              :options="{
                placeholder: $t('category.selectUnit'),
              }"
              class="w-full">
              <template v-for="option in unitOptions">
                <option :value="option.value">{{ option.label }}</option>
              </template>
            </TomSelect>
          </div>

          <div class="col-span-12">
            <Button variant="primary" class="mr-2 shadow-md w-28 " @click="modelOpenConfirm">
              <template v-if="isloading">
                <LoadingIcon icon="three-dots" class="w-8 h-6 text-white"/>
              </template>
              <template v-else>
                {{ $t('category.submit') }}
              </template>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Dialog :open="isOpenConfirmation" @close="modelCloseConfirm">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="CheckCircle" class="w-16 h-16 mx-auto mt-3 text-success"/>
        <div class="mt-5 text-3xl">{{ $t('category.confirmUpdate') }}</div>
        <div class="mt-2 text-slate-500">
          {{ $t('category.confirmUpdateMessage') }}<br/>
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button variant="outline-secondary" type="button" @click="modelCloseConfirm" class="w-24 mr-1">
          {{ $t('category.cancel') }}
        </Button>
        <Button variant="primary" type="button" class="ml-4 w-24" @click="submitEditAttribute">
          {{ $t('category.save') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Notification id="success-notification-content" class="flex hidden">
    <Lucide icon="CheckCircle" class="text-success"/>
    <div class="ml-4 mr-4">
      <div class="font-medium">{{ $t('category.attributeUpdatedSuccessfully') }}</div>
      <div class="mt-1 text-slate-500">
        {{ $t('category.attributeUpdatedMessage') }}
      </div>
    </div>
  </Notification>

</template>

