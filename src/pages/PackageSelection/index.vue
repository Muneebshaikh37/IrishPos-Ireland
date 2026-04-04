<template>
  <div class="bg-[#f4f4f4] min-h-screen flex flex-col items-center p-4 pt-6">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Choose Your Package</h1>
        <p class="text-gray-600">Select a subscription package that suits your needs</p>
      </div>

      <!-- Trial Status Banner -->
      <!-- Only show trial banner if there's no active subscription -->
      <div v-if="trialStatus?.is_trial && !currentSubscription" class="mb-6 p-4 rounded-lg"
           :class="(trialStatus.trial_active && !trialStatus.trial_expired) ? 'bg-primary/10 border border-primary/20' : 'bg-primary/10 border border-primary/20'">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-gray-800">
              {{ (trialStatus.trial_active && !trialStatus.trial_expired) ? 'Trial Active' : 'Trial Expired' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              <span v-if="trialStatus.trial_active && !trialStatus.trial_expired">
                {{ trialStatus.trial_remaining_days }} days remaining
              </span>
              <span v-else>
                Your trial has ended. Please select a package to continue.
              </span>
            </p>
          </div>
          <div v-if="trialStatus.trial_active && !trialStatus.trial_expired" class="text-right">
            <p class="text-xs text-gray-500">Trial ends on</p>
            <p class="font-semibold text-gray-700">{{ formatDate(trialStatus.trial_end_date) }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <LoadingIcon icon="oval" class="w-8 h-8" />
      </div>

      <!-- Packages Comparison Table -->
      <div v-else class="">
        <!-- Current Subscription Info - Moved to top -->
        <div v-if="currentSubscription && getSubscriptionPackageId(currentSubscription) && isCurrentSubscriptionActive" class="mb-6 p-5 bg-primary/10 border border-primary/20 rounded-xl shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 mb-2">Current Subscription Plan</h3>
              <div class="space-y-1">
                <p class="text-sm text-gray-700">
                  <span class="font-semibold">{{ capitalizeFirstLetter(currentSubscription.package?.name || 'N/A') }}</span>
                  <span class="text-gray-600"> - {{ formatPrice(currentSubscription.package?.price || 0) }}</span>
                </p>
                <p class="text-sm text-gray-600">
                  <span v-if="isFutureStartDate(currentSubscription.start_date)">
                    Starts on {{ formatDate(currentSubscription.start_date) }} and ends on {{ formatDate(currentSubscription.end_date) }}
                  </span>
                  <span v-else>
                    Active until {{ formatDate(currentSubscription.end_date) }}
                  </span>
                </p>
                <p class="text-xs text-gray-500 mt-2">
                  You can select a different package below. The new package will start after your current subscription ends.
                </p>
              </div>
            </div>
            <span class="px-3 py-1 bg-primary text-white rounded-full text-sm font-semibold ml-4 shadow-sm">
              {{ currentSubscription.status }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div
            v-for="packageItem in packages"
            :key="packageItem.id"
            class="relative border rounded-xl hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
            :class="isCurrentPackage(packageItem.id)
              ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5'
              : selectedPackageId === packageItem.id 
              ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-white' 
              : 'border-gray-200 shadow-sm hover:border-gray-300 bg-white'"
          >
            <!-- Active Plan Ribbon -->
            <div v-if="isCurrentPackage(packageItem.id)" class="absolute top-4 -right-2 z-20">
              <div class="relative bg-gradient-to-r from-primary via-primary to-primary/90 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-2xl transform rotate-12">
                <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-sm"></div>
                <span class="relative z-10">Subscribed</span>
                <div class="absolute -left-1 top-0 bottom-0 w-1 bg-primary/50"></div>
              </div>
              <div class="absolute right-0 top-full w-0 h-0 border-l-[16px] border-l-transparent border-t-[12px] border-t-primary shadow-lg"></div>
            </div>
            
            <!-- Package Header -->
            <div class="p-5 relative border-b-2"
                 :class="isCurrentPackage(packageItem.id) 
                   ? 'border-primary/30 bg-gradient-to-b from-primary/15 via-primary/10 to-primary/5' 
                   : 'border-primary/20 bg-gradient-to-b from-primary/8 via-primary/5 to-white'">
              <!-- Top Accent Line -->
              <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/90 to-primary"></div>
              
              <!-- Top Row: Icon and Package Name -->
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm flex-shrink-0">
                  <Lucide
                    :icon="getPackageIcon(packageItem.name)"
                    class="w-6 h-6 text-primary"
                  />
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-gray-600 tracking-tight">{{ capitalizeFirstLetter(packageItem.name) }}</h3>
                </div>
              </div>
              
              <!-- Price and Billing Frequency -->
              <div class="flex items-baseline justify-between gap-3">
                <div class="flex-1">
                  <div class="text-3xl font-bold text-gray-900 leading-none">{{ formatPrice(packageItem.price) }}</div>
                </div>
                <div class="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0">
                  <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ getBillingFrequency(packageItem) }}</span>
                </div>
              </div>
            </div>

            <!-- Package Content -->
            <div class="p-6 flex flex-col h-full"
                 :class="isCurrentPackage(packageItem.id) ? 'bg-primary/5' : 'bg-white'">
              <!-- Target Audience -->
              <p v-if="packageItem.description" class="text-left text-black mb-3 font-bold text-base leading-relaxed">
                {{ capitalizeFirstLetter(packageItem.description) }}
              </p>

              <!-- Features List -->
              <div v-if="getPackageFeatures(packageItem).length > 0" class="space-y-1.5 mb-6 flex-1 min-h-[200px] max-h-[300px] overflow-y-auto">
                <div class="text-sm">
                  <div
                    v-for="(feature, featureIndex) in getPackageFeatures(packageItem)"
                    :key="featureIndex"
                    class="flex items-start py-1"
                  >
                    <Lucide
                      :icon="feature.included ? 'Check' : 'X'"
                      :class="[
                        'w-4 h-4 mr-3 mt-0.5 flex-shrink-0 stroke-[3]',
                        feature.included ? 'text-primary' : 'text-gray-300'
                      ]"
                    />
                    <span :class="[
                      'text-sm leading-relaxed font-medium',
                      feature.included ? 'text-gray-700' : 'text-gray-400'
                    ]">
                      {{ feature.text }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="mb-6 flex-1 min-h-[200px] flex items-center justify-center">
                <p class="text-gray-400 text-sm">No features available</p>
              </div>

              <!-- Select Package Button -->
              <button
                v-if="!isCurrentPackage(packageItem.id)"
                @click="selectPackage(packageItem.id)"
                :disabled="isProcessing || selectedPackageId === packageItem.id"
                class="w-full py-3.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 mt-auto"
                :class="
                  (selectedPackageId === packageItem.id && !isProcessing)
                    ? 'bg-primary text-white cursor-not-allowed shadow-md'
                    : selectedPackageId === packageItem.id
                    ? 'bg-primary text-white cursor-not-allowed shadow-md'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                "
              >
                <span v-if="isProcessing && selectedPackageId === packageItem.id">
                  Processing...
                </span>
                <span v-else-if="selectedPackageId === packageItem.id">
                  Selected
                </span>
                <span v-else>
                  {{ hasActiveSubscription ? 'Change Package' : 'Select Package' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start">
          <Lucide icon="AlertCircle" class="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="font-semibold text-red-800 mb-1">Payment Failed</h4>
            <p class="text-red-700 mb-3">{{ errorMessage }}</p>
            <div class="flex items-center gap-2">
              <button
                @click="errorMessage = ''; showPaymentForm = false; selectedPackageId = null;"
                class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                @click="errorMessage = ''"
                class="px-3 py-2 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            @click="errorMessage = ''"
            class="ml-3 text-red-600 hover:text-red-800 transition-colors p-1"
            aria-label="Dismiss error"
          >
            <Lucide icon="X" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Moyasar Payment Form Modal -->
      <div v-if="showPaymentForm" class="fixed inset-0 bg-gradient-to-b from-theme-1/50 via-theme-2/50 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border-0 moyasar-modal-container">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Complete Payment</h2>
            <button @click="closePaymentForm" class="text-gray-500 hover:text-gray-700">
              <Lucide icon="X" class="w-6 h-6" />
            </button>
          </div>
          <div class="moyasar-payment-form"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import packagesApi from '@/network/modules/packages.js';
import { handleResponse, handleError } from '@/network/api/responseHandler.js';
import toast from '@/stores/utility/toast';
import pan from '@/stores/pan';
import LoadingIcon from '@/components/Base/LoadingIcon';
import Lucide from '@/components/Base/Lucide';
import { formatMoney } from '@/utils/currency';

const router = useRouter();

const packages = ref([]);
const trialStatus = ref(null);
const currentSubscription = ref(null);
const isLoading = ref(false);
const isProcessing = ref(false);
const selectedPackageId = ref(null);
const errorMessage = ref('');

const normalizeStatus = (status) => String(status || '').toLowerCase();
const normalizeId = (value) => (value === null || value === undefined ? null : String(value));
const getSubscriptionPackageId = (subscription) =>
  subscription?.package_id ?? subscription?.package?.id ?? null;

const getStoredCurrentSubscription = () => {
  try {
    const raw = localStorage.getItem('current_subscription');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to parse current_subscription from localStorage:', error);
    return null;
  }
};

// Check if user has an active PAID subscription (not trial)
// Users with active subscriptions can still select packages - new package will be scheduled
// This is just for UI display purposes
const hasActiveSubscription = computed(() => {
  if (!currentSubscription.value) {
    return false; // No subscription = can select packages
  }

  // Check if it's an active PAID subscription (has package_id)
  return normalizeStatus(currentSubscription.value.status) === 'active' &&
         getSubscriptionPackageId(currentSubscription.value) !== null &&
         getSubscriptionPackageId(currentSubscription.value) !== undefined;
});

const isCurrentSubscriptionActive = computed(() => {
  return normalizeStatus(currentSubscription.value?.status) === 'active';
});

// Check if a package is the current subscribed package
const isCurrentPackage = (packageId) => {
  const currentPackageId = getSubscriptionPackageId(currentSubscription.value);
  if (!currentSubscription.value || !currentPackageId) {
    return false;
  }
  return normalizeId(currentPackageId) === normalizeId(packageId) &&
         normalizeStatus(currentSubscription.value.status) === 'active';
};

// Check if start date is in the future
const isFutureStartDate = (startDate) => {
  if (!startDate) return false;
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start > today;
};

const fetchPackages = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await packagesApi.getAvailablePackages();
    const result = handleResponse(response);

    if (result.success) {
      // Support both: monolith returns array directly, accounts-jaldi returns { packages, trial_status, current_subscription }
      const raw = result.data;
      packages.value = Array.isArray(raw) ? raw : (raw?.packages || []);
      trialStatus.value = raw?.trial_status ?? null;
      currentSubscription.value = raw?.current_subscription ?? getStoredCurrentSubscription();

      // Debug: Log subscription status
      if (currentSubscription.value) {
        console.log('Current Subscription:', {
          status: currentSubscription.value.status,
          package_id: currentSubscription.value.package_id,
          hasActiveSubscription: hasActiveSubscription.value
        });
      }

      // Update localStorage only when API includes subscription metadata.
      // Some backends return only packages[]; in that case we must not overwrite
      // existing subscription_status, otherwise route guards can falsely redirect.
      const hasSubscriptionMetadata =
        raw &&
        !Array.isArray(raw) &&
        (Object.prototype.hasOwnProperty.call(raw, 'trial_status') ||
          Object.prototype.hasOwnProperty.call(raw, 'current_subscription'));

      if (hasSubscriptionMetadata) {
        if (trialStatus.value) {
          localStorage.setItem('trial_status', JSON.stringify(trialStatus.value));

          // If trial is expired, ensure remaining days is 0
          if (trialStatus.value.trial_expired || !trialStatus.value.trial_active) {
            trialStatus.value.trial_remaining_days = 0;
          }
        } else {
          // Clear trial status if not found
          localStorage.removeItem('trial_status');
        }

        if (currentSubscription.value) {
          const currentStatus = normalizeStatus(currentSubscription.value.status);
          localStorage.setItem('current_subscription', JSON.stringify(currentSubscription.value));
          const subscriptionStatus = {
            active: currentStatus === 'active',
            expired: currentStatus === 'expired',
            trial_expired: trialStatus.value?.trial_expired || false,
            has_active_subscription: currentStatus === 'active' || currentStatus === 'trial'
          };
          localStorage.setItem('subscription_status', JSON.stringify(subscriptionStatus));
        } else {
          // No active subscription
          const subscriptionStatus = {
            active: false,
            expired: true,
            trial_expired: trialStatus.value?.trial_expired || (trialStatus.value ? !trialStatus.value.trial_active : true),
            has_active_subscription: trialStatus.value?.trial_active || false
          };
          localStorage.setItem('subscription_status', JSON.stringify(subscriptionStatus));
        }
      }
    } else {
      errorMessage.value = result.message || 'Failed to load packages';
    }
  } catch (error) {
    handleError(error);
    errorMessage.value = 'Failed to load packages. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const showPaymentForm = ref(false);
const paymentFormData = ref(null);

const closePaymentForm = () => {
  showPaymentForm.value = false;
  selectedPackageId.value = null;
  isProcessing.value = false;
  paymentFormData.value = null;
};

const selectPackage = async (packageId) => {
  // Allow package selection even with active subscription
  // New package will be scheduled to start after current one ends
  isProcessing.value = true;
  selectedPackageId.value = packageId;
  errorMessage.value = '';

  try {
    const response = await packagesApi.selectPackage({
      package_id: packageId,
      payment_method: 'muyaser',
    });

    const result = handleResponse(response);

    if (result.success) {
      // If payment_data is provided, show Moyasar payment form
      if (result.data?.payment_data) {
        paymentFormData.value = result.data.payment_data;
        showPaymentForm.value = true;
        // Initialize Moyasar form after DOM update
        await nextTick();
        initializeMoyasarForm();
      } else if (result.data?.payment_url) {
        // Fallback: redirect to payment URL if provided
        window.location.href = result.data.payment_url;
      } else {
        // Payment successful or offline payment
        toast().fry(pan.success('Package selected successfully!'));

        // Clear trial notification dismissed flag since user has subscribed
        localStorage.removeItem('trial_notification_dismissed');

        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      }
    } else {
      errorMessage.value = result.message || 'Failed to select package';
      selectedPackageId.value = null;
    }
  } catch (error) {
    const errorResult = handleError(error);
    errorMessage.value = errorResult.message || 'Failed to select package. Please try again.';

    // Log error for debugging
    console.error('Package selection error:', error);
    selectedPackageId.value = null;
  } finally {
    isProcessing.value = false;
  }
};

const initializeMoyasarForm = () => {
  if (!window.Moyasar || !paymentFormData.value) {
    console.error('Moyasar library not loaded or payment data missing');
    errorMessage.value = 'Payment form initialization failed. Please refresh and try again.';
    closePaymentForm();
    return;
  }

  // Validate required fields
  if (!paymentFormData.value.publishable_api_key) {
    console.error('Missing publishable_api_key in payment data');
    errorMessage.value = 'Payment configuration error: Publishable API key is missing. Please contact support.';
    closePaymentForm();
    return;
  }

  try {
    window.Moyasar.init({
      element: '.moyasar-payment-form',
      amount: paymentFormData.value.amount,
      currency: paymentFormData.value.currency,
      description: paymentFormData.value.description,
      publishable_api_key: paymentFormData.value.publishable_api_key,
      callback_url: paymentFormData.value.callback_url,
      supported_networks: paymentFormData.value.supported_networks || ['visa', 'mastercard', 'mada'],
      methods: paymentFormData.value.methods || ['creditcard'],
      on_completed: async function (payment) {
        // Save payment ID before redirect
        console.log('Payment completed:', payment);
        // The form will redirect to callback_url automatically
      },
    });
  } catch (error) {
    console.error('Error initializing Moyasar form:', error);
    errorMessage.value = error.message || 'Failed to initialize payment form. Please try again.';
    closePaymentForm();
  }
};

const formatPrice = (price) => {
  return formatMoney(price || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getBillingFrequency = (packageItem) => {
  const type = packageItem.duration_type || 'monthly';

  const typeMap = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    annual: 'Annual',
    yearly: 'Annual',
  };

  return typeMap[type] || 'Monthly';
};

const getPackageIcon = (packageName) => {
  const name = packageName?.toLowerCase() || '';
  if (name.includes('silver') || name.includes('basic')) return 'Award';
  if (name.includes('gold') || name.includes('professional')) return 'Medal';
  if (name.includes('platinum') || name.includes('enterprise')) return 'Trophy';
  return 'Package';
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getPackageFeatures = (packageItem) => {
  // Only use features from API - no static/hardcoded features
  if (packageItem.features && Array.isArray(packageItem.features) && packageItem.features.length > 0) {
    return packageItem.features.map((feature) => {
      if (typeof feature === 'string') {
        return { text: capitalizeFirstLetter(feature), included: true };
      }
      // Handle object format: { text: "...", included: true/false }
      const featureText = feature.text || feature.name || String(feature);
      return {
        text: capitalizeFirstLetter(featureText),
        included: feature.included !== false
      };
    });
  }

  // Return empty array if no features from API
  return [];
};

onMounted(() => {
  fetchPackages();

  // Check for Moyasar payment callback in URL params
  // Moyasar redirects with: ?id={payment_id}&subscription_id={subscription_id}&status={status}&message={message}
  const urlParams = new URLSearchParams(window.location.search);
  const paymentId = urlParams.get('id');
  const subscriptionId = urlParams.get('subscription_id');
  const status = urlParams.get('status');
  const message = urlParams.get('message');

  if (paymentId) {
    // If status is already failed from Moyasar redirect, show error immediately
    if (status === 'failed' && message) {
      const decodedMessage = decodeURIComponent(message);
      errorMessage.value = decodedMessage || 'Payment failed. Please try again.';
      // Close payment form if it's open
      showPaymentForm.value = false;
      // Reset selected package
      selectedPackageId.value = null;
      // Still process the callback to update subscription status
      handlePaymentCallback({ id: paymentId, subscription_id: subscriptionId });
    } else {
      handlePaymentCallback({ id: paymentId, subscription_id: subscriptionId });
    }
  }
});

const handlePaymentCallback = async (callbackData) => {
  try {
    const response = await packagesApi.paymentCallback(callbackData);
    const result = handleResponse(response);

    if (result.success) {
      // Update subscription status in localStorage
      if (result.data?.subscription) {
        localStorage.setItem('current_subscription', JSON.stringify(result.data.subscription));
        const callbackStatus = normalizeStatus(result.data.subscription.status);
        const subscriptionStatus = {
          active: callbackStatus === 'active',
          expired: callbackStatus === 'expired',
          trial_expired: false,
          has_active_subscription: callbackStatus === 'active' || callbackStatus === 'trial'
        };
        localStorage.setItem('subscription_status', JSON.stringify(subscriptionStatus));

        // Remove trial_status from localStorage since user now has an active paid subscription
        localStorage.removeItem('trial_status');

        // Clear trial notification dismissed flag since user has subscribed
        localStorage.removeItem('trial_notification_dismissed');

        // Dispatch custom event to notify TopBar component to re-check trial status
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('subscription-updated'));
      }

      toast().fry(pan.success('Payment completed successfully!'));

      // Clear URL params immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to dashboard immediately - don't wait for fetchPackages
      // The dashboard will load the updated subscription status
      router.push('/admin');
    } else {
      // Show error message if not already shown from URL params
      if (!errorMessage.value) {
        errorMessage.value = result.message || 'Payment failed. Please try again.';
      }
      // Close payment form on error
      showPaymentForm.value = false;
      // Reset selected package to allow retry
      selectedPackageId.value = null;
      // Refresh packages to show updated subscription status
      await fetchPackages();
      // Clear URL params but stay on page to show error
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (error) {
    const errorResult = handleError(error);
    if (!errorMessage.value) {
      errorMessage.value = errorResult.message || 'Error processing payment. Please contact support.';
    }
    // Close payment form on error
    showPaymentForm.value = false;
    // Reset selected package to allow retry
    selectedPackageId.value = null;
    // Refresh packages even on error
    await fetchPackages();
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};
</script>

<style scoped>
/* Remove Moyasar form borders */
.moyasar-payment-form :deep(.moyasar-form),
.moyasar-payment-form :deep(.moyasar-form *),
.moyasar-payment-form :deep(form),
.moyasar-payment-form :deep(form *),
.moyasar-payment-form :deep(.form-group),
.moyasar-payment-form :deep(.form-control),
.moyasar-payment-form :deep(input),
.moyasar-payment-form :deep(select),
.moyasar-payment-form :deep(textarea),
.moyasar-payment-form :deep(.card-element),
.moyasar-payment-form :deep(.moyasar-card-element) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* Remove border from Moyasar container */
.moyasar-payment-form :deep(.moyasar-container),
.moyasar-payment-form :deep(.moyasar-form-wrapper) {
  border: none !important;
  box-shadow: none !important;
}

/* Target any element with moyasar class */
.moyasar-payment-form :deep([class*="moyasar"]) {
  border: none !important;
}

/* Remove any white borders from nested elements */
.moyasar-payment-form :deep(*) {
  border-color: transparent !important;
}
</style>

<style>
/* Global styles to override Moyasar's injected styles */
.moyasar-modal-container {
  border: none !important;
}

.moyasar-modal-container * {
  border-color: transparent !important;
}

/* Target Moyasar's specific classes that might have borders */
.moyasar-modal-container .moyasar-form,
.moyasar-modal-container .moyasar-container,
.moyasar-modal-container form,
.moyasar-modal-container .form-group,
.moyasar-modal-container .form-control,
.moyasar-modal-container input,
.moyasar-modal-container select,
.moyasar-modal-container textarea {
  border: none !important;
  border-width: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}
</style>
