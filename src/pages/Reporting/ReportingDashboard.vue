<script setup>
import ReportCard from "@/components/ReportingDashboard/ReportCard.vue";
import { PackageIcon, ShoppingCartIcon, TruckIcon, ReceiptIcon, CalculatorIcon, UsersIcon } from "lucide-vue-next";
</script>

<template>
    <div class="p-6 max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">{{ $t('reporting.dashboard') }}</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard :to="{ name: 'InventoryReport' }" :title="$t('reporting.inventory.title')"
                :description="$t('reporting.inventory.description')" :icon="PackageIcon" />

            <ReportCard :to="{ name: 'SalesReport' }" :title="$t('reporting.sales.title')"
                :description="$t('reporting.sales.description')" :icon="ShoppingCartIcon" />

            <ReportCard :to="{ name: 'PurchaseReport' }" :title="$t('reporting.purchasing.title')"
                :description="$t('reporting.purchasing.description')" :icon="TruckIcon" />

            <ReportCard :to="{ name: 'TaxReport' }" :title="$t('reporting.tax.title')"
                :description="$t('reporting.tax.description')" :icon="ReceiptIcon" />

            <ReportCard :to="{ name: 'TrialBalanceReport' }" :title="$t('reporting.TrialBalance')"
                :description="$t('reporting.TrialBalanceReport')" :icon="CalculatorIcon" />

            <ReportCard :to="{ name: 'BalanceSheetReport' }" :title="$t('reporting.BalanceSheet')"
                :description="$t('reporting.BalanceSheetReport')" :icon="CalculatorIcon" />

            <ReportCard :to="{ name: 'ProfitLossReport' }" :title="$t('reporting.ProfitLoss')"
                :description="$t('reporting.ProfitLossReport')" :icon="CalculatorIcon" />

            <ReportCard :to="{ name: 'WorkerPerformanceReport' }" :title="$t('reporting.WorkerPerformance')"
                :description="$t('reporting.descriptionsSale.WorkerPerformance')" :icon="UsersIcon" />
        </div>
    </div>
</template>
