<!-- src/components/Base/Dialog.vue -->
<template>
  <Dialog :open="isOpen" @close="closeDialog">
    <Dialog.Panel class="md:w-[700px]">
      <slot></slot> <!-- Slot for customizable content inside the dialog -->
    </Dialog.Panel>
  </Dialog>
</template>

<script setup lang="ts">
import { useDialog } from "@/composables/useDialog";
import { Dialog } from "@headlessui/vue"; // Ensure this is correctly imported

const { isOpen, closeDialog } = useDialog(); // Use the composable here
</script>

<style scoped>
/* Custom styles for your dialog */
</style>
