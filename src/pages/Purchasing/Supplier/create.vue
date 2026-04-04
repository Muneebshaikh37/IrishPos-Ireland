<script setup>

import {
	FormInput,
	FormLabel,
	FormTextarea,
} from "@/components/Base/Form";
import httpClient from "@/network/api/httpClient";
import Button from "@/components/Base/Button";
import { RouterLink } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import { ref, reactive } from "vue";
import { handleResponse } from "@/network/api/responseHandler.js";
import router from "@/router";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"
import ErrorHandler from "@/utils/validation";
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

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

const isloading = ref(false)
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
		// const response = await apiService.supplier.create(payload);
		const result = handleResponse(response);

		if (result.success) {
			toast().fry(pan.supplier.success(result.message))
			console.log(result.message)
			router.push("/purchasing/supplier");
		}
	} catch (error) {
		handleError(error);
		form.setErrors(error.response?.data?.errors);
	} finally {
		isloading.value = false;
	}

}



</script>

<template>
	<div class="flex items-center mt-8 intro-y">
		<RouterLink to="/purchasing/supplier">
			<Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
				<Lucide icon="ChevronLeft" class="w-5 h-5" />
			</Button>
		</RouterLink>
		<h2 class="mr-auto text-lg font-semibold">{{ $t('suppliers.createSupplier') }}</h2>
	</div>
	<div class="grid grid-cols-12 gap-6 mt-5">
		<div class="col-span-12 intro-y lg:col-span-12">
			<div class="intro-y box p-8">
				<div class="grid grid-cols-12 gap-6">
					<div class="col-span-6">
						<FormLabel>{{ $t('suppliers.supplier') }}  <span class="text-danger "> *</span></FormLabel>
						<FormInput v-model="createFormData.supplier_name" id="name_en" type="text" :placeholder="$t('suppliers.supplier')" :class="{'border-red-500': form.invalid('supplier_name')}"  />
							 
						<template v-if="form.invalid('supplier_name')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('supplier_name') }}</div>
						</template>
					</div>
					<div class="col-span-6">
						<FormLabel for="vat_number">{{ $t('suppliers.vatNumber') }}</FormLabel>
						<FormInput v-model="createFormData.vat" id="vat_number" type="text"
                       :placeholder="$t('suppliers.vatNumber')" :class="{'border-red-500': form.invalid('vat')}" />
							<template v-if="form.invalid('vat')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('vat') }}</div>
						</template>
					</div>
					<div class="col-span-6">
						<FormLabel> {{ $t('suppliers.contactName') }} </FormLabel>

						<FormInput id="nameAr" v-model="createFormData.name" type="text" :placeholder="$t('suppliers.contactName')"
						:class="{'border-red-500': form.invalid('name')}" />
						<template v-if="form.invalid('name')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('name') }}</div>
						</template>
					</div>
					<div class="col-span-6">
						<FormLabel> {{ $t('suppliers.email') }}  </FormLabel>
						<FormInput id="nameAr" v-model="createFormData.email" type="email" :placeholder="$t('suppliers.email')"
						:class="{'border-red-500': form.invalid('email')}" />
						<template v-if="form.invalid('email')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('email') }}</div>
						</template>
					</div>

					<div class="col-span-6">
						<FormLabel> {{ $t('suppliers.phone') }} <span class="text-danger "> *</span></FormLabel>
						<div class="flex item-center justify-center">
							<p
								class="  bg-gray-100 flex items-center justify-center w-[55px] text-sm border border-slate-200 shadow-sm rounded-l-md rounded-r-none   ">
								+966</p>
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
								:class="{'border-red-500': form.invalid('phone')}" 
							/>
						</div>
						<template v-if="form.invalid('phone')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('phone') }}</div>
						</template>

					</div>

					<div class="col-span-6">
						<FormLabel> {{ $t('suppliers.address') }}  </FormLabel>
						<FormInput id="nameAr" v-model="createFormData.address" type="text" :placeholder="$t('suppliers.address')" />
						<template v-if="form.invalid('address')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('address') }}</div>
						</template>
					</div>
					<div class="col-span-12">
						<Button variant="primary" class="mr-2 mt-2 shadow-md" @click="submitCreate">
              {{ $t('suppliers.submit') }}
						</Button>

					</div>
				</div>
			</div>
		</div>
	</div>


	<div v-if="isloading"
		class="fixed top-0 w-full h-full left-0 flex items-center justifty-center bg-black bg-opacity-30 z-[999999]">
		<clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'"
			:loading="true" :color="'#fff'" :size="'50px'"></clip-loader>
	</div>
</template>