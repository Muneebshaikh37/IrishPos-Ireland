<script setup>
import Lucide from "@/components/Base/Lucide";
import AlertUrl from "@/assets/images/alert.svg";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg"
import httpClient from "@/network/api/httpClient";
import { ref, watch, onMounted } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import Button from "@/components/Base/Button";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const dummy = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const props = defineProps({
  start_date: {
    type: String,
    required: true,
  },
  end_date: {
    type: String,
    required: true,
  }
}); 
const isLoading = ref(false)

const LowStockAlerts = ref()
const isfetchLowStockAlerts = async () => {
  try {
    isLoading.value = true
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/v1/dashboard/product-low-stock?user_id=${USER_ID}&start_date=${props.start_date}&end_date=${props.end_date}&limit=9`)
    const result = handleResponse(response);
    if (result.success) {
      const body = result.data ?? {};
      const list = Array.isArray(body.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : [];
      LowStockAlerts.value = list;
    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isLoading.value = false;
  }
}
watch([() => props.start_date, () => props.end_date], () => { isfetchLowStockAlerts() });
onMounted(() => {
  isfetchLowStockAlerts()
})

</script>

<template>
  <div class="md:col-span-6 flex flex-col h-full">
    <div class="grid grid-cols-12 gap-6 h-full">
      <div class="col-span-12 flex flex-col h-full">
        <div class="p-5 box h-full">
          <div class="">
            <h4 class="text-lg font-semibold text-gray-800 mb-6">{{ $t('dashboard.lowStockAlerts') }}</h4>
          </div>
          <div class="mt-2" v-if="isLoading">
            <div>
              <ul>
                <li class="flex justify-between py-2 mb-1.5 border animate-pulse h-10 bg-slate-200 border-[#EFF0F4] w-full rounded-lg" v-for="item in dummy" :key="item">
                </li>
              </ul>
            </div>
          </div>
          <div class="mt-2" v-else-if="LowStockAlerts && LowStockAlerts.length > 0">
            <div>
              <ul>
                <li class="flex justify-between py-2 mb-1.5 bg-[#F7F8FA] border border-[#EFF0F4] w-full rounded-lg" v-for="item in LowStockAlerts" :key="item.id ?? item.name">
                  <h4 class="flex items-center w-full justify-between px-3 gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <img :src="AlertUrl" alt="" class="w-5 h-5 shrink-0" />
                      <Lucide icon="CircleAlert" class="w-5 h-5 text-red-500 shrink-0" />
                      <span class="text-sm font-medium text-slate-800 truncate">{{ item.name_en || item.name || item.name_ar }}</span>
                    </div>
                    <div class="flex flex-col items-end ml-2 shrink-0">
                      <div class="flex items-center gap-1">
                        <span class="text-red-500 text-base font-medium">{{ item.quantity ?? item.initial_quantity }}</span>
                        <Lucide icon="MoveDown" class="w-4 h-4 text-red-500" />
                      </div>
                      <span class="text-xs text-slate-500 mt-0.5">{{ $t('general-settings.lowStockThreshold') }}: {{ item.low_stock_threshold }}</span>
                    </div>
                  </h4>
                </li>
              </ul>
            </div>
          </div>
          <div v-else>
            <img :src="NotFoundIcon" class="w-[160px] mx-auto">
            <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">{{ $t('dashboard.noDataAvailable') }}</h3>
            <p class="text-base text-gray-400 font-normal pb-4 text-center">{{ $t('dashboard.noDataDescription') }}</p>
            <Button variant="outline-secondary" class="flex items-center justify-center mx-auto w-36" @click="isfetchLowStockAlerts()">
              <Lucide icon="RefreshCcwIcon" class="w-4 h-4 text-gray-700 mr-2" /> {{ $t('dashboard.refreshNow') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>