<template>
  <div class="p-8">
    <!-- Header Section -->
    <div class="border-b border-gray-300 mb-4 pt-4 relative">
      <h4 class="text-lg font-medium text-gray-700 pb-3 px-6 text-center">
        <span class="bg-gray-300 animate-pulse w-1/2 h-5 rounded-md"></span>
      </h4>
      <span class="flex justify-center items-center absolute top-4 right-4 cursor-pointer border border-gray-500 rounded-full p-0.5">
        <div class="bg-gray-300 animate-pulse w-6 h-6 rounded-full"></div>
      </span>
    </div>

    <!-- Balance Overview Section -->
    <div class="grid grid-cols-12 gap-6 mt-5 px-8">
      <div class="col-span-6">
        <h5 class="bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h5>
        <h3 class="bg-gray-300 animate-pulse w-1/3 h-5 rounded-md"></h3>
      </div>

      <div class="col-span-6">
        <h5 class="bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h5>
        <div class="flex justify-between mt-2">
          <div>
            <h5 class="bg-gray-300 animate-pulse w-1/3 h-4 rounded-md"></h5>
            <h3 class="bg-gray-300 animate-pulse w-1/4 h-5 rounded-md"></h3>
          </div>
          <div>
            <h5 class="bg-gray-300 animate-pulse w-1/3 h-4 rounded-md"></h5>
            <h3 class="bg-gray-300 animate-pulse w-1/4 h-5 rounded-md"></h3>
          </div>
        </div>
      </div>

      <div class="col-span-6"></div>

      <div class="col-span-6">
        <div class="flex justify-between">
          <div>
            <h5 class="bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h5>
            <h3 class="bg-gray-300 animate-pulse w-1/3 h-5 rounded-md"></h3>
          </div>
          <div>
            <h5 class="bg-gray-300 animate-pulse w-1/3 h-4 rounded-md"></h5>
            <h3 class="bg-gray-300 animate-pulse w-1/4 h-5 rounded-md"></h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Summary Section -->
    <div class="grid grid-cols-12 gap-6 mt-5 mx-8 bg-[#F7F8FA] p-4 rounded-lg">
      <div class="col-span-6">
        <h5 class="bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h5>
        <h3 class="bg-gray-300 animate-pulse w-1/3 h-5 rounded-md"></h3>
      </div>
      <div class="col-span-6">
        <h5 class="bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h5>
        <h3 class="bg-gray-300 animate-pulse w-1/3 h-5 rounded-md"></h3>
      </div>
    </div>

    <!-- Cash Recording Table Section -->
    <div class="p-8 pt-6">
      <div class="border border-gray-200 rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead>
          <tr class="bg-gray-300 animate-pulse h-6">
            <th class="px-4 py-3 bg-gray-200"></th>
            <th class="px-4 py-3 bg-gray-200"></th>
            <th class="px-4 py-3 bg-gray-200"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="n in 3" :key="n" class="animate-pulse bg-gray-100 h-6">
            <td class="py-3 px-4 bg-gray-200"></td>
            <td class="py-3 px-4 bg-gray-200"></td>
            <td class="py-3 px-4 bg-gray-200"></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}
</style>
