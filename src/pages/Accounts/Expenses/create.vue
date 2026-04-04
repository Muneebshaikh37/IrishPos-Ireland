<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
  FormSelect,
  FormCheck,
} from "@/components/Base/Form";
import httpClient from "@/network/api/httpClient";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { ref, reactive, onMounted } from "vue";
import { handleResponse } from "@/network/api/responseHandler.js";
import router from "@/router";
import LoadingIcon from '@/components/Base/LoadingIcon/LoadingIcon.vue';
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import ErrorHandler from "@/utils/validation";
import TomSelect from "@/components/Base/TomSelect/TomSelect.vue";
import ExpenseCategory from "@/components/Models/ExpenseCategory/index.vue";
import {useAuthStore} from "@/stores/auth.js";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import { Dialog } from "@/components/Base/Headless";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const createFormData = ref({
  expense_name: "",
  expense_category: "",
  date: "",
  amount_paid_via_cash: "",
  amount_paid_via_bank: "",
  reference_number: "",
  attachments: [],
});

const categoryFormData = ref({
  name: "",
});

const expenseCategoryOptions = ref([]);
const paymentMethodOptions = ref([]);
const branchOptions = ref([]); 
const form = reactive(new ErrorHandler());
const imagePreviews = ref([]);
const createFormDatacategory = ref({
  name: "",
});

const isloading = ref(false);
const isOpenCategory = ref(false); 

const emit = defineEmits(['update:loading', 'category-created']);

const resetForm = () => {
  categoryFormData.value.name = '';
  form.errors = {};
};

const submitCreateCategory = async () => {
  if (!categoryFormData.value.name.trim()) {
    form.setError('name', 'Category name is required');
    return;
  }

  try {
    isloading.value = true;
    emit('update:loading', true);
    const response = await httpClient.post(`${import.meta.env.VITE_ACCOUNTING_API}/expenses/categories?user_id=${USER_ID}`, categoryFormData.value);
    
    // Add new category to options list
    const newCategory = {
      value: response.data.data.id,
      label: response.data.data.name
    };
    
    // Add to options list
    expenseCategoryOptions.value.push(newCategory);
    
    // Set as selected category
    createFormData.value.expense_category = response.data.data.id;
    
    isOpenCategory.value = false;
    resetForm();
    toast().fry('Category created successfully!');
    
  } catch (error) {
    form.setErrors(error.response?.data?.errors || {});
    toast().fry(pan.expense.error(error.message));
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
const fetchDropdowns = async () => {
  try {
    // Fetch expense categories from API
    const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/expenses/categories?user_id=${USER_ID}`);
    if (response.data && response.data.data) {
      expenseCategoryOptions.value = response.data.data.map(category => ({
        value: category.id,
        label: category.name
      }));
    }
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    toast().fry(pan.expense.error(error.message));
  }

  // Keep existing dummy data for other dropdowns
  paymentMethodOptions.value = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank' },
    { value: 'cheque', label: 'Cheque' },
  ];
  branchOptions.value = [
    { value: 'lahore', label: 'Lahore' },
    { value: 'karachi', label: 'Karachi' },
    { value: 'islamabad', label: 'Islamabad' },
  ];
};

const refreshCategories = (newCategoryId) => {
  if (newCategoryId) {
    createFormData.value.expense_category = newCategoryId;
  }
};

onMounted(() => {
  fetchDropdowns();
});

const submitCreateExpense = async (saveAndAddNew = false) => {
  isloading.value = true;
  try {
    const formData = new FormData();
    formData.append('expense_type', createFormData.value.expense_name);
    formData.append('account_id', createFormData.value.expense_category);
    formData.append('entry_date', createFormData.value.date);
    formData.append('amount_paid_via_cash', createFormData.value.amount_paid_via_cash || '0');
    formData.append('amount_paid_via_bank', createFormData.value.amount_paid_via_bank || '0');
    formData.append('notes', createFormData.value.notes || '');
    formData.append('reference_number', createFormData.value.reference_number || '');
    
    // Attachments
    createFormData.value.attachments.forEach((file) => {
      formData.append('attachment', file);
    });

    const response = await httpClient.post(
      `${import.meta.env.VITE_ACCOUNTING_API}/expenses?user_id=${USER_ID}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    const result = handleResponse(response);
    if (result.success) {
      // toast().fry('Expense created successfully!');
      if (!saveAndAddNew) {
        router.push('/account/expenses');
      } else {
        // Reset form for new entry
        createFormData.value = {
          expense_name: "",
          expense_category: "",
          date: "",
          amount_paid_via_cash: "",
          amount_paid_via_bank: "",
          reference_number: "",
          attachments: [],
        };
        imagePreviews.value = [];
      }
    }
  } catch (error) {
    // toast().fry(pan.expense.error(error.message));
    form.setErrors(error.response?.data?.errors || {});
  } finally {
    isloading.value = false;
  }
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  // Allow images and PDFs
  const allowedFiles = files.filter(file =>
    file.type.startsWith('image/') || file.type === 'application/pdf'
  );
  createFormData.value.attachments = allowedFiles;

  // Generate previews (only for images and PDFs)
  imagePreviews.value = [];
  allowedFiles.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push({ type: 'image', src: e.target.result });
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      imagePreviews.value.push({ type: 'pdf', name: file.name });
    }
  });
};

const removeImage = (idx) => {
  createFormData.value.attachments.splice(idx, 1);
  imagePreviews.value.splice(idx, 1);
};
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/account/expenses">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">Add New Expense</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 md:col-span-6">
            <FormLabel>Expenses Name <span class="text-danger">*</span></FormLabel>
            <FormInput v-model="createFormData.expense_name" type="text" placeholder="Select" :class="{'border-red-500': form.invalid('expense_type')}" />
            <template v-if="form.invalid('expense_type')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('expense_type') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-6">
            <FormLabel>Date <span class="text-danger">*</span></FormLabel>
            <FormInput v-model="createFormData.date" type="date" placeholder="Date" :class="{'border-red-500': form.invalid('entry_date')}" />
            <template v-if="form.invalid('entry_date')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('entry_date') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-6">
            <FormLabel>Expenses Category <span class="text-danger">*</span></FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect 
                v-model="createFormData.expense_category"
                class="w-full"
                :class="{'border-red-500': form.invalid('account_id')}"
                :disabled="isloading"
              >
                <option value=""></option>
                <template v-for="option in expenseCategoryOptions" :key="option.value">
                  <option :value="option.value">{{ option.label }}</option>
                </template>
              </TomSelect>
              <Button variant="primary" class="ml-3 shadow-md" @click="modelOpenCategory" :disabled="isloading">
    
    <template v-if="isloading">
      <LoadingIcon icon="three-dots" class="w-5 h-5" />
    </template>
    <template v-else>
      <Lucide icon="Plus" class="w-5 h-5" />
    </template>
  </Button>
              <!-- <ExpenseCategory 
                :expense-category-list="expenseCategoryOptions" 
                :expense-fields="createFormData"
                @update:loading="isloading = $event"
                @category-created="refreshCategories"
              /> -->
            </div>
            <template v-if="form.invalid('account_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('account_id') }}</div>
            </template>
          </div>
          
           
          
          <div class="col-span-12 md:col-span-6">
            <FormLabel>Amount Paid via Cash  </FormLabel>
            <FormInput v-model="createFormData.amount_paid_via_cash" type="number" min="0" step="0.01" placeholder="Amount" :class="{'border-red-500': form.invalid('amount')}" />
            <template v-if="form.invalid('amount')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('amount') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-6">
            <FormLabel>Amount Paid via Bank  </FormLabel>
            <FormInput v-model="createFormData.amount_paid_via_bank" type="number" min="0" step="0.01" placeholder="Amount" :class="{'border-red-500': form.invalid('amount')}" />
            <template v-if="form.invalid('amount')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('amount') }}</div>
            </template>
          </div>
          <div class="col-span-12 md:col-span-6">
            <FormLabel>Reference </FormLabel>
            <FormInput v-model="createFormData.reference_number" type="text" placeholder="Enter Reference Number " />
          </div>
          
          <div class="col-span-12 md:col-span-12">
            <FormLabel>Note</FormLabel>
            <FormTextarea v-model="createFormData.notes" rows="4" type="text" placeholder="Enter Note " class="w-full" />
          </div>
          
          <div class="col-span-12">
            <FormLabel>Attachments  </FormLabel>
            <div
              class="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-12 bg-white relative"
              style="min-height: 180px;"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*,.pdf"
                multiple
                @change="handleFileUpload"
                class="hidden"
              />
              <Lucide icon="FileText" class="w-12 h-12 text-gray-400 mb-2" />
              <div class="text-base font-medium mb-1">Upload Images</div>
              <div class="text-xs text-gray-400 mb-4">Max 5MB - PNG, JPG, PDF</div>
              <button
                type="button"
                class="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded transition"
                @click="$refs.fileInput.click()"
              >
                Upload
              </button>
              <div
                v-if="imagePreviews.length"
                class="flex flex-wrap gap-4 mt-6 justify-center w-full"
              >
                <div
                  v-for="(file, idx) in imagePreviews"
                  :key="idx"
                  class="relative w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50"
                >
                  <template v-if="file.type === 'image'">
                    <img :src="file.src" class="object-cover w-full h-full" />
                  </template>
                  <template v-else>
                    <div class="flex flex-col items-center justify-center w-full h-full">
                      <Lucide icon="FileText" class="w-8 h-8 text-gray-400 mb-1" />
                      <span class="text-xs text-center">{{ file.name }}</span>
                    </div>
                  </template>
                  <button
                    type="button"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    @click="removeImage(idx)"
                    title="Remove"
                  >×</button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-12 flex justify-end gap-2 mt-4"> 
            <Button variant="primary" @click="() => submitCreateExpense(false)">Submit</Button>
          </div>
        </div>
      </div>
    </div>
  </div>

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
              v-model="categoryFormData.name" 
              type="text" 
              placeholder="Enter category name"
              :class="{'border-red-500': form.invalid('name')}"
              :disabled="isloading"
              @keyup.enter="submitCreateCategory"
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
            @click="submitCreateCategory"
            :disabled="isloading || !categoryFormData.name.trim()"
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
  <div v-if="isloading"
       class="fixed top-0 w-full h-full left-0 flex items-center justifty-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
                 :color="'#fff'" :size="'50px'"></clip-loader>
  </div>
   
</template>

<style scoped>
</style>
