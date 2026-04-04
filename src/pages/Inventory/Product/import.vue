<script setup lang="ts">
import Dropzone, { type DropzoneElement } from "../../../components/Base/Dropzone";
import { onMounted, ref, provide, reactive } from "vue";
import Lucide from "../../../components/Base/Lucide";
import Button from "../../../components/Base/Button";
import { RouterLink } from "vue-router";
import { Dialog, Menu } from "../../../components/Base/Headless";
import router from "../../../router";
import Notification from "../../../components/Base/Notification";
import Toastify from "toastify-js";
import ErrorHandler from "@/utils/validation";
import {useAuthStore} from "@/stores/auth";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const form = reactive(new ErrorHandler());
const dropzoneSingleRef = ref<DropzoneElement>();
const dropzoneMultipleRef = ref<DropzoneElement>();
const dropzoneValidationRef = ref<DropzoneElement>();
const deleteConfirmationModal = ref(false);
const isError = ref(false);
const deleteButtonRef = ref(null);
const closeDeleteModal = () => {
	deleteConfirmationModal.value = false;
};

const confirmDelete = () => {
	// Handle delete action here
	isError.value = false;
	deleteConfirmationModal.value = false;
	router.push("/inventory/products")

};
provide("bind[dropzoneSingleRef]", (el: DropzoneElement) => {
	dropzoneSingleRef.value = el;
});

provide("bind[dropzoneMultipleRef]", (el: DropzoneElement) => {
	dropzoneMultipleRef.value = el;
});

provide("bind[dropzoneValidationRef]", (el: DropzoneElement) => {
	dropzoneValidationRef.value = el;
});
const USERID = USER_ID;
onMounted(() => {
    const elDropzoneSingleRef = dropzoneSingleRef.value;
     // Replace with dynamic user ID if needed
    // const userId = USERID; // Replace with dynamic user ID if needed

    if (elDropzoneSingleRef) {
        elDropzoneSingleRef.dropzone.options.init = function () {
            this.on("sending", function (file, xhr, formData) {
                // Append additional data
                formData.append("user_id", USERID);
            });
        };

        elDropzoneSingleRef.dropzone.on("success", () => {
            deleteConfirmationModal.value = true;
        });

        elDropzoneSingleRef.dropzone.on("error", () => {
			isError.value = true;
            const failedEl = document
                .querySelectorAll("#failed-notification-content")[0]
                .cloneNode(true) as HTMLElement;
            failedEl.classList.remove("hidden");
            Toastify({
                node: failedEl,
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true,
            }).showToast();
        });
    }
});
const token: any = localStorage.getItem('token') || '';
const isListError = ref("");
const inventoryApiUrl = import.meta.env.VITE_PUBLIC_INVENTORY_API_URL || 'https://inventory.jaldi.app';
const importProductsUrl = `${inventoryApiUrl}api/v1/import-products`;
</script>
<template>
	<div class="grid grid-cols-12 gap-6 mt-5">
		<div class="col-span-12 intro-y lg:col-span-12">
			<!-- BEGIN: Single File Upload -->
			<div class="flex flex-col items-center p-5 border-b sm:flex-row border-slate-200/60 dark:border-darkmode-400">
				<h2 class="mr-auto text-base font-semibold">Import File</h2>
			</div>
			<div class="w-full flex justify-between intro-y px-5">
				<div>
					<RouterLink to="/inventory/products">
						<Button variant="primary" class="mr-2 shadow-md">
							Back
						</Button>
					</RouterLink>
				</div>
			</div>
			<div class="p-5 bg-white shadow-md rounded-lg w-[800px] mx-auto mt-2 upload-detail">
				<Dropzone refKey="dropzoneSingleRef" :options="{
					url: importProductsUrl,
					thumbnailWidth: 150,
					maxFilesize: 0.5,
					maxFiles: 1,
					addRemoveLinks: true,
					acceptedFiles: '.xls,.xlsx',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					init() {
							this.on('sending', (file, xhr, formData) => {
								formData.append('user_id', USERID);
							});
							this.on('error', (file, errorMessage, xhr) => {
								if (xhr) {
									const response = JSON.parse(xhr.responseText);
									isListError = response.errors;
								} else {
									console.error(errorMessage);
								}
							});
						}
						}" class="dropzone">
					<div class="flex justify-center py-8">
						<Lucide icon="Upload" class="w-10 h-10" />
					</div>
					<div class="text-lg font-medium">
						Drop files here or click to upload.
					</div>
					<div class="text-gray-600">
						Selected files
					</div>
				</Dropzone>
				<template v-if="isListError">
					<div class="mt-4 pl-4">
						<ul class="list-disc text-sm mb-0.5 text-red-600" v-for="(error, index) in isListError" :key="index">
						  <li  v-for="(innerError, index) in error" :key="index">
							{{ innerError }}
						  </li>
					    </ul>
					</div>
				</template>
			</div>
		</div>
	</div>
	<!-- Delete Confirmation Modal -->
	<Dialog :open="deleteConfirmationModal" @close="closeDeleteModal" :initialFocus="deleteButtonRef">
		<Dialog.Panel>
			<div class="p-5 text-center">
				<Lucide icon="BadgeCheck" class="w-16 h-16 mx-auto mt-3 text-green-500 " />
				<div class="mt-5 text-3xl">File Update successful</div>
				<div class="mt-2 text-slate-500">
					Effortlessly upload and manage your files.
				</div>
			</div>
			<div class="px-5 pb-8 text-center">

				<Button variant="success" type="button" class="w-24 ml-4 text-white" ref="deleteButtonRef"
					@click="confirmDelete">
					ok
				</Button>
			</div>
		</Dialog.Panel>
	</Dialog>

	<Notification id="failed-notification-content" class="flex hidden">
		<Lucide icon="XCircle" class="text-danger" />
		<div class="ml-4 mr-4">
			<div class="font-medium">No more files please!</div>
			<div class="mt-1 text-slate-500">Already Upload data.</div>
		</div>
	</Notification>
</template>
<style>
.upload-detail .dz-error-message {
    display: none !important;
}
.upload-detail .dz-error-mark {
    display: none !important;
}
</style>
