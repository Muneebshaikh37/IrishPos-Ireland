<script setup>  
import WorkerPerformance from "@/components/Reporting/WorkerPerformance/index.vue"
import BackButton from "@/components/Base/Button/BackButton.vue"
</script>

<template>  
    <back-button class="mb-8" :to="{ name: 'ReportingDashboard' }" :label="$t('reporting.dashboard')" />
    <div class="px-6 max-w-7xl mx-auto"> 
        <WorkerPerformance   />
    </div>
</template>

