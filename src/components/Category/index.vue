<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { RouterLink } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import TomSelect from "../../components/Base/TomSelect";
import { ref, onMounted, defineProps, watch, watchEffect, reactive, computed, nextTick } from "vue";
import { Dialog, Menu } from "@/components/Base/Headless";

import apiService from '../../network/api/apiService';
import { handleResponse, handleError } from "../../network/api/responseHandler.js";
import ErrorHandler from "@/utils/validation";
import httpClient from '@/network/api/httpClient';

import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

/** POST /categories, /sub-categories, /brands return the model as the JSON body ({ id, ... }). */
const idFromStoreResponse = (body) => {
  if (!body || typeof body !== "object") return "";
  const raw = body.id ?? body.data?.id;
  return raw != null && raw !== "" ? String(raw) : "";
};

const props = defineProps({
  createFormData: {
    type: Object,
    required: true,
  },
  isProductBankData:{
    type: Object,
    required: false
  },
  form:{
    type: Object,
    required: true,
  }
})

const formError = reactive(new ErrorHandler());
const formScError = reactive(new ErrorHandler());
const formBrandError = reactive(new ErrorHandler());
const isloading = ref(false)
const CategoryList = ref()
const allSubCategory = ref([])
const allBrand = ref()
const CreateNewCategory = ref("")
const CreateNewSubCategory = ref("")
const CreateNewBrand = ref("")

const isCategoryList = async () => {
  try {
    const response = await apiService.product.categoryList();
    const result = handleResponse(response);
    if (result.success) {
      CategoryList.value = result.data.data
    }
  } catch (error) {
    const result = handleError(error);
  }
}

const submitCategory = async () => {
  try {
    const payload = {
      name: CreateNewCategory.value,
      user_id: USER_ID
    };
    const response = await apiService.product.categoryCreate(payload);
    const result = handleResponse(response);
    if (result.success) {
      OpenCategory.value = false;
      await isCategoryList();
      const newId = idFromStoreResponse(result.data);
      if (newId) {
        props.createFormData.category_id = newId;
        props.createFormData.SubCategorySelect = "";
        allSubCategory.value = [];
      }
      CreateNewCategory.value = "";
    }
  } catch (error) {
    handleError(error);
    formError.setErrors(error.errors);
  }
}

const isSubCategoryList = async () => {
  try {
    const response = await apiService.product.subCategoryList(props.createFormData.category_id);
    const result = handleResponse(response);
    if (result.success) {
      allSubCategory.value = result.data.data
    }
  } catch (error) {
    handleError(error);
  }
}

const submitSubCategory = async () => {
  const selectedCategoryId = String(props.createFormData.category_id || "").trim();
  if (!selectedCategoryId) {
    formScError.setErrors({ name: ["Please select category first."] });
    return;
  }
  try {
    const payload = {
      name: CreateNewSubCategory.value,
    }
    const response = await apiService.product.subCategoryCreate(selectedCategoryId, payload);
    const result = handleResponse(response);
    if (result.success) {
      OpenSubCategory.value = false;
      await isSubCategoryList();
      const newId = idFromStoreResponse(result.data);
      if (newId) {
        props.createFormData.SubCategorySelect = newId;
      }
      CreateNewSubCategory.value = "";
      formScError.clear();
    }
  } catch (error) {
    handleError(error);
    formScError.setErrors(error.errors);
  }
}

const isBrandsList = async () => {
  try {
    const response = await apiService.product.brandsList();
    const result = handleResponse(response);
    if (result.success) {
      allBrand.value = result.data.data
    }
  } catch (error) {
    const result = handleError(error);
  }
}

const submitBrand = async () => {
  try {
    const payload = {
      name: CreateNewBrand.value,
      user_id: USER_ID
    };
    const response = await apiService.product.brandsCreate(payload);
    const result = handleResponse(response);
    if (result.success) {
      await isBrandsList();
      const newId = idFromStoreResponse(result.data);
      if (newId) {
        props.createFormData.brand_id = newId;
      }
      OpenBrand.value = false;
      CreateNewBrand.value = "";
    }
  } catch (error) {
    handleError(error);
    formBrandError.setErrors(error.errors);
  }
}

watch(
    () => props.createFormData.category_id,
    (newValue) => {
      if (newValue) {
        isSubCategoryList();
        fetchAttributes(newValue);
      } else {
        availableAttributes.value = [];
        productAttributes.value = [];
      }
    }
);
// watch(
//     () => props.createFormData.category_id,
//     (newValue) => {
//         if (newValue) {
//             isSubCategoryList();
//             CreateNewCategory.value = CategoryList.value.find(cat => cat.id === newValue)?.name || "";
//         }
//     }
// );

let isCategoryResolved = ref(false);

watchEffect(async () => {
  if (props.isProductBankData && !props.createFormData.category_id) {
    if (props.isProductBankData.category?.name) {
      const matchedCategory = CategoryList.value.find(
          list => list?.name === props.isProductBankData.category.name
      );

      props.createFormData.category_id = matchedCategory ? matchedCategory.id : "";
      CreateNewCategory.value = matchedCategory ? matchedCategory.name : "";
    }

    if (props.createFormData.category_id && props.isProductBankData.subcategory?.name) {
      const matchedSubCategory = allSubCategory.value.find(
          list => list?.name === props.isProductBankData.subcategory.name
      );

      props.createFormData.SubCategorySelect = matchedSubCategory ? matchedSubCategory.id : "";
      CreateNewSubCategory.value = matchedSubCategory ? matchedSubCategory.name : "";
    }

    if (props.isProductBankData.brand?.name) {
      const matchedBrand = allBrand.value.find(
          list => list?.name === props.isProductBankData.brand.name
      );

      props.createFormData.brand_id = matchedBrand ? matchedBrand.id : "";
      CreateNewBrand.value = matchedBrand ? matchedBrand.name : "";
    }
  }
});

const normalizeId = (value) =>
  value === null || value === undefined || value === "" ? "" : String(value);

watch(
  () => CategoryList.value,
  () => {
    const selectedCategoryId = normalizeId(props.createFormData.category_id);
    if (!selectedCategoryId || !Array.isArray(CategoryList.value)) return;

    const exists = CategoryList.value.some((item) => normalizeId(item?.id) === selectedCategoryId);
    if (!exists) return;

    nextTick(() => {
      props.createFormData.category_id = "";
      nextTick(() => {
        props.createFormData.category_id = selectedCategoryId;
      });
    });
  },
  { deep: true }
);

watch(
  () => allSubCategory.value,
  () => {
    const selectedSubCategoryId = normalizeId(props.createFormData.SubCategorySelect);
    if (!selectedSubCategoryId || !Array.isArray(allSubCategory.value)) return;

    const exists = allSubCategory.value.some((item) => normalizeId(item?.id) === selectedSubCategoryId);
    if (!exists) return;

    nextTick(() => {
      props.createFormData.SubCategorySelect = "";
      nextTick(() => {
        props.createFormData.SubCategorySelect = selectedSubCategoryId;
      });
    });
  },
  { deep: true }
);

watch(
  () => allBrand.value,
  () => {
    const selectedBrandId = normalizeId(props.createFormData.brand_id);
    if (!selectedBrandId || !Array.isArray(allBrand.value)) return;

    const exists = allBrand.value.some((item) => normalizeId(item?.id) === selectedBrandId);
    if (!exists) return;

    nextTick(() => {
      props.createFormData.brand_id = "";
      nextTick(() => {
        props.createFormData.brand_id = selectedBrandId;
      });
    });
  },
  { deep: true }
);

const locale = ref('en'); // Default locale
onMounted(() => {
  locale.value = localStorage.getItem('locale') || 'en';
  isCategoryList()
  isBrandsList()
})

const OpenCategory = ref(false)
const OpenSubCategory = ref(false)
const OpenBrand = ref(false)
const modelOpenCategory = () => { OpenCategory.value = true }
const modelCloseCategory = () => { OpenCategory.value = false; CreateNewCategory.value = ""; }
const modelOpenSubCategory = () => {
  if (!props.createFormData.category_id) {
    formScError.setErrors({ name: ["Please select category first."] });
    return;
  }
  OpenSubCategory.value = true;
}
const modelCloseSubCategory = () => {
  OpenSubCategory.value = false;
  formScError.clear();
}
const modelOpenBrand = () => { OpenBrand.value = true }
const modelCloseBrand = () => { OpenBrand.value = false }

// Attributes functionality
const availableAttributes = ref([])
const isLoadingAttributes = ref(false)
const productAttributes = ref([]) // Array of selected attributes with values
const OpenAttribute = ref(false)
const formAttributeError = reactive(new ErrorHandler())
const CreateNewAttribute = ref({
  name: "",
  category_id: "",
  key_name: "",
  data_type: "string",
  unit: "none",
})

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

watch(() => CreateNewAttribute.value.name, (newVal) => {
  if (newVal) {
    CreateNewAttribute.value.key_name = newVal
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
});

const fetchAttributes = async (categoryId) => {
  if (!categoryId) {
    availableAttributes.value = [];
    // Reset product attributes when category changes
    productAttributes.value = [];
    if (props.createFormData.product_attributes) {
      props.createFormData.product_attributes = [];
    }
    return;
  }
  try {
    isLoadingAttributes.value = true;
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL + "/attributes", {
      params: { user_id: USER_ID },
    });
    const result = response.data;
    if (result.data) {
      // Filter attributes by category_id - convert both to strings for comparison
      const categoryIdStr = String(categoryId);
      availableAttributes.value = (result.data || []).filter(
        (attr) => attr.category_id && String(attr.category_id) === categoryIdStr
      );
    }
    // Always sync after attributes are loaded
    syncProductAttributes();
  } catch (error) {
    handleError(error);
  } finally {
    isLoadingAttributes.value = false;
  }
};

// Initialize product_attributes in createFormData if it doesn't exist
if (!props.createFormData.product_attributes) {
  props.createFormData.product_attributes = [];
}

const syncProductAttributes = () => {
  const formAttributes = Array.isArray(props.createFormData.product_attributes)
    ? props.createFormData.product_attributes
    : [];

  productAttributes.value = formAttributes.map((attr) => {
    // Only use attribute_id if it's explicitly set and not null
    // Never fall back to id - if attribute_id is null or undefined, keep it null
    let attributeId = null;
    if (attr?.attribute_id !== null && attr?.attribute_id !== undefined && attr?.attribute_id !== '') {
      attributeId = attr.attribute_id;
    }
    
    // Convert to string only if we have a valid attributeId
    const attributeIdStr = (attributeId !== null && attributeId !== undefined && attributeId !== '') 
      ? String(attributeId) 
      : null;
    
    const attributeMeta = attributeIdStr 
      ? availableAttributes.value.find(
          (availableAttr) => availableAttr && String(availableAttr.id) === attributeIdStr
        )
      : null;

    // Use attribute from availableAttributes if found, otherwise use the one from API response
    // But only if we have a valid attributeIdStr
    const finalAttribute = attributeIdStr && attributeMeta
      ? { ...attributeMeta }
      : (attributeIdStr && attr?.attribute)
        ? { ...attr.attribute }
        : null;

    return {
      attribute_id: attributeIdStr, // Will be null if no valid attribute_id was found
      value: attr?.value ?? null,
      attribute: finalAttribute,
    };
  });
};

watch(
  () => props.createFormData.product_attributes,
  () => {
    syncProductAttributes();
  },
  { deep: true, immediate: true }
);

watch(
  () => availableAttributes.value,
  () => {
    // Always sync when availableAttributes change, especially when they load
    // This ensures product_attributes are synced even if they were set before attributes loaded
    // The syncProductAttributes function will preserve null attribute_id values
    if (props.createFormData.product_attributes && props.createFormData.product_attributes.length > 0) {
      syncProductAttributes();
    }
  },
  { deep: true }
);

// Add new attribute field
const addAttributeField = () => {
  if (!props.createFormData.product_attributes) {
    props.createFormData.product_attributes = [];
  }
  // Add to form data first with explicit null values - ensure no id property exists
  const newAttr = {
    attribute_id: null,
    value: null,
  };
  // Explicitly remove any id property if it exists
  delete newAttr.id;
  props.createFormData.product_attributes.push(newAttr);
  
  // Then sync to productAttributes - this ensures syncProductAttributes handles it correctly
  syncProductAttributes();
  
  // Force reactivity update to ensure no auto-selection happens
  nextTick(() => {
    const lastIndex = productAttributes.value.length - 1;
    if (productAttributes.value[lastIndex]) {
      // Explicitly ensure no selection - set all related fields to null/empty
      productAttributes.value[lastIndex].attribute_id = null;
      productAttributes.value[lastIndex].value = null;
      productAttributes.value[lastIndex].attribute = null;
      
      // Also update form data to ensure consistency - explicitly set to null
      if (props.createFormData.product_attributes[lastIndex]) {
        props.createFormData.product_attributes[lastIndex].attribute_id = null;
        props.createFormData.product_attributes[lastIndex].value = null;
        // Remove any id property that might have been added
        delete props.createFormData.product_attributes[lastIndex].id;
      }
    }
  });
};

// Remove attribute field
const removeAttributeField = (index) => {
  productAttributes.value.splice(index, 1);
  if (props.createFormData.product_attributes) {
    props.createFormData.product_attributes.splice(index, 1);
  }
};

// When attribute is selected, find and store the full attribute object
const onAttributeSelected = (index, attributeId) => {
  // Ensure index is valid
  if (!productAttributes.value[index]) {
    return;
  }

  if (!attributeId || attributeId === "") {
    // Reset if no attribute selected
    productAttributes.value[index].attribute = null;
    productAttributes.value[index].attribute_id = null;
    productAttributes.value[index].value = null;

    if (props.createFormData.product_attributes[index]) {
      props.createFormData.product_attributes[index].attribute_id = null;
      props.createFormData.product_attributes[index].value = null;
    }
    return;
  }

  // Convert to string for consistent comparison
  const attributeIdStr = String(attributeId);
  const selectedAttribute = availableAttributes.value.find(attr => attr && String(attr.id) === attributeIdStr);
  if (selectedAttribute && productAttributes.value[index]) {
    // Use Vue's reactivity by updating the object directly
    productAttributes.value[index].attribute = { ...selectedAttribute }; // Create a copy to ensure reactivity
    productAttributes.value[index].attribute_id = attributeIdStr;

    // Update createFormData
    if (!props.createFormData.product_attributes[index]) {
      props.createFormData.product_attributes[index] = {
        attribute_id: attributeIdStr,
        value: null
      };
    } else {
      props.createFormData.product_attributes[index].attribute_id = attributeIdStr;
      props.createFormData.product_attributes[index].value = null;
    }
  }
};

// Update attribute value in createFormData
const updateAttributeValue = (index, value) => {
  if (!props.createFormData.product_attributes[index]) {
    props.createFormData.product_attributes[index] = {
      attribute_id: productAttributes.value[index].attribute_id,
      value: value
    };
  } else {
    props.createFormData.product_attributes[index].value = value;
  }
};

// Get available attributes that haven't been selected yet (excluding current selection)
const getAvailableAttributesForDropdown = (currentIndex) => {
  // Ensure we return an array
  if (!availableAttributes.value || !Array.isArray(availableAttributes.value)) {
    return [];
  }

  // Filter out null/undefined attributes
  return availableAttributes.value.filter(attr => attr && attr.id);
};

// Computed property to check if all available attributes have been selected
const hasUnselectedAttributes = computed(() => {
  // If no attributes are available, don't show the button
  if (!availableAttributes.value || !Array.isArray(availableAttributes.value) || availableAttributes.value.length === 0) {
    return false;
  }
  
  // Get all valid available attribute IDs
  const allAttributeIds = availableAttributes.value
    .filter(attr => attr && attr.id)
    .map(attr => String(attr.id));
  
  // If no valid attributes, don't show the button
  if (allAttributeIds.length === 0) {
    return false;
  }
  
  // Get all selected attribute IDs (excluding null/undefined/empty string)
  const selectedAttributeIds = productAttributes.value
    .map(attr => {
      const attrId = attr?.attribute_id;
      // Convert to string and filter out null, undefined, and empty string
      if (attrId === null || attrId === undefined || attrId === '') {
        return null;
      }
      return String(attrId);
    })
    .filter(id => id !== null);
  
  // Remove duplicates
  const uniqueSelectedIds = [...new Set(selectedAttributeIds)];
  
  // Return true if there are unselected attributes
  // This means: there's at least one available attribute that hasn't been selected yet
  const hasUnselected = allAttributeIds.some(attrId => !uniqueSelectedIds.includes(attrId));
  
  return hasUnselected;
});

// Create new attribute
const submitAttribute = async () => {
  try {
    const payload = {
      ...CreateNewAttribute.value,
      category_id: props.createFormData.category_id,
      user_id: USER_ID,
    };
    const response = await apiService.attribute.create(payload);
    const result = handleResponse(response);
    if (result.success) {
      OpenAttribute.value = false;
      CreateNewAttribute.value = {
        name: "",
        category_id: props.createFormData.category_id,
        key_name: "",
        data_type: "string",
        unit: "none",
      };
      // Refresh attributes list
      fetchAttributes(props.createFormData.category_id);
    }
  } catch (error) {
    handleError(error);
    formAttributeError.setErrors(error.errors);
  }
};

const modelOpenAttribute = () => {
  CreateNewAttribute.value.category_id = props.createFormData.category_id;
  OpenAttribute.value = true;
}
const modelCloseAttribute = () => {
  OpenAttribute.value = false;
  CreateNewAttribute.value = {
    name: "",
    category_id: props.createFormData.category_id,
    key_name: "",
    data_type: "string",
    unit: "none",
  };
  formAttributeError.clear();
}
</script>

<template>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12">
            <h3 class="mr-auto text-lg font-medium -mb-1">{{ $t('category.productClassification') }}</h3>
          </div>
          <div class="col-span-6">
            <FormLabel for="category_id">{{ $t('category.category') }} <span class="text-danger"> *</span></FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="props.createFormData.category_id" :options="{
                                placeholder: $t('category.selectCategory'),
                            }" class="w-full" id="category_id" :class="{ 'border-red-500': form.invalid('category_id') }">
                <option></option>
                <template v-for="list in CategoryList">
                  <option :value="String(list.id)">{{ list.name }}</option>
                </template>
              </TomSelect>
              <Button variant="primary" class="shadow-md" :class="{ 'mr-3': locale === 'ar', 'ml-3 ': locale !== 'ar' }" @click="modelOpenCategory">
                <Lucide icon="Plus" class="w-5 h-5" />
              </Button>
            </div>
            <template v-if="form.invalid('category_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('category_id') }}</div>
            </template>
          </div>
          <div class="col-span-6">
            <FormLabel for="SubCategorySelect">{{ $t('category.subCategory') }} <span class="text-danger"> *</span> </FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="props.createFormData.SubCategorySelect"
                         :options="{ placeholder: $t('category.selectSubCategory') }" id="SubCategorySelect" class="w-full" :class="{ 'border-red-500': form.invalid('sub_category_id') }">
                <template v-for="sb in allSubCategory" :key="sb.id">
                  <option :value="String(sb.id)">{{ sb.name }}</option>
                </template>
              </TomSelect>
              <Button variant="primary" :class="{ 'mr-3': locale === 'ar', 'ml-3 ': locale !== 'ar' }" class="shadow-md" @click="modelOpenSubCategory">
                <Lucide icon="Plus" class="w-5 h-5" />
              </Button>
            </div>
            <template v-if="form.invalid('sub_category_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('sub_category_id') }}</div>
            </template>
          </div>
          <div class="col-span-6">
            <FormLabel for="brand_id">{{ $t('category.brand') }} <span class="text-danger"> *</span> </FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="props.createFormData.brand_id" :options="{
                                placeholder: $t('category.selectBrand'),
                            }" class="w-full" id="brand_id" :class="{ 'border-red-500': form.invalid('brand_id') }">
                <option></option>
                <template v-for="list in allBrand">
                  <option :value="String(list.id)">{{ list.name }}</option>
                </template>
              </TomSelect>
              <Button variant="primary" :class="{ 'mr-3': locale === 'ar', 'ml-3 ': locale !== 'ar' }" class="shadow-md" @click="modelOpenBrand">
                <Lucide icon="Plus" class="w-5 h-5" />
              </Button>
            </div>
            <template v-if="form.invalid('brand_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('brand_id') }}</div>
            </template>
          </div>

          <!-- Attributes Section -->
          <div class="col-span-12 mt-6" v-if="props.createFormData.category_id">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium">{{ $t('category.productAttributes') }}</h3>
              <Button
                variant="primary"
                class="shadow-md flex items-center gap-2"
                @click="modelOpenAttribute">
                <Lucide icon="Plus" class="w-4 h-4" />
                {{ $t('category.addNewAttribute') }}
              </Button>
            </div>

            <div v-if="isLoadingAttributes" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>

            <div v-else-if="availableAttributes.length > 0 || productAttributes.length > 0" class="space-y-4">
              <!-- Attribute-Value Pairs -->
              <div
                v-for="(productAttr, index) in productAttributes"
                :key="`attr-${index}-${productAttr?.attribute_id || 'new'}`"
                class="flex items-start gap-4 mb-4"
              >
                <div class="flex-1">
                  <FormLabel>{{ $t('category.attribute') }}</FormLabel>
                  <TomSelect
                    :modelValue="productAttr.attribute_id === null || productAttr.attribute_id === undefined ? '' : String(productAttr.attribute_id)"
                    :options="{
                      placeholder: $t('category.selectAttribute'),
                      allowEmptyOption: true,
                    }"
                    class="w-full"
                    :class="{
                      'border-red-500': form.invalid(`attributes.${index}.attribute_id`)
                    }"
                    @update:modelValue="(value) => {
                      const newValue = value === '' || value === null || value === undefined ? null : value;
                      productAttr.attribute_id = newValue;
                      onAttributeSelected(index, newValue);
                    }">
                    <option value="">{{ $t('category.selectAttribute') }}</option>
                    <template v-for="attr in getAvailableAttributesForDropdown(index)" :key="attr.id">
                      <!-- Only show if not already selected by another field, or if it's the current selection -->
                      <option
                        v-if="!productAttributes.find((item, idx) => idx !== index && item && String(item.attribute_id) === String(attr.id)) || String(attr.id) === String(productAttr.attribute_id)"
                        :value="String(attr.id)">{{ attr.name ?? attr.name_en ?? attr.name_ar ?? '' }}</option>
                    </template>
                  </TomSelect>
                  <template v-if="form.invalid(`attributes.${index}.attribute_id`)">
                    <div class="mt-1 text-xs text-red-600">
                      {{ form.getError(`attributes.${index}.attribute_id`) }}
                    </div>
                  </template>
                </div>

                <!-- Value Field - Dynamic based on attribute data type -->
                <div class="flex-1" v-if="productAttr.attribute && (productAttr.attribute.name || productAttr.attribute.name_en || productAttr.attribute.name_ar)">
                  <FormLabel>
                    {{ productAttr.attribute?.name ?? productAttr.attribute?.name_en ?? productAttr.attribute?.name_ar ?? '' }} {{ $t('category.value') }}
                    <span v-if="productAttr.attribute?.unit && productAttr.attribute.unit !== 'none'" class="text-xs text-slate-500">({{ productAttr.attribute.unit }})</span>
                  </FormLabel>

                  <!-- String input -->
                  <FormInput
                    v-if="productAttr.attribute?.data_type === 'string'"
                    v-model="productAttr.value"
                    type="text"
                    :placeholder="$t('category.enterAttributeValue', { name: productAttr.attribute?.name ?? productAttr.attribute?.name_en ?? productAttr.attribute?.name_ar ?? '' })"
                    :class="{
                      'border-red-500': form.invalid(`attributes.${index}.value`)
                    }"
                    @input="updateAttributeValue(index, productAttr.value)"
                  />

                  <!-- Number input -->
                  <FormInput
                    v-else-if="productAttr.attribute?.data_type === 'number'"
                    v-model="productAttr.value"
                    type="number"
                    step="any"
                    :placeholder="$t('category.enterAttributeValue', { name: productAttr.attribute?.name ?? productAttr.attribute?.name_en ?? productAttr.attribute?.name_ar ?? '' })"
                    :class="{
                      'border-red-500': form.invalid(`attributes.${index}.value`)
                    }"
                    @input="updateAttributeValue(index, productAttr.value)"
                  />

                  <!-- Boolean select -->
                  <TomSelect
                    v-else-if="productAttr.attribute?.data_type === 'boolean'"
                    :modelValue="productAttr.value ?? ''"
                    :options="{
                      placeholder: $t('category.selectValue'),
                    }"
                    class="w-full"
                    :class="{
                      'border-red-500': form.invalid(`attributes.${index}.value`)
                    }"
                    @update:modelValue="(val) => {
                      const newValue = val === '' ? null : val;
                      productAttr.value = newValue;
                      updateAttributeValue(index, newValue);
                    }">
                    <option value="">{{ $t('category.selectValue') }}</option>
                    <option value="true">{{ $t('category.yes') }}</option>
                    <option value="false">{{ $t('category.no') }}</option>
                  </TomSelect>
                  <template v-if="form.invalid(`attributes.${index}.value`)">
                    <div class="mt-1 text-xs text-red-600">
                      {{ form.getError(`attributes.${index}.value`) }}
                    </div>
                  </template>
                </div>

                <!-- Placeholder when no attribute selected -->
                <div class="flex-1" v-else>
                  <FormLabel>{{ $t('category.value') }}</FormLabel>
                  <FormInput
                    type="text"
                    :placeholder="$t('category.selectAttributeFirst')"
                    disabled
                  />
                </div>

                <!-- Remove button -->
                <div>
                  <Button
                    variant="danger"
                    class="shadow-md flex items-center"
                    @click="removeAttributeField(index)">
                    <Lucide icon="Trash" class="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <!-- Add Attribute Button -->
              <div>
                <Button
                  variant="primary"
                  class="shadow-md flex items-center gap-2"
                  @click="addAttributeField"
                  v-if="hasUnselectedAttributes">
                  <Lucide icon="Plus" class="w-4 h-4" />
                  {{ $t('category.addAttribute') }}
                </Button>
                <p v-else-if="availableAttributes.length > 0 && !hasUnselectedAttributes" class="text-sm text-slate-500 mt-2">{{ $t('category.allAttributesAdded') }}</p>
              </div>
            </div>

            <div v-else class="border rounded-lg p-8 text-center text-slate-500">
              <Lucide icon="List" class="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>{{ $t('category.noAttributesFound') }}</p>
            </div>

            <!-- Generic error for attributes array -->
            <template v-if="form.invalid('attributes')">
              <div class="mt-2 text-xs text-red-600">
                {{ form.getError('attributes') }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Dialog :open="OpenCategory" @close="modelCloseCategory">
    <Dialog.Panel>
      <div class="p-5">
        <div class="text-xl text-black my-4 font-medium text-center">{{ $t('category.addNewCategory') }}</div>
        <div class="pt-2">
          <FormLabel htmlFor="vertical-form-1">{{ $t('category.category') }} </FormLabel>
          <FormInput v-model="CreateNewCategory" type="text" :placeholder="$t('category.category')" :class="{ 'border-red-500': formError.invalid('name') }" />
          <template v-if="formError.invalid('name')">
            <div class="mt-2 text-xs text-red-600">{{ formError.getError('name') }}</div>
          </template>
        </div>
      </div>
      <div class="px-5 pt-6 pb-8 flex items-center justify-center text-center gap-4" :class="{ 'flex-row-reverse': locale === 'ar', '': locale !== 'ar' }">
        <Button variant="outline-secondary" type="button" @click="modelCloseCategory" class="w-24 ">
          {{ $t('category.cancel') }}
        </Button>
        <Button variant="primary" type="button" @click="submitCategory" ref="deleteButtonRef">
          {{ $t('category.addCategory') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Dialog :open="OpenBrand" @close="modelCloseBrand">
    <Dialog.Panel>
      <div class="p-5">
        <div class="text-xl text-black my-4 font-medium text-center">{{ $t('category.addNewBrand') }}</div>
        <div class="pt-2">
          <FormLabel htmlFor="vertical-form-1">{{ $t('category.brand') }} </FormLabel>
          <FormInput v-model="CreateNewBrand" type="text" :placeholder="$t('category.brand')" :class="{ 'border-red-500': formBrandError.invalid('name') }" />
          <template v-if="formBrandError.invalid('name')">
            <div class="mt-2 text-xs text-red-600">{{ formBrandError.getError('name') }}</div>
          </template>
        </div>
      </div>
      <div class="px-5 pt-6 pb-8 flex items-center justify-center text-center gap-4" :class="{ 'flex-row-reverse': locale === 'ar', '': locale !== 'ar' }">
        <Button variant="outline-secondary" type="button" @click="modelCloseBrand" class="w-24">
          {{ $t('category.cancel') }}
        </Button>
        <Button variant="primary" type="button" @click="submitBrand" ref="deleteButtonRef">
          {{ $t('category.addBrand') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Dialog :open="OpenSubCategory" @close="modelCloseSubCategory">
    <Dialog.Panel>
      <div class="p-5">
        <div class="text-xl text-black my-4 font-medium text-center">{{ $t('category.addNewSubCategory') }}</div>
        <div class="pt-2">
          <FormLabel htmlFor="vertical-form-1">{{ $t('category.subCategory') }} </FormLabel>
          <FormInput v-model="CreateNewSubCategory" type="text" :placeholder="$t('category.subCategory')" :class="{ 'border-red-500': formScError.invalid('name') }" />
          <template v-if="formScError.invalid('name')">
            <div class="mt-2 text-xs text-red-600">{{ formScError.getError('name') }}</div>
          </template>
        </div>
      </div>
      <div class="px-5 pt-6 pb-8 flex items-center justify-center text-center gap-4" :class="{ 'flex-row-reverse': locale === 'ar', '': locale !== 'ar' }">
        <Button variant="outline-secondary" type="button" @click="modelCloseSubCategory" class="w-24  ">
          {{ $t('category.cancel') }}
        </Button>
        <Button variant="primary" type="button" @click="submitSubCategory" ref="deleteButtonRef">
          {{ $t('category.addSubCategory') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

  <!-- Add New Attribute Dialog -->
  <Dialog :open="OpenAttribute" @close="modelCloseAttribute">
    <Dialog.Panel class="w-full max-w-2xl">
      <div class="p-5">
        <div class="text-xl text-black my-4 font-medium text-center">{{ $t('category.addNewAttribute') }}</div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 sm:col-span-6">
            <FormLabel>{{ $t('category.nameLabel') }} <span class="text-danger"> *</span></FormLabel>
            <FormInput v-model="CreateNewAttribute.name" type="text" :placeholder="$t('category.enterName')" :class="{ 'border-red-500': formAttributeError.invalid('name') || formAttributeError.invalid('name_en') }" />
            <template v-if="formAttributeError.invalid('name') || formAttributeError.invalid('name_en')">
              <div class="mt-2 text-xs text-red-600">{{ formAttributeError.getError('name') || formAttributeError.getError('name_en') }}</div>
            </template>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.keyName') }}</FormLabel>
            <FormInput v-model="CreateNewAttribute.key_name" type="text" :placeholder="$t('category.autoGeneratedFromName')" />
            <p class="text-xs text-slate-500 mt-1">{{ $t('category.autoGeneratedEditable') }}</p>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.dataType') }} <span class="text-danger"> *</span></FormLabel>
            <TomSelect
              v-model="CreateNewAttribute.data_type"
              :options="{
                placeholder: $t('category.selectDataType'),
              }"
              class="w-full"
              :class="{ 'border-red-500': formAttributeError.invalid('data_type') }">
              <template v-for="option in dataTypeOptions">
                <option :value="option.value">{{ option.label }}</option>
              </template>
            </TomSelect>
            <template v-if="formAttributeError.invalid('data_type')">
              <div class="mt-2 text-xs text-red-600">{{ formAttributeError.getError('data_type') }}</div>
            </template>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('category.unit') }}</FormLabel>
            <TomSelect
              v-model="CreateNewAttribute.unit"
              :options="{
                placeholder: $t('category.selectUnit'),
              }"
              class="w-full">
              <template v-for="option in unitOptions">
                <option :value="option.value">{{ option.label }}</option>
              </template>
            </TomSelect>
          </div>
        </div>
      </div>
      <div class="px-5 pt-6 pb-8 flex items-center justify-center text-center gap-4" :class="{ 'flex-row-reverse': locale === 'ar', '': locale !== 'ar' }">
        <Button variant="outline-secondary" type="button" @click="modelCloseAttribute" class="w-24">
          {{ $t('category.cancel') }}
        </Button>
        <Button variant="primary" type="button" @click="submitAttribute">
          {{ $t('category.addAttribute') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>

</template>
