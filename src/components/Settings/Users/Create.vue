<template>
  <div class=" py-6"  v-if="ability.can('create', 'user')">
    <form @submit.prevent="handleSubmit" class="">
      <div class="bg-white">
        <h2 class="text-2xl font-semibold mb-6">{{ $t('users.createUser') }}</h2>

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
          <div class="md:col-span-6 2xl:col-span-4">
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
            <FormInput class="py-3 "
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
                    :value="service.id"
                    v-model="formData.services"
                    class="mr-3"
                  />
                  <label :for="`service-${service.id}`" class="cursor-pointer flex-1">
                    {{ service.name_en || service.name_ar || service.name || service.sku || 'Unnamed Service' }}
                  </label>
                </div>
              </div>
            </div>
            <p v-if="isValidForm.invalid('services')" class="text-red-500 text-sm mt-1">
              {{ isValidForm.getError('services') }}
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
                  <li v-for="(role, index) in isAdminList" :key="role.id">
                    <input type="radio" :id="role.name" v-model="form.roleId" name="hosting" :value="role.id"
                           class="hidden peer" required/>
                    <FormLabel :for="role.name"
                               class="inline-flex items-center justify-between py-2.5 px-6 font-medium text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:text-primary hover:border-primary hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
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
                        <FormSwitch.Label :htmlFor="`allow-all-${list.id}`"
                                          class="text-base semibold text-black">
                          {{ $t('users.allowAll') }}
                        </FormSwitch.Label>
                        <FormSwitch.Input :id="`allow-all-${list.id}`" class="ml-3 mr-0" type="checkbox"
                                          :checked="isModuleFullyChecked(list)"
                                          @change="toggleAllModulePermissions(list, $event.target.checked)"/>
                      </div>
                      <div>
                        <FormSwitch.Label :htmlFor="`all-expend-${index}`" class="text-base semibold text-black"> {{ $t('users.expandAll') }}
                        </FormSwitch.Label>
                        <FormSwitch.Input :id="`all-expend-${index}`" class="ml-3 mr-0" type="checkbox"
                                          v-model="list.expandAll"
                                          @change="toggleAllSubModules(list)"/>
                      </div>

                    </div>
                  </div>
                  <template v-for="(sub_modules, index) in list.sub_modules">
                    <div class="bg-[#F1F5F9] rounded-lg mb-4 p-5 ">
                      <div class="flex items-center justify-between">
                        <h2 class="text-lg font-medium text-gray-600">{{ sub_modules.name }}</h2>
                        <div class="flex items-center gap-4">
                          <div class="z-[99999]">
                            <FormSwitch.Label :htmlFor="`all-${sub_modules.id}`" class="text-sm semibold text-black">
                              {{ $t('users.allowAll') }}
                            </FormSwitch.Label>
                            <FormSwitch.Input :id="`all-${sub_modules.id}`" class="ml-3 mr-0 z-[99999]" type="checkbox"
                                              :checked="sub_modules.permissions.every(permission => form.permissions.includes(permission.id))"
                                              @change="toggleAllPermissions(sub_modules, $event.target.checked)"/>
                          </div>
                          <div>
                            <Lucide icon="ChevronUp" :class="openCollapse[sub_modules.id] ? 'rotate-180 transform' : ''"
                                    class="h-5 w-5 text-black cursor-pointer" @click="toggleCollapse(sub_modules.id)"/>
                          </div>
                        </div>
                      </div>
                      <div v-show="openCollapse[sub_modules.id]" :class="`index-${index}`">
                        <div :class="`grid grid-cols-12 gap-6 mt-5`">
                          <template v-for="(permissions, index) in sub_modules.permissions">
                            <div class="lg:col-span-3 xl:col-span-2 flex">
                              <FormSwitch.Label :htmlFor="`${permissions.id}`" class="text-sm text-gray-500 min-w-[2.875rem]">
                                {{ permissions.label }}
                              </FormSwitch.Label>
                              <FormSwitch.Input :id="`${permissions.id}`" :value="permissions.id"
                                                v-model="form.permissions"
                                                class="ml-3 mr-0" type="checkbox"
                                                :checked="form.permissions.includes(permissions.id)"/>
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
        <div v-if="isloading"
             class="fixed top-0 w-full h-full left-0 flex items-center justifty-center bg-black bg-opacity-30 z-[999999]">
          <clip-loader
              class="absolute flex items-center justify-center w-full h-full top-0"
              :margin="'0px'"
              :loading="true"
              :color="'#fff'"
              :size="'50px'">
          </clip-loader>
        </div>

        <!-- Form Actions -->
        <div class="mt-8 flex justify-end space-x-4">
          <div class="mt-8">
            <Button type="submit" variant="primary" class="mr-2 shadow-md text-base px-6">
              <template v-if="isLoading">
                <LoadingIcon icon="three-dots" class="w-8 h-5 text-white"/>
              </template>
              <template v-else>{{ $t('users.createUser') }}</template>
            </Button>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div v-else>
    <AccessDenied/>
  </div>
</template>

<style>
.m-input-wrapper-input.--md, .m-input-wrapper.m-reset-css.--default-border.maz-rounded, .m-input-wrapper.m-reset-css.--default-border.maz-rounded {
  width: 100% !important;
}

.m-input-wrapper-input.--md input.m-input-input {
  width: 100% !important;
}

.m-phone-number-input.--responsive .m-phone-input.--border-radius .m-input-wrapper {
  width: 100% !important;
}
</style>

<script setup>
import {useAbility} from "@casl/vue";
import {onMounted, reactive, ref, watch, computed} from 'vue'
import httpClient from '@/network/api/httpClient';
import {handleResponse, handleError} from "@/network/api/responseHandler";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast.js";
import pan from "@/stores/pan.js"
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput';

import Button from "@/components/Base/Button";
import {FormInput, FormLabel, FormSwitch} from "@/components/Base/Form";
import {useAuthStore} from "@/stores/auth.js";
import AccessDenied from "../../AccessDenied/index.vue"

const authStore = useAuthStore();
const ability = useAbility();
const USER_ID = authStore.getUserId;
const isLoading = ref(false)
const countryCode = ref("SA");
const results = ref();
const formData = ref({
  id: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  services: [],
  permissions: {
    inventoryManagement: {
      allowAll: false,
      expandAll: false,
      products: {
        add: false,
        view: false,
        update: false,
        delete: false,
      },
    },
  },
})
const locale = ref('en'); // Default locale

const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);

// Toggle password visibility
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};
const toggleConfirmPasswordVisibility = () => {
  isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
};

const isAdminList = ref({})
const isAdminModulesList = ref({})
const isloading = ref(false)
const isBtnLoading = ref(false)
const servicesList = ref([]);
const isServicesDropdownOpen = ref(false);

const form = ref({
  roleId: "",
  roleName: "",
  permissions: [],
})

// Computed property to show services field only for worker role
const showServicesField = computed(() => {
  return form.value.roleName.toLowerCase() === 'worker';
});

// Computed property to hide permissions section when worker role is selected
const isWorkerRole = computed(() => {
  return form.value.roleName.toLowerCase() === 'worker';
});

const fetchAdminRoles = async () => {
  try {
    isloading.value = true
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_AUTH_AdMIN_API}/admin/roles`)
    const result = handleResponse(response);
    if (result.success) {
      // Filter out Super Admin role
      isAdminList.value = result.data.data.filter(role =>
        role.name.toLowerCase() !== 'super admin'
      )
      if (isAdminList.value.length > 0) {
        form.value.roleId = isAdminList.value[0].id
        form.value.roleName = isAdminList.value[0].name
        form.value.permissions = isAdminList.value.flatMap(role =>
            role.permissions.map(permission => permission.id)
        );
      }
      isloading.value = false
    }
  } catch (error) {
    handleError(error);
    isloading.value = false
  }
}

const fetchAdminModules = async () => {
  try {
    isloading.value = true
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_AUTH_AdMIN_API}/user-module/${USER_ID}`)
    const result = handleResponse(response);
    if (result.success) {
      isAdminModulesList.value = result.data.modules;
      isloading.value = false;
    }
  } catch (error) {
    handleError(error);
    isloading.value = false
  }
}

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
    if (result.success) {
      servicesList.value = Array.isArray(result.data?.data) ? result.data.data : [];
    } else {
      servicesList.value = [];
    }
    isloading.value = false;
  } catch (error) {
    handleError(error);
    isloading.value = false;
  }
};

const handleRoleChange = (role) => {
  formData.value.role = role
  if (role === 'Admin') {
    formData.value.permissions = {
      inventoryManagement: {
        allowAll: true,
        expandAll: true,
        products: {add: true, view: true, update: true, delete: true},
      },
    }
  } else if (role === 'User') {
    formData.value.permissions = {
      inventoryManagement: {
        allowAll: false,
        expandAll: false,
        products: {add: true, view: true, update: false, delete: false},
      },
    }
  } else {
    formData.value.permissions = {
      inventoryManagement: {
        allowAll: false,
        expandAll: false,
        products: {add: false, view: false, update: false, delete: false},
      },
    }
  }
}

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

const toggleServicesDropdown = () => {
  isServicesDropdownOpen.value = !isServicesDropdownOpen.value;
};

onMounted(() => {
  const ability = useAbility();
  if (ability.can('create', 'user')) {
    fetchAdminRoles();
    fetchAdminModules();
    fetchServices();
  }
  locale.value = localStorage.getItem('locale') || 'en';

  if (isAdminModulesList.value.length > 0 && isAdminModulesList.value[0].sub_modules.length > 0) {
    openCollapse[isAdminModulesList.value[0].sub_modules[0].id] = true;
  }
})

const emit = defineEmits(['created']);

const isValidForm = reactive(new ErrorHandler());

const handleSubmit = async () => {
  isLoading.value = true
  isValidForm.clear();
  try {
    // Filter services to only include valid service IDs from the fetched list
    const validServiceIds = servicesList.value.map(service => service.id);
    const filteredServices = formData.value.services.filter(serviceId => 
      validServiceIds.includes(serviceId)
    );
    
    // If some services were filtered out, show a warning
    if (formData.value.services.length > filteredServices.length) {
      const removedServices = formData.value.services.filter(id => !validServiceIds.includes(id));
      console.warn('Some invalid services were removed:', removedServices);
      toast().fry(pan.error('Some selected services are invalid and were removed. Please refresh and try again.'));
    }
    
    const payload = {
      name: formData.value.name,
      user_id: USER_ID,
      phone: formData.value.phone,
      country_code: results.value.countryCallingCode,
      email: formData.value.email,
      password: formData.value.password,
      password_confirmation: formData.value.confirmPassword,
      role: form.value.roleName,
      permissions: form.value.permissions,
      services: filteredServices,
    }
    const response = await httpClient.post(`${import.meta.env.VITE_PUBLIC_AUTH_AdMIN_API}/users`, payload)
    const result = handleResponse(response);
    if (result.success) {
      toast().fry(pan.Permissions.success("User Created Successfully"))
      resetForm();
      emit("created");
    }
  } catch (error) {
    // Handle backend validation errors for services
    if (error.response?.data?.message && error.response.data.message.includes('service')) {
      const invalidServices = error.response.data.invalid_services || [];
      toast().fry(pan.error(`Invalid services detected: ${invalidServices.join(', ')}. Please refresh the services list and try again.`));
      // Refresh services list
      await fetchServices();
    }
    isValidForm.setErrors(error.errors || error.response?.data?.errors || {});
  } finally {
    isLoading.value = false
  }
}

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

const resetForm = () => {
  formData.value = {
    id: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    services: [],
    permissions: {
      inventoryManagement: {
        allowAll: false,
        expandAll: false,
        products: {add: false, view: false, update: false, delete: false},
      },
    },
  }
}

watch(() => form.value.roleId,
	(newRoleId) => {
		if (newRoleId) {
			const selectedRole = isAdminList.value.find(role => role.id === newRoleId);
      console.log(selectedRole)
      form.value.roleName = selectedRole.name;
      const selectedRolePermissions = selectedRole ? selectedRole.permissions.map(permission => permission.id) : [];

      // If worker role is selected, clear permissions (they won't be sent to backend)
      // This avoids validation errors while keeping permissions hidden from the UI
      if (selectedRole && selectedRole.name.toLowerCase() === 'worker') {
        form.value.permissions = [];
      } else {
        form.value.permissions = selectedRolePermissions;
      }
		}
	}
);
</script>
