<template>
  <div class="max-w-7xl mx-auto">
    <!-- Back Button (visible only when a child route is active) -->
    <div v-if="$route.path !== '/reporting/sales'" class="mb-6">
      <back-button :to="{ name: 'SalesReport' }" :label="$t('reporting.SalesReports')" />
    </div>
    <div v-else>
      <back-button :to="{ name: 'ReportingDashboard' }" :label="$t('reporting.SalesReports')" />
    </div>

    <!-- Display the report links only if no child route is active -->
    <div v-if="$route.path === '/reporting/sales'" class="px-6 mt-8">
      <!-- <h1 class="text-3xl font-bold text-gray-800 mb-8">{{$t('reporting.SalesReports')}}  </h1> -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Daily/Monthly Sales Report -->
  <RouterLink to="/reporting/sales/daily-monthly-sales"
              class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
    <div class="flex justify-center mb-4">
      <CalendarIcon class="w-10 h-10 text-[#f96f02]" />
    </div>
    <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.DailyMonthlySalesReport')}}</h3>
    <p class="text-sm text-gray-600">{{$t('reporting.descriptionsSale.DailyMonthlySalesReport')}}</p>
  </RouterLink>

  <!-- Customer Purchase History Report -->
  <RouterLink to="/reporting/sales/customer-purchase-history"
              class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
    <div class="flex justify-center mb-4">
      <UsersIcon class="w-10 h-10 text-[#f96f02]" />
    </div>
    <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.CustomerPurchaseHistoryReport')}}</h3>
    <p class="text-sm text-gray-600">{{$t('reporting.descriptionsSale.CustomerPurchaseHistoryReport')}}</p>
  </RouterLink>

  <!-- Sales Performance by Product -->
  <RouterLink to="/reporting/sales/sales-performance"
              class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
    <div class="flex justify-center mb-4">
      <TrendingUpIcon class="w-10 h-10 text-[#f96f02]" />
    </div>
    <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.SalesPerformanceByProduct')}}</h3>
    <p class="text-sm text-gray-600">{{$t('reporting.descriptionsSale.SalesPerformanceByProduct')}}</p>
  </RouterLink>

  <!-- Sales Performance by Services -->
  <RouterLink to="/reporting/sales/sales-performance-by-services"
              class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
    <div class="flex justify-center mb-4">
      <TrendingUpIcon class="w-10 h-10 text-[#f96f02]" />
    </div>
    <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.SalesPerformanceByServices')}}</h3>
    <p class="text-sm text-gray-600">{{$t('reporting.descriptionsSale.SalesPerformanceByServices')}}</p>
  </RouterLink>

  <!-- Discounts Report -->
  <RouterLink to="/reporting/sales/discounts"
              class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
    <div class="flex justify-center mb-4">
      <TagIcon class="w-10 h-10 text-[#f96f02]" />
    </div>
    <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.DiscountsReport')}}</h3>
    <p class="text-sm text-gray-600">{{$t('reporting.descriptionsSale.DiscountsReport')}}</p>
  </RouterLink>

  <!--Product Profit-->
  <RouterLink to="/reporting/sales/product-profit"
              class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#f96f02] text-center">
    <div class="flex justify-center mb-4">
      <TagIcon class="w-10 h-10 text-[#f96f02]" />
    </div>
    <h3 class="text-xl font-semibold text-gray-800 mb-2">{{$t('reporting.productProfit')}}</h3>
    <p class="text-sm text-gray-600">{{$t('reporting.descriptionsSale.productProfit')}}</p>
  </RouterLink>
</div>
    </div>

    <!-- Nested router-view for child components -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import {
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  TagIcon,
  ArrowLeftIcon,
} from 'lucide-vue-next';
import BackButton from "@/components/Base/Button/BackButton.vue";

</script>
