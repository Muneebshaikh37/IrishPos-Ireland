<template>
  <div class="relative w-full" ref="selectContainer">
    <div 
      @click="toggleDropdown"
      :class="[
        'w-full border rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between',
        { 'border-red-500 border-2': hasError },
        { 'border-gray-300': !hasError }
      ]"
    >
      <div class="flex-1 min-h-[20px]">
        <span v-if="selectedWorkers.length === 0" class="text-gray-400 text-sm">
          {{ placeholder }}
        </span>
        <span v-else class="text-sm text-gray-700">
          {{ selectedWorkers.length }} worker(s) selected
        </span>
      </div>
      <Lucide 
        :icon="isOpen ? 'ChevronUp' : 'ChevronDown'" 
        class="w-4 h-4 text-gray-500"
      />
    </div>
    
    <Teleport to="body">
      <div 
        v-if="isOpen"
        ref="dropdownRef"
        class="fixed z-[99999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-[300px] overflow-hidden"
        :style="dropdownStyle"
      >
      <!-- Search Bar -->
      <div class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search workers..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          @click.stop
        />
      </div>
      
      <!-- Worker List with Checkboxes -->
      <div class="max-h-[250px] overflow-y-auto">
        <div
          v-for="worker in filteredWorkers"
          :key="worker.id"
          @click.stop="toggleWorker(worker.id)"
          class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="isSelected(worker.id)"
            @change.stop="toggleWorker(worker.id)"
            class="mr-3 w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary checked:bg-primary checked:border-primary"
          />
          <span class="text-sm text-gray-700">{{ worker.name }}</span>
        </div>
        <div v-if="filteredWorkers.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
          No workers found
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import Lucide from "@/components/Base/Lucide";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  workers: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select Workers'
  },
  hasError: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const selectContainer = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({});

const selectedWorkers = computed(() => {
  return props.workers.filter(worker => props.modelValue.includes(String(worker.id)));
});

const filteredWorkers = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.workers;
  }
  const query = searchQuery.value.toLowerCase();
  return props.workers.filter(worker => 
    worker.name.toLowerCase().includes(query)
  );
});

const isSelected = (workerId) => {
  return props.modelValue.includes(String(workerId));
};

const toggleWorker = (workerId) => {
  const workerIdStr = String(workerId);
  const currentValue = [...props.modelValue];
  const index = currentValue.indexOf(workerIdStr);
  
  if (index > -1) {
    currentValue.splice(index, 1);
  } else {
    currentValue.push(workerIdStr);
  }
  
  emit('update:modelValue', currentValue);
};

const updateDropdownPosition = async () => {
  if (!selectContainer.value || !dropdownRef.value) return;
  
  await nextTick();
  
  const rect = selectContainer.value.getBoundingClientRect();
  
  // Calculate actual dropdown height based on content
  // Search bar: ~48px (padding + input height)
  // Each worker item: ~40px (py-2 = 8px top + 8px bottom + ~24px text)
  // Max height: 300px (250px scrollable + 48px search bar)
  const searchBarHeight = 48;
  const workerItemHeight = 40;
  const maxDropdownHeight = 300;
  const actualContentHeight = searchBarHeight + (filteredWorkers.value.length * workerItemHeight);
  const dropdownHeight = Math.min(actualContentHeight, maxDropdownHeight);
  
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  // Use fixed positioning relative to viewport (getBoundingClientRect already gives viewport coordinates)
  let top = rect.bottom + 4; // 4px gap below input
  let left = rect.left;
  let width = Math.max(rect.width, 200); // Ensure minimum width
  
  // If not enough space below, show above
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    top = rect.top - dropdownHeight - 4;
  }
  
  // Ensure dropdown doesn't go off-screen horizontally
  const maxLeft = window.innerWidth - width;
  if (left > maxLeft) {
    left = Math.max(0, maxLeft);
  }
  if (left < 0) {
    left = 0;
  }
  
  // Ensure dropdown doesn't go off-screen vertically
  if (top < 0) {
    top = 4;
  }
  if (top + dropdownHeight > window.innerHeight) {
    top = Math.max(4, window.innerHeight - dropdownHeight - 4);
  }
  
  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
  };
};

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    updateDropdownPosition();
  }
};

const closeDropdown = (event) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      isOpen.value = false;
    }
  }
};

watch(isOpen, async (newValue) => {
  if (newValue) {
    await nextTick();
    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
  } else {
    window.removeEventListener('scroll', updateDropdownPosition, true);
    window.removeEventListener('resize', updateDropdownPosition);
  }
});

// Watch filteredWorkers to recalculate position when list changes
watch(filteredWorkers, async () => {
  if (isOpen.value) {
    await nextTick();
    updateDropdownPosition();
  }
});

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  window.removeEventListener('scroll', updateDropdownPosition, true);
  window.removeEventListener('resize', updateDropdownPosition);
});
</script>

<style scoped>
/* Custom scrollbar for dropdown */
.max-h-\[250px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[250px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-\[250px\]::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.max-h-\[250px\]::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Ensure checkbox shows checkmark when checked */
input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L4 12.586l7.793-7.793a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 70% 70%;
  background-position: center;
  background-repeat: no-repeat;
  border-color: #f97316;
  background-color: #f97316;
}

input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

input[type="checkbox"]:hover {
  border-color: #f97316;
}
</style>

