<script setup>
import { ref, onMounted } from 'vue';
import { authHttpClient } from '@/network/modules/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useNotification } from "@/stores/notification.js";
import { useAuthStore } from "@/stores/auth.js";
import toast from "@/stores/utility/toast.js";
import {
  API_KEY, AUTH_DOMAIN, PROJECT_ID,
  STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID
} from "@/config/constants";

// Firebase Configuration
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};

// Initialize Firebase and Messaging
const app = initializeApp(firebaseConfig);

let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  // Silent error handling
}

// Notification State
const notifications = ref(useNotification().isNotification);

// Function to show toast notification
const showToastNotification = (title, body, data = {}) => {
  try {
    // Check if it's a low stock alert
    const isLowStock = data.type === 'low_stock' ||
                      (title && title.toLowerCase().includes('low stock')) ||
                      (body && body.toLowerCase().includes('low stock'));

    const toastData = isLowStock ? {
      subject: title || 'Low Stock Alert',
      message: body || 'Product stock is running low',
      type: 'warning',
      background: 'primary',
      parentBg: 'primary/10',
      heading: 'white',
      options: {
        duration: 5000,
        offset: { x: 10, y: 30 },
      },
      icon: 'AlertTriangle'
    } : {
      subject: title || 'Notification',
      message: body || 'You have a new notification',
      type: 'info',
      background: 'blue-600',
      parentBg: 'blue-100',
      heading: 'white',
      options: {
        duration: 4000,
        offset: { x: 10, y: 30 },
      },
      icon: 'Bell'
    };

    const toastStore = toast();
    toastStore.fry(toastData);
  } catch (error) {
    // Silent error handling
  }
};

// Handle Incoming Messages (foreground) - will be registered after messaging is confirmed
let onMessageRegistered = false;
const registerOnMessage = () => {
  if (messaging && !onMessageRegistered) {
    try {
      onMessage(messaging, (payload) => {
        // Handle both notification and data-only payloads
        let title, body;
        const data = payload.data || {};

        if (payload.notification) {
          // Standard FCM notification payload
          title = payload.notification.title;
          body = payload.notification.body;
        } else if (data.title || data.message) {
          // Data-only payload (custom format)
          title = data.title || 'Notification';
          body = data.message || data.body || '';
        }

        // Add to notification store
        if (title && body) {
          notifications.value.push({ title, body });
        }

        // Show toast notification if we have title and body (after 10 seconds delay)
        if (title && body) {
          // Dispatch event to refresh notification list in TopBar immediately
          window.dispatchEvent(new CustomEvent('notification-received', {
            detail: { title, body, type: data.type }
          }));

          // Show toast notification after 10 seconds
          setTimeout(() => {
            showToastNotification(title, body, data);
          }, 10000); // 10 seconds delay
        }
      });
      onMessageRegistered = true;
    } catch (error) {
      // Silent error handling
    }
  }
};

// Retrieve Device Information
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const deviceType = /Mobi|Tablet|iPad|iPhone/.test(userAgent) ? 'Mobile' : 'Desktop';

  const deviceInfo = {
    userAgent,
    platform,
    deviceType,
    os: navigator.appVersion,
  };

  localStorage.setItem('device_name', deviceType);
  return deviceInfo;
}

getDeviceInfo();

// Device Key Management
let deviceKey = localStorage.getItem('device_key');
if (!deviceKey) {
  deviceKey = uuidv4();
  localStorage.setItem('device_key', deviceKey);
}

// Save Token to Backend and Local Storage
async function saveTokenToBackendAndStorage(token, userId) {
  try {
    const name = localStorage.getItem('device_name');
    await authHttpClient.post(
        `/device-token?user_id=${userId}`,
        { token, name, device_key: deviceKey }
    );
    localStorage.setItem('fcmToken', token);
  } catch (error) {
    // Silent error handling
  }
}

// Get and Save Token
async function getAndSaveToken(userId) {
  if (!messaging) {
    return;
  }

  try {
    // Try without VAPID key first - Firebase will use the default from config
    // If this fails, get the correct VAPID key from Firebase Console:
    // https://console.firebase.google.com/project/jaldi-19ab9/settings/cloudmessaging
    // Then uncomment the vapidKey line below and replace with the correct key
    const currentToken = await getToken(messaging);
    // Alternative: If you have the correct VAPID key, use this instead:
    // const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_HERE' });

    if (currentToken) {
      await saveTokenToBackendAndStorage(currentToken, userId);
    }
  } catch (error) {
    // Silent error handling
  }
}

// Authentication and Initialization
const authStore = useAuthStore();
const token = localStorage.getItem('token');
const userId = authStore.getUserId;

onMounted(async () => {
  // Register service worker first (required for FCM)
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      await navigator.serviceWorker.ready;
    } catch (error) {
      // Silent error handling
    }
  }

  // Register onMessage handler now that messaging should be available
  if (messaging) {
    registerOnMessage();
  } else {
    // Wait a bit and try again if messaging wasn't ready
    setTimeout(() => {
      if (messaging) {
        registerOnMessage();
      }
    }, 1000);
  }

  // Initialize FCM token
  if (token && userId) {
    getAndSaveToken(userId);
  }

  // Function to handle service worker messages
  const handleServiceWorkerMessage = (event) => {
    // Handle FCM messages from service worker
    if (event.data && event.data.type === 'FCM_MESSAGE') {
        const payload = event.data.payload;

        // Handle both notification and data-only payloads
        let title, body;
        const data = payload.data || {};

        if (payload.notification) {
          // Standard FCM notification payload
          title = payload.notification.title;
          body = payload.notification.body;
        } else if (data.title || data.message) {
          // Data-only payload (custom format)
          title = data.title || 'Notification';
          body = data.message || data.body || '';
        }

        // Add to notification store
        if (title && body) {
          notifications.value.push({ title, body });
        }

        // Show toast notification if we have title and body (after 10 seconds delay)
        if (title && body) {
          // Dispatch event to refresh notification list in TopBar immediately
          window.dispatchEvent(new CustomEvent('notification-received', {
            detail: { title, body, type: data.type }
          }));

          // Show toast notification after 10 seconds
          setTimeout(() => {
            showToastNotification(title, body, data);
          }, 10000); // 10 seconds delay
        }
      }

    // Handle push-received for token refresh
    if (event.data?.type === 'push-received') {
      const userId = authStore.getUserId;
      if (userId) {
        getAndSaveToken(userId);
      }
    }
  };

  // Listen for messages from service worker (background notifications)
  if ('serviceWorker' in navigator) {
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    // Also listen via service worker controller if available
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.addEventListener('message', handleServiceWorkerMessage);
    }
  }
});
</script>
<template>

</template>
