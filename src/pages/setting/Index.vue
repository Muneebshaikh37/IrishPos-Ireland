<script setup>
import { useRoute } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import {useAbility} from "@casl/vue";

const route = useRoute();
const ability = useAbility();

</script>

<template>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <!-- Navigation Tabs -->
        <div class="inline-block space-x-5 mb-6 w-auto border border-slate-200 rounded-lg p-1">
          <router-link  
              :to="{ name: 'TaxManagement' }"
              class="inline-flex items-center rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none"
              :class="route.fullPath === '/setting/tax' ? 'bg-[#f8f4f3] text-primary' : 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary'"
          >
            <Lucide icon="BadgePercent" class="w-5 h-5 mr-2" /> {{$t('tax-management.headingTax')}}
          </router-link>
          
          <router-link v-if="ability.can('list', 'user')"
              :to="{ name: 'UserManagement' }"
              class="inline-flex items-center rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none"
              :class="route.name === 'UserManagement' ? 'bg-[#f8f4f3] text-primary' : 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary'"
          >
            <Lucide icon="User" class="w-5 h-5 mr-2" /> {{$t('tax-management.headingUser')}}
          </router-link>
          <router-link  v-if="ability.can('list', 'renewSubscription')"
              :to="{ name: 'SubscriptionManagement' }"
              class="inline-flex items-center rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none"
              :class="route.name === 'SubscriptionManagement' ? 'bg-[#f8f4f3] text-primary' : 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary'"
          >
            <Lucide icon="Settings" class="w-5 h-5 mr-2" />{{$t('tax-management.headingSubscription')}}
          </router-link>
          <router-link v-if="ability.can('update', 'companyProfile')"
              :to="{ name: 'CompanyProfile' }"
              class="inline-flex items-center rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none"
              :class="route.name === 'CompanyProfile' ? 'bg-[#f8f4f3] text-primary' : 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary'"
          >
            <Lucide icon="Building2" class="w-5 h-5 mr-2" /> {{$t('tax-management.headingCompanyProfile')}}
          </router-link>
          <router-link v-if="ability.can('update', 'generalSetting')"
              :to="{ name: 'GeneralSettings' }"
              class="inline-flex items-center rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none"
              :class="route.name === 'GeneralSettings' ? 'bg-[#f8f4f3] text-primary' : 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary'"
          >
            <Lucide icon="Settings" class="w-5 h-5 mr-2" /> {{$t('tax-management.headingGeneralSettings')}}
          </router-link>
          <router-link  v-if="ability.can('list', 'saleTarget')"
              :to="{ name: 'SaleTarget' }"
              class="inline-flex items-center rounded-lg py-2.5 px-4 text-sm font-normal leading-5 shadow-none border-none"
              :class="route.name === 'SaleTarget' ? 'bg-[#f8f4f3] text-primary' : 'text-gray-600 hover:bg-[#f8f4f3] hover:text-primary'"
          >
            <Lucide icon="Settings" class="w-5 h-5 mr-2" /> {{$t('sale-target.saleTarget')}}
          </router-link>
        </div>

        <!-- Dynamic Component Rendering -->
        <router-view v-if="ability.can('update', 'generalSetting') || ability.can('update', 'companyProfile') || ability.can('list', 'user') || ability.can('list', 'taxManagement')  || ability.can('list', 'renewSubscription') || ability.can('list', 'saleTarget')"  />
      </div>
    </div>
  </div>
</template>
