<template>
  <vue3-datatable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :totalRows="totalRows"
      :isServerMode="true"
      :pageSize="params.pagesize"
      :sortable="true"
      :sortColumn="params.sort_column"
      :sortDirection="params.sort_direction"
      @change="handleTableChange"
  >
    <template v-for="(slot, name) in slots" #[name]="slotProps">
      <component :is="slot" :slotProps="slotProps" />
    </template>
  </vue3-datatable>
</template>

<script setup lang="ts">
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const props = defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  totalRows: { type: Number, required: true },
  params: { type: Object, required: true },
  slots: { type: Object, default: () => ({}) },
});

const emits = defineEmits(["change"]);

const handleTableChange = (data: any) => {
  emits("change", data);
};
</script>
