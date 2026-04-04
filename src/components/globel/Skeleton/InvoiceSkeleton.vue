<template>
  <div class="p-8">
    <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
      <h1 class="text-base font-medium text-gray-600 mb-1 bg-gray-300 animate-pulse w-3/4 h-4 rounded-md"></h1>
      <h2 class="text-base font-medium text-gray-600 mb-1 bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h2>
      <h2 class="text-base font-medium text-gray-600 mb-1 bg-gray-300 animate-pulse w-1/3 h-4 rounded-md"></h2>
      <h3 class="text-base font-medium text-gray-600 bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h3>
    </div>
    <div class="py-6 border-dashed border-b border-gray-500">
      <h4 class="text-sm font-medium text-gray-600 mb-2 bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h4>
      <h4 class="text-sm font-medium text-gray-600 mb-2 bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
      <h4 class="text-sm font-medium text-gray-600 bg-gray-300 animate-pulse w-1/3 h-4 rounded-md"></h4>
    </div>
    <div class="py-4 border-dashed border-b border-gray-500">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead>
        <tr class="bg-gray-300 animate-pulse w-full h-6 rounded-md mb-4">
          <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tl-lg bg-gray-200"></th>
          <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium bg-gray-200"></th>
          <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium bg-gray-200"></th>
          <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium bg-gray-200"></th>
          <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium bg-gray-200"></th>
          <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium bg-gray-200"></th>
        </tr>
        </thead>
        <tbody>
        <tr class="animate-pulse bg-gray-100 h-6 mb-4">
          <td class="py-3 px-2 text-xs bg-gray-200"></td>
          <td class="py-3 px-2 text-xs bg-gray-200"></td>
          <td class="py-3 px-2 text-xs bg-gray-200"></td>
          <td class="py-3 px-2 text-xs bg-gray-200"></td>
          <td class="py-3 px-2 text-xs bg-gray-200"></td>
          <td class="py-3 px-2 text-xs bg-gray-200"></td>
        </tr>
        <!-- Repeat for more rows -->
        </tbody>
      </table>
    </div>
    <div class="py-4 border-dashed border-b border-gray-500">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-gray-800 font-medium bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
        <h4 class="text-gray-600 bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
      </div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-gray-800 font-medium bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
        <h4 class="text-gray-600 bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
      </div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-gray-800 font-medium bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
        <h4 class="text-gray-600 bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
      </div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-gray-800 font-medium bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
        <h4 class="text-gray-600 bg-gray-300 animate-pulse w-1/4 h-4 rounded-md"></h4>
      </div>
    </div>
    <div class="py-4">
      <h4 class="text-gray-600 font-medium text-center mb-4 mt-2 bg-gray-300 animate-pulse w-1/2 h-4 rounded-md"></h4>
      <div class="flex items-center justify-center">
        <div class="bg-gray-300 animate-pulse w-28 h-8 rounded-md"></div>
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