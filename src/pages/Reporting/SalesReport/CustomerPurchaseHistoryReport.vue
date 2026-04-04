<script setup>  
import CustomerPurchaseHistory from "@/components/Reporting/CustomerPurchaseHistory/index.vue"
</script>

<template>  
    <div class="px-6 max-w-7xl mx-auto"> 
        <CustomerPurchaseHistory :full-height="false" :start_date="null" :end_date="null" />
    </div>
</template>