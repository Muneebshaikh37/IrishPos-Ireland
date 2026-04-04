<script setup>
import { onMounted, reactive, ref, watch, computed, nextTick } from 'vue';
import httpClient from '@/network/api/httpClient';
import { handleResponse, handleError } from "@/network/api/responseHandler";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast.js";
import pan from "@/stores/pan.js";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput';

import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSwitch } from "@/components/Base/Form";
import {useAuthStore} from "@/stores/auth.js";

const props = defineProps({
  user: { type: Object, required: true },
});

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isLoading = ref(false);
const countryCode = ref("SA");
const results = ref();
const formData = ref({
  id: '',
  name: props.user.name,
  phone: props.user.phone,
  email: props.user.email,
  password: '',
  confirmPassword: '',
  role: props.user.roles.length ? props.user.roles[0].name : '',
  permissions: {},
  services: [],
});
const isAdminList = ref({});
const isAdminModulesList = ref({});
const isloading = ref(false);

const form = ref({
  roleName: props.user.roles.length ? props.user.roles[0].name : '',
  permissions: [],
});


const servicesList = ref([]);
const isServicesDropdownOpen = ref(false);

const showServicesField = computed(() => {
  return form.value.roleName.toLowerCase() === 'worker';
});

// Computed property to hide permissions section when worker role is selected
const isWorkerRole = computed(() => {
  return form.value.roleName.toLowerCase() === 'worker';
});

const isPasswordVisible = ref(false); 
const isConfirmPasswordVisible = ref(false);  
// Toggle password visibility
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};
const toggleConfirmPasswordVisibility = () => {
  isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
};

const currentUser = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_AUTH_AdMIN_API}/users/${props.user.id}`);
    const result = handleResponse(response);
    if (result.success) {
      const user = result.data;
      form.value.permissions = user.permissions.map(permission => permission.id);

      // Store user services data and set them when services list is ready
      if (Array.isArray(user.services) && user.services.length > 0) {
        userServicesData.value = user.services;
        if (servicesList.value.length > 0) {
          setUserServices();
        }
      } else {
        userServicesData.value = null;
        formData.value.services = [];
      }
    }
  } catch (error) {
    handleError(error);
  } finally {
    isloading.value = false;
  }
};

const fetchAdminRoles = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_AUTH_AdMIN_API}/admin/roles`);
    const result = handleResponse(response);
    if (result.success) {
      // Filter out Super Admin role
      isAdminList.value = result.data.data.filter(role => 
        role.name.toLowerCase() !== 'super admin'
      );
      // Set default role if not already set
      if (!form.value.roleName && isAdminList.value.length) {
        form.value.roleName = isAdminList.value[0].name;
      }
    }
    isloading.value = false;
  } catch (error) {
    handleError(error);
    isloading.value = false;
  }
};

const fetchAdminModules = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_AUTH_AdMIN_API}/user-module/${USER_ID}`);
    const result = handleResponse(response);
    if (result.success) {
      isAdminModulesList.value = result.data.modules;
      isloading.value = false;
    }
  } catch (error) {
    handleError(error);
    isloading.value = false;
  }
};

const fetchServices = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/dropdowndata/products`, {
      params: {
        user_id: USER_ID,
        is_service: true,
      },
    });
    const result = handleResponse(response);
    servicesList.value = result.success && Array.isArray(result.data?.data)
      ? result.data.data
      : [];
  } catch (error) {
    handleError(error);
    servicesList.value = [];
  } finally {
    isloading.value = false;
  }
};

const isModuleFullyChecked = (module) =>
    module.sub_modules.every(subModule =>
        subModule.permissions.every(permission => form.value.permissions.includes(permission.id))
    );

const openCollapse = reactive({});
const toggleCollapse = (id) => {
  openCollapse[id] = !openCollapse[id];
};
const toggleAllSubModules = (list) => {
  list.sub_modules.forEach((subModule) => {
    openCollapse[subModule.id] = list.expandAll;
  });
};

// Store user services temporarily until servicesList is loaded
const userServicesData = ref(null);

const setUserServices = () => {
  if (userServicesData.value && servicesList.value.length > 0) {
    // Extract service/product IDs from user services
    // The service object might have: product_id, service_id, or be the product itself with id
    const userServiceIds = userServicesData.value
      .map((service) =>
        service?.product_id ??
        service?.service_id ??
        service?.pivot?.product_id ??
        service?.pivot?.service_id ??
        service?.id
      )
      .filter((id) => id !== null && id !== undefined)
      .map((id) => String(id)); // Compare as strings

    // Match with servicesList
    formData.value.services = servicesList.value
      .filter((service) => userServiceIds.includes(String(service.id)))
      .map((service) => String(service.id));
  }
};

// Watch for servicesList changes and set user services when it's loaded
watch(
  servicesList,
  (newList) => {
    if (newList && newList.length > 0 && userServicesData.value) {
      setUserServices();
    }
  },
  { deep: true }
);

onMounted(async () => {
  // Fetch in parallel to reduce load time
  await Promise.all([
    fetchAdminModules(),
    fetchAdminRoles(),
    fetchServices(),
    currentUser(),
  ]);
  if (userServicesData.value && servicesList.value.length > 0) {
    setUserServices();
  }
});

watch(() => form.value.roleName,
    (newRoleName) => {
      if (newRoleName) {
        const selectedRole = isAdminList.value.find(role => role.name === newRoleName);
        form.value.roleName = selectedRole ? selectedRole.name : newRoleName;
        
        // If worker role is selected, clear permissions as workers cannot have permissions
        if (selectedRole && selectedRole.name.toLowerCase() === 'worker') {
          form.value.permissions = [];
        } else {
          form.value.permissions = selectedRole ? selectedRole.permissions.map(permission => permission.id) : [];
        }
      }
    }
);

const isValidForm = reactive(new ErrorHandler());
const toggleAllModulePermissions = (module, isChecked) => {
  if (isChecked) {
    module.sub_modules.forEach(subModule => {
      subModule.permissions.forEach(permission => {
        if (!form.value.permissions.includes(permission.id)) {
          form.value.permissions.push(permission.id);
        }
      });
    });
  } else {
    form.value.permissions = form.value.permissions.filter(permissionId =>
        !module.sub_modules.some(subModule =>
            subModule.permissions.some(permission => permission.id === permissionId)
        )
    );
  }
};

const toggleAllPermissions = (subModule, isChecked) => {
  if (isChecked) {
    subModule.permissions.forEach(permission => {
      if (!form.value.permissions.includes(permission.id)) {
        form.value.permissions.push(permission.id);
      }
    });
  } else {
    form.value.permissions = form.value.permissions.filter(
        permissionId => !subModule.permissions.some(permission => permission.id === permissionId)
    );
  }
};

const toggleServicesDropdown = () => {
  isServicesDropdownOpen.value = !isServicesDropdownOpen.value;
};

const emit = defineEmits(['updated']);

// Update user
const handleSubmit = async () => {
  isLoading.value = true;
  isValidForm.clear();
  if (showServicesField.value && formData.value.services.length === 0) {
    isValidForm.setErrors({ services: ["Please select at least one service."] });
    isLoading.value = false;
    return;
  }
  try {
    // Get the selected role to use its default permissions
    const selectedRole = isAdminList.value.find(role => role.name === form.value.roleName);
    // For non-workers, use form permissions or role's default permissions
    const permissionsToSend = form.value.permissions.length > 0 
      ? form.value.permissions 
      : (selectedRole?.permissions?.map(p => p.id) || []);
    
    const payload = {
      name: formData.value.name,
      user_id: USER_ID,
      phone: formData.value.phone,
      email: formData.value.email,
      country_code: results.value.countryCallingCode,
      password: formData.value.password,
      password_confirmation: formData.value.confirmPassword,
      role: form.value.roleName,
      services: formData.value.services,
      _method: "PUT",
    };
    
    // Only include permissions if role is not Worker
    if (!isWorkerRole.value) {
      payload.permissions = permissionsToSend;
    }
    console.log(payload);
    const response = await httpClient.post(`${import.meta.env.VITE_PUBLIC_AUTH_AdMIN_API}/users/${props.user.id}`, payload);
    const result = handleResponse(response);
    if (result.success) {
      toast().fry(pan.Permissions.success("User Update Successfully"));
      emit("updated"); // Emit the 'updated' event
    }
  } catch (error) {
    isValidForm.setErrors(error.errors);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class=" py-6">
    <form @submit.prevent="handleSubmit" class="">
      <div class="bg-white">
        <h2 class="text-2xl font-semibold mb-6">{{ $t('users.updateUser') }}</h2>

        <!-- User Details Section -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- User Name Field -->
          <div class="md:col-span-6 2xl:col-span-4">
            <FormLabel>{{ $t('users.userName') }}</FormLabel>
            <FormInput
                v-model="formData.name"
                :placeholder="$t('users.enterName')"
                class="py-3" :class="isValidForm.invalid('name') ? 'border-red-500' : ''"
            />
            <p v-if="isValidForm.invalid('name')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('name') }}
            </p>
          </div>

          <!-- Phone Number Field -->
          <div class="  md:col-span-6 2xl:col-span-4">
            <FormLabel>{{ $t('users.phoneNumber') }}</FormLabel>
            <MazPhoneNumberInput
                id="phone"
                v-model="formData.phone"
                :noSearch="true"
                :noFlags="true"
                :noExample="true"
                :fetchCountry="false"
                :default-country="'SA'"
                :block="true"
                :noValidationSuccess="true"
                v-model:country-code="countryCode"
                :onlyCountries="['SA']"
                class="w-full h-12"
                @update="results = $event"
                :error="isValidForm.invalid('phone')"
            />
            <p v-if="isValidForm.invalid('phone')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('phone') }}
            </p>
          </div>

          <!-- Email Field -->
          <div class="col-span-4">
            <FormLabel>{{ $t('users.email') }}</FormLabel>
            <FormInput class="py-3"
                       type="email"
                       disabled
                       v-model="formData.email"
                       :placeholder="$t('users.enterEmail')"
                       :class="isValidForm.invalid('email') ? 'border-red-500' : ''"
            />
            <p v-if="isValidForm.invalid('email')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('email') }}
            </p>
          </div>


          <!-- Password Field -->
          <div class="col-span-4 relative">
            <FormLabel>{{ $t('users.password') }}</FormLabel>
            <FormInput class="py-3"
                        :type="isPasswordVisible ? 'text' : 'password'"
                       v-model="formData.password"
                       :placeholder="$t('users.enterPassword')"
                       :class="isValidForm.invalid('password') ? 'border-red-500' : ''"
            />
            <Lucide
                :icon="isPasswordVisible ? 'Eye' : 'EyeOff'"
                @click="togglePasswordVisibility"
                class="w-5 h-5 text-gray-500 absolute top-10 cursor-pointer" :class="{ 'left-3': locale === 'ar', 'right-3': locale !== 'ar' }"
            />

            <p v-if="isValidForm.invalid('password')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('password') }}
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div class="col-span-4 relative">
            <FormLabel>{{ $t('users.confirmPassword') }}</FormLabel>
            <FormInput class="py-3"
                      :type="isConfirmPasswordVisible ? 'text' : 'password'"
                       v-model="formData.confirmPassword"
                       :placeholder="$t('users.confirmPassword')"
                       :class="isValidForm.invalid('password_confirmation') ? 'border-red-500' : ''"
            />
            <Lucide
                :icon="isConfirmPasswordVisible ? 'Eye' : 'EyeOff'"
                @click="toggleConfirmPasswordVisibility"
                class="w-5 h-5 text-gray-500 absolute top-10 cursor-pointer" :class="{ 'left-3': locale === 'ar', 'right-3': locale !== 'ar' }"
            />
            <p v-if="isValidForm.invalid('password_confirmation')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('password_confirmation') }}
            </p>
          </div>

          <!-- Services Field (Conditional) -->
          <div v-if="showServicesField" class="col-span-4 relative">
            <!-- <FormLabel>{{ $t('users.services') }}</FormLabel> -->
             <FormLabel>Services</FormLabel>
            <div class="relative">
              <div
                @click="toggleServicesDropdown"
                class="py-3 px-4 border border-gray-300 rounded-md cursor-pointer bg-white flex items-center justify-between"
                :class="isValidForm.invalid('services') ? 'border-red-500' : ''"
              >
                <span v-if="formData.services.length === 0" class="text-gray-400">Select Services</span>
                <span v-else class="text-gray-700">{{ formData.services.length }} selected</span>
                <Lucide
                  icon="ChevronDown"
                  :class="isServicesDropdownOpen ? 'rotate-180 transform' : ''"
                  class="h-5 w-5 text-gray-500"
                />
              </div>
              <div
                v-show="isServicesDropdownOpen"
                class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
                :class="servicesList.length === 0 ? 'min-h-[50px]' : 'max-h-60'"
              >
                <div v-if="servicesList.length === 0" class="px-4 py-3 text-gray-500 text-center text-sm">
                  No service available
                </div>
                <div
                  v-for="service in servicesList"
                  :key="service.id"
                  class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  @click.stop
                >
                  <input
                    type="checkbox"
                    :id="`service-${service.id}`"
                    :value="String(service.id)"
                    v-model="formData.services"
                    class="mr-3"
                  />
                  <label :for="`service-${service.id}`" class="cursor-pointer flex-1">
                    {{ service.name_en || service.name_ar || service.name || service.sku || 'Unnamed Service' }}
                  </label>
                </div>
              </div>
            </div>
            <p v-if="isValidForm.invalid('services') || isValidForm.invalid('services.0')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('services') || isValidForm.getError('services.0') }}
            </p>
          </div>

        </div>

        <!-- Roles & Permissions Section -->
        <div class="flex items-center mt-8 intro-y">
          <h2 class="mr-auto text-lg font-medium">{{ $t('users.permissionManagement') }}</h2>
        </div>
        <div class="grid grid-cols-12 gap-6 mt-5">
          <div class="col-span-12 intro-y lg:col-span-12">
            <div class="intro-y box p-8">
              <div class="mb-4">
                <ul class="flex w-full gap-6">
                  <li v-for="(role, index) in isAdminList" :key="role.name">
                    <input
                        type="radio"
                        :id="role.name"
                        v-model="form.roleName"
                        :value="role.name"
                        class="hidden peer"
                        required
                    />
                    <FormLabel
                        :for="role.name"
                        class="inline-flex items-center justify-between py-2.5 px-6 font-medium text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:text-primary hover:border-primary hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      {{ role.name }}
                    </FormLabel>
                  </li>
                </ul>
                <p v-if="isValidForm.invalid('role')" class="text-red-500 text-sm mt-1">
                  {{ isValidForm.getError('role') }}
                </p>
              </div>
              <div v-if="!isWorkerRole" class="mt-4">
                <template v-for="(list, index) in isAdminModulesList">
                  <div class="flex items-center justify-between">
                    <h2 class="text-xl font-semibold text-gray-600 my-3 pl-1">{{ list.name }}</h2>
                    <div class="flex items-center gap-4">
                      <div>
                        <FormSwitch.Label :htmlFor="`allow-all-${list.id}`" class="text-base semibold text-black">
                          {{ $t('users.allowAll') }}
                        </FormSwitch.Label>
                        <FormSwitch.Input
                            :id="`allow-all-${list.id}`"
                            class="ml-3 mr-0"
                            type="checkbox"
                            :checked="isModuleFullyChecked(list)"
                            @change="toggleAllModulePermissions(list, $event.target.checked)"
                        />
                      </div>
                      <div>
                        <FormSwitch.Label :htmlFor="`all-expend-${index}`" class="text-base semibold text-black">
                          {{ $t('users.expandAll') }}
                        </FormSwitch.Label>
                        <FormSwitch.Input
                            :id="`all-expend-${index}`"
                            class="ml-3 mr-0"
                            type="checkbox"
                            v-model="list.expandAll"
                            @change="toggleAllSubModules(list)"
                        />
                      </div>
                    </div>
                  </div>
                  <template v-for="(sub_modules, index) in list.sub_modules">
                    <div class="bg-[#F1F5F9] rounded-lg mb-4 p-5">
                      <div class="flex items-center justify-between">
                        <h2 class="text-lg font-medium text-gray-600">{{ sub_modules.name }}</h2>
                        <div class="flex items-center gap-4">
                          <div class="z-[99999]">
                            <FormSwitch.Label :htmlFor="`all-${sub_modules.id}`" class="text-sm semibold text-black">
                              {{ $t('users.allowAll') }}
                            </FormSwitch.Label>
                            <FormSwitch.Input
                                :id="`all-${sub_modules.id}`"
                                class="ml-3 mr-0 z-[99999]"
                                type="checkbox"
                                :checked="sub_modules.permissions.every(permission => form.permissions.includes(permission.id))"
                                @change="toggleAllPermissions(sub_modules, $event.target.checked)"
                            />
                          </div>
                          <div>
                            <Lucide
                                icon="ChevronDown"
                                :class="openCollapse[sub_modules.id] ? 'rotate-180 transform' : ''"
                                class="h-5 w-5 text-black cursor-pointer"
                                @click="toggleCollapse(sub_modules.id)"
                            />
                          </div>
                        </div>
                      </div>
                      <div v-show="openCollapse[sub_modules.id]" :class="`index-${index}`">
                        <div :class="`grid grid-cols-12 gap-6 mt-5`">
                          <template v-for="(permissions, index) in sub_modules.permissions">
                            <div class="lg:col-span-3 xl:col-span-2 flex">
                              <FormSwitch.Label :htmlFor="`${permissions.id}`" class="text-sm text-gray-500">
                                {{ permissions.label }}
                              </FormSwitch.Label>
                              <FormSwitch.Input
                                  :id="`${permissions.id}`"
                                  :value="permissions.id"
                                  v-model="form.permissions"
                                  class="ml-3 mr-0"
                                  type="checkbox"
                                  :checked="form.permissions.includes(permissions.id)"
                              />
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                </template>
              </div>
            </div>
          </div>
        </div>
       


        <!-- Form Actions -->
        <div class="mt-8 flex justify-end space-x-4">
          <div class="mt-8">
            <Button type="submit" variant="primary" class="mr-2 shadow-md text-base px-6">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-8 h-5 text-white"/>
              </template>
              <template v-else> {{ $t('users.updateUser') }}</template>
            </Button>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div v-if="isloading" class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-opacity-30 z-[999999]">
          <clip-loader
              class="absolute flex items-center justify-center w-full h-full top-0"
              :margin="'0px'"
              :loading="true"
              :color="'#000'"
              :size="'50px'"
          ></clip-loader>
        </div>
</template>