<script setup>
 
  import {
    FormInput,
    FormLabel,
    FormTextarea,
  } from "@/components/Base/Form";
  import Button from "@/components/Base/Button";
  import { RouterLink } from "vue-router";
  import Lucide from "@/components/Base/Lucide";
  import { onMounted, ref, reactive, nextTick } from "vue";
  import apiService from "@/network/api/apiService";
  import { handleResponse, handleError } from "@/network/api/responseHandler.js";
  import router from "@/router";
  import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
  import ErrorHandler from "@/utils/validation";
  import {useAuthStore} from "@/stores/auth.js";
  import Toastify from "toastify-js";
  import Notification from "@/components/Base/Notification";
  import { useI18n } from "vue-i18n";
   
  const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;
  const { t } = useI18n();
   
  const createFormData = ref({
    user_id: USER_ID,
    name_ar: "",
    name_en: "",
    description_en: "",
    description_ar: "",
    sale_price: "",
    is_service: true,
   
  })
   
  const form = reactive(new ErrorHandler());
  const isloading = ref(false)
   
  const submitServiceData = async () => {
    try {
      isloading.value = true
      const response = await apiService.product.create(createFormData.value);
      const result = handleResponse(response);
      if (result.success) {
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
        router.push("/inventory/services");
      } else {
        isloading.value = false;
      }
    } catch (error) {
      isloading.value = false;
      handleError(error);
      form.setErrors(error.errors);
    }
  };
   
  const locale = ref('en');
  onMounted(() => {
    locale.value = localStorage.getItem('locale') || 'en';
  })
   
  </script>
   
  <template>
    <div class="flex items-center mt-8 intro-y">
      <RouterLink to="/inventory/services">
        <Button variant="primary" size="sm" class="shadow-md h-8 w-9" :class="{ 'ml-4': locale === 'ar', 'mr-4': locale !== 'ar' }">
          <Lucide icon="ChevronLeft" class="w-5 h-5" :class="{ 'rotate-180': locale === 'ar', '': locale !== 'ar' }" />
        </Button>
      </RouterLink>
      <h2 class="text-lg font-semibold" :class="{ 'ml-auto': locale === 'ar', 'mr-auto': locale !== 'ar' }">{{ $t('services.addNewService') }}</h2>
    </div>
    <div class="grid grid-cols-12 gap-6 mt-5">
      <div class="col-span-12 intro-y lg:col-span-12">
        <div class="intro-y box p-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-6">
              <FormLabel for="name_en">{{ $t('services.serviceNameEn') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput v-model="createFormData.name_en" id="name_en" type="text" :placeholder="$t('services.serviceNameEnPlaceholder')" :class="{ 'border-red-500': form.invalid('name_en') }" />
              <template v-if="form.invalid('name_en')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('name_en') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel for="nameAr">{{ $t('services.serviceNameAr') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput id="nameAr" v-model="createFormData.name_ar" type="text" :placeholder="$t('services.serviceNameArPlaceholder')" :class="{ 'border-red-500': form.invalid('name_ar') }" />
              <template v-if="form.invalid('name_ar')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('name_ar') }}</div>
              </template>
            </div>
            <div class="col-span-6">
              <FormLabel id="sale_price">{{ $t('services.price') }} <span class="text-danger"> *</span></FormLabel>
              <FormInput :id="'sale_price'" v-model="createFormData.sale_price" type="number" :placeholder="$t('services.pricePlaceholder')" :class="{ 'border-red-500': form.invalid('sale_price') }" />
              <template v-if="form.invalid('sale_price')">
                <div class="mt-2 text-xs text-red-600">{{ form.getError('sale_price') }}</div>
              </template>
            </div>
            <div class="col-span-6"></div>
            <div class="col-span-6">
              <FormLabel>{{ $t('services.descriptionEn') }}</FormLabel>
              <FormTextarea v-model="createFormData.description_en" class="py-2 pl-4 resize-none" :rows="3" :placeholder="$t('services.descriptionEnPlaceholder')">
              </FormTextarea>
            </div>
            <div class="col-span-12 flex justify-end mt-4">
              <Button variant="primary" class="shadow-md" @click="submitServiceData">
                {{ $t('services.submit') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
   
    <Notification id="success-notification-content" class="flex hidden">
      <Lucide icon="CheckCircle" class="text-success" />
      <div class="ml-4 mr-4">
        <div class="font-medium">{{ $t('services.serviceCreatedSuccessfully') }}</div>
        <div class="mt-1 text-slate-500">
          {{ $t('services.serviceAddedSuccessfully') }}
        </div>
      </div>
    </Notification>
   
    <div v-if="isloading"
         class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
      <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
                   :color="'#fff'" :size="'50px'"></clip-loader>
    </div>
  </template>