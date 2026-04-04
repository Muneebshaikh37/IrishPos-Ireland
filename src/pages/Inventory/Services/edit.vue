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
  import { onMounted, ref, provide, reactive } from "vue";
  import CategoryWrap from "@/components/Category/index.vue";
  import apiService from "@/network/api/apiService";
  import { handleResponse, handleError } from "@/network/api/responseHandler.js";
  import Dropzone from "@/components/Base/Dropzone";
  import router from "@/router";
  import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
  import ErrorHandler from "@/utils/validation";
  import { useAuthStore } from "@/stores/auth.js";
  import { useI18n } from "vue-i18n";
   
  const route = useRoute()
   
  const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;
  const { t } = useI18n();
   
  const createFormData = ref({
      user_id: USER_ID,
   
    brand_id: "",
    category_id: "",
    sub_category_id: "",
    SubCategorySelect: "",
    image: "",
    name: "",
    description: "",
    sale_price: "",
    _method: "PUT",
    is_service: true,
  })
   
  const form = reactive(new ErrorHandler());
  const isloading = ref(false)
   
  const allServiceFetch = async () => {
    try {
      isloading.value = true;
      const response = await apiService.product.show(route.params.uuid);
      const result = handleResponse(response);
      if (result.success) {
        // Handle different response structures: result.data.data or result.data
        const serviceData = result.data?.data || result.data || {};
        
        // Debug: Check what description fields the backend is returning
        createFormData.value = {
          ...createFormData.value,
          category_id: serviceData.category?.id || "",
          sub_category_id: serviceData.sub_category?.id || "",
          SubCategorySelect: serviceData.sub_category?.id || "",
          name: serviceData.name ?? serviceData.name_en ?? serviceData.name_ar ?? "",
          description:
            serviceData.description
            ?? serviceData.description_en
            ?? serviceData.description_ar
            ?? "",
          sale_price: serviceData.sale_price || "",
          image: serviceData.image || "",
        };
        const elDropzoneMultipleRef = dropzoneMultipleRef.value;
        if (elDropzoneMultipleRef && result.data.data.image) {
          const mockFile = { name: "Existing Image", size: 123456 };
          elDropzoneMultipleRef.dropzone.emit("addedfile", mockFile);
          elDropzoneMultipleRef.dropzone.emit("thumbnail", mockFile, result.data.data.image);
          elDropzoneMultipleRef.dropzone.files.push(mockFile);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      isloading.value = false;
    }
  };
   
  const submitServiceData = async () => {
    try {
      isloading.value = true
      createFormData.value.category_id = createFormData.value.category_id
      createFormData.value.sub_category_id = createFormData.value.SubCategorySelect
      const response = await apiService.product.edit(route.params.uuid, createFormData.value);
      const result = handleResponse(response);
      if (result.success) {
        router.push("/inventory/services")
      }
    } catch (error) {
      handleError(error);
      form.setErrors(error.errors);
    } finally {
      isloading.value = false
    }
  };
   
  const locale = ref('en');
  onMounted(() => {
    allServiceFetch()
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
   
  </script>
   
  <template>
    <div class="flex items-center mt-8 intro-y">
      <RouterLink to="/inventory/services">
        <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
          <Lucide icon="ChevronLeft" class="w-5 h-5" />
        </Button>
      </RouterLink>
      <h2 class="mr-auto text-lg font-semibold">{{ $t('services.editService') }}</h2>
    </div>
    <div class="grid grid-cols-12 gap-6 mt-5">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-6">
              <FormLabel for="service-name-edit">{{ $t('services.serviceName') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput v-model="createFormData.name" id="service-name-edit" type="text" :placeholder="$t('services.serviceNamePlaceholder')"
                :class="{ 'border-red-500': form.invalid('name') || form.invalid('name_en') }" />
              <template v-if="form.invalid('name') || form.invalid('name_en')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('name') || form.getError('name_en') }}</div>
              </template>
            </div>
            <div class="col-span-6">
      <FormLabel>{{ $t('services.price') }} <span class="text-danger">*</span></FormLabel>
      <FormInput
        id="sale_price"
        v-model="createFormData.sale_price"
        type="number"
        :placeholder="$t('services.pricePlaceholder')"
        :class="{ 'border-red-500': form.invalid('sale_price') }"
      />
      <template v-if="form.invalid('sale_price')">
        <div class="mt-2 text-xs text-red-600">
          {{ form.getError('sale_price') }}
        </div>
      </template>
    </div>
            <div class="col-span-6">
              <FormLabel>{{ $t('services.descriptionSingle') }}</FormLabel>
              <FormTextarea v-model="createFormData.description" class="py-2 pl-4 resize-none" :rows="3"
                :placeholder="$t('services.descriptionSinglePlaceholder')">
              </FormTextarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <CategoryWrap :createFormData="createFormData" :form="form" /> -->
    <!-- <div class="grid grid-cols-12 gap-6 mt-5 relative z-10">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
              <h3 class="mr-auto text-lg font-medium -mb-1">Upload Image</h3>
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
                  Drop files here
                </div>
              </Dropzone>
            </div>
            <div class="col-span-12 -mt-4">
              <template v-if="form.invalid('image')">
                <div class="mt-2 text-xs text-red-600 font-medium">Image is required</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div> -->
   
    <div class="grid grid-cols-12 gap-6 mt-5 relative z-[10]">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
              <Button variant="primary" class="mr-2 shadow-md" @click="submitServiceData">
                {{ $t('services.save') }}
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