<template>
  <div class="mt-8">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead>
      <tr class="bg-gray-100 border-b">
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium w-[180px]">Product Name</th>
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">Remove Quantity</th>
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">Available Quantity</th>
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">Updated Quantity</th>
        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">Adjustment Reason</th>
        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(product, index) in products"
          :key="product.id || index"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
      >
        <!-- Product Name -->
        <td class="py-3 px-4">{{ product.name_en }}</td>

        <!-- Remove Quantity Input -->
        <td class="py-3 px-4">
          <FormInput
              type="number"
              v-model.number="product.remove_qty"
              @input="validateRemoveQty(product)"
              min="0"
              :max="product.initial_quantity"
              class="w-[85px] px-4 py-2 border rounded-lg"
          />
        </td>

        <!-- Available Quantity -->
        <td class="py-3 px-4">
          <FormInput
              type="number"
              readonly
              v-model.number="product.initial_quantity"
              class="w-[85px] px-4 py-2 border rounded-lg"
          />
        </td>

        <!-- Updated Quantity -->
        <td class="py-3 px-4">
          <FormInput
              type="number"
              readonly
              v-model.number="product.updated_quantity"
              class="w-[85px] px-4 py-2 border rounded-lg"
          />
        </td>

        <!-- Adjustment Reason Dropdown -->
        <td class="py-3 px-4">
          <TomSelect v-model="product.reason" :options="reasonsList" class="w-full">
            <option></option>
            <template v-for="reason in reasonsList" :key="reason.id">
              <option :value="reason.id">{{ reason.title }}</option>
            </template>
          </TomSelect>

          <TomSelect v-model="product.reason" :options="{
								placeholder: 'Select Category',
							}" class="w-full">
            <option></option>
            <template v-for="reason in reasonsList">
              <option :value="reason.id">{{ list.title }}</option>
            </template>
          </TomSelect>
        </td>

        <!-- Actions -->
        <td class="py-3 px-4">
          <button @click="removeProduct(index)" class="bg-red-100 p-2 rounded-md">
            <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]" />
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { FormInput } from "@/components/Base/Form";
import TomSelect from "@/components/Base/TomSelect";
import { handleResponse } from "@/network/api/responseHandler";
import httpClient from "@/network/api/httpClient";
import {useAuthStore} from "@/stores/auth.js";

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
});
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const emit = defineEmits(["removeProduct"]);
const reasonsList = ref([]); // Holds the list of adjustment reasons

// Function to validate remove quantity
const validateRemoveQty = (product) => {
  if (product.remove_qty > product.initial_quantity) {
    product.remove_qty = product.initial_quantity;
    alert("Remove quantity cannot be greater than available quantity.");
  } else if (product.remove_qty < 0 || product.remove_qty === null) {
    product.remove_qty = 0;
  }

  // Dynamically calculate updated quantity
  product.updated_quantity = product.initial_quantity - product.remove_qty;
};

// Fetch adjustment reasons
async function getReasonsList() {
  try {
    const response = await httpClient.get(`stock-adjustment-reason?user_id=${USER_ID}`);
    const result = handleResponse(response);
    if (result.success) {
      reasonsList.value = result.data.data; // Assuming API returns 'data' array
    }
  } catch (error) {
    console.error("Error fetching reasons list:", error);
  }
}

// Remove product
function removeProduct(index) {
  emit("removeProduct", index);
}

// Fetch reasons list on component mount
onMounted(() => {
  getReasonsList();
});

// Initialize remove_qty to 0 for all products
props.products.forEach((product) => {
  product.remove_qty = 0;
  product.reason = null;
});
</script>
