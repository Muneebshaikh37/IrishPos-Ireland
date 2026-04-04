<template>
  <div>
    <div>
      <button @click="startScanner" :disabled="isScanning">Start Scanner</button>
      <button @click="stopScanner" :disabled="!isScanning">Stop Scanner</button>
    </div>

    <!-- Conditionally render the scanner based on the scanning state -->
    <div v-if="isScanning">
      <StreamBarcodeReader @decode="onDecode" @loaded="onLoaded" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { StreamBarcodeReader } from "vue-barcode-reader";
import { eventBus } from "../../utils/eventBus"; // Import the event bus


// Reactive state for controlling the scanner
const isScanning = ref(false);
const decodedBarcode = ref<string | null>(null);

// Event handler for when a barcode is decoded
const onDecode = (decodedResult: string) => {
  decodedBarcode.value = decodedResult;
  isScanning.value = false;

  // Emit the result using mitt
  eventBus.emit("barcode-scanned", decodedResult);


};

// Event handler for when the scanner is loaded
const onLoaded = () => {
  console.log("Barcode scanner loaded successfully");
};

// Methods to start and stop the scanner
const startScanner = () => {
  isScanning.value = true;
  decodedBarcode.value = null; // Reset previous result

};

const stopScanner = () => {
  isScanning.value = false;
};
</script>

<style scoped>
button {
  margin: 5px;
  padding: 10px 15px;
  border: none;
  background-color: #007bff;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

p {
  margin-top: 10px;
  font-size: 16px;
}
</style>