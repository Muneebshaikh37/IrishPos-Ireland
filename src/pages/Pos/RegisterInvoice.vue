<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <RouterLink :to="{ name: 'Register Close', params: { registerId: registerId }}">
          <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
            <Lucide icon="ChevronLeft" class="w-5 h-5"/>
          </Button>
        </RouterLink>
        <h1 class="text-lg font-medium">{{ $t('invoices.saleInvoice') }}</h1>
      </div>
      <div class="flex items-center">
        <AddWithdraw/>
      </div>
    </div>

    <div class="tabs">
      <button
          class="tab"
          :class="{ 'active': activeTab === 'selling' }"
          @click="activeTab = 'selling'"
      >
        {{ $t('invoices.selling') }}
      </button>
      <button
          class="tab"
          :class="{ 'active': activeTab === 'invoices' }"
          @click="activeTab = 'invoices'"
      >
        {{ $t('invoices.invoices') }}
      </button>
      <button
          class="tab"
          :class="{ 'active': activeTab === 'returns' }"
          @click="activeTab = 'returns'"
      >
        {{ $t('invoices.returnInvoice') }}
      </button>
    </div>

    <!-- Tab Navigation -->
<!--    <div class="flex border-b border-gray-200 mb-6">-->
<!--      <button-->
<!--          class="px-4 py-2 -mb-px text-sm font-medium focus:outline-none"-->
<!--          :class="activeTab === 'selling' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'"-->
<!--          @click="activeTab = 'selling'"-->
<!--      >-->
<!--        {{ $t('invoices.selling') }}-->
<!--      </button>-->
<!--      <button-->
<!--          class="px-4 py-2 -mb-px text-sm font-medium focus:outline-none"-->
<!--          :class="activeTab === 'invoices' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'"-->
<!--          @click="activeTab = 'invoices'"-->
<!--      >-->
<!--        {{ $t('invoices.invoices') }}-->
<!--      </button>-->
<!--      <button-->
<!--          class="px-4 py-2 -mb-px text-sm font-medium focus:outline-none"-->
<!--          :class="activeTab === 'returns' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'"-->
<!--          @click="activeTab = 'returns'"-->
<!--      >-->
<!--        {{ $t('invoices.returnInvoice') }}-->
<!--      </button>-->
<!--    </div>-->

    <!-- Tab Content -->
    <div>

      <SellingComponent v-if="activeTab === 'selling' && ability.can('create', 'invoice')" :registerId="registerId" />
      <div v-if="activeTab === 'selling' && !ability.can('create', 'invoice')">
        <AccessDenied/>
      </div>

      <InvoicesComponent  :registerId="registerId" v-if="activeTab === 'invoices'" />
      <ReturnInvoices  :registerId="registerId" v-if="activeTab === 'returns'" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AddWithdraw from "@/components/pos/AddWithdraw.vue";
import SellingComponent from "@/components/pos/SellingComponent.vue";
import InvoicesComponent from "@/components/pos/InvoicesComponent.vue";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import ReturnInvoices from "@/components/pos/ReturnInvoices.vue";
import {useAbility} from "@casl/vue";
import AccessDenied from "../../components/AccessDenied/index.vue"
// Props
const props = defineProps({
  registerId: {
    type: String,
    required: true,
  },
});
const ability = useAbility();
const route = useRoute();
const router = useRouter();
// Reactive state for active tab
const activeTab = ref(route.query.tab || "selling"); // Read from query or default to 'selling'

// Watch for tab changes and update query in the URL
watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } }); // Keep URL updated
});
</script>
<style>
.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #ed8936;
  border-bottom-color: #ed8936;
}

.tab-content {
  padding: 1rem 0;
}
</style>
