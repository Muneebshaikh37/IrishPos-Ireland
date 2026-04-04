<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import packagesApi from '@/network/modules/packages';
import { handleResponse, handleError } from '@/network/api/responseHandler';
import ErrorHandler from '@/utils/validation';
import toast from '@/stores/utility/toast';
import pan from '@/stores/pan';
import { FormInput, FormLabel, FormSelect, FormCheck, FormTextarea } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import LoadingIcon from '@/components/Base/LoadingIcon';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useI18n();
const superAdminId = computed<string | ''>(() => (authStore.getUserId as any) || (authStore.user as any)?.id || '');
const packageId = route.params.id as string;

// Form data
const formData = reactive({
  name: '',
  description: '',
  price: '',
  duration_days: '',
  duration_type: 'monthly',
  features: [] as string[],
  is_active: true,
});

// Error handler
const form = reactive(new ErrorHandler());

const isUpdating = ref(false);
const isLoadingPackage = ref(true);
const currentFeature = ref('');

const durationTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const fetchPackageDetails = async () => {
  if (!superAdminId.value || !packageId) {
    toast().fry(pan.error(t('superadmin.editPackage.missingIds')));
    router.push({ name: 'SuperAdminPackages' });
    return;
  }
  isLoadingPackage.value = true;
  try {
    const response = await packagesApi.getPackage({ id: packageId, superAdminId: superAdminId.value });
    const result = handleResponse(response);
    if (result.success) {
      const packageData = result.data?.data || result.data;
      formData.name = packageData.name;
      formData.description = packageData.description || '';
      formData.price = packageData.price?.toString() || '';
      formData.duration_days = packageData.duration_days?.toString() || '';
      formData.duration_type = packageData.duration_type || 'monthly';
      formData.features = Array.isArray(packageData.features) ? packageData.features : [];
      formData.is_active = packageData.is_active ?? true;
    } else {
      toast().fry(pan.error(result.message || t('superadmin.editPackage.failedToLoad')));
      router.push({ name: 'SuperAdminPackages' });
    }
  } catch (e) {
    handleError(e);
    toast().fry(pan.error(t('superadmin.editPackage.errorLoading')));
    router.push({ name: 'SuperAdminPackages' });
  } finally {
    isLoadingPackage.value = false;
  }
};

const addFeature = () => {
  if (currentFeature.value.trim()) {
    // Ensure features is an array before pushing
    if (!Array.isArray(formData.features)) {
      formData.features = [];
    }
    formData.features.push(currentFeature.value.trim());
    currentFeature.value = '';
  }
};

const removeFeature = (index: number) => {
  if (Array.isArray(formData.features)) {
    formData.features.splice(index, 1);
  }
};

const updatePackage = async () => {
  form.clear();
  isUpdating.value = true;
  try {
    const payload: any = {
      super_admin_id: superAdminId.value,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      duration_days: parseInt(formData.duration_days),
      duration_type: formData.duration_type,
      features: (Array.isArray(formData.features) && formData.features.length > 0) ? formData.features : null,
      is_active: formData.is_active,
    };

    const response = await packagesApi.updatePackage({ id: packageId, data: payload });
    const result = handleResponse(response);

    if (result.success) {
      toast().fry(pan.success(t('superadmin.editPackage.packageUpdatedSuccess')));
      router.push({ name: 'SuperAdminPackages' });
    } else {
      if (result.errors) {
        form.setErrors(result.errors);
      }
      toast().fry(pan.error(result.message || t('superadmin.editPackage.failedToUpdate')));
    }
  } catch (e) {
    handleError(e);
    toast().fry(pan.error(t('superadmin.editPackage.errorUpdating')));
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => {
  fetchPackageDetails();
});
</script>

<template>
  <div class="flex items-center mt-8 intro-y" :class="{ 'flex-row-reverse': locale === 'ar' }">
    <RouterLink :to="{ name: 'SuperAdminPackages' }">
      <Button variant="primary" size="sm" class="shadow-md h-8 w-9" :class="locale === 'ar' ? 'ml-4' : 'mr-4'">
        <Lucide icon="ChevronLeft" class="w-5 h-5" :class="{ 'rotate-180': locale === 'ar' }" />
      </Button>
    </RouterLink>
    <h2 class="text-lg font-medium flex-1" :class="locale === 'ar' ? 'text-right ml-auto' : 'mr-auto'">{{ $t('superadmin.editPackage.title') }}: {{ formData.name || $t('superadmin.editPackage.loadingPackageDetails') }}</h2>
  </div>
  <div class="box p-5 mt-5">
      <div v-if="isLoadingPackage" class="flex justify-center items-center py-12">
        <LoadingIcon icon="oval" class="w-8 h-8" />
        <span class="ml-3 text-gray-600">{{ $t('superadmin.editPackage.loadingPackageDetails') }}</span>
      </div>

      <form v-else @submit.prevent="updatePackage">
        <div class="grid grid-cols-12 gap-4">
          <!-- Package Name -->
          <div class="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="name">{{ $t('superadmin.editPackage.packageName') }} *</FormLabel>
            <FormInput
              id="name"
              v-model="formData.name"
              type="text"
              :placeholder="$t('superadmin.editPackage.packageNamePlaceholder')"
              required
            />
            <div v-if="form.invalid('name')" class="text-danger mt-1">
              {{ form.getError('name') }}
            </div>
          </div>

          <!-- Price -->
          <div class="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="price">{{ $t('superadmin.editPackage.price') }} *</FormLabel>
            <FormInput
              id="price"
              v-model="formData.price"
              type="number"
              step="0.01"
              min="0"
              :placeholder="$t('superadmin.editPackage.pricePlaceholder')"
              required
            />
            <div v-if="form.invalid('price')" class="text-danger mt-1">
              {{ form.getError('price') }}
            </div>
          </div>

          <!-- Duration Type -->
          <div class="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="duration_type">{{ $t('superadmin.editPackage.durationType') }} *</FormLabel>
            <FormSelect id="duration_type" v-model="formData.duration_type" required>
              <option v-for="type in durationTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </FormSelect>
            <div v-if="form.invalid('duration_type')" class="text-danger mt-1">
              {{ form.getError('duration_type') }}
            </div>
          </div>

          <!-- Duration Days -->
          <div class="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="duration_days">{{ $t('superadmin.editPackage.durationNumber') }} *</FormLabel>
            <FormInput
              id="duration_days"
              v-model="formData.duration_days"
              type="number"
              min="1"
              :placeholder="$t('superadmin.editPackage.durationNumberPlaceholder')"
              required
            />
            <div class="text-xs text-gray-500 mt-1">
              {{ $t('superadmin.editPackage.durationHelper', { type: formData.duration_type }) }}
            </div>
            <div v-if="form.invalid('duration_days')" class="text-danger mt-1">
              {{ form.getError('duration_days') }}
            </div>
          </div>

          <!-- Description -->
          <div class="col-span-12">
            <FormLabel htmlFor="description">{{ $t('superadmin.editPackage.description') }}</FormLabel>
            <FormTextarea
              id="description"
              v-model="formData.description"
              :placeholder="$t('superadmin.editPackage.descriptionPlaceholder')"
              rows="3"
            />
            <div v-if="form.invalid('description')" class="text-danger mt-1">
              {{ form.getError('description') }}
            </div>
          </div>

          <!-- Features -->
          <div class="col-span-12">
            <FormLabel>{{ $t('superadmin.editPackage.features') }}</FormLabel>
            <div class="flex gap-2 mb-2">
              <FormInput
                v-model="currentFeature"
                type="text"
                :placeholder="$t('superadmin.editPackage.addFeature')"
                @keyup.enter.prevent="addFeature"
              />
              <Button type="button" variant="primary" @click="addFeature">
                <Lucide icon="Plus" class="w-4 h-4 mr-1" />
                {{ $t('superadmin.editPackage.add') }}
              </Button>
            </div>
            <div v-if="formData.features && Array.isArray(formData.features) && formData.features.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="(feature, index) in formData.features"
                :key="index"
                class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {{ feature }}
                <button
                  type="button"
                  @click="removeFeature(index)"
                  class="hover:text-red-600"
                >
                  <Lucide icon="X" class="w-3 h-3" />
                </button>
              </span>
            </div>
            <div v-else class="text-xs text-gray-500">
              {{ $t('superadmin.editPackage.noFeaturesAdded') }}
            </div>
          </div>

          <!-- Active Status -->
          <div class="col-span-12">
            <FormCheck class="mt-2">
              <FormCheck.Input
                id="is_active"
                v-model="formData.is_active"
                type="checkbox"
              />
              <FormCheck.Label htmlFor="is_active">
                {{ $t('superadmin.editPackage.packageActive') }}
              </FormCheck.Label>
            </FormCheck>
          </div>
        </div>

        <div class="flex justify-end mt-5">
          <Button
            type="button"
            variant="outline-secondary"
            class="w-24 mr-2"
            @click="router.push({ name: 'SuperAdminPackages' })"
          >
            {{ $t('superadmin.editPackage.cancel') }}
          </Button>
          <Button type="submit" variant="primary" class="w-24" :disabled="isUpdating">
            <span v-if="isUpdating">{{ $t('superadmin.editPackage.updating') }}</span>
            <span v-else>{{ $t('superadmin.editPackage.update') }}</span>
          </Button>
        </div>
      </form>
    </div>
</template>
