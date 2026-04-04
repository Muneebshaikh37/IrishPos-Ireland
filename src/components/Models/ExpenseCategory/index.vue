<script setup>
import {
  FormInput,
  FormLabel,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { ref, reactive, defineProps, defineEmits } from "vue";
import { Dialog } from "@/components/Base/Headless";
import httpClient from "@/network/api/httpClient";
import { handleResponse } from "@/network/api/responseHandler.js";
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const props = defineProps({
  expenseCategoryList: {
    type: Object,
    required: true,
  },
  expenseFields: {
    type: Object,
    required: true,
  }
});

const createFormData = ref({
  name: "",
});

const isloading = ref(false);
const isOpenCategory = ref(false);
const form = reactive(new ErrorHandler());

const emit = defineEmits(['update:loading', 'category-created']);

const resetForm = () => {
  createFormData.value.name = '';
  form.errors = {};
};

const submitCreate = async () => {
  if (!createFormData.value.name.trim()) {
    form.setError('name', 'Category name is required');
    return;
  }

  try {
    isloading.value = true;
    emit('update:loading', true);
    const response = await httpClient.post(`${import.meta.env.VITE_ACCOUNTING_API}/expenses/categories?user_id=${USER_ID}`, createFormData.value);
    const result = handleResponse(response);
    
    
      props.expenseCategoryList.push({
        value: String(response.data.data.id),
        label: response.data.data.name
      });
      props.expenseFields.expense_category = String(response.data.data.id);
      isOpenCategory.value = false;
      resetForm();
      emit('category-created', String(response.data.data.id));
    
  } catch (error) {
    form.setErrors(error.response?.data?.errors || {});
  } finally {
    isloading.value = false;
    emit('update:loading', false);
  }
};

const modelOpenCategory = () => { 
  resetForm();
  isOpenCategory.value = true; 
};

const modelCloseCategory = () => { 
  isOpenCategory.value = false; 
  resetForm(); 
};
</script>

<template>
  <Button variant="primary" class="ml-3 shadow-md" @click="modelOpenCategory" :disabled="isloading">
    
    <template v-if="isloading">
      <LoadingIcon icon="three-dots" class="w-5 h-5" />
    </template>
    <template v-else>
      <Lucide icon="Plus" class="w-5 h-5" />
    </template>
  </Button>
  <Dialog :open="isOpenCategory" @close="modelCloseCategory">
    <Dialog.Panel class="md:w-[700px]">
      <div class="py-5">
        
        <div class="border-b border-gray-300 mb-4">
          <h4 class="text-lg text-gray-800 font-semibold pb-3 px-6">Add New Expense Category</h4>
        </div>
        <div class="grid grid-cols-12 gap-6 p-6">
          <div class="col-span-12">
            <FormLabel>Category Name <span class="text-danger">*</span></FormLabel>
            <FormInput 
              v-model="createFormData.name" 
              type="text" 
              placeholder="Enter category name"
              :class="{'border-red-500': form.invalid('name')}"
              :disabled="isloading"
              @keyup.enter="submitCreate"
            />
            <template v-if="form.invalid('name')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('name') }}</div>
            </template>
          </div>
          
        </div>
        <div class="px-5 py-4 text-left flex items-center">
          <Button 
            variant="outline-secondary" 
            type="button" 
            @click="modelCloseCategory" 
            class="w-24 mr-4"
            :disabled="isloading"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="button" 
            @click="submitCreate"
            :disabled="isloading || !createFormData.name.trim()"
          >
            <template v-if="isloading">
              <LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
            </template>
            <template v-else>
              Create Category
            </template>
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template> 