<template>
  <div class="flex items-center mt-8 intro-y" :class="{ 'flex-row-reverse': locale === 'ar' }">
    <RouterLink :to="{ name: 'SuperAdminShops' }">
      <Button variant="primary" size="sm" class="shadow-md h-8 w-9" :class="locale === 'ar' ? 'ml-4' : 'mr-4'">
        <Lucide icon="ChevronLeft" class="w-5 h-5" :class="{ 'rotate-180': locale === 'ar' }" />
      </Button>
    </RouterLink>
    <h2 class="text-lg font-medium flex-1" :class="locale === 'ar' ? 'text-right ml-auto' : 'mr-auto'">{{ $t('superadmin.createShop.title') }}</h2>
  </div>
  <div class="intro-y box mt-5">

    <form @submit.prevent="handleSubmit" class="p-5">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Shop Name -->
        <div class="md:col-span-6">
          <FormLabel>{{ $t('superadmin.createShop.shopName') }} *</FormLabel>
          <FormInput
            v-model="formData.name"
            type="text"
            :placeholder="$t('superadmin.createShop.shopNamePlaceholder')"
            :class="errors.name ? 'border-red-500' : ''"
          />
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name[0] }}</p>
        </div>

        <!-- Email -->
        <div class="md:col-span-6">
          <FormLabel>{{ $t('superadmin.createShop.email') }} *</FormLabel>
          <FormInput
            v-model="formData.email"
            type="email"
            :placeholder="$t('superadmin.createShop.emailPlaceholder')"
            :class="errors.email ? 'border-red-500' : ''"
          />
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email[0] }}</p>
        </div>

        <!-- Password -->
        <div class="md:col-span-6 relative">
          <FormLabel>{{ $t('superadmin.createShop.password') }} *</FormLabel>
          <FormInput
            v-model="formData.password"
            :type="isPasswordVisible ? 'text' : 'password'"
            :placeholder="$t('superadmin.createShop.passwordPlaceholder')"
            :class="errors.password ? 'border-red-500' : ''"
          />
          <Lucide
            :icon="isPasswordVisible ? 'Eye' : 'EyeOff'"
            @click="isPasswordVisible = !isPasswordVisible"
            :class="['w-5 h-5 text-gray-500 absolute top-10 cursor-pointer', locale === 'ar' ? 'left-3' : 'right-3']"
          />
          <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password[0] }}</p>
        </div>

        <!-- Confirm Password -->
        <div class="md:col-span-6 relative">
          <FormLabel>{{ $t('superadmin.createShop.confirmPassword') }} *</FormLabel>
          <FormInput
            v-model="formData.password_confirmation"
            :type="isConfirmPasswordVisible ? 'text' : 'password'"
            :placeholder="$t('superadmin.createShop.confirmPasswordPlaceholder')"
            :class="errors.password_confirmation ? 'border-red-500' : ''"
          />
          <Lucide
            :icon="isConfirmPasswordVisible ? 'Eye' : 'EyeOff'"
            @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
            :class="['w-5 h-5 text-gray-500 absolute top-10 cursor-pointer', locale === 'ar' ? 'left-3' : 'right-3']"
          />
          <p v-if="errors.password_confirmation" class="text-red-500 text-sm mt-1">
            {{ errors.password_confirmation[0] }}
          </p>
        </div>

        <!-- Phone -->
        <div class="md:col-span-6">
          <FormLabel>{{ $t('superadmin.createShop.phone') }}</FormLabel>
          <div :class="{ 'rtl-phone-input': locale === 'ar' }">
            <MazPhoneNumberInput
              id="phone"
              v-model="formData.phone"
              :noSearch="true"
              v-model:country-code="countryCode"
              :onlyCountries="['SA']"
              :placeholder="$t('superadmin.createShop.phonePlaceholder')"
              class="w-full"
              @update="phoneResults = $event"
            />
          </div>
          <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone[0] }}</p>
        </div>

        <!-- Address -->
        <div class="md:col-span-6">
          <FormLabel>{{ $t('superadmin.createShop.address') }}</FormLabel>
          <FormTextarea
            v-model="formData.address"
            :placeholder="$t('superadmin.createShop.addressPlaceholder')"
            rows="3"
            :class="errors.address ? 'border-red-500' : ''"
          />
          <p v-if="errors.address" class="text-red-500 text-sm mt-1">{{ errors.address[0] }}</p>
        </div>

        <!-- VAT Number -->
        <div class="md:col-span-6">
          <FormLabel>{{ $t('superadmin.createShop.vatNumber') }}</FormLabel>
          <FormInput
            v-model="formData.vat_number"
            type="text"
            maxlength="15"
            :placeholder="$t('superadmin.createShop.vatNumberPlaceholder')"
            :class="errors.vat_number ? 'border-red-500' : ''"
          />
          <p v-if="errors.vat_number" class="text-red-500 text-sm mt-1">{{ errors.vat_number[0] }}</p>
        </div>

        <!-- Currency -->
        <div class="md:col-span-6">
          <FormLabel>{{ $t('superadmin.createShop.currency') }} *</FormLabel>
          <FormSelect
            v-model="formData.currency_code"
            :class="errors.currency_code ? 'border-red-500' : ''"
          >
            <option v-for="currency in currencyOptions" :key="currency.code" :value="currency.code">
              {{ currency.label }}
            </option>
          </FormSelect>
          <p v-if="errors.currency_code" class="text-red-500 text-sm mt-1">{{ errors.currency_code[0] }}</p>
        </div>

        <!-- Package Selection -->
        <div class="md:col-span-6">
          <FormLabel>{{ $t('superadmin.createShop.package') }}</FormLabel>
          <FormSelect
            v-model="formData.package_id"
            :class="errors.package_id ? 'border-red-500' : ''"
          >
            <option value="">{{ $t('superadmin.createShop.selectPackage') }}</option>
            <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">
              {{ pkg.name }} - {{ formatPrice(pkg.price) }} / {{ getBillingFrequency(pkg) }}
            </option>
          </FormSelect>
          <p v-if="errors.package_id" class="text-red-500 text-sm mt-1">{{ errors.package_id[0] }}</p>
        </div>

        <!-- Skip Payment (only if package selected) -->
        <div v-if="formData.package_id" class="md:col-span-12">
          <FormSwitch>
            <FormCheck.Input
              id="skip_payment"
              v-model="formData.skip_payment"
              type="checkbox"
            />
            <FormCheck.Label htmlFor="skip_payment">
              {{ $t('superadmin.createShop.skipPayment') }}
            </FormCheck.Label>
          </FormSwitch>
          <p class="text-sm text-gray-600 mt-1">
            {{ $t('superadmin.createShop.skipPaymentDescription') }}
          </p>
        </div>

        <!-- Notes -->
        <div class="md:col-span-12">
          <FormLabel>{{ $t('superadmin.createShop.notes') }}</FormLabel>
          <FormTextarea
            v-model="formData.notes"
            :placeholder="$t('superadmin.createShop.notesPlaceholder')"
            rows="3"
            :class="errors.notes ? 'border-red-500' : ''"
          />
          <p v-if="errors.notes" class="text-red-500 text-sm mt-1">{{ errors.notes[0] }}</p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-200/60">
        <router-link :to="{ name: 'SuperAdminShops' }" class="btn btn-secondary">
          {{ $t('superadmin.createShop.cancel') }}
        </router-link>
        <Button
          type="submit"
          variant="primary"
          :disabled="isSubmitting"
          class="min-w-[120px]"
        >
          <LoadingIcon v-if="isSubmitting" icon="oval" class="w-5 h-5 mr-2" />
          <span v-if="isSubmitting">{{ $t('superadmin.createShop.creating') }}</span>
          <span v-else>{{ $t('superadmin.createShop.create') }}</span>
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import superAdminApi from '@/network/modules/superadmin';
import packagesApi from '@/network/modules/packages';
import { handleResponse, handleError } from '@/network/api/responseHandler';
import { FormLabel, FormInput, FormTextarea, FormSelect, FormSwitch, FormCheck } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import LoadingIcon from '@/components/Base/LoadingIcon';
import toast from '@/stores/utility/toast';
import pan from '@/stores/pan';
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput';
import { formatMoney, CURRENCY_OPTIONS, getCurrencySymbol } from '@/utils/currency';

const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useI18n();

const superAdminId = computed(() => {
  // For Super Admin, prioritize user.id (the actual user ID)
  // Then fallback to user_id from localStorage, then getUserId
  const user = authStore.getUser;
  const userId = user?.id || authStore.user_id || authStore.getUserId || '';
  
  // Debug logging (remove in production)
  if (!userId) {
    console.warn('SuperAdmin ID not found:', {
      user: user,
      user_id: authStore.user_id,
      getUserId: authStore.getUserId,
      localStorage_user_id: localStorage.getItem('user_id'),
      localStorage_user: localStorage.getItem('user')
    });
  }
  
  return userId;
});

const formData = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  address: '',
  vat_number: '',
  currency_code: 'EUR',
  package_id: '',
  skip_payment: false,
  notes: '',
});

const errors = ref({});
const isSubmitting = ref(false);
const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const packages = ref([]);
const countryCode = ref('SA');
const phoneResults = ref(null);
const currencyOptions = CURRENCY_OPTIONS.map((code) => ({
  code,
  label: `${code} (${getCurrencySymbol(code)})`,
}));

const fetchPackages = async () => {
  try {
    const response = await packagesApi.listPackages({
      superAdminId: superAdminId.value,
      is_active: true, // Only get active packages
      limit: 100, // Get all active packages
      page: 1,
    });
    const result = handleResponse(response);
    if (result.success) {
      // Handle paginated response - data might be in result.data.data or result.data
      const packagesData = result.data?.data || result.data || [];
      packages.value = Array.isArray(packagesData) ? packagesData : [];
    }
  } catch (error) {
    handleError(error);
    toast().fry(pan.error(t('superadmin.createShop.failedToLoadPackages')));
  }
};

const formatPrice = (price) => {
  return formatMoney(price || 0);
};

const getBillingFrequency = (pkg) => {
  const typeMap = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    annual: 'Annual',
  };
  return typeMap[pkg.duration_type] || 'Monthly';
};

const handleSubmit = async () => {
  if (!superAdminId.value) {
    toast().fry(pan.error(t('superadmin.createShop.superAdminIdRequired')));
    return;
  }

  isSubmitting.value = true;
  errors.value = {};

  try {
    // Format phone number from MazPhoneNumberInput
    const phone = phoneResults.value?.nationalNumber || formData.value.phone;
    const countryCodeValue = phoneResults.value ? `+${phoneResults.value.countryCallingCode}` : '+966';

    const payload = {
      super_admin_id: superAdminId.value,
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      password_confirmation: formData.value.password_confirmation,
      phone: phone,
      country_code: countryCodeValue,
      address: formData.value.address,
      vat_number: formData.value.vat_number,
      currency_code: formData.value.currency_code,
      skip_payment: formData.value.package_id ? formData.value.skip_payment : false,
    };

    // Remove package_id if not selected
    if (!formData.value.package_id) {
      delete payload.package_id;
    } else {
      payload.package_id = formData.value.package_id;
    }

    // Add notes if provided
    if (formData.value.notes) {
      payload.notes = formData.value.notes;
    }

    console.log('Creating shop with payload:', { ...payload, password: '***', password_confirmation: '***' });
    console.log('SuperAdmin ID being sent:', superAdminId.value);
    
    const response = await superAdminApi.createShop(payload);
    console.log('Shop creation response:', response);
    
    const result = handleResponse(response);
    console.log('Shop creation result:', result);

    if (result.success) {
      toast().fry(pan.success(t('superadmin.createShop.shopCreatedSuccess')));
      router.push({ name: 'SuperAdminShops' });
    } else {
      console.error('Shop creation failed:', result);
      if (result.errors) {
        errors.value = result.errors;
        // Show first error message
        const firstError = Object.values(result.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast().fry(pan.error(firstError[0]));
        }
      } else {
        toast().fry(pan.error(result.message || t('superadmin.createShop.failedToCreate')));
      }
    }
  } catch (error) {
    console.error('Shop creation error:', error);
    const errorResult = handleError(error);
    console.error('Error result:', errorResult);
    
    if (errorResult.errors) {
      errors.value = errorResult.errors;
      // Show first error message
      const firstError = Object.values(errorResult.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        toast().fry(pan.error(firstError[0]));
      }
    } else {
      toast().fry(pan.error(errorResult.message || t('superadmin.createShop.failedToCreate')));
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Function to translate country code text
const translateCountryCodeText = () => {
  if (locale.value === 'ar') {
    nextTick(() => {
      const selectInputs = document.querySelectorAll('.rtl-phone-input .maz-select__input');
      selectInputs.forEach((input) => {
        if (input && !input.value) {
          // Replace "Country cod" with Arabic
          const observer = new MutationObserver(() => {
            if (input.textContent && input.textContent.includes('Country cod')) {
              // The text might be in a different element, try to find it
              const parent = input.closest('.m-phone-number-input__select-wrapper') || 
                           input.closest('.maz-select');
              if (parent) {
                const textElements = parent.querySelectorAll('*');
                textElements.forEach((el) => {
                  if (el.textContent && el.textContent.includes('Country cod')) {
                    el.textContent = el.textContent.replace('Country cod', 'رمز البلد');
                  }
                });
              }
            }
          });
          observer.observe(input, { childList: true, subtree: true, characterData: true });
        }
      });
    });
  }
};

// Watch for locale changes
watch(locale, () => {
  translateCountryCodeText();
});

onMounted(() => {
  fetchPackages();
  translateCountryCodeText();
});
</script>

<style scoped>
/* RTL alignment for phone input in Arabic */
.rtl-phone-input :deep(.m-phone-number-input) {
  direction: rtl;
}

.rtl-phone-input :deep(.m-phone-number-input__wrapper) {
  flex-direction: row !important;
  direction: rtl;
  /* Unified border for the entire component */
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.375rem !important;
  overflow: hidden;
}

/* Remove individual borders from inner components */
.rtl-phone-input :deep(.m-phone-number-input__select-wrapper),
.rtl-phone-input :deep(.m-phone-number-input__input-wrapper) {
  border: none !important;
}

.rtl-phone-input :deep(.maz-select),
.rtl-phone-input :deep(.maz-select__input),
.rtl-phone-input :deep(.m-phone-number-input__input),
.rtl-phone-input :deep(input) {
  border: none !important;
  border-radius: 0 !important;
}

/* Focus state - unified border */
.rtl-phone-input :deep(.m-phone-number-input__wrapper:focus-within) {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
}

/* Country code selector - order for RTL */
/* In RTL with direction:rtl: first element (order:1) appears on RIGHT, second (order:2) on LEFT */
/* We want: country code on LEFT (order:2), phone input on RIGHT (order:1) */
.rtl-phone-input :deep(.m-phone-number-input__select-wrapper) {
  order: 2 !important;
  direction: rtl;
}

.rtl-phone-input :deep(.m-phone-number-input__input-wrapper) {
  order: 1 !important;
  direction: rtl;
}

/* Country code select styling */
.rtl-phone-input :deep(.m-phone-number-input__select) {
  direction: rtl;
  text-align: right;
  padding-right: 8px !important;
  padding-left: 32px !important;
  border: none !important;
  box-shadow: none !important;
}

.rtl-phone-input :deep(.m-phone-number-input__select-country) {
  direction: rtl;
  text-align: right;
  flex-direction: row-reverse;
}

/* Flag and arrow positioning in RTL */
.rtl-phone-input :deep(.m-phone-number-input__select-country-flag) {
  order: 2;
  margin-left: 8px !important;
  margin-right: 0 !important;
}

.rtl-phone-input :deep(.m-phone-number-input__select-country-code) {
  order: 1;
  margin-left: 0 !important;
  margin-right: 4px !important;
}

.rtl-phone-input :deep(.m-phone-number-input__select-arrow),
.rtl-phone-input :deep(.maz-select__arrow),
.rtl-phone-input :deep([class*="arrow"]) {
  left: 8px !important;
  right: auto !important;
}

.rtl-phone-input :deep(.maz-select) {
  direction: rtl;
}

.rtl-phone-input :deep(.maz-select__input) {
  direction: rtl;
  text-align: right;
  padding-right: 8px !important;
  padding-left: 32px !important;
  border: none !important;
  box-shadow: none !important;
}

/* Remove focus ring from inner elements */
.rtl-phone-input :deep(.maz-select__input:focus),
.rtl-phone-input :deep(.m-phone-number-input__input:focus),
.rtl-phone-input :deep(input:focus) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* Input field RTL */
.rtl-phone-input :deep(.m-phone-number-input__input) {
  direction: rtl;
  text-align: right;
}

.rtl-phone-input :deep(input) {
  direction: rtl;
  text-align: right;
}

.rtl-phone-input :deep(input::placeholder) {
  direction: rtl;
  text-align: right;
}

/* General RTL adjustments */
.rtl-phone-input :deep([class*="phone-number-input"]) {
  direction: rtl;
}

.rtl-phone-input :deep([class*="select-wrapper"]) {
  order: 2 !important;
  direction: rtl;
}

.rtl-phone-input :deep([class*="input-wrapper"]) {
  order: 1 !important;
  direction: rtl;
}

.rtl-phone-input :deep(select) {
  direction: rtl;
  text-align: right;
}

/* Ensure all inputs are RTL */
.rtl-phone-input :deep(input[type="text"]),
.rtl-phone-input :deep(input[type="tel"]) {
  direction: rtl;
  text-align: right;
}

/* Arrow icons RTL */
.rtl-phone-input :deep([class*="arrow"]),
.rtl-phone-input :deep(svg[class*="arrow"]),
.rtl-phone-input :deep(i[class*="arrow"]) {
  left: 8px !important;
  right: auto !important;
}

/* Flag images RTL */
.rtl-phone-input :deep([class*="flag"]),
.rtl-phone-input :deep(img[class*="flag"]) {
  margin-left: 8px !important;
  margin-right: 0 !important;
}

/* Translate "Country cod" text to Arabic - Target the select input text */
.rtl-phone-input :deep(.maz-select__input) {
  position: relative;
}

/* Hide the original "Country cod" text */
.rtl-phone-input :deep(.maz-select__input:not(:focus)) {
  color: transparent;
}

/* Show Arabic text instead */
.rtl-phone-input :deep(.maz-select__input:not(:focus)::after) {
  content: "رمز البلد";
  color: inherit;
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* When showing country code value, keep it visible */
.rtl-phone-input :deep(.maz-select__input[value]:not([value=""])) {
  color: inherit;
}

.rtl-phone-input :deep(.maz-select__input[value]:not([value=""])::after) {
  display: none;
}
</style>
