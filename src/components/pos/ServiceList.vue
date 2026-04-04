<template>
  <div class="mt-8">
    <h3 class="text-lg font-medium mb-4">{{ $t('invoices.services') }}</h3>
    <div class="border border-gray-200 rounded-lg overflow-hidden relative" style="z-index: 1;">
      <div class="overflow-y-auto" :class="{ 'max-h-[240px]': services.length > 3 }" style="z-index: 1;">
        <table class="w-full text-sm text-left text-gray-500" style="z-index: 1;">
        <thead class="bg-gray-100 sticky top-0 z-10">
        <tr class="border-b">
          <th class="px-2 py-3 text-gray-700 font-medium w-[200px]">{{$t('product.productName')}}</th>
          <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.price')}}</th>
          <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.disc')}} (%)</th>
          <th class="px-2 py-3 text-gray-700 font-medium w-[250px]">Assign Worker</th>
          <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.vat')}}</th>
          <th class="px-2 py-3 text-gray-700 font-medium">{{$t('product.totalPrice')}}</th>
          <th class="px-2 py-3 text-gray-700 font-medium"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(service, index) in services" :key="service.id || index"
            :class="['border-b', { 'bg-red-50': isValidationTriggered && (!service.assigned_worker || (Array.isArray(service.assigned_worker) && service.assigned_worker.length === 0) || service.assigned_worker === '' || service.assigned_worker === null) }]">
          <td class="py-3 px-2">{{ service.name_en }}</td>
          <td class="py-3 px-2">{{ service.sale_price || '0.00' }}</td>
          <td class="py-3 px-2">
            <FormInput
                type="number"
                v-model.number="service.discount"
                min="0"
                max="100"
                class="w-[50px] px-2 py-2 border rounded-lg"
                @input="updateServiceTotal(service, index)"
            />
          </td>
          <td class="py-3 px-2 relative worker-select-cell">
            <div class="w-full min-w-[200px]">
              <WorkerMultiSelect
                :modelValue="Array.isArray(service.assigned_worker) ? service.assigned_worker : (service.assigned_worker && service.assigned_worker !== '' && service.assigned_worker !== null ? [String(service.assigned_worker)] : [])"
                @update:modelValue="(value) => {
                  // Handle array of selected worker IDs
                  if (Array.isArray(value) && value.length > 0) {
                    service.assigned_worker = value.map(v => String(v).trim()).filter(v => v !== '');
                  } else {
                    service.assigned_worker = [];
                  }

                  // Force reactivity update
                  if (isValidationTriggered) {
                    checkAllServicesAssigned();
                  }
                }"
                :workers="workers"
                :placeholder="workers.length === 1 ? 'Select option' : 'Select Workers'"
                :hasError="isValidationTriggered && (!service.assigned_worker || (Array.isArray(service.assigned_worker) && service.assigned_worker.length === 0) || service.assigned_worker === '' || service.assigned_worker === null)"
              />
            </div>
          </td>
          <td class="py-3 px-2">
            {{ calculateServiceVat(service).toFixed(2) }}
          </td>
          <td class="py-3 px-2">
            {{ calculateServiceTotal(service).toFixed(2) }}
          </td>
          <td class="py-3 px-2">
            <button @click="removeService(index)" class="bg-red-100 p-2 rounded-md">
              <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import FormInput from "@/components/Base/Form/FormInput.vue";
import WorkerMultiSelect from "@/components/pos/WorkerMultiSelect.vue";
import Lucide from "@/components/Base/Lucide";
import { useWorkerStore } from '@/stores/workerStore';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import { useI18n } from "vue-i18n";

// Define props
const props = defineProps({
  services: {
    type: Array,
    required: true
  }
});

const authStore = useAuthStore();
const vatValue = authStore.getVatValue;

const emit = defineEmits(["remove-service"]);

// Worker Store
const workerStore = useWorkerStore();
const workers = computed(() => workerStore.getWorkers);

// Validation state
const isValidationTriggered = ref(false);

// Method to remove a service from the list
function removeService(index) {
  emit("remove-service", index);
}

function calculateServiceTotal(service) {
  const price = service.sale_price || 0;
  const discount = service.discount || 0;
  const discountAmount = price * (discount / 100);
  const totalAfterDiscount = price - discountAmount;
  return totalAfterDiscount;
}

function calculateServiceVat(service) {
  const price = service.sale_price || 0;
  const discount = service.discount || 0;
  const discounted = price - (price * (discount / 100));
  return discounted > 0 ? discounted * (vatValue / (1 + vatValue)) : 0;
}

function updateServiceTotal(service, index) {
  service.totalPrice = calculateServiceTotal(service);
}

// Validation methods
function triggerValidation() {
  isValidationTriggered.value = true;
}

function resetValidation() {
  isValidationTriggered.value = false;
}

function checkAllServicesAssigned() {
  // Check if all services now have workers assigned
  // Support both array and string formats for backward compatibility
  const allAssigned = props.services.every(service => {
    const workerId = service.assigned_worker;
    if (Array.isArray(workerId)) {
      return workerId.length > 0;
    }
    return workerId && workerId !== '' && workerId !== null && workerId !== undefined;
  });
  if (allAssigned) {
    resetValidation();
  }
}

// Expose methods to parent component
defineExpose({
  triggerValidation,
  resetValidation
});

</script>
<!--
<style scoped>
/* Target TomSelect dropdown options */
:deep(.ts-dropdown .option),
:deep(.ts-dropdown .optgroup-header),
:deep(.ts-control .item) {
  font-size: 12px !important;
}

/* Target the input placeholder */
:deep(.ts-control input::placeholder) {
  font-size: 12px !important;
}

/* Target selected item in the control */
:deep(.ts-control) {
  font-size: 12px !important;
}
</style> -->
<style scoped>
/* Ensure the table cell allows dropdown positioning */
td.relative {
  position: relative;
  z-index: 1;
}
</style>


