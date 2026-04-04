<script setup>
defineProps({
  // Number of rows to show in the table
  rows: {
    type: Number,
    default: 5
  }
});
</script>

<template>
  <div class="   coa-style">
    <!-- Search Bar Skeleton -->
    

    <!-- Table Skeleton -->
    <div class="col-span-12">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr>
              <th class="p-treetable-header-cell p-2"><div class="h-4 bg-gray-200 rounded animate-pulse w-48"></div></th>
              <th class="p-treetable-header-cell p-2"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></th>
              <th class="p-treetable-header-cell p-2"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></th>
              <th class="p-treetable-header-cell p-2"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in rows" :key="i" :class="{ 'bg-gray-50': i % 2 === 0 }">
              <td class="p-2">
                <div class="flex items-center">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-6 mr-4"></div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                </div>
              </td>
              <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
              <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
              <td class="p-2 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coa-style th.p-treetable-header-cell {
  border: none !important;
  padding: 18px 14px;
  background: #f6f7fa;
}
.coa-style .p-treetable-header {
  border-bottom: 1px solid #e9e8e8 !important;
  padding: 18px 14px;
}
</style> 