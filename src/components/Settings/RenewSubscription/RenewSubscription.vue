<script setup>
import { ref, onMounted } from 'vue';
import packagesApi from '@/network/modules/packages.js';
import { handleResponse, handleError } from '@/network/api/responseHandler.js';
import toast from '@/stores/utility/toast';
import pan from '@/stores/pan';
import LoadingIcon from '@/components/Base/LoadingIcon';
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import { useRouter } from 'vue-router';
import { formatMoney } from '@/utils/currency';

const router = useRouter();

const isLoading = ref(false);
const currentSubscription = ref(null);
const packageInfo = ref(null);
const trialStatus = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPrice = (price) => {
  return formatMoney(price || 0);
};

const fetchSubscriptionInfo = async () => {
  isLoading.value = true;
  try {
    const response = await packagesApi.getAvailablePackages();
    const result = handleResponse(response);

    if (result.success) {
      currentSubscription.value = result.data?.current_subscription || null;
      trialStatus.value = result.data?.trial_status || null;
      
      // Find package info if subscription has package_id
      if (currentSubscription.value?.package_id && result.data?.packages) {
        packageInfo.value = result.data.packages.find(
          pkg => pkg.id === currentSubscription.value.package_id
        );
      }
    } else {
      toast().fry(pan.error(result.message || 'Failed to load subscription information'));
    }
  } catch (error) {
    handleError(error);
    toast().fry(pan.error('Failed to load subscription information. Please try again.'));
  } finally {
    isLoading.value = false;
  }
};

const goToPackageSelection = () => {
  router.push('/package-selection');
};

onMounted(() => {
  fetchSubscriptionInfo();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <LoadingIcon icon="oval" class="w-8 h-8" />
    </div>

    <!-- Current Subscription Card -->
    <div v-else-if="currentSubscription || trialStatus?.is_trial" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">Current Subscription</h2>
        <Button 
          variant="primary" 
          @click="goToPackageSelection"
          class="flex items-center gap-2"
        >
          <Lucide icon="Package" class="w-4 h-4" />
          Change Package
        </Button>
      </div>

      <!-- Active Subscription -->
      <div v-if="currentSubscription && currentSubscription.status === 'active'" class="space-y-4">
        <div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="p-2 bg-green-100 rounded-full">
            <Lucide icon="CheckCircle" class="w-6 h-6 text-green-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600">Status</p>
            <p class="font-semibold text-green-700">Active</p>
          </div>
        </div>

        <div v-if="packageInfo" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Package Name</p>
            <p class="text-lg font-semibold text-gray-800">{{ packageInfo.name }}</p>
          </div>
          
          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Package Price</p>
            <p class="text-lg font-semibold text-gray-800">{{ formatPrice(packageInfo.price) }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ packageInfo.duration_type === 'monthly' ? 'Per Month' : 
                 packageInfo.duration_type === 'weekly' ? 'Per Week' : 
                 packageInfo.duration_type === 'annual' ? 'Per Year' : 'Per ' + packageInfo.duration_type }}
            </p>
          </div>
        </div>

        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">Subscription End Date</p>
          <p class="text-lg font-semibold text-gray-800">{{ formatDate(currentSubscription.end_date) }}</p>
        </div>

        <div v-if="packageInfo?.features && packageInfo.features.length > 0" class="mt-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">Package Features:</p>
          <ul class="space-y-2">
            <li v-for="(feature, index) in packageInfo.features" :key="index" class="flex items-start gap-2">
              <Lucide icon="Check" class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700">{{ typeof feature === 'string' ? feature : feature.text || feature.name }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Trial Subscription -->
      <div v-else-if="trialStatus?.is_trial" class="space-y-4">
        <div class="flex items-center gap-3 p-4" 
             :class="trialStatus.trial_active && !trialStatus.trial_expired ? 'bg-blue-50 border border-blue-200' : 'bg-primary/10 border border-primary/20'"
             :style="{ borderRadius: '0.5rem' }">
          <div class="p-2 rounded-full"
              :class="trialStatus.trial_active && !trialStatus.trial_expired ? 'bg-blue-100' : 'bg-primary/20'">
            <Lucide icon="Clock" 
                    class="w-6 h-6"
                   :class="trialStatus.trial_active && !trialStatus.trial_expired ? 'text-blue-600' : 'text-primary'" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600">Status</p>
            <p class="font-semibold"
              :class="trialStatus.trial_active && !trialStatus.trial_expired ? 'text-blue-700' : 'text-primary'">
              {{ trialStatus.trial_active && !trialStatus.trial_expired ? 'Trial Active' : 'Trial Expired' }}
            </p>
          </div>
        </div>

        <div v-if="trialStatus.trial_active && !trialStatus.trial_expired" class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">Trial End Date</p>
          <p class="text-lg font-semibold text-gray-800">{{ formatDate(trialStatus.trial_end_date) }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ Math.ceil(trialStatus.trial_remaining_days || 0) }} days remaining
          </p>
        </div>

        <div v-else class="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p class="text-sm text-primary">
            Your trial has ended. Please select a package to continue using the system.
          </p>
        </div>
      </div>

      <!-- Expired Subscription -->
      <div v-else-if="currentSubscription && currentSubscription.status === 'expired'" class="space-y-4">
        <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="p-2 bg-red-100 rounded-full">
            <Lucide icon="XCircle" class="w-6 h-6 text-red-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600">Status</p>
            <p class="font-semibold text-red-700">Expired</p>
          </div>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">Subscription Ended</p>
          <p class="text-lg font-semibold text-gray-800">{{ formatDate(currentSubscription.end_date) }}</p>
        </div>

        <div class="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p class="text-sm text-primary">
            Your subscription has expired. Please renew or select a new package to continue.
          </p>
        </div>
      </div>
    </div>

    <!-- No Subscription -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-center py-8">
        <Lucide icon="Package" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">No Active Subscription</h3>
        <p class="text-sm text-gray-600 mb-6">You don't have an active subscription. Please select a package to get started.</p>
        <Button variant="primary" @click="goToPackageSelection">
          <Lucide icon="Package" class="w-4 h-4 mr-2" />
          Select Package
        </Button>
      </div>
    </div>
  </div>
</template>