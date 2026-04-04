<template>
  <div class="mb-4">
    <label for="transactionType" class="block text-gray-700 font-medium mb-2">
      Transaction Type
    </label>
    <select
        id="transactionType"
        v-model="transactionType"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="add">Add</option>
      <option value="withdraw">Withdraw</option>
    </select>
    <button @click="handleTransaction" class="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md">
      Apply Transaction
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const transactionType = ref('add');

function handleTransaction() {
  // Implement transaction handling here
}
</script>
