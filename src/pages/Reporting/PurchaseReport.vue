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
        <div v-if="$route.path === '/reporting/purchases'"> 
            <back-button :to="{ name: 'ReportingDashboard' }" :label="$t('reporting.PurchasesReports')" />
        </div>
        <div class="p-6">
            <div v-if="$route.path === '/reporting/purchases'"> 
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Daily/Monthly Sales Report -->
                    <RouterLink to="/reporting/purchases/purchase-summary"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <BoxIcon class="w-10 h-10 text-[#f96f02]" /> 
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.PurchaseSummaryReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.Overviewofpurchases')}}</p>
                    </RouterLink> 
                   
                     <RouterLink to="/reporting/purchases/supplier-wise-purchase"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <DollarSignIcon class="w-10 h-10 text-[#f96f02]"/>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.SupplierWisePurchaseReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.Purchasesgroupedbysuppliers')}}</p>
                    </RouterLink>
                   <RouterLink to="/reporting/purchases/return-supplier"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <AlertCircleIcon class="w-10 h-10 text-[#f96f02]" />
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.ReturnToSupplierReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.DetailedAnalysis')}}</p>
                    </RouterLink>
                      <RouterLink to="/reporting/purchases/supplier-wise-payment"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <ShoppingCart class="w-10 h-10 text-[#f96f02]" />
                            
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.SupplierwisePaymentReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.DetailedAnalysis')}}</p>
                    </RouterLink>  
 
                </div>
            </div>

            <!-- Nested router-view for child components -->
            <router-view></router-view>
        </div>
    </div> 
</template>
