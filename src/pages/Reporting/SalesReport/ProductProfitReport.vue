<script setup>
import ProductProfitReport from "@/components/Reporting/ProductProfitReport/index.vue"
</script>

<template>
    <div class="px-6 max-w-7xl mx-auto">
        <ProductProfitReport :full-height="false" :start_date="null" :end_date="null" />
    </div>
</template>