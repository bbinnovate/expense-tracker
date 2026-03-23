importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAqJCrml0KEzL2ijjqfz9tRiZTM10_eUUE",
  authDomain: "expense-tracker-358a4.firebaseapp.com",
  projectId: "expense-tracker-358a4",
  storageBucket: "expense-tracker-358a4.firebasestorage.app",
  messagingSenderId: "1090282183350",
  appId: "1:1090282183350:web:0eacef6074ab73f50a2417",
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Expense Tracker";
  const body = payload.notification?.body || "";
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-96.png",
    tag: payload.data?.tag || "expense-notification",
    data: { url: payload.data?.url || "/" },
  });
});

// Open / focus the app when notification is tapped
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => c.url.includes(self.location.origin));
        if (existing) return existing.focus();
        return clients.openWindow(event.notification.data?.url || "/");
      })
  );
});
