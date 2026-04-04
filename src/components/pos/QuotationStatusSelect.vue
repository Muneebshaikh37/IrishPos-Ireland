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
        <span v-if="!selectedStatus" class="text-gray-400 text-sm">
          {{ placeholder }}
        </span>
        <span v-else class="text-sm text-gray-700">
          {{ getStatusLabel(selectedStatus) }}
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
        class="fixed bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
        :style="{
          ...dropdownStyle,
          zIndex: currentZIndex,
          willChange: 'transform',
        }"
      >
      <!-- Search Bar -->
      <div class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search status..."
          class="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          @click.stop
        />
      </div>
      
      <!-- Status List -->
      <div class="max-h-[240px] overflow-y-auto">
        <div
          v-for="status in filteredStatuses"
          :key="status.value"
          @click.stop="selectStatus(status.value)"
          :class="[
            'flex items-center px-4 py-1 hover:bg-gray-50 cursor-pointer',
            { 'bg-primary/10': selectedStatus === status.value }
          ]"
        >
          <span class="text-sm text-gray-700">{{ status.label }}</span>
        </div>
        <div v-if="filteredStatuses.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
          No status found
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import Lucide from "@/components/Base/Lucide";

// Global counter for z-index management
let globalZIndex = 10000;

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select Status'
  },
  hasError: {
    type: Boolean,
    default: false
  },
  statuses: {
    type: Array,
    default: () => [
      { value: 'pending', label: 'Pending' },
      { value: 'invoice', label: 'Invoice' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const selectContainer = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({});
const currentZIndex = ref(10000);

const selectedStatus = computed(() => props.modelValue);

const filteredStatuses = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.statuses;
  }
  const query = searchQuery.value.toLowerCase();
  return props.statuses.filter(status => 
    status.label.toLowerCase().includes(query) ||
    status.value.toLowerCase().includes(query)
  );
});

const getStatusLabel = (value) => {
  const status = props.statuses.find(s => s.value === value);
  return status ? status.label : value;
};

const selectStatus = (value) => {
  emit('update:modelValue', value);
  isOpen.value = false;
  searchQuery.value = '';
};

const updateDropdownPosition = async () => {
  if (!selectContainer.value) return;
  
  await nextTick();
  
  const rect = selectContainer.value.getBoundingClientRect();
  const dropdownMaxHeight = 300; // max-h-[300px]
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  // Calculate actual dropdown height (will be less if not enough items)
  let dropdownHeight = dropdownMaxHeight;
  if (dropdownRef.value) {
    const dropdownRect = dropdownRef.value.getBoundingClientRect();
    dropdownHeight = dropdownRect.height || dropdownMaxHeight;
  }
  
  // Use fixed positioning relative to viewport
  let top = rect.bottom + 8; // 8px gap below input
  let left = rect.left;
  let width = rect.width; // Match exactly with select container width
  
  // Determine if we should show above or below
  // Only show above if there's not enough space below AND there's more space above
  const showAbove = spaceBelow < Math.min(dropdownHeight + 20, 250) && spaceAbove > spaceBelow + 100;
  
  if (showAbove) {
    // Position above the input
    top = rect.top - Math.min(dropdownHeight, spaceAbove - 20) - 8;
  }
  
  // Ensure dropdown stays within viewport horizontally
  if (left + width > window.innerWidth) {
    left = Math.max(10, window.innerWidth - width - 10);
  }
  if (left < 10) {
    left = 10;
  }
  
  // Ensure dropdown stays within viewport vertically
  if (top < 10) {
    top = 10;
  }
  if (top + dropdownHeight > window.innerHeight - 10) {
    top = window.innerHeight - dropdownHeight - 10;
  }
  
  dropdownStyle.value = {
    top: `${Math.max(10, top)}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: showAbove ? `${Math.min(spaceAbove - 20, dropdownMaxHeight)}px` : `${Math.min(spaceBelow - 20, dropdownMaxHeight)}px`,
  };
};

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // Notify other dropdowns to close
    const event = new CustomEvent('quotation-dropdown-open', { detail: selectContainer.value });
    document.dispatchEvent(event);
    
    // Increment global z-index and assign to this dropdown
    globalZIndex++;
    currentZIndex.value = globalZIndex;
    await nextTick();
    updateDropdownPosition();
  } else {
    searchQuery.value = '';
  }
};

const closeDropdown = (event) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      isOpen.value = false;
      searchQuery.value = '';
    }
  }
};

// Listen for other dropdowns opening and close this one
const handleOtherDropdownOpen = (event) => {
  if (event.detail && event.detail !== selectContainer.value) {
    isOpen.value = false;
    searchQuery.value = '';
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

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  document.addEventListener('quotation-dropdown-open', handleOtherDropdownOpen);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  document.removeEventListener('quotation-dropdown-open', handleOtherDropdownOpen);
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
</style>



