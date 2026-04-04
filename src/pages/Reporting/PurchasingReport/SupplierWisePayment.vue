<script setup>
import BackButton from "@/components/Base/Button/BackButton.vue";  
import SupplierWisePayment from "@/components/Reporting/SupplierWisePayment/index.vue"
</script>
 

<template>
    <div class="max-w-7xl mx-auto">
     <back-button class="mb-8 pl-[55px]" :to="{ name: 'PurchaseReport' }" :label="$t('reporting.PurchasesReports')" />
     <div class="px-14">
        <SupplierWisePayment :full-height="false" :start_date="null" :end_date="null" />
     </div>
    </div> 
     
     
</template>