<script setup>
import BackButton from "@/components/Base/Button/BackButton.vue";  
import StockCountReport from "@/components/Reporting/StockCountReport/index.vue"
</script>

<template>
    <back-button class="mb-8" :to="{ name: 'InventoryReport' }" :label="$t('reporting.InventoryReports')" />

    <div class="px-6 max-w-7xl mx-auto"> 
        <StockCountReport :full-height="false" :start_date="null" :end_date="null" />
    </div>
</template>