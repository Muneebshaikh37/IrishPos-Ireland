<template>
  <QuotationComponent :showOpenRegisterButton="false" />
</template>

<script setup lang="ts">
import QuotationComponent from "@/components/pos/QuotationComponent.vue";
</script>
<style scoped>
/* Ensure table cells don't clip dropdowns */
:deep(.vue3-datatable table td) {
  overflow: visible !important;
  position: relative;
}

:deep(.vue3-datatable table th) {
  overflow: visible !important;
  position: relative;
}

:deep(.vue3-datatable table tr) {
  overflow: visible !important;
}

:deep(.vue3-datatable table tbody) {
  overflow: visible !important;
}

:deep(.vue3-datatable table thead) {
  overflow: visible !important;
}

:deep(.vue3-datatable table) {
  overflow: visible !important;
}

:deep(.vue3-datatable) {
  overflow: visible !important;
}

/* Ensure parent containers don't clip */
.quotation-status-wrapper {
  overflow: visible !important;
  position: relative !important;
  z-index: 1;
}

/* Make sure the table wrapper doesn't clip */
:deep(.vue3-datatable-wrapper) {
  overflow: visible !important;
}

/* Ensure the box container doesn't clip */
:deep(.box) {
  overflow: visible !important;
}
</style>
<style>
@media print {
  /* Set page size and margins */
  @page {
    size: auto;
    margin: -10mm 0mm -10mm -6mm;
  }

  #app {
    display: none;
  }

  /* Enlarge the QR code image */
  .qr-code {
    width: 100% !important; /* Adjust this value as needed */
    height: auto;
  }

  /* Increase overall text size for the quotation */
  .invoice-container {
    font-size: 16px !important;
    font-weight: bold;
    page-break-before: always !important;
  }

  /* Specifically increase the text size for table cells in the items list */
  .items-list td, .items-list th {
    font-size: 12px !important;
  }
  .invoice-container .items-list {
   page-break-inside: avoid;
   page-break-after: auto;
  }
}
</style>
