<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Lucide from '../../components/Base/Lucide';
import Button from '../../components/Base/Button';
import LoadingIcon from '../../components/Base/LoadingIcon';
import toast from '../../stores/utility/toast';
import pan from '../../stores/pan';
import superAdminApi from '../../network/modules/superadmin';
import { handleResponse, handleError } from '../../network/api/responseHandler.js';

const route = useRoute();
const router = useRouter();

const shopId = route.params.id as string;

const isLoading = ref(false);
const isSaving = ref(false);
const shopName = ref('');
const modules = ref<{ id: string; name: string; parent_id: string | null; is_enabled: boolean }[]>([]);

const fetchModules = async () => {
  isLoading.value = true;
  try {
    const res = await superAdminApi.getShopModules(shopId);
    const result = handleResponse(res);
    if (result.success) {
      modules.value = result.data?.data ?? result.data ?? [];
    } else {
      toast().fry(pan.error(result.message || 'Failed to load modules.'));
    }
  } catch (e) {
    handleError(e);
  } finally {
    isLoading.value = false;
  }
};

const toggleModule = async (mod: { id: string; name: string; is_enabled: boolean }) => {
  const newValue = !mod.is_enabled;
  mod.is_enabled = newValue; // optimistic

  try {
    const res = await superAdminApi.toggleShopModule(shopId, mod.id, newValue);
    const result = handleResponse(res);
    if (!result.success) {
      mod.is_enabled = !newValue; // rollback
      toast().fry(pan.error(result.message || 'Failed to update module.'));
    } else {
      toast().fry(pan.success(`${mod.name} ${newValue ? 'enabled' : 'disabled'}.`));
    }
  } catch (e) {
    mod.is_enabled = !newValue; // rollback
    handleError(e);
  }
};

const saveAll = async () => {
  isSaving.value = true;
  try {
    const payload = modules.value.map((m) => ({ module_id: m.id, is_enabled: m.is_enabled }));
    const res = await superAdminApi.bulkUpdateShopModules(shopId, payload);
    const result = handleResponse(res);
    if (result.success) {
      toast().fry(pan.success('Module settings saved successfully.'));
    } else {
      toast().fry(pan.error(result.message || 'Failed to save module settings.'));
    }
  } catch (e) {
    handleError(e);
  } finally {
    isSaving.value = false;
  }
};

const enableAll = () => modules.value.forEach((m) => (m.is_enabled = true));
const disableAll = () => modules.value.forEach((m) => (m.is_enabled = false));

onMounted(fetchModules);
</script>

<template>
  <div class="mt-6 intro-y">
    <div class="flex items-center gap-3 mb-6">
      <Button variant="outline-secondary" class="flex items-center gap-2 px-3 py-1.5" @click="router.back()">
        <Lucide icon="ArrowLeft" class="w-4 h-4" />
        Back
      </Button>
      <h2 class="text-lg font-medium">Shop Module Settings</h2>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <LoadingIcon icon="oval" class="w-8 h-8" />
    </div>

    <div v-else>
      <div class="box p-5 mb-5 flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">Enable or disable modules for this shop. Changes apply to all users within the shop.</p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline-secondary" class="text-xs px-3 py-1.5" @click="disableAll">Disable All</Button>
          <Button variant="outline-secondary" class="text-xs px-3 py-1.5" @click="enableAll">Enable All</Button>
          <Button variant="primary" class="flex items-center gap-2 px-4 py-1.5" :disabled="isSaving" @click="saveAll">
            <LoadingIcon v-if="isSaving" icon="oval" class="w-4 h-4" />
            {{ isSaving ? 'Saving…' : 'Save All' }}
          </Button>
        </div>
      </div>

      <div v-if="modules.length === 0" class="box p-8 text-center text-slate-400">
        <Lucide icon="Layout" class="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>No modules found. Make sure global modules are seeded.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="mod in modules"
          :key="mod.id"
          class="box p-5 flex items-center justify-between"
          :class="{ 'opacity-60': !mod.is_enabled }"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="mod.is_enabled ? 'bg-blue-100' : 'bg-slate-100'"
            >
              <Lucide icon="Layout" class="w-5 h-5" :class="mod.is_enabled ? 'text-blue-600' : 'text-slate-400'" />
            </div>
            <div>
              <p class="font-medium text-sm">{{ mod.name }}</p>
              <p class="text-xs text-slate-400">{{ mod.is_enabled ? 'Enabled' : 'Disabled' }}</p>
            </div>
          </div>

          <!-- Toggle Switch -->
          <button
            type="button"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            :class="mod.is_enabled ? 'bg-blue-600' : 'bg-slate-300'"
            @click="toggleModule(mod)"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="mod.is_enabled ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
