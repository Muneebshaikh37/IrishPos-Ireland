<script setup>
import {ref} from "vue"
import BackButton from "@/components/Base/Button/BackButton.vue";  
import ProductSellingProduct from "@/components/Reporting/TopSellingProduct/index.vue"

const start_date = ref("")
const end_date = ref("")
</script>

<template>
    <div class="max-w-7xl mx-auto">
     <back-button class="mb-8 pl-[55px]" :to="{ name: 'InventoryReport' }" :label="$t('reporting.InventoryReports')" />
     <div class="px-14">
        <ProductSellingProduct :full-height="false" :start_date="start_date" :end_date="end_date" />
     </div>
    </div>
     
     
</template>