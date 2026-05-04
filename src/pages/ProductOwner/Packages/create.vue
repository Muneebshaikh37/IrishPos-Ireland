<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Lucide from '../../../components/Base/Lucide';
import Button from '../../../components/Base/Button';
import LoadingIcon from '../../../components/Base/LoadingIcon';
import toast from '../../../stores/utility/toast';
import pan from '../../../stores/pan';
import packagesApi from '../../../network/modules/packages';
import modulesApi from '../../../network/modules/modules';
import { handleResponse, handleError } from '../../../network/api/responseHandler.js';

const router = useRouter();

const isSubmitting = ref(false);
const form = ref({
  name: '',
  description: '',
  price: '',
  duration_days: '',
  duration_type: 'monthly',
  max_shops: 1,
  allowed_modules: [] as string[],
  features: [] as string[],
  is_active: true,
});
const newFeature = ref('');
const errors = ref<Record<string, string>>({});

// Modules are fetched from the API so the form reflects the current platform structure
// (parents + sub-modules). Falls back to a hardcoded list if the request fails.
const allModules = ref<Array<{ id: string; name: string; parent_id: string | null }>>([]);
const isLoadingModules = ref(false);

const moduleTree = computed(() => {
  const parents = allModules.value.filter((m) => !m.parent_id);
  return parents.map((p) => ({
    ...p,
    children: allModules.value.filter((m) => m.parent_id === p.id),
  }));
});

const fetchModules = async () => {
  isLoadingModules.value = true;
  try {
    const res = await modulesApi.listModules();
    const data = res?.data?.data ?? [];
    allModules.value = Array.isArray(data) ? data : [];
  } catch (e) {
    handleError(e);
    // Fallback to top-level names so the form remains usable
    allModules.value = ['POS', 'Inventory', 'Purchasing', 'Accounting', 'CRM', 'Reporting'].map(
      (name) => ({ id: name, name, parent_id: null })
    );
  } finally {
    isLoadingModules.value = false;
  }
};

onMounted(fetchModules);

const toggleModule = (mod: string) => {
  const idx = form.value.allowed_modules.indexOf(mod);
  if (idx >= 0) {
    form.value.allowed_modules.splice(idx, 1);
  } else {
    form.value.allowed_modules.push(mod);
  }
};

const addFeature = () => {
  const f = newFeature.value.trim();
  if (f && !form.value.features.includes(f)) {
    form.value.features.push(f);
  }
  newFeature.value = '';
};

const removeFeature = (i: number) => form.value.features.splice(i, 1);

const handleSubmit = async () => {
  errors.value = {};
  isSubmitting.value = true;
  try {
    const payload: any = {
      name: form.value.name,
      description: form.value.description || null,
      price: parseFloat(form.value.price as any),
      duration_days: parseInt(form.value.duration_days as any),
      duration_type: form.value.duration_type,
      max_shops: form.value.max_shops,
      features: form.value.features,
      is_active: form.value.is_active,
    };
    if (form.value.allowed_modules.length > 0) {
      payload.allowed_modules = form.value.allowed_modules;
    }

    const res = await packagesApi.createPackage(payload);
    const result = handleResponse(res);
    if (result.success) {
      toast().fry(pan.success('Package created successfully.'));
      router.push({ name: 'ProductOwnerPackages' });
    } else {
      errors.value = result.errors || {};
      toast().fry(pan.error(result.message || 'Failed to create package.'));
    }
  } catch (e: any) {
    handleError(e);
    if (e?.response?.data?.errors) errors.value = e.response.data.errors;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="flex items-center gap-3 mb-6">
      <Button variant="outline-secondary" class="flex items-center gap-2 px-3 py-1.5" @click="router.push({ name: 'ProductOwnerPackages' })">
        <Lucide icon="ArrowLeft" class="w-4 h-4" />
        Back
      </Button>
      <h2 class="text-lg font-medium">Create Package</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="box p-6 space-y-5 max-w-2xl">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium mb-1">Package Name <span class="text-red-500">*</span></label>
        <input v-model="form.name" type="text" class="form-control w-full" placeholder="e.g. Premium" />
        <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium mb-1">Description</label>
        <textarea v-model="form.description" class="form-control w-full" rows="2" placeholder="Brief description…"></textarea>
      </div>

      <!-- Price & Duration -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Price (€) <span class="text-red-500">*</span></label>
          <input v-model="form.price" type="number" step="0.01" min="0" class="form-control w-full" placeholder="29.99" />
          <p v-if="errors.price" class="text-red-500 text-xs mt-1">{{ errors.price }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Duration (days) <span class="text-red-500">*</span></label>
          <input v-model="form.duration_days" type="number" min="1" class="form-control w-full" placeholder="30" />
          <p v-if="errors.duration_days" class="text-red-500 text-xs mt-1">{{ errors.duration_days }}</p>
        </div>
      </div>

      <!-- Duration Type & Max Shops -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Duration Type <span class="text-red-500">*</span></label>
          <select v-model="form.duration_type" class="form-control w-full">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Max Shops Allowed <span class="text-red-500">*</span></label>
          <input v-model.number="form.max_shops" type="number" min="1" class="form-control w-full" placeholder="1" />
          <p class="text-xs text-slate-400 mt-1">How many shops a subscriber can create.</p>
        </div>
      </div>

      <!-- Allowed Modules -->
      <div>
        <label class="block text-sm font-medium mb-2">Allowed Modules</label>
        <p class="text-xs text-slate-400 mb-2">Leave all unselected to allow all modules.</p>

        <div v-if="isLoadingModules" class="flex items-center gap-2 text-sm text-slate-500">
          <LoadingIcon icon="oval" class="w-4 h-4" /> Loading modules…
        </div>

        <div v-else class="space-y-3">
          <div v-for="parent in moduleTree" :key="parent.id" class="border rounded-md p-3">
            <button
              type="button"
              class="px-3 py-1.5 rounded-full text-sm border transition-colors font-medium"
              :class="form.allowed_modules.includes(parent.name)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'"
              @click="toggleModule(parent.name)"
            >
              {{ parent.name }}
            </button>

            <div v-if="parent.children.length" class="mt-2 ml-4 flex flex-wrap gap-2">
              <button
                v-for="child in parent.children"
                :key="child.id"
                type="button"
                class="px-2.5 py-1 rounded-full text-xs border transition-colors"
                :class="form.allowed_modules.includes(child.name)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'"
                @click="toggleModule(child.name)"
              >
                {{ child.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div>
        <label class="block text-sm font-medium mb-1">Features</label>
        <div class="flex gap-2 mb-2">
          <input
            v-model="newFeature"
            type="text"
            class="form-control flex-1"
            placeholder="e.g. Unlimited products"
            @keyup.enter.prevent="addFeature"
          />
          <Button type="button" variant="secondary" @click="addFeature">Add</Button>
        </div>
        <div v-if="form.features.length" class="flex flex-wrap gap-2">
          <span
            v-for="(f, i) in form.features"
            :key="i"
            class="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-sm"
          >
            {{ f }}
            <button type="button" @click="removeFeature(i)" class="text-slate-400 hover:text-red-500">
              <Lucide icon="X" class="w-3 h-3" />
            </button>
          </span>
        </div>
      </div>

      <!-- Active -->
      <div class="flex items-center gap-3">
        <input id="is_active" v-model="form.is_active" type="checkbox" class="w-4 h-4" />
        <label for="is_active" class="text-sm font-medium">Active (visible to super admins)</label>
      </div>

      <!-- Submit -->
      <div class="flex items-center gap-3 pt-2 border-t">
        <Button type="submit" variant="primary" :disabled="isSubmitting" class="flex items-center gap-2">
          <LoadingIcon v-if="isSubmitting" icon="oval" class="w-4 h-4" />
          {{ isSubmitting ? 'Creating…' : 'Create Package' }}
        </Button>
        <Button type="button" variant="secondary" @click="router.push({ name: 'ProductOwnerPackages' })">
          Cancel
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-control { border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 0.5rem 0.75rem; }
</style>
