<script setup>
import { onMounted, ref, computed } from "vue";
import BackButton from "@/components/Base/Button/BackButton.vue"; 
import { BoxIcon, DollarSignIcon, AlertCircleIcon, ShoppingCart } from 'lucide-vue-next';
 
const locale = ref('en');

onMounted(() => {
    locale.value = localStorage.getItem('locale') || 'en';
})
</script>

<template>
    <div class="max-w-7xl mx-auto">
        <div v-if="$route.path === '/reporting/tax'"> 
            <back-button :to="{ name: 'ReportingDashboard' }" :label="$t('reporting.TaxReporting')" />
        </div>
        <div class="p-6">
            <div v-if="$route.path === '/reporting/tax'"> 
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Daily/Monthly Sales Report -->
                    <RouterLink to="/reporting/tax/tax-report"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <BoxIcon class="w-10 h-10 text-[#f96f02]" />
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.VATSummaryReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.descriptions.VATSuppliers')}}</p>
                    </RouterLink>  
                </div>
            </div> 
            <router-view></router-view>
        </div>
    </div> 
</template>
