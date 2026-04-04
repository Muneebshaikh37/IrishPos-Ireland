/**
 * Subscription Guard
 * Blocks navigation if trial/subscription is expired
 * Only allows navigation to package-selection page when expired
 */
export function useSubscriptionGuard() {
  return (to, from) => {
    try {
      // Always allow access to package-selection page (with or without subscription)
      if (to.path === '/package-selection' || to.name === 'PackageSelection') {
        return true;
      }

      // Allow access to auth pages (login, register, etc.)
      const authRoutes = ['/login', '/register', '/forget-password', '/enter-otp', '/verify-otp', '/create-new-password'];
      if (authRoutes.some(route => to.path.startsWith(route))) {
        return true;
      }

      // Check user data from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        return true; // Let auth guard handle this
      }

      const user = JSON.parse(userData);

      // Skip check for Super Admin
      const isSuperAdmin = user?.role === 'Super Admin' || (Array.isArray(user?.roles) && user.roles.includes('Super Admin'));
      if (isSuperAdmin) {
        return true;
      }

      // Skip check for sub-users (users with different user_id than id)
      const isSubUser = user?.user_id && user?.user_id !== user?.id;
      if (isSubUser) {
        return true;
      }

      // Check subscription status from localStorage
      const subscriptionStatus = localStorage.getItem('subscription_status');
      const trialStatus = localStorage.getItem('trial_status');

      let isExpired = false;
      let hasActiveSubscription = false;

      if (subscriptionStatus) {
        try {
          const status = JSON.parse(subscriptionStatus);
          isExpired = status.expired === true || status.trial_expired === true;
          hasActiveSubscription = status.has_active_subscription === true || status.active === true;
        } catch (e) {
          console.error('Error parsing subscription status:', e);
        }
      }

      if (trialStatus && !hasActiveSubscription) {
        try {
          const status = JSON.parse(trialStatus);
          isExpired = isExpired || status.trial_expired === true;
        } catch (e) {
          console.error('Error parsing trial status:', e);
        }
      }

      // Redirect to package-selection only when expired AND no active subscription
      if (isExpired && !hasActiveSubscription) {
        console.warn('Subscription expired. Redirecting to package selection.');
        return { name: 'PackageSelection' };
      }

      return true; // Allow navigation
    } catch (error) {
      console.error('Error in Subscription Guard:', error);
      return true; // Allow navigation on error (fail open)
    }
  };
}
