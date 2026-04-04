<script setup>
import {
	FormInput,
	FormLabel,
	FormTextarea,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { RouterLink } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import TomSelect from "@/components/Base/TomSelect";
import { ref, onMounted, reactive, defineProps, watch, watchEffect } from "vue";
import { Dialog, Menu } from "@/components/Base/Headless";

import apiService from '@/network/api/apiService';
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import httpClient from '@/network/api/httpClient';
import ErrorHandler from "@/utils/validation";
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"
import LoadingIcon from "@/components/Base/LoadingIcon";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const props = defineProps({
	supplierList:{
		type: Array,
		required: true,
	},
	SupplierFields:{
		type: Object,
		required: true,
	}

})
 
const createFormData = ref({
	supplier_name: "",
	name: "",
	email: "",
	address: "",
	vat: "",
	country_code: "+966",
	phone: "",
})

// Phone number formatting
const phoneDisplay = ref("");

// Format phone number as user types: 5XX XXX XXXX (without +966 prefix in input)
const formatPhoneNumber = (value) => {
	// Remove all non-numeric characters
	const numbers = value.replace(/\D/g, '');
	
	// Remove leading 966 if user types it
	const cleanNumbers = numbers.startsWith('966') ? numbers.substring(3) : numbers;
	
	// Limit to 9 digits (Saudi phone number format: 5XX XXX XXXX)
	const limitedNumbers = cleanNumbers.substring(0, 9);
	
	// Format: 5XX XXX XXXX
	let formatted = '';
	if (limitedNumbers.length > 0) {
		formatted = limitedNumbers.substring(0, 1); // First digit (5)
	}
	if (limitedNumbers.length > 1) {
		formatted += limitedNumbers.substring(1, 3); // Next 2 digits (XX)
	}
	if (limitedNumbers.length > 3) {
		formatted += ' ' + limitedNumbers.substring(3, 6); // Next 3 digits (XXX)
	}
	if (limitedNumbers.length > 6) {
		formatted += ' ' + limitedNumbers.substring(6, 9); // Last 3 digits (XXX)
	}
	
	return formatted;
};

// Handle phone input
const handlePhoneInput = (event) => {
	const input = event.target;
	const inputValue = input.value;
	
	// Get cursor position before formatting
	const cursorPosition = input.selectionStart;
	const beforeCursor = inputValue.substring(0, cursorPosition);
	const digitsBeforeCursor = beforeCursor.replace(/\D/g, '').length;
	
	// Format the phone number
	const formatted = formatPhoneNumber(inputValue);
	phoneDisplay.value = formatted;
	
	// Store clean numeric value (just the 9 digits, without 966)
	const numbers = inputValue.replace(/\D/g, '');
	const cleanNumbers = numbers.startsWith('966') ? numbers.substring(3) : numbers;
	createFormData.value.phone = cleanNumbers.substring(0, 9);
	
	// Calculate new cursor position
	let newCursorPosition = 0;
	if (digitsBeforeCursor > 0) {
		// Count spaces before cursor position in formatted string
		let digitCount = 0;
		for (let i = 0; i < formatted.length && digitCount < digitsBeforeCursor; i++) {
			if (/\d/.test(formatted[i])) {
				digitCount++;
			}
			if (digitCount <= digitsBeforeCursor) {
				newCursorPosition = i + 1;
			}
		}
	}
	
	// Update input value
	input.value = formatted;
	
	// Adjust cursor position after formatting
	setTimeout(() => {
		input.setSelectionRange(newCursorPosition, newCursorPosition);
	}, 0);
};

// Handle phone paste
const handlePhonePaste = (event) => {
	event.preventDefault();
	const pastedData = (event.clipboardData || window.clipboardData).getData('text');
	const formatted = formatPhoneNumber(pastedData);
	phoneDisplay.value = formatted;
	
	const numbers = pastedData.replace(/\D/g, '');
	const cleanNumbers = numbers.startsWith('966') ? numbers.substring(3) : numbers;
	createFormData.value.phone = cleanNumbers.substring(0, 9);
	
	// Update the input value
	event.target.value = formatted;
	
	// Set cursor to end
	setTimeout(() => {
		event.target.setSelectionRange(formatted.length, formatted.length);
	}, 0);
};

// Handle keydown to prevent invalid characters
const handlePhoneKeydown = (event) => {
	// Allow: backspace, delete, tab, escape, enter, home, end, and arrow keys
	if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(event.keyCode) !== -1 ||
		// Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
		(event.keyCode === 65 && event.ctrlKey === true) ||
		(event.keyCode === 67 && event.ctrlKey === true) ||
		(event.keyCode === 86 && event.ctrlKey === true) ||
		(event.keyCode === 88 && event.ctrlKey === true)) {
		return;
	}
	// Ensure that it is a number and stop the keypress
	if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
		event.preventDefault();
	}
};

// Get clean phone number for submission (966XXXXXXXXX)
const getCleanPhoneNumber = () => {
	const phone = createFormData.value.phone || '';
	return '966' + phone;
};

const resetForm = () => {
  Object.keys(createFormData.value).forEach(key => {
    createFormData.value[key] = key === 'country_code' ? '+966' : '';
  });
  phoneDisplay.value = '';
};

const isloading = ref(false)
const isOpenSupplier = ref(false)
const form = reactive(new ErrorHandler());
const submitCreate = async () => {
	try {
		isloading.value = true;
		// Prepare payload with clean phone number
		const payload = {
			...createFormData.value,
			phone: getCleanPhoneNumber() // Store as 966XXXXXXXXX
		};
		const response = await httpClient.post(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/suppliers?user_id=${USER_ID}`, payload)
		// const response = await apiService.supplier.create(createFormData.value);
		const result = handleResponse(response);

		if (result.success) { 
			props.supplierList.push(result.data.data)
			props.SupplierFields.supplier_id = result.data.data.id
			toast().fry(pan.supplier.success(result.message))
			isOpenSupplier.value=false
			resetForm()
		}
	} catch (error) {
		// Show network error instead of field validations
		handleError(error);
		toast().fry(pan.supplier.error(error.message))
	} finally {
		isloading.value = false;
	}
} 
const resetFormClosed = () => {
    Object.assign(createFormData.value, {
        supplier_name: "",
        name: "",
        email: "",
        address: "",
        vat: "", 
        phone: "",
    });
    phoneDisplay.value = '';
};
// Model Open  
const modelOpenSupplier = () => { isOpenSupplier.value = true }
const modelCloseSupplier = () => { isOpenSupplier.value = false; resetFormClosed() } 
</script>


<template>
  <Button variant="primary" class="ml-3 shadow-md" @click="modelOpenSupplier">
    <Lucide icon="Plus" class="w-5 h-5" />
  </Button>
  <Dialog :open="isOpenSupplier" @close="modelCloseSupplier">
    <Dialog.Panel class="md:w-[700px]">
      <div class="py-5">
        <div class="border-b border-gray-300 mb-4">
          <h4 class="text-lg text-gray-800 font-semibold pb-3 px-6">{{ $t('suppliers.addSupplier') }}</h4>
        </div>
        <div class="grid grid-cols-12 gap-6 p-6">
          <div class="col-span-6">
            <FormLabel>{{ $t('suppliers.supplier') }} <span class="text-danger"> *</span></FormLabel>
            <FormInput v-model="createFormData.supplier_name" id="name_en" type="text" :placeholder="$t('suppliers.placeholder.supplier')"
                       :class="{ 'border-red-500': form.invalid('supplier_name') }" />
            <template v-if="form.invalid('supplier_name')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('supplier_name') }}</div>
            </template>
          </div>
          <div class="col-span-6">
            <FormLabel for="vat_number">{{ $t('suppliers.vatNumber') }}</FormLabel>
            <FormInput v-model="createFormData.vat" id="vat_number" type="text" :placeholder="$t('suppliers.placeholder.vat')"
                       :class="{ 'border-red-500': form.invalid('vat') }" />
            <template v-if="form.invalid('vat')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('vat') }}</div>
            </template>
          </div>
          <div class="col-span-6">
            <FormLabel>{{ $t('suppliers.contactName') }}</FormLabel>
            <FormInput id="nameAr" v-model="createFormData.name" type="text" :placeholder="$t('suppliers.placeholder.contactName')"
                       :class="{ 'border-red-500': form.invalid('name') }" />
            <template v-if="form.invalid('name')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('name') }}</div>
            </template>
          </div>
          <div class="col-span-6">
            <FormLabel>{{ $t('suppliers.email') }}</FormLabel>
            <FormInput id="nameAr" v-model="createFormData.email" type="email" :placeholder="$t('suppliers.placeholder.email')"
                       :class="{ 'border-red-500': form.invalid('email') }" />
            <template v-if="form.invalid('email')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('email') }}</div>
            </template>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('suppliers.phone') }} <span class="text-danger"> *</span></FormLabel>
            <div class="flex item-center justify-center">
              <p class="bg-gray-100 flex items-center justify-center w-[55px] text-sm border border-slate-200 shadow-sm rounded-l-md rounded-r-none">
                +966
              </p>
              <FormInput 
                id="phone" 
                :value="phoneDisplay" 
                @input="handlePhoneInput"
                @paste="handlePhonePaste"
                @keydown="handlePhoneKeydown"
                class="rounded-l-none" 
                type="text"
                placeholder="Example: 051 234 5678"
                maxlength="13"
                :class="{ 'border-red-500': form.invalid('phone') }" 
              />
            </div>
            <template v-if="form.invalid('phone')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('phone') }}</div>
            </template>
          </div>

          <div class="col-span-6">
            <FormLabel>{{ $t('suppliers.address') }}</FormLabel>
            <FormInput id="nameAr" v-model="createFormData.address" type="text" :placeholder="$t('suppliers.placeholder.address')" />
            <template v-if="form.invalid('address')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('address') }}</div>
            </template>
          </div>
        </div>
        <div class="px-5 py-4 text-left flex items-center">
          <Button variant="outline-secondary" type="button" @click="modelCloseSupplier" class="w-24 mr-4">
            {{ $t('suppliers.cancel') }}
          </Button>
          <Button variant="primary" type="button" class="" @click="submitCreate">
            <template v-if="isloading">
              <LoadingIcon icon="three-dots" class="w-8 h-5 text-white " />
            </template>
            <template v-else>
              {{ $t('suppliers.createSupplier') }}
            </template>
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>