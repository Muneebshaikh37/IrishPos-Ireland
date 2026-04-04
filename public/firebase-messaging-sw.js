importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Updated to match backend service account: jaldi-19ab9
// Must match the values in src/config/constants.js
firebase.initializeApp({
  apiKey: "AIzaSyB5K6iXLWrN3IQpKD4AB_ndOaROoCCHjuQ",
  authDomain: "jaldi-19ab9.firebaseapp.com",
  projectId: "jaldi-19ab9",
  storageBucket: "jaldi-19ab9.firebasestorage.app",
  messagingSenderId: "350198239145",
  appId: "1:350198239145:web:3a1c87fd623a1705833eb8",
  measurementId: "G-QWSZTX9ETT"
});

const messaging = firebase.messaging();

// Listen for all messages (both foreground and background)
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Notification';
    const notificationBody = payload.notification?.body || payload.data?.message || payload.data?.body || '';
    const notificationOptions = {
      body: notificationBody,
      icon: '/favicon.png',
      data: payload.data || {}
    };
  
    // Show browser notification (only if app is in background)
    // If app is in foreground, the main app's onMessage will handle it
    self.registration.showNotification(notificationTitle, notificationOptions);
    
    // ALWAYS send message to all clients (main app) to show toast
    // This ensures toasts appear even when app is in foreground
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      clients.forEach((client) => {
        try {
          client.postMessage({
            type: 'FCM_MESSAGE',
            payload: payload
          });
        } catch (error) {
          // Silent error handling
        }
      });
    }).catch((error) => {
      // Silent error handling
    });
  });
