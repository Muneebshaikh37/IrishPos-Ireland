<script setup>
import BackButton from "@/components/Base/Button/BackButton.vue";  
import TaxReports from "@/components/Reporting/TaxReports/index.vue"
</script>

<template>
    <back-button class="mb-8" :to="{ name: 'TaxReport' }" :label="$t('reporting.TaxReporting')" />

    <div class="px-6 max-w-7xl mx-auto"> 
        <TaxReports :full-height="false" :start_date="null" :end_date="null" />
    </div>
</template>