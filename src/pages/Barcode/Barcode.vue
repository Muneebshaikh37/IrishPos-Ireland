<template>
  <div>
    <BarcodeScanner />
    <p v-if="scannedResult">Scanned Barcode: {{ scannedResult }}</p>

    <!-- Input field for simulating barcode scan -->
    <div class="mt-4">
      <input
          type="text"
          v-model="testBarcode"
          placeholder="Simulate Barcode Scan"
          class="border p-2 rounded w-full"
      />
      <button @click="simulateBarcodeScan" class="mt-2 bg-green-500 text-white p-2 rounded">
        Simulate Scan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import BarcodeScanner from "../../components/Barcode/BarcodeScanner.vue";
import { eventBus } from "../../utils/eventBus"; // Import the event bus

// Reactive state to hold the scanned result and test barcode
const scannedResult = ref<string | null>(null);
const testBarcode = ref<string>("");

// Event handler for barcode-scanned event
const onBarcodeScanned = (result: string) => {
  scannedResult.value = result;
  console.log("Scanned Barcode:", result);
};

// Simulate barcode scan for testing
const simulateBarcodeScan = () => {
  if (testBarcode.value) {
    onBarcodeScanned(testBarcode.value);
    testBarcode.value = ""; // Clear the test input after simulating
  } else {
    console.warn("No test barcode entered to simulate.");
  }
};

// Listen for the event when the component is mounted
onMounted(() => {
  eventBus.on("barcode-scanned", onBarcodeScanned);
});

// Cleanup the event listener when the component is unmounted
onUnmounted(() => {
  eventBus.off("barcode-scanned", onBarcodeScanned);
});
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>