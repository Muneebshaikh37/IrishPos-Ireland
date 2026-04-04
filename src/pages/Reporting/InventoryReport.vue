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
        <div v-if="$route.path === '/reporting/inventory'"> 
            <back-button :to="{ name: 'ReportingDashboard' }" :label="$t('reporting.InventoryReports')" />
        </div>
        <div class="p-6">
            <div v-if="$route.path === '/reporting/inventory'"> 
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Daily/Monthly Sales Report -->
                    <RouterLink to="/reporting/inventory/report"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <BoxIcon class="w-10 h-10 text-[#f96f02]" />
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.InventoryLevelReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.descriptions.InventoryLevelReport')}}</p>
                    </RouterLink> 
                    <!-- Daily/Monthly Sales Report -->
                    <RouterLink to="/reporting/inventory/products-stock"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <DollarSignIcon class="w-10 h-10 text-[#f96f02]" />
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.ProductsStockValueReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.descriptions.ProductsStockValueReport')}}</p>
                    </RouterLink>
                    <RouterLink to="/reporting/inventory/products-dead-items"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <AlertCircleIcon class="w-10 h-10 text-[#f96f02]" />
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.DeadItemsLowSalesProductsReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.descriptions.DeadItemsLowSalesProductsReport')}}</p>
                    </RouterLink>
                    <RouterLink to="/reporting/inventory/top-selling-product"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <ShoppingCart class="w-10 h-10 text-[#f96f02]" />
                            
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.TopSellingProductsReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.descriptions.TopSellingProductsReport')}}</p>
                    </RouterLink>
                    <RouterLink to="/reporting/inventory/stock-count-report"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <ShoppingCart class="w-10 h-10 text-[#f96f02]" />
                            
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.StockCountReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.descriptions.StockCountReport')}}</p>
                    </RouterLink>
                    <RouterLink to="/reporting/inventory/stock-adjustment-report"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
                        <div class="flex justify-center mb-4">
                            <ShoppingCart class="w-10 h-10 text-[#f96f02]" />
                            
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.StockAdjustmentReport')}}</h3>
                        <p class="text-sm text-gray-600">{{$t('reporting.descriptions.StockAdjustmentReport')}}</p>
                    </RouterLink>
 
                </div>
            </div>

            <!-- Nested router-view for child components -->
            <router-view></router-view>
        </div>
    </div>
    <!-- <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               
                <ReportCard :to="{ name: 'Inventory Leve Report' }" title="Inventory Level Report"
                    description="View stock levels by category, subcategory, and brand." :icon="BoxIcon" />

              
                <ReportCard :to="{ name: 'StockLevelsReport' }" title="Products Stock Value Report"
                    description="View total inventory value and distribution by category." :icon="DollarSignIcon" />

                
                <ReportCard :to="{ name: 'StockLevelsReport' }" title="Dead Items/Low Sales Products Report"
                    description="View products with little to no sales." :icon="AlertCircleIcon" />
            </div>
        </div> -->
</template>
