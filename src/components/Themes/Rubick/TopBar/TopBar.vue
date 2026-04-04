<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import {useAuthStore} from "@/stores/auth.js";
import { useNotification } from "@/stores/notification";
import router from "@/router";
import { authHttpClient } from "@/network/modules/auth.js";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import LocaleSelector from "@/components/globel/LocaleSelector.vue";
import Lucide from "@/components/Base/Lucide";
import Breadcrumb from "@/components/Base/Breadcrumb";
import { Menu, Popover } from "@/components/Base/Headless";
import { TransitionRoot } from "@headlessui/vue";
import ProfileUrl from "@/assets/images/profile.png";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getBreadcrumbTranslationKey } from "@/helpers/breadcrumbHelper.js";

const authStore = useAuthStore();
const notificationStore = useNotification();
const { t } = useI18n();

// Reactive states
const searchDropdown = ref(false);
const locale = ref("en");
const isNotification = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const lastPage = ref(1);
const scrollContainer = ref(null);

// User data
const USER = authStore.getUser;
const route: any = useRouter()

// Trial notification state
const showTrialNotification = ref(false);
const trialStatus = ref(null);
const isDismissed = ref(false);

// Check if user is on trial
const checkTrialStatus = () => {
  try {
    // Skip for Super Admin and sub-users
    if (USER?.role === 'Super Admin' || (Array.isArray(USER?.roles) && USER.roles.includes('Super Admin'))) {
      return;
    }
    const isSubUser = USER?.user_id && USER?.user_id !== USER?.id;
    if (isSubUser) {
      return;
    }

    // Check if notification was dismissed
    const dismissed = localStorage.getItem('trial_notification_dismissed');
    if (dismissed) {
      isDismissed.value = true;
      return;
    }

    // Get current subscription from localStorage
    const currentSubscriptionStr = localStorage.getItem('current_subscription');
    let currentSubscription = null;
    if (currentSubscriptionStr) {
      try {
        currentSubscription = JSON.parse(currentSubscriptionStr);
      } catch (e) {
        console.error('Error parsing current_subscription:', e);
      }
    }

    // Don't show notification if user has an active paid subscription
    // Check for active subscription with a package (paid subscription)
    if (currentSubscription &&
        currentSubscription.status === 'active' &&
        currentSubscription.package_id !== null &&
        currentSubscription.package_id !== undefined) {
      showTrialNotification.value = false;
      // Also remove trial_status if it exists to prevent any confusion
      localStorage.removeItem('trial_status');
      localStorage.removeItem('trial_notification_dismissed');
      return;
    }

    // Get trial status from localStorage
    const trialStatusStr = localStorage.getItem('trial_status');
    if (trialStatusStr) {
      try {
        trialStatus.value = JSON.parse(trialStatusStr);
        // Show notification if trial is active and not expired
        // But only if we don't have an active paid subscription
        if (trialStatus.value.trial_active && !trialStatus.value.trial_expired) {
          // Double-check: don't show if we have an active subscription
          if (!currentSubscription ||
              currentSubscription.status !== 'active' ||
              currentSubscription.package_id === null ||
              currentSubscription.package_id === undefined) {
            showTrialNotification.value = true;
          } else {
            showTrialNotification.value = false;
          }
        } else {
          showTrialNotification.value = false;
        }
      } catch (e) {
        console.error('Error parsing trial_status:', e);
        showTrialNotification.value = false;
      }
    } else {
      // No trial status found - don't show notification
      showTrialNotification.value = false;
    }
  } catch (error) {
    console.error('Error checking trial status:', error);
  }
};

// Dismiss notification
const dismissNotification = () => {
  showTrialNotification.value = false;
  isDismissed.value = true;
  localStorage.setItem('trial_notification_dismissed', 'true');
};

// Navigate to package selection
const goToPackageSelection = () => {
  router.push('/package-selection');
};

// Format remaining days in human-readable format
const formatRemainingDays = (days: number | null | undefined): string => {
  if (days === null || days === undefined) {
    return '';
  }

  const roundedDays = Math.round(days);

  if (roundedDays <= 0) {
    return 'Less than 1 day';
  } else if (roundedDays === 1) {
    return '1 day';
  } else {
    return `${roundedDays} days`;
  }
};

const breadcrumbs = computed(() => {
      return route.currentRoute.value.matched.map((match: any) => {
        return {
          path: match.path,
          name: match.name || match.path, // Fallback to path if name is not defined
        };
      });
    });

    // Function to translate breadcrumb name
    const translateBreadcrumb = (name: string) => {
      if (!name || name === '/admin' || name === 'ReportingDashboard') {
        return '';
      }

      const translationKey = getBreadcrumbTranslationKey(name);
      if (translationKey) {
        return t(translationKey);
      }

      // Fallback: add space to camelCase text
      return name ? name.replace(/([A-Z])/g, " $1").trim() : '';
    };


// Handle notification received event
const handleNotificationReceived = () => {
  // Refresh notification list when new notification arrives
  if (USER?.user_id && !loading.value) {
    fetchNotifications(1);
  }
};

// Lifecycle hooks
onMounted(() => {
  locale.value = localStorage.getItem("locale") || "en";

  // Fetch notifications on mount
  if (USER?.user_id) {
    fetchNotifications(1);
  }

  // Check trial status for notification
  checkTrialStatus();

  // Listen for new FCM notifications
  window.addEventListener('notification-received', handleNotificationReceived);

  // Listen for subscription status changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'trial_status' || e.key === 'current_subscription') {
      checkTrialStatus();
    }
  });

  // Listen for subscription-updated custom event
  window.addEventListener('subscription-updated', checkTrialStatus);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('notification-received', handleNotificationReceived);
  window.removeEventListener('subscription-updated', checkTrialStatus);
});

// Functions
const toggleSearchDropdown = (state: boolean) => {
  searchDropdown.value = state;
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const fetchNotifications = async (page = 1) => {
  if (loading.value || page > lastPage.value) return;

  loading.value = true;

  try {
    const response = await authHttpClient.get(
        `/notification?user_id=${USER?.user_id}&page=${page}`
    );
    const result = handleResponse(response);
    if (result.success) {
      const { data, meta } = result.data;
      if (page === 1) {
        isNotification.value = [];
      }
      isNotification.value.push(...data);
      currentPage.value = meta.current_page;
      lastPage.value = meta.last_page;
    }
  } catch (error) {
    // Silent error handling
  } finally {
    loading.value = false;
  }
};

const markNotificationAsRead = async (id: string) => {
  try {
    const payload = { notification_ids: [id] };
    const response = await authHttpClient.post(
        `/notification/mark-read?user_id=${USER?.user_id}`,
        payload
    );
    const result = handleResponse(response);

    // Update local state to mark notification as read
    if (result.success) {
      const notification = isNotification.value.find((n: any) => n.id === id);
      if (notification) {
        notification.is_read = true;
      }
    }
  } catch (error) {
    handleError(error);
  }
};

const handleScroll = () => {
  if (!scrollContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    fetchNotifications(currentPage.value + 1);
  }
};
function addProtocolToUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url; // or 'http://' based on your preference
    }
    return url;
  }
  const url = "jaldi.app"
</script>

<template>
  <!-- Trial Notification Alert -->
  <TransitionRoot
    v-if="showTrialNotification && !isDismissed"
    :show="showTrialNotification && !isDismissed"
    enter="transition-all ease-linear duration-150"
    enterFrom="invisible opacity-0 translate-y-1"
    enterTo="visible opacity-100 translate-y-0"
    leave="transition-all ease-linear duration-150"
    leaveFrom="visible opacity-100 translate-y-0"
    leaveTo="invisible opacity-0 translate-y-1"
    class="relative z-[52] px-4 pt-4 pb-0"
  >
    <div class="relative border border-primary rounded-md px-5 py-4 bg-primary bg-opacity-20 border-opacity-5 text-primary mb-0">
      <div class="flex items-start">
        <Lucide icon="Info" class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
        <div class="flex-1 pr-8">
          <div class="font-semibold text-sm mb-1">
            You're on a free trial!
            <span v-if="trialStatus?.trial_remaining_days !== null && trialStatus?.trial_remaining_days !== undefined" class="ml-1">
              {{ formatRemainingDays(trialStatus.trial_remaining_days) }} remaining.
            </span>
          </div>
          <p class="text-sm opacity-90 mb-3">
            Select a subscription package to continue after your trial ends.
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="goToPackageSelection"
              class="px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              View Packages
            </button>
            <button
              @click="dismissNotification"
              class="px-3 py-2 text-primary hover:bg-primary/10 rounded-md text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          @click="dismissNotification"
          class="absolute right-0 top-0 my-auto mr-2 mt-2 text-primary hover:text-primary/80 transition-colors p-1"
          aria-label="Dismiss notification"
        >
          <Lucide icon="X" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </TransitionRoot>

  <!-- BEGIN: Top Bar -->
  <div
    class="relative z-[51] flex h-[67px] items-center border-b border-slate-200"
  >

    <!-- BEGIN: Breadcrumb -->
    <Breadcrumb class="hidden -intro-x sm:flex" :class="{ 'ml-auto': locale === 'ar', 'mr-auto': locale !== 'ar' }">
    <a :href="addProtocolToUrl(url)" :class="{ 'mr-5': locale === 'ar', 'ml-0': locale !== 'ar' }"> {{ $t('common.home') }} </a>

    <template v-for="(item, index) in breadcrumbs" :key="index">
      <Breadcrumb.Link v-if="item.name !== '/admin' && item.name !== 'ReportingDashboard'"  :to="item.path" class="relative capitalize before:content-[''] before:w-[14px] before:h-[14px] before:bg-chevron-black before:bg-[length:100%] before:absolute before:my-auto before:inset-y-0 dark:before:bg-chevron-white text-slate-800 cursor-text" :class="{
        'top-ar mr-5 pl-0.5': locale === 'ar',
        'ml-5 pl-0.5 before:-ml-[1.125rem] before:transform before:rotate-[-90deg]': locale !== 'ar'
      }">
        {{ translateBreadcrumb(item.name) }}
      </Breadcrumb.Link>
    </template>
  </Breadcrumb>


  <div class="relative z-[51] flex h-[67px] items-center border-b border-slate-200">

    <!-- Notifications -->
    <Popover class="mr-auto intro-x sm:mr-6">
      <Popover.Button
          @click="fetchNotifications(1)"
          class="relative text-slate-600 outline-none block before:content-[''] before:w-[8px] before:h-[8px] before:rounded-full before:absolute before:top-[-2px] before:right-0 before:bg-danger"
      >
        <Lucide icon="Bell" class="w-5 h-5 dark:text-slate-500" />
      </Popover.Button>
      <Popover.Panel class="w-[280px] sm:w-[350px] mt-2 pb-4">
        <h4 class="mb-4 mt-3 pl-1.5 font-semobold">Notifications</h4>
        <div
            ref="scrollContainer"
            class="h-[300px] overflow-y-auto pb-4"
            @scroll="handleScroll"
        >
          <div
              v-for="(notification, index) in isNotification"
              :key="index"
              class="cursor-pointer pr-4 relative flex items-center mt-5"
              @click="markNotificationAsRead(notification.id)"
          >
            <div class="ml-2 overflow-hidden z-50">
              <div class="flex items-center">
                <a
                    href="#"
                    class="mr-5 font-medium truncate"
                    :class="{ 'font-bold': !notification.is_read }"
                >
                  {{ notification.title }}
                </a>
                <div
                    class="ml-auto text-xs text-slate-400 whitespace-nowrap"
                    :class="{ 'font-bold text-slate-500': !notification.is_read }"
                >
                  {{ notification.created_at }}
                </div>
              </div>
              <div
                  class="w-full truncate text-slate-600 mt-0.5"
                  :class="{ 'font-bold': !notification.is_read }"
              >
                {{ notification.message }}
              </div>
            </div>
          </div>
        </div>
      </Popover.Panel>
    </Popover>

    <!-- Locale Selector -->
    <div :class="{ 'ml-2': locale === 'ar', '': locale !== 'ar' }">
      <LocaleSelector />
    </div>

    <!-- Account Menu -->
    <Menu class="relative">
      <Menu.Button class="block w-8 h-8 overflow-hidden rounded-full shadow-lg image-fit zoom-in intro-x">
        <img alt="profile" :src="ProfileUrl" />
      </Menu.Button>
      <Menu.Items :placement="locale === 'ar' ? 'bottom-start' : 'bottom-end'" class="w-56 mt-px text-white bg-primary text-left" dir="ltr">
        <Menu.Header class="font-normal">
          <div class="font-medium">{{ USER.name }}</div>
          <div class="text-xs text-white/70 mt-0.5 dark:text-slate-500">
            {{ USER.email }}
          </div>
        </Menu.Header>
        <Menu.Divider class="bg-white/[0.08]" />
        <Menu.Item class="hover:bg-white/5 flex items-center" @click="logout">
          <Lucide icon="ToggleRight" class="w-4 h-4 mr-2 flex-shrink-0" /> Logout
        </Menu.Item>
      </Menu.Items>
    </Menu>
  </div>
  </div>
</template>

<style scoped>
.top-ar::before {
  right: -1.125rem;
  left: auto;
  transform: rotate(90deg);
}
</style>
