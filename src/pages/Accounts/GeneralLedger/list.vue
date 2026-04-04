<script setup>
import { ref, onMounted } from 'vue';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import Lucide from '../../../components/Base/Lucide';
import { FormInput } from '../../../components/Base/Form';
import httpClient from '@/network/api/httpClient';
import LoadingIcon from '../../../components/Base/LoadingIcon';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from "@/stores/auth.js";
import GeneralLedgerSkeleton from '../../../components/Skeletons/GeneralLedgerSkeleton.vue';
const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;
const { t } = useI18n();
const expandedKeys = ref({});
const loading = ref(false);
const searchQuery = ref('');
let searchTimer = null;

const generalLedger = ref([]);

// API endpoint
const apiUrl = `${import.meta.env.VITE_ACCOUNTING_API}/general-ledger`;

// Transform API data to TreeTable format
function transformData(data) {
  return data.map(account => ({
    key: account.id,
    data: {
      name: `${account.name} - ${account.code}`,
      debit: account.debit,
      credit: account.credit,
      balance: account.balance,
      isTransaction: false,
    },
    children:  [],
  }));
}

const handleSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchGeneralLedger();
  }, 300);
};

async function fetchGeneralLedger() {
  loading.value = true;
  try {
    const params = {
      user_id: USER_ID,
      search: searchQuery.value
    };
    const res = await httpClient.get(apiUrl, { params });
    generalLedger.value = transformData(res.data.data);
  } catch (e) {
    generalLedger.value = [];
    console.error('Error fetching general ledger:', e);
  }
  loading.value = false;
}

onMounted(() => {
  fetchGeneralLedger();
});
</script>

<template>
  <h2 class="mt-10 text-xl font-semibold intro-y">{{ t('account.GeneralLedger') }}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8 coa-style">
    <div class="col-span-12 flex justify-between intro-y">
      <div></div>
      <div class="flex items-center mt-3 sm:mt-0">
        <div class="relative w-56 text-slate-500">
          <FormInput 
            v-model="searchQuery" 
            type="text" 
            class="w-56 pr-10 !box" 
            :placeholder="$t('product.searchPlaceholder')" 
            @input="handleSearch"
          />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>
    <div class="col-span-12">
      <div v-if="loading">
         <GeneralLedgerSkeleton :rows="5" />
       </div>
      <TreeTable v-else :value="generalLedger" :expandedKeys="expandedKeys" @update:expandedKeys="val => expandedKeys = val" :tableStyle="{ minWidth: '60rem' }">
        <Column field="name" header="Account Name" class="p-treetable-header" expander>
          <template #body="slotProps">
            <span v-if="!slotProps.node.data.isTransaction">{{ slotProps.node.data.name }}</span>
            <span v-else class="ml-6 text-sm text-gray-500">{{ slotProps.node.data.name }}
            </span>
          </template>
        </Column>
        <Column field="debit" header="Debit" class="p-treetable-header">
          <template #body="slotProps">
            <RouterLink v-if="slotProps.node.data.debit !== 0" class="text-blue-500 underline" :to="`/account/general-ledger/${slotProps.node.key}/view`">
                <span>{{ slotProps.node.data.debit?.toFixed(2) }}</span>
            </RouterLink>
            <span v-else>--</span>
          </template>
        </Column>
        <Column field="credit" header="Credit" class="p-treetable-header">
          <template #body="slotProps">
            <span v-if="slotProps.node.data.credit === 0">--</span>
            <RouterLink v-else class="text-blue-500 underline" :to="`/account/general-ledger/${slotProps.node.key}/view`">
              <span>{{ slotProps.node.data.credit?.toFixed(2) }}</span>
            </RouterLink>
          </template>
        </Column>
        <Column field="balance" header="Balance" class="p-treetable-header">
          <template #body="slotProps">
            <span v-if="slotProps.node.data.balance === 0">--</span>
            <RouterLink v-else class="text-blue-500 underline" :to="`/account/general-ledger/${slotProps.node.key}/view`">  
                <span :class="{ 'text-red-500': slotProps.node.data.balance < 0 }">
                    {{ slotProps.node.data.balance?.toFixed(2) || '0.00' }}
                </span>
            </RouterLink>   
          </template>
        </Column>
      </TreeTable>
    </div>
  </div>
</template>

<style>
.coa-style th.p-treetable-header-cell  {
    border: none !important;
    padding: 18px 14px;
    background: #f6f7fa;
}
.coa-style .p-treetable-header {
    border-bottom: 1px solid #e9e8e8 !important;
    padding: 18px 14px;
}
.coa-style  button.p-treetable-node-toggle-button {
    margin-right: 20px;
}
</style>
