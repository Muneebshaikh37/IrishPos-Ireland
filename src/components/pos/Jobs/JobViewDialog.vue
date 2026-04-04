<template>
  <Dialog :open="show && !isImagePreviewOpen" @close="closeDialog" size="xl">
    <div class="flex items-center justify-center min-h-screen px-4">
      <Dialog.Panel class="!w-[90%] !max-w-4xl sm:!w-[70%] lg:!w-[70%]">
        <div class="p-6 space-y-5">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold">{{ $t('jobs.title') }}</h3>
            <Button variant="outline-secondary" size="sm" @click="closeDialog">{{ $t('jobs.cancel') }}</Button>
          </div>
          <div class="space-y-4 text-sm">
            <!-- First row: Service, Customer -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-slate-500">{{ $t('jobs.title') }}</div>
                <div class="font-medium">{{ job?.service_name_en || 'N/A' }}</div>
              </div>
              <div>
                <div class="text-slate-500">{{ $t('jobs.customer') }}</div>
                <div class="font-medium">{{ job?.customer_name || 'N/A' }}</div>
              </div>
            </div>
            
            <!-- Second row: Status, Sale Price, Assigned At -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <div class="text-slate-500">{{ $t('jobs.status') }}</div>
                <span :class="['inline-flex items-center px-2 py-1 rounded text-xs font-medium', statusClass(job?.status)]">
                  {{ job?.status || 'N/A' }}
                </span>
              </div>
              <div>
                <div class="text-slate-500">{{ $t('jobs.salePrice') }}</div>
                <div class="font-medium">{{ job?.sale_price ?? 'N/A' }}</div>
              </div>
              <div>
                <div class="text-slate-500">{{ $t('jobs.assignedAt') }}</div>
                <div class="font-medium">{{ formatDate(job?.assigned_at) }}</div>
              </div>
            </div>
            
            <!-- Optional fields: Comments and Vehicle Details -->
            <div v-if="job?.comments || job?.vehicle_details" class="grid grid-cols-3 gap-4">
              <div v-if="job?.comments">
                <div class="text-slate-500">{{ $t('jobs.description') }}</div>
                <div class="font-medium">{{ job?.comments }}</div>
              </div>
              <div v-if="job?.vehicle_details">
                <div class="text-slate-500">Vehicle</div>
                <div class="font-medium">{{ job?.vehicle_details }}</div>
              </div>
            </div>
            
            <!-- Workers' Signature and Proof Images -->
            <div v-if="assignedWorkers.length > 0" class="mt-6 pt-6 border-t">
              <h4 class="text-lg font-semibold mb-4">{{ $t('jobs.assignedWorkers') }}</h4>
              <div class="space-y-6 pr-2" :class="{ 'max-h-[800px] overflow-y-auto': assignedWorkers.length > 2 }">
                <div 
                  v-for="(worker, index) in assignedWorkers" 
                  :key="index" 
                  class="border rounded-lg p-4 bg-slate-50"
                >
                  <div class="mb-3">
                    <h5 class="font-medium text-base">{{ worker.name || worker.worker_name || 'Worker ' + (index + 1) }}</h5>
                  </div>
                  
                  <!-- Worker Details: Status, Started At, Completed At -->
                  <div class="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div class="text-slate-500 text-xs mb-1">{{ $t('jobs.status') }}</div>
                      <span :class="['inline-flex items-center px-2 py-1 rounded text-xs font-medium', statusClass(worker.status)]">
                        {{ worker.status || 'N/A' }}
                      </span>
                    </div>
                    <div>
                      <div class="text-slate-500 text-xs mb-1">{{ $t('jobs.startedAt') }}</div>
                      <div class="font-medium text-sm">{{ formatDate(worker.started_at) }}</div>
                    </div>
                    <div>
                      <div class="text-slate-500 text-xs mb-1">{{ $t('jobs.completedAt') }}</div>
                      <div class="font-medium text-sm">{{ formatDate(worker.completed_at) }}</div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div v-if="worker.signature_image_url">
                      <div class="text-slate-500 mb-2">Signature</div>
                      <div 
                        class="border rounded-md p-2 bg-white h-64 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                        @click="openImagePreview(worker.signature_image_url, `Signature - ${worker.name || worker.worker_name || 'Worker ' + (index + 1)}`)"
                      >
                        <img 
                          :src="worker.signature_image_url" 
                          :alt="'Signature - ' + (worker.name || worker.worker_name || 'Worker ' + (index + 1))" 
                          class="max-h-[240px] max-w-full w-auto h-auto object-contain"
                          @error="handleImageError"
                          @load="() => console.log('Signature image loaded:', worker.signature_image_url)"
                        />
                      </div>
                    </div>
                    <div v-if="worker.proof_image_url">
                      <div class="text-slate-500 mb-2">Proof</div>
                      <div 
                        class="border rounded-md p-2 bg-white h-64 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                        @click="openImagePreview(worker.proof_image_url, `Proof - ${worker.name || worker.worker_name || 'Worker ' + (index + 1)}`)"
                      >
                        <img 
                          :src="worker.proof_image_url" 
                          :alt="'Proof - ' + (worker.name || worker.worker_name || 'Worker ' + (index + 1))" 
                          class="max-h-[240px] max-w-full w-auto h-auto object-contain"
                          @error="handleImageError"
                          @load="() => console.log('Proof image loaded:', worker.proof_image_url)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </div>
  </Dialog>

  <!-- Image Preview Lightbox -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isImagePreviewOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center"
      @click="closeImagePreview"
    >
      <!-- Blurred/Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
      
      <!-- Close Button -->
      <button
        @click.stop="closeImagePreview"
        class="absolute top-4 right-4 z-[101] bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
        aria-label="Close"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Image Container -->
      <div
        @click.stop
        class="relative z-[101] max-w-[90vw] max-h-[90vh] p-4"
      >
        <img
          :src="previewImageUrl"
          :alt="previewImageTitle"
          class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <!-- Image Title -->
        <div class="mt-4 text-center">
          <p class="text-white text-lg font-medium drop-shadow-lg">{{ previewImageTitle }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, Transition } from "vue";
import Button from "@/components/Base/Button";
import { Dialog } from "@/components/Base/Headless";

const props = defineProps({
  show: Boolean,
  job: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

// Computed property to get all assigned workers
const assignedWorkers = computed(() => {
  if (!props.job) return [];
  
  // Check if job has an assigned_workers array
  if (Array.isArray(props.job.assigned_workers) && props.job.assigned_workers.length > 0) {
    console.log('Using assigned_workers:', props.job.assigned_workers);
    return props.job.assigned_workers;
  }
  
  // Check if job has a workers array (this is the main structure from API)
  if (Array.isArray(props.job.workers) && props.job.workers.length > 0) {
    console.log('Using workers array:', props.job.workers);
    console.log('First worker details:', props.job.workers[0]);
    if (props.job.workers[0]) {
      console.log('Signature URL:', props.job.workers[0].signature_image_url);
      console.log('Proof URL:', props.job.workers[0].proof_image_url);
    }
    return props.job.workers;
  }
  
  // Fallback: If there's a single worker_name, create a single worker object
  // (This handles backward compatibility with the old structure)
  if (props.job.worker_name || props.job.worker_id) {
    return [{
      name: props.job.worker_name,
      worker_name: props.job.worker_name,
      id: props.job.worker_id,
      signature_image_url: props.job.signature_image_url,
      signature_url: props.job.signature_image_url,
      proof_image_url: props.job.proof_image_url,
      proof_url: props.job.proof_image_url,
    }].filter(worker => worker.signature_image_url || worker.proof_image_url);
  }
  
  return [];
});

// Image preview state
const isImagePreviewOpen = ref(false);
const previewImageUrl = ref("");
const previewImageTitle = ref("");

const openImagePreview = (imageUrl: string, title: string) => {
  previewImageUrl.value = imageUrl;
  previewImageTitle.value = title;
  isImagePreviewOpen.value = true;
};

const closeImagePreview = () => {
  isImagePreviewOpen.value = false;
  previewImageUrl.value = "";
  previewImageTitle.value = "";
};

const closeDialog = () => {
  emit("close");
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.error('Image failed to load:', img.src);
  // Don't hide the image, let browser show broken image icon or alt text
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const [date, time] = value.split(" ");
  if (!time) return value;
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${date} ${parts[0]}:${parts[1]}`;
  }
  return value;
};

const statusClass = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "pending") return "bg-yellow-100 text-yellow-700";
  if (normalized === "completed") return "bg-green-100 text-green-700";
  if (normalized === "cancelled" || normalized === "canceled") return "bg-red-100 text-red-700";
  if (normalized === "in-progress" || normalized === "started") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
};
</script>

