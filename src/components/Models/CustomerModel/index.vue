<script setup>
import { Dialog } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";

const props = defineProps({
  isOpenCustomerView: {
    type: Boolean,
    required: true
  },
  customerData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['closeCustomerView']);

const closeCustomerView = () => {
  emit('closeCustomerView');
};
</script>

<template>
  <Dialog :open="isOpenCustomerView" @close="closeCustomerView">
    <Dialog.Panel class="md:w-[500px]">
      <div class="p-8 customer-container">
        <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
          <h1 class="text-base font-medium mb-4">Customer Details</h1>
          <span class="absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="closeCustomerView">
            <Lucide icon="X" class="w-5 h-5 text-white" />
          </span>
        </div>

        <!-- Customer Details -->
        <div class="py-6">
          <div class="grid gap-4">
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-medium">Name:</h4>
              <span class="text-sm">{{ customerData.name }}</span>
            </div>
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-medium">Phone:</h4>
              <span class="text-sm">{{ customerData.full_phone }}</span>
            </div>
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-medium">Status:</h4>
              <span class="text-sm" :class="customerData.is_active ? 'text-green-600' : 'text-red-600'">
                {{ customerData.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template> 