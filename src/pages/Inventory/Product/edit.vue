<script setup>
 
  import {
    FormInput,
    FormLabel,
    FormTextarea,
  } from "@/components/Base/Form";
  import Button from "@/components/Base/Button";
  import { RouterLink, useRoute } from "vue-router";
  import Lucide from "@/components/Base/Lucide";
  import TomSelect from "@/components/Base/TomSelect";
  import { onMounted, ref, provide,  reactive, nextTick, computed } from "vue";
  import CategoryWrap from "../../../components/Category/index.vue"
  import apiService from '../../../network/api/apiService';
  import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
  import Dropzone from "@/components/Base/Dropzone";
  import router from "../../../router";
  import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
  import ErrorHandler from "@/utils/validation";
  import {useAuthStore} from "@/stores/auth.js";
  import toast from "@/stores/utility/toast";
  import pan from "@/stores/pan";
  import { useI18n } from "vue-i18n";
   
  const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;
  const route = useRoute()
  const createFormData = ref({
    user_id: USER_ID,
    brand_id: "",
    category_id: "",
    sub_category_id: "",
    SubCategorySelect:"",
    sku: "",
    image: "",
    name_ar: "",
    name_en: "",
    barcode: "",
    description: "",
    initial_quantity: "",
    cost_price: "",
    sale_price: "",
    vat: " ",
    product_attributes: [],
    _method: "PUT",
  })
  const isProductBankData = ref()
  const { t } = useI18n();
  const locale = ref('en');
  
  const vatOptions = computed(() => [
    {
      value: 1,
      label: t('product.subjectToVat'),
    },
    {
      value: 0,
      label: t('product.subjectToNoVat')
    },
  ]);
  
  const form = reactive(new ErrorHandler());
  const isloading = ref(false)
  // In your edit product file, update the allProductFetch function:
   
  const allProductFetch = async () => {
    try {
      isloading.value = true;
      const response = await apiService.product.show(route.params.uuid);
      const result = handleResponse(response);
      console.log("Product details fetched:", result);
      if (result.success) {
        createFormData.value = {
          ...createFormData.value,
          barcode: result.data.data.barcode,
          category_id: result.data.data.category?.id || "",
          sub_category_id: result.data.data.sub_category?.id || "",
          SubCategorySelect: result.data.data.sub_category?.id || "",
          sku: result.data.data.sku,
          name_ar: result.data.data.name_ar,
          name_en: result.data.data.name_en,
          // split description into EN / AR with fallback to legacy field
          description_en: result.data.data.description_en || result.data.data.description || "",
          description_ar: "",
          description: result.data.data.description || "",
          initial_quantity: result.data.data.initial_quantity,
          cost_price: result.data.data.cost_price,
          sale_price: result.data.data.sale_price,
          brand_id: result.data.data.brand_id,
          // DON'T set image here - let it be empty string initially
          image: "",
          vat: result.data.data.vat ? 1 : 0,
          product_attributes: (result.data.data.attributes || []).map((attribute) => ({
            attribute_id: attribute?.attribute_id || attribute?.id || null,
            value: attribute?.value ?? "",
            attribute: attribute?.attribute || null,
          })),
        };
        
        const elDropzoneMultipleRef = dropzoneMultipleRef.value;
        if (elDropzoneMultipleRef && result.data.data.image) {
          console.log("result.data.data.image", result.data.data.image);
          const mockFile = {
            name: "Existing Image",
            size: 123456,
            // Store the URL for reference
            existingImageUrl: result.data.data.image
          };
          elDropzoneMultipleRef.dropzone.emit("addedfile", mockFile);
          elDropzoneMultipleRef.dropzone.emit("thumbnail", mockFile, result.data.data.image);
          elDropzoneMultipleRef.dropzone.files.push(mockFile);
        }
      }
    } catch (error) {
      const result = handleError(error);
    } finally {
      isloading.value = false;
      console.log("Loading state set to false");
    }
  };
   
  // Update the submitProductData function to handle the image properly:
   
  const submitProductData = async () => {
    try {
      isloading.value = true;
      
      // Create FormData object to handle file upload
      const formData = new FormData();
      
      // Update sub_category_id from SubCategorySelect
      createFormData.value.sub_category_id = createFormData.value.SubCategorySelect;
      
      // Append all fields to FormData
      Object.keys(createFormData.value).forEach(key => {
        if (key === 'product_attributes') {
          // Send each attribute as indexed fields so Laravel receives a proper array
          // e.g. attributes[0][attribute_id], attributes[0][value]
          if (Array.isArray(createFormData.value[key]) && createFormData.value[key].length > 0) {
            createFormData.value[key].forEach((attr, index) => {
              formData.append(`attributes[${index}][attribute_id]`, attr.attribute_id ?? '');
              formData.append(`attributes[${index}][value]`, attr.value ?? '');
            });
          }
        } else if (key === 'image') {
          // Only append if it's a real File object (user uploaded a new image)
          if (createFormData.value[key] instanceof File) {
            formData.append('image', createFormData.value[key]);
          }
        } else {
          formData.append(key, createFormData.value[key] !== null ? createFormData.value[key] : "");
        }
      });
      
      console.log("Submitting FormData for product update");
      const response = await apiService.product.edit(route.params.uuid, formData);
      const result = handleResponse(response);
      
      if (result.success) {
        isloading.value = false;
        // Show success notification
        toast().fry(pan.Permissions.success(t('product.productUpdatedSuccessfully')));
        // Redirect to product list page
        try {
          router.push("/inventory/products").catch(() => {
            // Fallback if router.push fails
            window.location.href = "/inventory/products";
          });
        } catch (error) {
          // Fallback redirect
          window.location.href = "/inventory/products";
        }
      } else {
        isloading.value = false;
      }
    } catch (error) {
      handleError(error);
      isloading.value = false;
      if (error.errors) {
        form.setErrors(error.errors);
      }
    }
  };
   
   
   
   
   
  // Packings support removed entirely from edit page
   
   
   
  const generateSku = () => { createFormData.value.sku = Math.floor(10000000000 + Math.random() * 90000000000).toString(); };
   
  onMounted(() => {
    locale.value = localStorage.getItem('locale') || 'en';
    allProductFetch()
    const elDropzoneMultipleRef = dropzoneMultipleRef.value;
    if (elDropzoneMultipleRef) {
      // Handle new file addition - only store real File objects, not mock files
      elDropzoneMultipleRef.dropzone.on("addedfile", (file) => {
        // Only store if it's a real File object (user uploaded a new file)
        // Ignore mock file objects (existing images loaded from server)
        if (file instanceof File) {
          createFormData.value.image = file;
        }
      //   console.log("New image file added:", file);
      });
   
      // Handle file removal
      elDropzoneMultipleRef.dropzone.on("removedfile", () => {
        // Clear the image from createFormData
        createFormData.value.image = "";
      //   console.log("Image file removed.");
      });
    }
  })
  const dropzoneSingleRef = ref();
  const dropzoneMultipleRef = ref();
  const dropzoneValidationRef = ref();
   
  provide("bind[dropzoneSingleRef]", (el) => {
    dropzoneSingleRef.value = el;
  });
   
  provide("bind[dropzoneMultipleRef]", (el) => {
    dropzoneMultipleRef.value = el;
  });
   
  provide("bind[dropzoneValidationRef]", (el) => {
    dropzoneValidationRef.value = el;
  });
   
   
  </script>
   
  <template>
    <div class="flex items-center mt-8 intro-y">
      <RouterLink to="/inventory/products">
        <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
          <Lucide icon="ChevronLeft" class="w-5 h-5" />
        </Button>
      </RouterLink>
      <h2 class="mr-auto text-lg font-semibold">{{ $t('product.editProduct') }}</h2>
   
    </div>
    <div class="grid grid-cols-12 gap-6 mt-5">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-6">
              <FormLabel>{{ $t('product.barcode') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput v-model="createFormData.barcode" id="barcode-1" type="text"
                         :placeholder="$t('product.scanOrEnterBarcode')" :class="{ 'border-red-500': form.invalid('barcode') }" />
              <template v-if="form.invalid('barcode')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('barcode') }}</div>
              </template>
            </div>
            <div class="col-span-6"></div>
            <div class="col-span-6">
              <FormLabel>{{ $t('product.productNameEn') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput v-model="createFormData.name_en" id="name_en" type="text" :placeholder="$t('product.productNameEn')" :class="{ 'border-red-500': form.invalid('name_en') }" />
              <template v-if="form.invalid('name_en')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('name_en') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel>{{ $t('product.productNameAr') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput id="nameAr" v-model="createFormData.name_ar" type="text" :placeholder="$t('product.productNameAr')" :class="{ 'border-red-500': form.invalid('name_ar') }" />
              <template v-if="form.invalid('name_ar')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('name_ar') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel>{{ $t('product.sku') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput v-model="createFormData.sku" id="sku" type="text" :placeholder="$t('product.sku')" :class="{ 'border-red-500': form.invalid('sku') }" />
              <template v-if="form.invalid('sku')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('sku') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <div class="pt-7">
                <Button variant="primary" class="mr-2 py-2 w-[180px] shadow-md" @click="generateSku">
                  {{ $t('product.autoGenerateSku') }}
                </Button>
              </div>
            </div>
            <div class="col-span-6">
              <FormLabel>{{ $t('product.descriptionEn') }}</FormLabel>
              <FormTextarea
                v-model="createFormData.description_en"
                class="py-2 pl-4 resize-none"
                :rows="3"
                :placeholder="$t('product.descriptionEnPlaceholder')">
              </FormTextarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    <CategoryWrap :createFormData="createFormData" :isProductBankData="isProductBankData" :form="form" />
    <div class="grid grid-cols-12 gap-6 mt-5 relative z-10">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
              <h3 class="mr-auto text-lg font-medium -mb-1">{{ $t('product.uploadImage') }}</h3>
            </div>
            <div class="col-span-12 upload-img" :class="{ 'border-upload': form.invalid('image') }">
              <Dropzone refKey="dropzoneMultipleRef" :options="{
                              url: 'https://httpbin.org/post',
                              autoProcessQueue: false,
                              thumbnailWidth: 150,
                              maxFilesize: 100,
                              acceptedFiles: 'image/jpeg,image/png,image/jpg',
                              headers: { 'My-Awesome-Header': 'header value' },
                              addRemoveLinks: true,
                          }" class="dropzone">
                <div class="flex justify-center py-8">
                  <Lucide icon="Upload" class="w-10 h-10" />
                </div>
                <div class="text-lg font-medium">
                  {{ $t('product.dropFilesHere') }}
                </div>
                <div class="text-gray-600">
                  {{ $t('product.selectedFiles') }}
                </div>
              </Dropzone>
            </div>
            <div class="col-span-12 -mt-4">
              <template v-if="form.invalid('image')">
                      <div class="mt-2 text-xs text-red-600 font-medium">{{ $t('product.imageUploadError') }}</div>
                    </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-6 mt-5">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
              <h3 class="mr-auto text-lg font-medium -mb-1">{{ $t('product.stockAndPricingDetails') }}</h3>
            </div>
            <div class="col-span-12">
              <div class="gap-5">
                <div class="grid grid-cols-12 gap-6">
                  <div class="sm:col-span-3 md:col-span-6 lg:col-span-3">
                    <FormLabel>{{ $t('product.quantity') }}</FormLabel>
                    <FormInput min="0" v-model="createFormData.initial_quantity" disabled type="text" placeholder="0" :class="{ 'border-red-500': form.invalid('initial_quantity') }" />
                    <template v-if="form.invalid('initial_quantity')">
                      <div class="mt-2 text-xs text-red-600">{{ form.getError('initial_quantity') }}</div>
                    </template>
                  </div>
                  <div class="sm:col-span-3 md:col-span-6 lg:col-span-3">
                    <FormLabel>{{ $t('product.costPrice') }} <span class="text-danger"> *</span></FormLabel>
                    <FormInput :id="'barcode-'" disabled v-model="createFormData.cost_price" type="text" placeholder="0.00" :class="{ 'border-red-500': form.invalid('cost_price') }" />
                    <template v-if="form.invalid('cost_price')">
                      <div class="mt-2 text-xs text-red-600">{{ form.getError('cost_price') }}</div>
                    </template>
                  </div>
                  <div class="sm:col-span-3 md:col-span-6 lg:col-span-3">
                    <FormLabel>{{ $t('product.salePrice') }} <span class="text-danger"> *</span></FormLabel>
                    <FormInput :id="'qty-'" v-model="createFormData.sale_price" type="number" placeholder="0.00" :class="{ 'border-red-500': form.invalid('sale_price') }" />
                    <template v-if="form.invalid('sale_price')">
                      <div class="mt-2 text-xs text-red-600">{{ form.getError('sale_price') }}</div>
                    </template>
                  </div>
                  <div class="sm:col-span-3 md:col-span-6 lg:col-span-3 relative">
                    <FormLabel>{{ $t('product.vat') }} <span class="text-danger"> *</span></FormLabel>
                    <div class="flex items-center z-40">
                      <TomSelect v-model="createFormData.vat" :options="{
                        placeholder:$t('product.vat'),
                      }" class="w-full z-40">
                        <option value=""></option>
                        <template v-for="item in vatOptions" :key="item.value">
                          <option :value="item.value" :selected="createFormData.vat === item.value">{{ item.label }}</option>
                        </template>
                      </TomSelect>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-6 mt-5 relative z-[10]">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
              <Button variant="primary" class="mr-2 shadow-md" @click="submitProductData">
                {{ $t('product.save') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
   
    <div v-if="isloading"
         class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
      <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
                   :color="'#fff'" :size="'50px'"></clip-loader>
    </div>
  </template>