// Firebase Cloud Messaging Service Worker
// This service worker handles push notifications from Firebase

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
// Note: These values should match your Firebase project
const firebaseConfig = {
  apiKey: 'placeholder', // Will be set via postMessage from main thread
  authDomain: 'placeholder',
  projectId: 'placeholder',
  storageBucket: 'placeholder',
  messagingSenderId: 'placeholder',
  appId: 'placeholder',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'EduNexus Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: payload.notification?.image,
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    actions: getNotificationActions(payload.data?.type),
    requireInteraction: isHighPriorityNotification(payload.data?.type),
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  // Determine URL based on notification type
  switch (data.type) {
    case 'payment_success':
    case 'fee_reminder':
    case 'fee_overdue':
      targetUrl = '/student/fees';
      break;
    case 'attendance_alert':
      targetUrl = '/student/attendance';
      break;
    case 'exam_result':
      targetUrl = '/student/exams';
      break;
    case 'announcement':
      targetUrl = '/announcements';
      break;
    case 'library_due':
      targetUrl = '/student/library';
      break;
    case 'transport_alert':
      targetUrl = '/student/transport';
      break;
    default:
      targetUrl = data.clickAction || '/student';
  }

  // Handle action clicks
  if (event.action) {
    switch (event.action) {
      case 'view':
        // Default behavior - open the target URL
        break;
      case 'pay':
        targetUrl = '/student/fees?action=pay';
        break;
      case 'dismiss':
        return; // Just close the notification
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if any client window is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification was closed:', event.notification.tag);
});

// Helper function to get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'fee_reminder':
    case 'fee_overdue':
      return [
        { action: 'pay', title: 'Pay Now' },
        { action: 'view', title: 'View Details' },
      ];
    case 'payment_success':
      return [{ action: 'view', title: 'View Receipt' }];
    case 'exam_result':
      return [{ action: 'view', title: 'View Results' }];
    case 'announcement':
      return [
        { action: 'view', title: 'Read More' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
    default:
      return [{ action: 'view', title: 'View' }];
  }
}

// Helper function to determine if notification should require interaction
function isHighPriorityNotification(type) {
  const highPriorityTypes = ['fee_overdue', 'attendance_alert', 'urgent_announcement'];
  return highPriorityTypes.includes(type);
}

// Listen for messages from the main thread to update config
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    console.log('[firebase-messaging-sw.js] Received Firebase config from main thread');
    // Config is already set during initialization
    // This is mainly for logging/debugging
  }
});

console.log('[firebase-messaging-sw.js] Service worker loaded');
