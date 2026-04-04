<template>
  <div class=" outline-dashed border-[#C1C1C1] hover:border-[#011938] rounded-md  w-[800px] mx-auto py-6">
    <!-- Existing code for uploaded files preview -->
     <div class="w-[600px] flex mx-auto">
      <div class="">
      <div class="w-[600px]">
       <div v-if="previewUrls.length > 0" class="flex">
        <!-- Loop through files and display file names -->
        <div v-for="(file, index) in previewUrls" :key="index"
          class="relative rounded-lg flex w-full h-8 border my-1 mx-4 mb-4 border-[#C1C1C1] hover:border-[#011938] cursor-pointer">
          <svg @click="removeFile(index)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-6 h-6 absolute right-1 top-1 cursor-pointer ml-3">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <!-- Display file name -->
          <div class="w-full rounded-lg">
            <div class="h-full flex items-center text-sm pl-1 rounded-lg">
              <div v-if="file" class="text-black truncate block w-[50px] rounded-lg">
                File
              </div>
              <div v-else class="text-black">
                No image found ...
              </div>
            </div>
          </div>
        </div>
       </div>
       <div v-else>
        <p class="text-lg font-medium text-center mb-4">  Click to upload Images. </p>
       </div>
    </div>
    <!-- Drop area for file upload -->
    <label class="flex items-end justify-end cursor-pointer h-[40px] relative transition-all duration-300 mx-auto">
      <div 
        class=" flex justify-center w-full ">
        <Button variant="primary" size="sm" class="shadow-md  ">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        </Button>
      </div>
      <input ref="fileInput" @change="getFile" type="file"
        class=" absolute w-full h-full top-0 left-0 opacity-0 cursor-pointer" />
    </label>

     </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "@/components/Base/Button";
const props = defineProps({
  label: String,
  buttonText: String,
  fileProp: Array,
  imageRoute: String,
});

const previewUrls = ref<string[]>([]);
const files = ref<File[]>([]);
const filePropArray: any = ref([]);
// const emitArray = ref<string[]>([]);
const emit = defineEmits(["returnFile", "removedFile"]);

// Method to handle file selection
const getFile = (ev: Event) => {
  const input = ev.target as HTMLInputElement;
  if (input.files?.length) {
    Array.from(input.files).forEach((file) => handleFile(file));
    input.value = ""; // Reset input value
  }
};

const removeFile = (index: number) => {
  // console.log({ emitArray:  emitArray.value});
  if (index >= 0 && index < previewUrls.value.length) {
    // console.log({ RemovedImage: previewUrls.value });
    previewUrls.value.splice(index, 1);
    // console.log({ RemovedImage: previewUrls.value });
    files.value.splice(index, 1);
    emit("returnFile", files.value);
  }
};

// Method to handle individual file
const handleFile = (file: any) => {
  previewUrls.value = []
  // console.log("adf", file)
  const reader = new FileReader();
  reader.onload = (ev: ProgressEvent<FileReader>) => {
    if (ev.target && ev.target.result) {
      console.log({ Event: ev?.target });
      previewUrls.value.push(ev.target.result as string);
    }
  };
  reader.onerror = (ev: ProgressEvent<FileReader>) => {
    console.error("File reading error:", ev.target?.error);
  };
  reader.readAsDataURL(file);
  files.value.push(file);
  emit("returnFile", files.value);
};

onMounted(() => {
  if (props.fileProp) {
    props.fileProp.forEach((image: any) => {
      // console.log({fileProp: image})
      let url = "";
      if (props.imageRoute == "users") {
        url =
          "https://api_westcaprealestate.ttech.app/storage/user/" + image.image;
      }
      filePropArray.value.push(image);
      if (typeof url === "string") {
        // Simulate a file object for existing files
        previewUrls.value.push(image.image);
      }
    });
  }
  console.log({ previewUrls: previewUrls.value });
  // console.log({Files: files.value})
});
</script>
