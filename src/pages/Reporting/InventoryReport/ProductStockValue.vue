<script setup>
import BackButton from "@/components/Base/Button/BackButton.vue";  
import ProductStockReport from "@/components/Reporting/ProductStockReport/index.vue"
</script>
 

<template>
    <div class="max-w-7xl mx-auto">
     <back-button class="mb-8 pl-[55px]" :to="{ name: 'InventoryReport' }" :label="$t('reporting.InventoryReports')" />
     <div class="px-14">
        <ProductStockReport :full-height="false" :start_date="null" :end_date="null" />
     </div>
    </div>
     
     
</template>