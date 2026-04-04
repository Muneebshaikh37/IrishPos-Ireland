<script setup>
import {FormInput, FormLabel, FormSwitch} from "@/components/Base/Form";
import Toastify from "toastify-js";
import Button from "@/components/Base/Button";
import {RouterLink, useRoute} from "vue-router";
import Lucide from "@/components/Base/Lucide";
import {ref, onMounted, computed, reactive} from "vue";
import Notification from "../../../components/Base/Notification";
import apiService from '../../../network/api/apiService';
import {handleResponse, handleError} from "../../../network/api/responseHandler.js";
import LoadingIcon from "@/components/Base/LoadingIcon";
import router from "../../../router";
import {Dialog} from "../../../components/Base/Headless";
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"
import {useAuthStore} from "@/stores/auth.js";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const route = useRoute();
const Uuid = route.params.uuid;
const form = reactive(new ErrorHandler());
const isloading = ref(false);
const newSubCategory = ref("");
let tempIdCounter = 0; // For generating temporary IDs

const createFormData = ref({
  user_id: USER_ID,
  name: "",
  sub_category: [],
  _method: "PUT",
});

const validationErrors = ref({
  sub_category: "", // Holds error message for subcategories
});
const addCategory = () => {
  if (newSubCategory.value.trim() !== "") {
    createFormData.value.sub_category.push({
      name: newSubCategory.value.trim(),
      is_delete: 0, // Newly added subcategories are active by default
      parent_id: Uuid,
      id: `temp-${tempIdCounter++}`, // Temporary ID for frontend purposes
    });
    newSubCategory.value = "";
    validationErrors.value.sub_category = ""; // Clear error if a subcategory is added

  }
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
  if (activeCategories.value.length === 0) {
    validationErrors.value.sub_category = t('category.addSubcategoryRequired');
    isValid = false;
  } else {
    validationErrors.value.sub_category = "";
  }

  return isValid;
};


const removeCategory = (identifier) => {
  const categoryIndex = typeof identifier === "number"
      ? identifier // If identifier is an index
      : createFormData.value.sub_category.findIndex((sub) => sub.id === identifier); // Find by id

  if (categoryIndex > -1) {
    const subCategory = createFormData.value.sub_category[categoryIndex];

    if (subCategory.id && !subCategory.id.toString().startsWith("temp-")) {
      // Existing subcategory: mark as deleted
      subCategory.is_delete = 1;
    } else {
      // Newly added subcategory: remove from the array
      createFormData.value.sub_category.splice(categoryIndex, 1);
    }
  }
};

// Computed property to filter active (non-deleted) subcategories
const activeCategories = computed(() =>
    createFormData.value.sub_category.filter((sub) => sub.is_delete === 0)
);

const submitEditProductCategories = async () => {

  if (activeCategories.value.length === 0) {
    validationErrors.value.sub_category = "Please add at least one subcategory.";
    return;
  }

  try {
    // Reset temporary IDs to null before submitting
    createFormData.value.sub_category = createFormData.value.sub_category.map((sub) => ({
      ...sub,
      id: sub.id && sub.id.toString().startsWith("temp-") ? null : sub.id,
    }));
    isloading.value = true;
    const response = await apiService.category.edit(route.params.uuid, createFormData.value);
    const result = handleResponse(response);
    if (result.success) {
      isloading.value = false; 
      toast().fry(pan.category.success(result.message))
      router.push("/inventory/categories");
      modelCloseConfirm()
    }
  } catch (error) {
     
    form.setErrors(error.errors);
    toast().fry(pan.category.error(error.message))
    isloading.value = false;
    isOpenConfirmation.value = false;
  }
};

const listSubCategories = async () => {
  try {
    isloading.value = true;
    const response = await apiService.category.show(route.params.uuid);
    const result = handleResponse(response);
    if (result.success) {
      createFormData.value.name = result.data.data.name;
      createFormData.value.sub_category = result.data.data.sub_category.map((item) => ({
        ...item,
        is_delete: 0, // Ensure all subcategories start as active
      }));
    }
    isloading.value = false;
  } catch (error) {
    handleError(error);
    isloading.value = false;
  }
};

onMounted(() => {
  listSubCategories();
});

const toggleActive = async (row) => {

  try {
    const response = await apiService.category.activation(row);
    const result = handleResponse(response); 
    if (result.success) {
      toast().fry(pan.category.success(result.message))
      getUsers();
    } else { 
    }
  } catch (error) {
    const result = handleError(error);
  }
};

const isOpenConfirmation = ref(false)
const modelOpenConfirm = () => {
  // Run validation before opening confirmation modal
  if (validateForm()) {
    isOpenConfirmation.value = true;
  }
};
const modelCloseConfirm = () => {
  isOpenConfirmation.value = false;
  listSubCategories()
}

</script>

<template>
  <!-- {{ activeCategories }} -->
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/inventory/categories">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5   "/>
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('category.editCategory') }}</h2>
  </div>

  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">

          <div class="col-span-12">
            <FormLabel>{{ $t('category.category') }}</FormLabel>
            <div class="flex items-center  ">
              <FormInput v-model="createFormData.name" id="category" type="text" class="w-[60%]"
                         :placeholder="$t('category.category')"/>
            </div>
            <p v-if="validationErrors.name" class="text-red-500 text-sm mt-2">
              {{ validationErrors.name }}
            </p>

          </div>
          <div class="col-span-12">
            <FormLabel>{{ $t('category.subCategory') }}</FormLabel>
            <div class="flex items-center mb-4 w-[69%]">
              <FormInput v-model="newSubCategory" id="sub-category" type="text" class="w-[87%]"
                         :placeholder="$t('category.subCategory')"/>
              <Button variant="primary" class="ml-4 shadow-md w-[100px] flex items-center pl-2 pr-4"
                      @click="addCategory">
                <Lucide icon="Plus" class="w-5 h-5 mr-2"/>
                <p>{{ $t('category.add') }}</p>
              </Button>
            </div>


            <div class="border p-2 rounded-md min-h-[50px] w-[69%]">
              <h3 class="m-3 font-semibold">{{ $t('category.subCategories') }}</h3>

              <!-- Use activeCategories directly without additional filtering -->
              <div v-for="(category, index) in activeCategories" :key="category.id || index"  class=" ">
                <div class="w-full flex items-center mb-4 ">
                <FormInput v-model="category.name" type="text" class="mr-4 w-[92%]" :placeholder="$t('category.enterSubcategory')"/>
                <div class="flex items-center gap-2">
                  <Button variant="danger" class="shadow-md flex items-center bg-red-500"
                         @click="removeCategory(category.id || index)">
                    <Lucide icon="Trash" class="w-4 h-4 "/>
                  </Button>
                  
                  <template v-if="category.id && !category.id.toString().startsWith('temp-')">
                    <FormSwitch class="w-full mt-3 sm:w-auto sm:ml-auto sm:mt-0">
                      <FormSwitch.Input @click="toggleActive(category.id)" :checked="category.is_active" class="ml-3 mr-0"
                                        type="checkbox"/>
                    </FormSwitch>
                  </template>
                </div>
              </div> 
              <template v-if="form.invalid(`sub_category.${index}.name`)">
              <div class="mt-2 text-xs text-red-600">{{$t('category.TheSubCategory')}}</div>
            </template>
              <!-- {{ form }} -->
						<template v-if="validationErrors.sub_category">
							<div class="mt-2 text-xs text-red-600">{{ validationErrors.sub_category }}</div>
						</template>
            <!-- <template v-if="form.invalid(`${category}`)">
							<div class="mt-2 text-xs text-red-600">{{ form.getError(`${category.index}`) }}</div>
						</template> -->
              </div>
            </div>
            <p v-if="validationErrors.sub_category" class="text-red-500 text-sm mt-2">
              {{ validationErrors.sub_category }}
            </p>
          </div>
          <div class="col-span-12">
            <Button variant="primary" class="mr-2 shadow-md w-28 " @click="modelOpenConfirm">
              {{ $t('category.submit') }}
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
        <div class="mt-5 text-3xl">{{ $t('category.deleteConfirmation') }}</div>
        <div class="mt-2 text-slate-500">
          {{ $t('category.deleteWarning2') }}<br/>
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button variant="outline-secondary" type="button" @click="modelCloseConfirm" class="w-24 mr-1">
          {{$t('common.cancel') }}
        </Button>
        <Button variant="primary" type="button" class="ml-4 w-24" @click="submitEditProductCategories">
          {{$t('common.save') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Notification id="success-notification-content" class="flex hidden">
    <Lucide icon="CheckCircle" class="text-success"/>
    <div class="ml-4 mr-4">
      <div class="font-medium"> {{ $t('category.categoryCreatedSuccess') }}</div>
      <div class="mt-1 text-slate-500">
        {{ $t('category.checkCategoryListing') }}
      </div>
    </div>
  </Notification>

</template>