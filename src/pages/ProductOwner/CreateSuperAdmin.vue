<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Lucide from '../../components/Base/Lucide';
import Button from '../../components/Base/Button';
import LoadingIcon from '../../components/Base/LoadingIcon';
import toast from '../../stores/utility/toast';
import pan from '../../stores/pan';
import superAdminApi from '../../network/modules/superadmin';
import { handleResponse, handleError } from '../../network/api/responseHandler.js';

const router = useRouter();

// ── Form state ────────────────────────────────────────────────────────────────
const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  package_id: '',
  phone: '',
  address: '',
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// ── Packages ──────────────────────────────────────────────────────────────────
const packages = ref<any[]>([]);
const isLoadingPackages = ref(false);

const fetchPackages = async () => {
  isLoadingPackages.value = true;
  try {
    const res = await superAdminApi.listPackages({ limit: 100, page: 1 });
    const result = handleResponse(res);
    if (result.success) {
      const raw = result.data;
      packages.value = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
    }
  } catch (e) {
    handleError(e);
  } finally {
    isLoadingPackages.value = false;
  }
};

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (): boolean => {
  errors.value = {};

  if (!form.value.name.trim()) errors.value.name = 'Name is required.';
  if (!form.value.email.trim()) errors.value.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errors.value.email = 'Enter a valid email.';
  if (!form.value.password) errors.value.password = 'Password is required.';
  else if (form.value.password.length < 8) errors.value.password = 'Password must be at least 8 characters.';
  if (form.value.password !== form.value.password_confirmation) errors.value.password_confirmation = 'Passwords do not match.';
  if (!form.value.package_id) errors.value.package_id = 'Please select a package.';

  return Object.keys(errors.value).length === 0;
};

// ── Submit ────────────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    const payload: any = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      package_id: form.value.package_id,
    };
    if (form.value.phone) payload.phone = form.value.phone;
    if (form.value.address) payload.address = form.value.address;

    const res = await superAdminApi.createSuperAdmin(payload);
    const result = handleResponse(res);

    if (result.success) {
      toast().fry(pan.success('Super Admin created successfully.'));
      router.push({ name: 'ProductOwnerSuperAdmins' });
    } else {
      toast().fry(pan.error(result.message || 'Failed to create Super Admin.'));
    }
  } catch (e: any) {
    const data = e?.response?.data;
    if (data?.errors) {
      // Map Laravel validation errors
      Object.entries(data.errors).forEach(([field, msgs]: any) => {
        errors.value[field] = Array.isArray(msgs) ? msgs[0] : msgs;
      });
    } else {
      toast().fry(pan.error(data?.message || 'Something went wrong.'));
    }
  } finally {
    isSubmitting.value = false;
  }
};

const selectedPackage = (id: string) => packages.value.find((p: any) => p.id === id);

onMounted(() => fetchPackages());
</script>

<template>
  <div class="mt-6 intro-y max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <Button variant="outline-secondary" class="px-3 py-2" @click="router.push({ name: 'ProductOwnerSuperAdmins' })">
        <Lucide icon="ArrowLeft" class="w-4 h-4" />
      </Button>
      <h2 class="text-lg font-medium">Create Super Admin</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Account Information -->
      <div class="box p-6">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Lucide icon="User" class="w-4 h-4" />
          Account Information
        </h3>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form-control w-full"
              :class="{ 'border-red-400': errors.name }"
              placeholder="e.g. John Smith"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-control w-full"
              :class="{ 'border-red-400': errors.email }"
              placeholder="admin@example.com"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
            <input
              v-model="form.password"
              type="password"
              class="form-control w-full"
              :class="{ 'border-red-400': errors.password }"
              placeholder="Min. 8 characters"
            />
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span class="text-red-500">*</span></label>
            <input
              v-model="form.password_confirmation"
              type="password"
              class="form-control w-full"
              :class="{ 'border-red-400': errors.password_confirmation }"
              placeholder="Re-enter password"
            />
            <p v-if="errors.password_confirmation" class="mt-1 text-xs text-red-500">{{ errors.password_confirmation }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="text"
              class="form-control w-full"
              placeholder="+353 87 000 0000"
            />
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              v-model="form.address"
              type="text"
              class="form-control w-full"
              placeholder="Business address"
            />
          </div>
        </div>
      </div>

      <!-- Package Assignment -->
      <div class="box p-6">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Lucide icon="Package" class="w-4 h-4" />
          Package Assignment <span class="text-red-500">*</span>
        </h3>

        <div v-if="isLoadingPackages" class="flex items-center gap-2 text-gray-500 text-sm">
          <LoadingIcon icon="oval" class="w-4 h-4" />
          Loading packages…
        </div>

        <div v-else-if="packages.length === 0" class="text-sm text-gray-500 italic">
          No packages available. Please create a package first.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all"
            :class="form.package_id === pkg.id
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'"
            @click="form.package_id = pkg.id"
          >
            <div
              class="w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
              :class="form.package_id === pkg.id ? 'border-primary' : 'border-gray-400'"
            >
              <div v-if="form.package_id === pkg.id" class="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="font-semibold text-gray-800">{{ pkg.name }}</span>
                <span class="text-primary font-bold text-sm">€{{ pkg.price }}</span>
              </div>
              <p v-if="pkg.description" class="text-xs text-gray-500 mt-0.5">{{ pkg.description }}</p>
              <div class="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                <span class="flex items-center gap-1">
                  <Lucide icon="Store" class="w-3 h-3" />
                  {{ pkg.max_shops ?? 1 }} shop{{ (pkg.max_shops ?? 1) !== 1 ? 's' : '' }}
                </span>
                <span class="flex items-center gap-1">
                  <Lucide icon="Calendar" class="w-3 h-3" />
                  {{ pkg.duration_days }} {{ pkg.duration_type }}
                </span>
                <span v-if="pkg.allowed_modules?.length" class="flex items-center gap-1">
                  <Lucide icon="Layers" class="w-3 h-3" />
                  {{ pkg.allowed_modules.join(', ') }}
                </span>
                <span v-else class="flex items-center gap-1 text-green-600">
                  <Lucide icon="Layers" class="w-3 h-3" />
                  All modules
                </span>
              </div>
            </div>
          </div>
          <p v-if="errors.package_id" class="mt-1 text-xs text-red-500">{{ errors.package_id }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pb-6">
        <Button
          type="button"
          variant="outline-secondary"
          @click="router.push({ name: 'ProductOwnerSuperAdmins' })"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          :disabled="isSubmitting || packages.length === 0"
          class="flex items-center gap-2"
        >
          <LoadingIcon v-if="isSubmitting" icon="oval" class="w-4 h-4" />
          <Lucide v-else icon="UserPlus" class="w-4 h-4" />
          {{ isSubmitting ? 'Creating…' : 'Create Super Admin' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-control {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}
.form-control:focus {
  border-color: #169B62;
  box-shadow: 0 0 0 2px rgba(22, 155, 98, 0.15);
}
</style>
