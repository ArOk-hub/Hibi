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
  const taskId = e.notification?.data?.taskId || '';
  const targetUrl = taskId ? `./?task=${encodeURIComponent(taskId)}` : './';
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // If the app is already open, focus it and tell it which task to open.
    for (const c of cs) {
      if (c.url.includes(self.registration.scope) || c.url.includes('/')) {
        try { c.postMessage({ type: 'hibi-open-task', taskId }); } catch(e) {}
        try { await c.focus(); return; } catch(e) {}
      }
    }
    // No open client — launch a new window with the task id in the URL.
    await self.clients.openWindow(targetUrl);
  })());
});
