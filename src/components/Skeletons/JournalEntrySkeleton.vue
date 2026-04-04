<script setup>
defineProps({
  // Number of rows to show in the table
  rows: {
    type: Number,
    default: 3
  },
  // Whether to show the header skeleton
  showHeader: {
    type: Boolean,
    default: true
  },
  // Whether to show the table skeleton
  showTable: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div class="intro-y box">
    <div class="p-5">
      <!-- Header Skeleton -->
      <div v-if="showHeader" class="flex items-center mb-6">
        <div class="h-8 bg-gray-200 rounded animate-pulse w-8 mr-4"></div>
        <div class="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
      </div>
      
      <!-- Grid Layout Skeleton -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Date -->
        <div class="col-span-12 md:col-span-4">
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-16"></div>
          <div class="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        
        <!-- Transaction Type -->
        <div class="col-span-12 md:col-span-4">
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24"></div>
          <div class="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
        </div>
        
        <!-- Amount -->
        <div class="col-span-12 md:col-span-4">
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
          <div class="h-6 bg-gray-200 rounded animate-pulse w-28"></div>
        </div>
        
        <!-- Notes -->
        <div class="col-span-12 md:col-span-4">
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-16"></div>
          <div class="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
        
        <!-- Reference -->
        <div class="col-span-12 md:col-span-4">
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
          <div class="h-6 bg-gray-200 rounded animate-pulse w-36"></div>
        </div>
        
        <!-- Contact -->
        <div class="col-span-12 md:col-span-4">
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-16"></div>
          <div class="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
      </div>

      <!-- Journal Lines Table Skeleton -->
      <div v-if="showTable" class="mt-8">
        <div class="h-4 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm border">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-2 text-left"><div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div></th>
                <th class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div></th>
                <th class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div></th>
                <th class="p-2 text-left"><div class="h-4 bg-gray-200 rounded animate-pulse w-48"></div></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in rows" :key="i" :class="{ 'bg-gray-50': i % 2 === 0 }">
                <td class="p-2"><div class="h-4 bg-gray-200 rounded animate-pulse w-40"></div></td>
                <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
                <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
                <td class="p-2"><div class="h-4 bg-gray-200 rounded animate-pulse w-56"></div></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-gray-100 font-semibold">
                <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto"></div></td>
                <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
                <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
                <td class="p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template> 