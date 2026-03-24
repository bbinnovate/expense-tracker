// Custom service worker code — merged into next-pwa's generated sw.js

self.addEventListener("push", (event: Event) => {
  const pushEvent = event as PushEvent;
  if (!pushEvent.data) return;
  const data = pushEvent.data.json();
  pushEvent.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(
      data.title || "Expense Tracker",
      {
        body: data.body || "",
        icon: "/icon-192.png",
        badge: "/icon-96.png",
        tag: data.tag || "expense-notification",
        data: { url: data.url || "/" },
      }
    )
  );
});

self.addEventListener("notificationclick", (event: Event) => {
  const notifEvent = event as NotificationEvent;
  notifEvent.notification.close();
  notifEvent.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list: readonly WindowClient[]) => {
        const existing = list.find((c) =>
          c.url.includes((self as unknown as ServiceWorkerGlobalScope).location.origin)
        );
        if (existing) return existing.focus();
        return (self as unknown as ServiceWorkerGlobalScope).clients.openWindow(
          notifEvent.notification.data?.url || "/"
        );
      })
  );
});
