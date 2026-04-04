<script setup>
 
  import {
    FormInput,
    FormLabel,
    FormTextarea,
  } from "@/components/Base/Form";
  import axios from "axios";
  import Button from "@/components/Base/Button";
  import { RouterLink } from "vue-router";
  import Lucide from "@/components/Base/Lucide";
  import TomSelect from "@/components/Base/TomSelect";
  import {onMounted, ref, watch, provide, reactive, onUnmounted, nextTick} from "vue";
  import Notification from "../../../components/Base/Notification";
  import CategoryWrap from "../../../components/Category/index.vue"
  import apiService from '../../../network/api/apiService';
  import Toastify from "toastify-js";
  import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
  import Dropzone from "@/components/Base/Dropzone";
  import router from "../../../router";
  import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
  import ErrorHandler from "@/utils/validation";
  import BarcodeScanner from "@/components/Barcode/BarcodeScanner.vue";
  import { eventBus } from "@/utils/eventBus"; // Import the event bus
  import { useRoute } from 'vue-router';
   
  import {useAuthStore} from "@/stores/auth.js";
   
  const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;
  // Reactive state to hold the scanned result
  const scannedResult = ref(null);
  const route = useRoute();
  const barcodeInput = ref("");
   
  // Event handler for barcode-scanned event
  const onBarcodeScanned = (result) => {
    scannedResult.value = result;
    barcodeInput.value = result; // Populate the input field with the scanned result
    createFormData.value.barcode = result; // Update the form barcode
    console.log("Scanned Barcode:", result);
    // Trigger search when barcode is scanned
    SearchProduct(result);
  };
   
  // Search barcode function (define whatever logic you need to search)
  const searchBarcode = () => {
    if (barcodeInput.value) {
      console.log("Searching for barcode:", barcodeInput.value);
      // Implement your search logic here
    } else {
      console.warn("No barcode entered to search.");
    }
  };
  // Clear barcode input function
  const clearBarcode = () => {
    barcodeInput.value = '';
  };
   
  // Listen for the event when the component is mounted
  onMounted(() => {
    eventBus.on("barcode-scanned", onBarcodeScanned);
    if (route.query.barcode) {
      createFormData.value.barcode = route.query.barcode;
      previousBarcode.value = route.query.barcode;
      // Trigger search if barcode is provided via route
      SearchProduct(route.query.barcode);
    }
  });
   
  // Cleanup the event listener when the component is unmounted
  onUnmounted(() => {
    eventBus.off("barcode-scanned", onBarcodeScanned);
  });
   
  const createFormData = ref({
    user_id: USER_ID,
    brand_id: "",
    category_id: "",
    sub_category_id: "",
    SubCategorySelect: "",
    sku: "",
    image: "",
    name: "",
    barcode: "",
    description: "",
    initial_quantity: "",
    cost_price: "",
    sale_price: "",
    vat: 1,
    is_imported: 1,
    product_attributes: []
  })
  const vatOptions = [
    {
      value: 1,
      label: 'Subject to VAT',
    },
    {
      value: 0,
      label: 'Not subject to VAT'
    },
  ];
  const form = reactive(new ErrorHandler());
  const submitProductData = async () => {
    isloading.value = true;
    const originalCategoryId =  createFormData.value.category_id;
    const originalSubCategorySelect =  createFormData.value.SubCategorySelect;
    
    try {
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
          // Only append if it's a real File object
          if (createFormData.value[key] instanceof File) {
            formData.append('image', createFormData.value[key]);
          }
        } else {
          formData.append(key, createFormData.value[key] !== null ? createFormData.value[key] : "");
        }
      });

      console.log("Submitting FormData for product creation");
      const response = await apiService.product.create(formData);
      const result = handleResponse(response);
      
      if (result.success) {
        isloading.value = false;
        router.push("/inventory/products");
      } else {
        isloading.value = false;
      }
    } catch (error) {
      isloading.value = false;
      // Restore original values on error for form state consistency
      createFormData.value.category_id = originalCategoryId;
      createFormData.value.SubCategorySelect = originalSubCategorySelect;
      handleError(error);
      if (error.errors) {
        form.setErrors(error.errors);
      }
    }
  };
  const isloading = ref(false)
  const isProductBankData = ref()
  const previousBarcode = ref("")
   
  const loading = ref(true);
  const generateSku = () => { createFormData.value.sku = Math.floor(10000000000 + Math.random() * 90000000000).toString(); };
   
  // Function to reset form fields to initial state (except user_id and barcode)
  const resetFormFields = () => {
    createFormData.value.brand_id = "";
    createFormData.value.category_id = "";
    createFormData.value.sub_category_id = "";
    createFormData.value.SubCategorySelect = "";
    createFormData.value.sku = "";
    createFormData.value.image = "";
    createFormData.value.name = "";
    createFormData.value.description = "";
    createFormData.value.initial_quantity = "";
    createFormData.value.cost_price = "";
    createFormData.value.sale_price = "";
    createFormData.value.vat = 1;
    createFormData.value.is_imported = 1;
    createFormData.value.product_attributes = [];
    isProductBankData.value = null;
    
    // Clear dropzone image
    const elDropzoneMultipleRef = dropzoneMultipleRef.value;
    if (elDropzoneMultipleRef && elDropzoneMultipleRef.dropzone) {
      elDropzoneMultipleRef.dropzone.removeAllFiles(true);
    }
  };
   
  const locale = ref('en');
  onMounted(() => {
    locale.value = localStorage.getItem('locale') || 'en';
    const elDropzoneMultipleRef = dropzoneMultipleRef.value;
    if (elDropzoneMultipleRef) {
      elDropzoneMultipleRef.dropzone.on("addedfile", (file) => {
        createFormData.value.image = file;
      });
      elDropzoneMultipleRef.dropzone.on("removedfile", () => {
        createFormData.value.image = "";
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
  const SearchProduct = async (barcodeId) => {
    const currentBarcode = createFormData.value.barcode?.trim() || "";
    
    // Check if barcode has changed or been cleared
    if (previousBarcode.value !== "" && previousBarcode.value !== currentBarcode) {
      // Barcode has changed, reset all fields first
      resetFormFields();
    }
    
    // If barcode is empty, reset fields and return
    if (currentBarcode === "") {
      if (previousBarcode.value !== "") {
        // Only reset if there was a previous barcode
        resetFormFields();
      }
      previousBarcode.value = "";
      return;
    }
    
    // Update previous barcode
    previousBarcode.value = currentBarcode;
    
    if (createFormData.value.barcode !== "") {
      try {
        isloading.value = true
        barcodeId = createFormData.value.barcode
        console.log("barcodeId", barcodeId)
        const response = await apiService.product.search(barcodeId);
        const result = handleResponse(response);
        if (result.success) {
          const products = result.data?.data || [];
          // If product already exists in our system, auto-fill the form from the first match
          if (products.length > 0) {
            const existingProduct = products[0];
   
            // Get IDs - use category.id (not category_id which might be sub_category)
            const categoryId = existingProduct.category?.id || "";
            const subCategoryId = existingProduct.sub_category?.id || existingProduct.sub_category_id || "";
            const brandId = existingProduct.brand?.id || existingProduct.brand_id || "";
   
            // Set all basic fields first
            createFormData.value.name = existingProduct.name ?? existingProduct.name_en ?? existingProduct.name_ar ?? "";
            createFormData.value.sku = existingProduct.sku || createFormData.value.sku;
            createFormData.value.description =
              existingProduct.description ?? existingProduct.description_en ?? existingProduct.description_ar ?? "";
            createFormData.value.initial_quantity = existingProduct.initial_quantity ?? "";
            createFormData.value.cost_price = existingProduct.cost_price ?? "";
            createFormData.value.sale_price = existingProduct.sale_price ?? "";
            
            if (typeof existingProduct.vat !== "undefined" && existingProduct.vat !== null) {
              createFormData.value.vat = existingProduct.vat ? 1 : 0;
            }
            createFormData.value.is_imported = 0;
   
            // Set image if available
            if (existingProduct.image) {
              createFormData.value.image = existingProduct.image;
              // Display image in Dropzone component
              await nextTick();
              const elDropzoneMultipleRef = dropzoneMultipleRef.value;
              if (elDropzoneMultipleRef && existingProduct.image) {
                const mockFile = { name: "Existing Image", size: 123456 };
                elDropzoneMultipleRef.dropzone.emit("addedfile", mockFile);
                elDropzoneMultipleRef.dropzone.emit("thumbnail", mockFile, existingProduct.image);
                elDropzoneMultipleRef.dropzone.files.push(mockFile);
              }
            }
   
            // Set category first (this triggers subcategory and attributes loading)
            if (categoryId) {
              createFormData.value.category_id = String(categoryId);
            }
            
            // Wait for lists to load, then set dropdown values
            await nextTick();
            setTimeout(() => {
              // Set subcategory and brand after lists are loaded
              if (subCategoryId) {
                createFormData.value.SubCategorySelect = String(subCategoryId);
              }
              if (brandId) {
                createFormData.value.brand_id = String(brandId);
              }
              
              // Set attributes after they're loaded
              if (existingProduct.attributes && Array.isArray(existingProduct.attributes) && existingProduct.attributes.length > 0) {
                createFormData.value.product_attributes = existingProduct.attributes.map((attribute) => {
                  const attrId = attribute?.attribute_id || attribute?.id || null;
                  return {
                    attribute_id: attrId ? String(attrId) : null,
                    value: attribute?.value ?? "",
                    attribute: attribute?.attribute || null,
                  };
                });
              } else {
                createFormData.value.product_attributes = [];
              }
            }, 800);
   
            isloading.value = false;
   
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
          }
   
          // If not found in our system, fall back to Product Bank API
          if (products.length === 0) {
            if (barcodeId) {
              isloading.value = true
   
              const token = localStorage.getItem('token');
              const response = await axios.get(
                `${import.meta.env.VITE_PUBLIC_API_URL_PRODUCT_BANK}/search-products?barcode=[${barcodeId}]`,
                {
                  headers: {
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                },
              );
              const productBankResponse = handleResponse(response);
              console.log("productBankResponse", productBankResponse)
              if (productBankResponse.status === 200) {
                isloading.value = false
                if (productBankResponse.data?.data?.length === 0) {
                  isloading.value = false
                  createFormData.value.is_imported = 0
                  const successEl = document
                    .querySelectorAll("#success-notification-productBank")[0]
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
                }
                if (productBankResponse.data?.data?.length > 0) {
                  isProductBankData.value = productBankResponse.data.data[0]
                  console.log("isProductBankData", isProductBankData)
                  const pb = productBankResponse.data.data[0]
                  createFormData.value.name = pb.name_en ?? pb.name_ar ?? pb.name ?? ""
                  createFormData.value.description = pb.description || ""
                  createFormData.value.initial_quantity = productBankResponse.data.data[0].initial_quantity
                  createFormData.value.cost_price = productBankResponse.data.data[0].cost_price
                  createFormData.value.sale_price = productBankResponse.data.data[0].sale_price
                  createFormData.value.brand_id = productBankResponse.data.data[0].brand.id
                  createFormData.value.image = productBankResponse.data.data[0].image
                }
              }
              //  createFormData.value.name_en = productBankResponse.data.data[0].name_en
              // listPackings.value = productBankResponse.data.data[0].packings
   
              // Process the fallback response
            } else {
              console.error("No barcode found for fallback API call.");
            }
          } else if (result.success) {
            // Redirect if the original request was successful
   
          }
        }
      } catch (error) {
        handleError(error);
        isloading.value = false
      }
    }
  }
   
  </script>
  <template>
    <div class="flex items-center mt-8 intro-y">
      <RouterLink to="/inventory/products">
        <Button variant="primary" size="sm" class="shadow-md h-8 w-9" :class="{ 'ml-4': locale === 'ar', 'mr-4': locale !== 'ar' }">
          <Lucide icon="ChevronLeft" class="w-5 h-5" :class="{ 'rotate-180': locale === 'ar', '': locale !== 'ar' }" />
        </Button>
      </RouterLink>
      <h2 class="text-lg font-semibold" :class="{ 'ml-auto': locale === 'ar', 'mr-auto': locale !== 'ar' }">{{ $t('product.addNewProduct') }}</h2>
    </div>
    <div class="grid grid-cols-12 gap-6 mt-5">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-6">
              <FormLabel for="barcode">{{ $t('product.barcode') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput
                  id="barcode"
                  v-model="createFormData.barcode"
                  @change="SearchProduct"
                  type="text"
                  :placeholder="$t('product.scanOrEnterBarcode')"
                  @keydown.enter="searchBarcode"
                  @focus="clearBarcode"
                  :class="{ 'border-red-500': form.invalid('barcode') }" />
              <template v-if="form.invalid('barcode')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('barcode') }}</div>
              </template>
            </div>
            <div class="col-span-6"></div>
            <div class="col-span-6">
              <FormLabel for="product-name">{{ $t('product.productName') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput v-model="createFormData.name" id="product-name" type="text" :placeholder="$t('product.productName')" :class="{ 'border-red-500': form.invalid('name') || form.invalid('name_en') }" />
              <template v-if="form.invalid('name') || form.invalid('name_en')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('name') || form.getError('name_en') }}</div>
              </template>
            </div>
            <div class="col-span-6"></div>
            <div class="col-span-6">
              <FormLabel for="sku">{{ $t('product.sku') }} <span class="text-danger"> *</span></FormLabel>
              <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div class="min-w-0 flex-1">
                  <FormInput v-model="createFormData.sku" id="sku" type="text" :placeholder="$t('product.sku')" :class="{ 'border-red-500': form.invalid('sku') }" />
                </div>
                <Button variant="primary" type="button" class="w-full shrink-0 py-2 shadow-md sm:w-[180px]" @click="generateSku">
                  {{ $t('product.autoGenerateSku') }}
                </Button>
              </div>
              <template v-if="form.invalid('sku')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('sku') }}</div>
              </template>
            </div>
            <div class="col-span-6"></div>
            <div class="col-span-6">
              <FormLabel>{{ $t('product.descriptionSingle') }}</FormLabel>
              <FormTextarea
                v-model="createFormData.description"
                class="py-2 pl-4 resize-none"
                :rows="3"
                :placeholder="$t('product.descriptionSinglePlaceholder')"
              >
              </FormTextarea>
              <template v-if="form.invalid('description') || form.invalid('description_en')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('description') || form.getError('description_en') }}</div>
              </template>
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
                <!-- <div class="text-gray-600">
                  {{ $t('product.selectedFiles') }}
                </div> -->
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
              <h3 class="mr-auto text-lg font-medium -mb-1">{{ $t('product.stockPricingDetails') }}</h3>
            </div>
   
            <div class="col-span-12">
              <div class="gap-5">
                <div class="grid grid-cols-12 gap-6">
                  <div class="col-span-3 md:col-span-6 lg:col-span-3">
                    <FormLabel>{{ $t('product.initialQuantity') }}</FormLabel>
                    <FormInput min="0" v-model="createFormData.initial_quantity" type="text" placeholder="0" :class="{ 'border-red-500': form.invalid('initial_quantity') }"/>
                    <template v-if="form.invalid('initial_quantity')">
                      <div class="mt-2 text-xs text-red-600">{{ form.getError('initial_quantity') }}</div>
                    </template>
                  </div>
                  <div class="col-span-3 md:col-span-6 lg:col-span-3">
                    <FormLabel for="cost_price">{{ $t('product.costPrice') }} <span class="text-danger"> *</span></FormLabel>
                    <FormInput :id="'cost_price'" v-model="createFormData.cost_price" type="text" placeholder="0.00" :class="{ 'border-red-500': form.invalid('cost_price') }" />
                    <template v-if="form.invalid('cost_price')">
                      <div class="mt-2 text-xs text-red-600">{{ form.getError('cost_price') }}</div>
                    </template>
                  </div>
                  <div class="col-span-3 md:col-span-6 lg:col-span-3">
                    <FormLabel id="sale_price">{{ $t('product.salePrice') }} <span class="text-danger"> *</span></FormLabel>
                    <FormInput :id="'sale_price'" v-model="createFormData.sale_price" type="number" placeholder="0.00" :class="{ 'border-red-500': form.invalid('sale_price') }" />
                    <template v-if="form.invalid('sale_price')">
                      <div class="mt-2 text-xs text-red-600">{{ form.getError('sale_price') }}</div>
                    </template>
                  </div>
                  <div class="col-span-3 md:col-span-6 lg:col-span-3">
                    <FormLabel for="vat">{{ $t('product.vat') }} <span class="text-danger"> *</span></FormLabel>
                    <div class="flex items-center z-40">
                      <TomSelect v-model="createFormData.vat" :options="{
                        placeholder:$t('product.vat'),
                      }" class="w-full" id="vat" :class="{ 'border-red-500': form.invalid('vat') }">
                        <template v-for="item in vatOptions">
                          <option :value="item.value">{{ item.label }}</option>
                        </template>
                      </TomSelect>
                    </div>
                    <template v-if="form.invalid('vat')">
                      <div class="mt-2 text-xs text-red-600">{{ form.getError('vat') }}</div>
                    </template>
                  </div>
                </div>
                <div class="py-2">
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
              <Button variant="primary" class="mr-2 mt-2 shadow-md" @click="submitProductData">
                {{ $t('product.submit') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
   
    <Notification id="success-notification-content" class="flex hidden">
      <Lucide icon="CheckCircle" class="text-success" />
      <div class="ml-4 mr-4">
        <div class="font-medium">{{ $t('product.productAlreadyAdded') }}</div>
      </div>
    </Notification>
    <Notification id="success-notification-productBank" class="flex hidden">
      <Lucide icon="CheckCircle" class="text-success" />
      <div class="ml-4 mr-4">
        <div class="font-medium">{{ $t('product.noProduct') }}</div>
        <div class="mt-1 text-slate-500">
          {{ $t('product.addProductManually') }}
        </div>
      </div>
    </Notification>
   
    <div v-if="isloading"
         class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
      <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
                   :color="'#fff'" :size="'50px'"></clip-loader>
    </div>
  </template>