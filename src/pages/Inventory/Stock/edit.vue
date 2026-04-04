<script setup>

import {
	FormInput,
	FormLabel,
	FormTextarea,
} from "@/components/Base/Form";
import axios from "axios";
import Button from "@/components/Base/Button";
import { RouterLink } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import TomSelect from "@/components/Base/TomSelect";
import { onMounted, ref, reactive, watch, provide } from "vue";
import { Dialog, Menu } from "@/components/Base/Headless";
import apiService from '@/network/api/apiService';
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import Dropzone from "@/components/Base/Dropzone";
import router from "@/router";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"
import ErrorHandler from "@/utils/validation";
import Litepicker from "@/components/Base/Litepicker";
import EditStockCount from "@/components/InventoryStockCount/EditStockCount.vue";

const createStockCountForm = ref({
	count_name: "",
	count_date: "",
	notes: "", 
})

const isloading = ref(false)
const form = reactive(new ErrorHandler()); 
const fixedDate = ref(new Date().toISOString().split("T")[0]); 
onMounted(()=>{
	createStockCountForm.value.count_date = fixedDate.value
}) 
</script>

<template>
 
	<div class="flex items-center mt-8 intro-y">
		<RouterLink to="/inventory/stock-count">
			<Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
				<Lucide icon="ChevronLeft" class="w-5 h-5" />
			</Button>
		</RouterLink>
		<h2 class="mr-auto text-lg font-medium">{{ $t('stock-count.headingEdit') }}</h2>
	</div>
	<div class="grid grid-cols-12 gap-6 mt-5">
		<div class="col-span-12 intro-y lg:col-span-12">
			<div class="intro-y box p-8">
				<div class="grid grid-cols-12 gap-6">
					<div class="col-span-6">
						<FormLabel>{{ $t('stock-count.countName') }} <span class="text-danger "> *</span></FormLabel>
						<FormInput v-model="createStockCountForm.count_name" id="count_name" type="text" :placeholder="$t('stock-count.countName')" />
						<!-- :class="{'border-red-500': form.invalid('supplier_name')}"    
                        <template v-if="form.invalid('supplier_name')">
							<div class="mt-2 text-xs text-red-600">{{ form.getError('supplier_name') }}</div>
						</template> -->
					</div>
					<div class="col-span-6">
						 
					</div>
					<div class="col-span-12">
						<FormLabel>{{ $t('stock-count.notes') }} </FormLabel>
						<FormTextarea v-model="createStockCountForm.notes" class="py-2 pl-4   resize-none  " :rows="3"
							placeholder="Notes">
						</FormTextarea>
					</div>
					<div class="col-span-12">
						<EditStockCount :createStockCountForm="createStockCountForm" :form="form" :isloading="isloading"   @update-loading="isloading = $event" />
					</div> 
				</div>
			</div>
		</div>
	</div>


	<div v-if="isloading"
		class="fixed top-0 w-full h-full left-0 flex items-center justifty-center bg-black bg-opacity-30 z-[999999]">
		<clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true"
			:color="'#fff'" :size="'50px'"></clip-loader>
	</div>
</template>