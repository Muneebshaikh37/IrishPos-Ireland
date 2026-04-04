<script setup>
import { FormInput, FormLabel } from "@/components/Base/Form";
import Toastify from "toastify-js";
import Button from "@/components/Base/Button";
import { useRouter } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import { ref, onMounted, reactive, watch } from "vue";
import Notification from "../../../components/Base/Notification";
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import LoadingIcon from "@/components/Base/LoadingIcon";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";
import ErrorHandler from "@/utils/validation";
import TomSelect from "@/components/Base/TomSelect";
import httpClient from '@/network/api/httpClient';


const form = reactive(new ErrorHandler());
const {t} = useI18n();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const router = useRouter();
const isloading = ref(false);
const validationErrors = ref({
  name_en: "",
  name_ar: "",
  category_id: "",
  data_type: "",
  unit: "",
});

const createFormData = ref({
  user_id: USER_ID,
  name_en: "",
  name_ar: "",
  category_id: "",
  key_name: "",
  data_type: "string",
  unit: "none",
  options: null,
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

// Auto-generate key_name from name_en
watch(() => createFormData.value.name_en, (newVal) => {
  if (newVal) {
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

  // Validate English name
  if (!createFormData.value.name_en.trim()) {
    validationErrors.value.name_en = t('category.englishNameRequired');
    isValid = false;
  } else {
    validationErrors.value.name_en = "";
  }

  // Validate Arabic name
  if (!createFormData.value.name_ar.trim()) {
    validationErrors.value.name_ar = t('category.arabicNameRequired');
    isValid = false;
  } else {
    validationErrors.value.name_ar = "";
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

const createAttribute = async () => {
  if (!validateForm()) {
    return; // Stop submission if validation fails
  }

  try {
    isloading.value = true;
    const response = await apiService.attribute.create(createFormData.value);
    const result = handleResponse(response);

    if (result.success) {
      isloading.value = false;
      createFormData.value = {
        user_id: USER_ID,
        name_en: "",
        name_ar: "",
        category_id: "",
        key_name: "",
        data_type: "string",
        unit: "none",
        options: null,
      };
      const successEl = document
          .querySelectorAll("#success-notification-content")[0]
          .cloneNode(true);
      successEl.classList.remove("hidden");
      Toastify({
        node: successEl,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();
      router.push("/inventory/attributes");
    }
  } catch (error) {
    handleError(error);
    form.setErrors(error.errors);
    isloading.value = false;
  }
};

const locale = ref('en'); // Default locale
onMounted(()=>{
  locale.value = localStorage.getItem('locale') || 'en';
  fetchCategories();
})
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/inventory/attributes">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" :class="{ 'rotate-180': locale === 'ar', '': locale !== 'ar' }" class="w-5 h-5"/>
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('category.addNewAttribute') }}</h2>
  </div>

  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-6">
            <FormLabel>{{ $t('category.nameEnglish') }} <span class="text-danger"> *</span></FormLabel>
            <FormInput v-model="createFormData.name_en" id="name_en" type="text" :class="{ 'border-red-500': form.invalid('name_en') || validationErrors.name_en }" :placeholder="$t('category.enterEnglishName')" />
            <template v-if="form.invalid('name_en')">
              <div class="mt-1 text-xs text-red-600">{{ form.getError('name_en') }}</div>
            </template>
            <p v-if="validationErrors.name_en" class="text-red-500 text-sm mt-1">
              {{ validationErrors.name_en }}
            </p>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.nameArabic') }} <span class="text-danger"> *</span></FormLabel>
            <FormInput v-model="createFormData.name_ar" id="name_ar" type="text" :class="{ 'border-red-500': form.invalid('name_ar') || validationErrors.name_ar }" :placeholder="$t('category.enterArabicName')" />
            <template v-if="form.invalid('name_ar')">
              <div class="mt-1 text-xs text-red-600">{{ form.getError('name_ar') }}</div>
            </template>
            <p v-if="validationErrors.name_ar" class="text-red-500 text-sm mt-1">
              {{ validationErrors.name_ar }}
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
                <!-- <option value="">Select Category</option> -->
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
            <FormInput v-model="createFormData.key_name" id="key_name" type="text" :placeholder="$t('category.autoGeneratedFromEnglish')" />
            <p class="text-xs text-slate-500 mt-1">{{ $t('category.autoGeneratedEditable') }}</p>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.dataType') }} <span class="text-danger"> *</span></FormLabel>
            <div>
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
            </div>
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
            <Button variant="primary" class="mr-2 shadow-md w-28" @click="createAttribute">
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

  <Notification id="success-notification-content" class="flex hidden">
    <Lucide icon="CheckCircle" class="text-success" />
    <div class="ml-4 mr-4">
      <div class="font-medium">{{ $t('category.attributeCreatedSuccessfully') }}</div>
      <div class="mt-1 text-slate-500">
        {{ $t('category.attributeCreatedMessage') }}
      </div>
    </div>
  </Notification>
</template>

