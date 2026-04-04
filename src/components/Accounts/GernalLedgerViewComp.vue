<script setup lang="ts">
import { ref, reactive, defineProps, computed, defineEmits, watch } from 'vue';
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const totalRows = ref(0);
const search = ref("");

const columns = [
  { field: "entry_date", title: "Date" },
  { field: "transaction_type", title: "Type" },
  { field: "referenceable_id", title: "Reference ID" },
  { field: "entry_number", title: "Entry Number" },
  { field: "accountName", title: "Account Name" },
  { field: "debit", title: "Debit" },
  { field: "credit", title: "Credit" },
  { field: "description", title: "Description" },
  { field: "balance", title: "Balance" },
];

interface Transaction {
  entry_date: string;
  transaction_type: string;
  referenceable_id: number;
  referenceable_type: string;
  entry_number: string;
  account: { name: string };
  debit: number;
  credit: number;
  description: string;
}

const emit = defineEmits(['update:search', 'page-change']);

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  meta: { type: Object, default: () => ({}) },
  links: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  search: { type: String, default: '' },
});

const localSearch = ref(props.search);
watch(() => props.search, (val) => { localSearch.value = val; });

const onSearch = () => {
  emit('update:search', localSearch.value);
};

const onPageChange = (page) => {
  emit('page-change', page);
};

const transactions = computed(() => props.transactions);

</script>

<template>
  <div class=""> 
    <div class="overflow-x-auto rounded-lg bg-white">
      <vue3-datatable
        :rows="transactions"
        :columns="columns"
        :loading="loading"
        :total-rows="props.meta.total || transactions.length"
        :is-server-mode="true"
        :page-size="props.meta.per_page || 10"
        :sortable="true"
        :search="localSearch"
        :current-page="props.meta.current_page || 1"
        @page-change="onPageChange"
      >
        <template #entry_date="{ value }">
          <div class="text-sm text-gray-700">{{ value.entry_date }}</div>
        </template>
        
        

        <template #accountName="{ value }">
          <div class="text-sm text-gray-700">{{ value.account.name }}</div>
        </template>

        <template #debit="{ value }">
          <div class="text-sm text-gray-700">{{ value.debit }}</div>
        </template>

        <template #credit="{ value }">
          <div class="text-sm text-gray-700">{{ value.credit }}</div>
        </template>

        <template #balance="{ value }">
          <div class="text-sm text-gray-700">{{ Math.abs(value.debit - value.credit) }}</div>
        </template>
      </vue3-datatable>
      <div v-if="props.meta && props.meta.last_page > 1" class="flex gap-2 mt-2 justify-end">
        <button
          :disabled="props.meta.current_page === 1"
          @click="onPageChange(props.meta.current_page - 1)"
          class="px-2 py-1 border rounded disabled:opacity-50"
        >Prev</button>
        <span>Page {{ props.meta.current_page }} of {{ props.meta.last_page }}</span>
        <button
          :disabled="props.meta.current_page === props.meta.last_page"
          @click="onPageChange(props.meta.current_page + 1)"
          class="px-2 py-1 border rounded disabled:opacity-50"
        >Next</button>
      </div>
    </div>
  </div>
</template>
  

  
 
  