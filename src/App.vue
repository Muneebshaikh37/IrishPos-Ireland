<script setup>
import ToastWrapper from './components/Addons/ToastWrapper.vue';
import SaveTokenNotification from './composables/SaveTokenNotification.vue';
import { onMounted, watchEffect, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

function updateDirection(locale) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', direction);
}
onMounted(() => {
  // Initial locale setup
  const locale = localStorage.getItem('locale') || 'en'; // Default to 'en'
  updateDirection(locale);
});

// Watch for locale changes
watchEffect(() => {
  const locale = localStorage.getItem('locale') || 'en';
  updateDirection(locale);
});

const authStore = useAuthStore();
const router = useRouter();
const isImpersonating = computed(() => authStore.isImpersonating);
const impersonatedName = computed(() => authStore.getUserName);
const stopImpersonation = () => {
  authStore.endImpersonation();
  router.push('/superadmin/shops');
};

</script>
<template>
  <SaveTokenNotification/>
  <ToastWrapper/>
  <div v-if="isImpersonating" class="w-full bg-amber-100 text-amber-900 px-4 py-2 text-sm flex items-center justify-between">
    <div>
      Impersonating: <strong>{{ impersonatedName }}</strong>
    </div>
    <button class="bg-amber-600 text-white px-3 py-1 rounded" @click="stopImpersonation">
      Revert
    </button>
  </div>
  <RouterView />
</template>
