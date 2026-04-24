// Hibi 日々 — Firebase Messaging Service Worker
// Handles background push notifications from Cloud Messaging (FCM).
//
// This SW runs alongside the main sw.js (which handles offline caching).
// Both can coexist because browsers allow multiple SWs on different scopes;
// firebase-messaging-sw.js is just a separate registration.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
importScripts('./firebase-config.js');

firebase.initializeApp(self.HIBI_FIREBASE_CONFIG);
const messaging = firebase.messaging();

// Background messages → show a notification.
messaging.onBackgroundMessage((payload) => {
  const { title = 'Hibi 日々', body = 'リマインダー' } = payload?.notification || {};
  const data = payload?.data || {};
  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.taskId || 'hibi',
    renotify: true,
    data,
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => {
    if (cs.length) return cs[0].focus();
    return self.clients.openWindow('./');
  }));
});
