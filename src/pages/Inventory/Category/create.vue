<script setup>
import { FormInput, FormLabel } from "@/components/Base/Form";
import Toastify from "toastify-js";
import Button from "@/components/Base/Button";
import { useRouter } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import { ref, onMounted, reactive } from "vue";
import Notification from "../../../components/Base/Notification";
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import LoadingIcon from "@/components/Base/LoadingIcon";
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";
import ErrorHandler from "@/utils/validation";


const form = reactive(new ErrorHandler());
const {t} = useI18n();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const router = useRouter();
const isloading = ref(false);
const newSubCategory = ref("");
const validationErrors = ref({
  name: "",
  sub_category: "",
});

const createFormData = ref({
  user_id: USER_ID,
  name: "",
  sub_category: [],
});

const addCategory = () => {
  if (newSubCategory.value.trim() !== "") {
    createFormData.value.sub_category.push({ name: newSubCategory.value.trim() });
    newSubCategory.value = "";
    validationErrors.value.sub_category = ""; // Clear subcategory error if valid
  }
};

const removeCategory = (index) => {
  createFormData.value.sub_category.splice(index, 1);
};

const validateForm = () => {
  let isValid = true;

  // Validate category name
  if (!createFormData.value.name.trim()) {
    validationErrors.value.name = t('category.categoryNameRequired');
    isValid = false;
  } else {
    validationErrors.value.name = "";
  }

  // Validate subcategories
  if (createFormData.value.sub_category.length === 0) {
    validationErrors.value.sub_category = t('category.addSubcategoryRequired');
    isValid = false;
  } else {
    validationErrors.value.sub_category = "";
  }

  return isValid;
};

const createProductCategories = async () => {
  if (!validateForm()) {
    return; // Stop submission if validation fails
  }

  try {
    isloading.value = true;
    const response = await apiService.category.create(createFormData.value, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const result = handleResponse(response);
 
    if (result.success) {
      isloading.value = false;
      createFormData.value = {
        user_id: USER_ID,
        name: "",
        sub_category: [],
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
      router.push("/inventory/categories");
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
})
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/inventory/categories">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" :class="{ 'rotate-180': locale === 'ar', '': locale !== 'ar' }" class="w-5 h-5"/>
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('category.addNewCategory') }}</h2>
  </div>

  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12">
            <FormLabel>{{ $t('category.category') }}</FormLabel>
            <div class="flex items-center">
              <FormInput v-model="createFormData.name" id="category" type="text"  :class="{ 'border-red-500': form.invalid('name') }"  class="w-[60%]" :placeholder="$t('category.category')" />
            </div>
            <template v-if="form.invalid('name')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('name') }}</div>
            </template>
            <p v-if="validationErrors.name" class="text-red-500 text-sm mt-2">
              {{ validationErrors.name }}
            </p>
          </div>

          <div class="col-span-12">
            <FormLabel>{{ $t('category.subCategory') }}</FormLabel>
            <div class="flex items-center mb-4">
              <FormInput v-model="newSubCategory" id="sub-category" class="w-[60%]" type="text" :placeholder="$t('category.subCategory')" />
              <Button variant="primary" :class="{ 'mr-4 ': locale === 'ar', 'ml-4 ': locale !== 'ar' }" class="shadow-md w-28 flex items-center pl-2 pr-4" @click="addCategory">
                <Lucide icon="Plus" class="w-5 h-5 mr-2"/>
                <span>{{ $t('category.add') }}</span>
              </Button>
            </div>

            <div class="border p-2 rounded-md min-h-[50px] w-[70%]">
              <h3 class="m-3 font-semibold">{{ $t('category.subCategories') }}</h3>
              <div v-for="(category, index) in createFormData.sub_category" :key="index" class="">
                <div class="flex items-center mb-2">
                  <FormInput v-model="category.name" type="text" class="mr-4 w-[87%]" :placeholder="$t('category.enterSubcategory')" />
                <Button variant="danger" :class="{ 'mr-4': locale === 'ar', '': locale !== 'ar' }" class="shadow-md flex items-center" @click="removeCategory(index)">
                  <Lucide icon="Trash" class="w-5 h-5"/>
                </Button>
                </div>
                <template v-if="form.invalid(`sub_category`)">
              <div class="mt-2 text-xs text-red-600">{{$t('category.TheSubCategory')}}</div>
            </template>
            
              </div>

            </div>
            <p v-if="validationErrors.sub_category" class="text-red-500 text-sm mt-2">
              {{ validationErrors.sub_category }}
            </p>
          </div>

          <div class="col-span-12">
            <Button variant="primary" class="mr-2 shadow-md w-28" @click="createProductCategories">
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
      <div class="font-medium">{{ $t('category.categoryCreatedSuccess') }}</div>
      <div class="mt-1 text-slate-500">
        {{ $t('category.checkCategoryListing') }}
      </div>
    </div>
  </Notification>
</template>