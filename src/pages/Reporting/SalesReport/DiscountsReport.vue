<script setup> 
import DiscountsReport from "@/components/Reporting/DiscountsReport/index.vue";
</script>

<template> 

    <div class="px-6 max-w-7xl mx-auto"> 
        <DiscountsReport :full-height="false" :start_date="null" :end_date="null" />
    </div>
</template>