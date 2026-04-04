<script setup>

import {
	FormInput,
	FormLabel,
	FormCheck,
	FormSwitch,
} from "@/components/Base/Form";
import { authHttpClient } from "@/network/modules/auth.js";
import Button from "@/components/Base/Button"; 
import Lucide from "@/components/Base/Lucide";
import { onMounted, ref, reactive, watch, provide , computed} from "vue"; 
import { handleResponse, handleError } from "@/network/api/responseHandler.js"; 
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"
import ErrorHandler from "@/utils/validation";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import UsersTab from "@/components/Settings/Users/UsersTab.vue";

import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const TexFormData = ref({ 
	is_zatca: "",
	subject_to_vat: "",
	subject_to_no_vat: "",
	_method: "PUT",
})  
const isloading = ref(false) 
const form = reactive(new ErrorHandler()); 
const isfetchVat = async () => {
	try {
		const response = await authHttpClient.get(`/user-taxes?user_id=${USER_ID}`)
		// const response = await apiService.product.brandsList();
		const result = handleResponse(response);
		if (result.success) {
			TexFormData.value = result.data 
		}
	} catch (error) {
		const result = handleError(error);
	}
}
const saveVat = async () => {
	try {
		isloading.value = true
		const { subject_to_no_vat, ...rest } = TexFormData.value;
		const Payload = { ...rest, _method: "PUT" };
		const response = await authHttpClient.put(`/user-taxes?user_id=${USER_ID}`, Payload)
		// const response = await apiService.product.brandsList();
		const result = handleResponse(response);
		if (result.success) {
			isloading.value = false
			toast().fry(pan.tax.success(result.message)) 
		}
	} catch (error) {
		const result = handleError(error);
		isloading.value = false 
		form.setErrors(error.response.data.errors);
		toast().fry(pan.tax.error(error.message))
	}
} 
onMounted(() => {
	isfetchVat()
})
const isZatcaChecked = computed({
	// Converts 1 to true
  get() { return TexFormData.value.is_zatca === 1;},
	// Converts true to 1, false to 0
  set(value) { TexFormData.value.is_zatca = value ? 1 : 0; },
}); 
// To debug and log the payload
watch( () => TexFormData.value.is_zatca,
  (newValue) => {
    console.log("Payload updated:", { is_zatca: newValue });
  }
);
</script>
<template> 
	<div class="grid grid-cols-12 gap-6 mt-5">
		<div class="col-span-12 intro-y lg:col-span-12">
			<div class="intro-y box p-8"> 
				<!-- sm:w-[90%] lg:w-[75%] xl:w-[70%] -->
				<TabGroup>
					<TabList class="flex w-full  space-x-6 rounded-xl px-4  p-1">
						<Tab as="template" v-slot="{ selected }">
							<Button :class="[
								'rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none',
								'ring-transparent ring-offset-0 ring-offset-transparent focus:outline-none focus:ring-0',
								selected
									? 'bg-[#f8f4f3] text-primary '
									: 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary',]">
								<Lucide icon="BadgePercent" class="w-5 h-5 mr-2" /> Tax Management
							</Button>
						</Tab>
						 <Tab as="template" v-slot="{ selected }">
							<Button :class="[
								'shadow-none rounded-lg py-2.5 px-4 text-sm font-normal leading-5 border-none',
								'ring-transparent ring-offset-0 ring-offset-transparent focus:outline-none focus:ring-0',
								selected
									? 'bg-[#f8f4f3] text-primary '
									: 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary',]">
								<Lucide icon="Building2" class="w-5 h-5 mr-2" />
								Company Profile
							</Button>
						</Tab>
						<Tab as="template" v-slot="{ selected }">
							<Button :class="[
								'shadow-none rounded-lg py-2.5 px-4 text-sm font-normal leading-5 border-none',
								'ring-transparent ring-offset-0 ring-offset-transparent focus:outline-none focus:ring-0',
								selected
									? 'bg-[#f8f4f3] text-primary '
									: 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary',]">
								<Lucide icon="Settings" class="w-5 h-5 mr-2" />
								General Settings
							</Button>
						</Tab>
						<Tab as="template" v-slot="{ selected }">
							<Button :class="[
								'rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none',
								'ring-transparent ring-offset-0 ring-offset-transparent focus:outline-none focus:ring-0',
								selected
									? 'bg-[#f8f4f3] text-primary '
									: 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary',]">
								<Lucide icon="User" class="w-5 h-5 mr-2" /> Users
							</Button>
						</Tab>

						<Tab as="template" v-slot="{ selected }">
							<Button :class="[
								'rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none',
								'ring-transparent ring-offset-0 ring-offset-transparent focus:outline-none focus:ring-0',
								selected
									? 'bg-[#f8f4f3] text-primary '
									: 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary',]">
								<Lucide icon="Settings" class="w-5 h-5 mr-2" /> Renew Subscription
							</Button>
						</Tab>
					</TabList>
					<TabPanels class="mt-4 px-0 pb-6 w-full">
						<TabPanel
							:class="['rounded-lg w-full p-5', 'ring-white/60 ring-offset-0 ring-offset-blue-400 focus:outline-none focus:ring-0',]">
							<div class="">
								<h2 class="text-lg font-medium text-gray-600 mb-4">Tax Management</h2>
							</div>
							<div class="mb-4 grid grid-cols-12 gap-6 ">
								<div class="col-span-6">
									<FormLabel> VAT <span class="text-danger "> *</span></FormLabel>
									<div class="flex item-center justify-center"> 
									<FormInput id="name_en" type="text" v-model="TexFormData.subject_to_vat" placeholder=""
									class="rounded-r-none" :class="{'border-red-500': form.invalid('subject_to_vat')}" disabled />
									<p class="bg-gray-100 flex text-base items-center justify-center w-[55px]   border border-slate-200 shadow-sm rounded-r-md rounded-l-none"> % </p>
									</div>
									<template v-if="form.invalid('subject_to_vat')">
							      <div class="mt-2 text-xs text-red-600">{{ form.getError('subject_to_vat') }}</div>
						      </template>
								</div>
								<div class="col-span-6">
									<FormLabel>Subject to No Tax </FormLabel>
									<div class="flex item-center justify-center"> 
									<FormInput id="name_en" v-model="TexFormData.subject_to_no_vat" type="text" placeholder=""
										disabled="" class="rounded-r-none" :class="{'border-red-500': form.invalid('subject_to_no_vat')}" />
										<p class="bg-gray-100 flex text-base items-center justify-center w-[55px]   border border-slate-200 shadow-sm rounded-r-md rounded-l-none"> % </p>
									</div>
									<template v-if="form.invalid('subject_to_no_vat')">
							      <div class="mt-2 text-xs text-red-600">{{ form.getError('subject_to_no_vat') }}</div>
						      </template>
									 
								</div>
							 
								<div class="col-span-3">

									<FormSwitch.Label htmlFor="zatca" class="text-sm text-gray-500"> ZATCA </FormSwitch.Label>
									<FormSwitch.Input id="zatca" v-model="isZatcaChecked" :checked="TexFormData.is_zatca === 1"
										class="ml-3 mr-0" type="checkbox" disabled />
								</div>
								<div class="mt-3 col-span-12">
									<Button variant="primary" type="button" class="  mt-4" @click="saveVat" :disabled="isloading">
										<template v-if="isloading">
											<LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
										</template>
										<template v-else>
											Save
										</template>
									</Button>
								</div>
							</div>
						</TabPanel>
						 <TabPanel
							:class="['rounded-xl ', ' ',]">
							<div class="mb-4">
								<CompanyProfile/>
							</div> 
						</TabPanel>
						<TabPanel
							:class="['rounded-xl ', ' ',]">
							<div class="mb-4">
								<GeneralSettings/>
							</div> 
						</TabPanel>
						<TabPanel
							:class="['rounded-lg p-5', 'ring-white/60 ring-offset-0 ring-offset-blue-400 focus:outline-none focus:ring-0',]">

							<div class="mb-4 flex justify-between">
                <UsersTab />
							</div>
						</TabPanel>

						<TabPanel
							:class="['rounded-lg bg-[#F1F5F9] p-5', 'ring-white/60 ring-offset-0 ring-offset-blue-400 focus:outline-none focus:ring-0',]">
							<div class="mb-4 flex justify-between">
								<label class="text-gray-700 font-medium">Renew Subscription</label>
							</div>
						</TabPanel>

					</TabPanels>
				</TabGroup>
			</div>
		</div>
	</div>
	<div v-if="isloading"
		class="fixed top-0 w-full h-full left-0 flex items-center justifty-center bg-black bg-opacity-30 z-[999999]">
		<clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
			:color="'#fff'" :size="'50px'"></clip-loader>
	</div>
</template>