/* eslint-disable @typescript-eslint/no-explicit-any */

declare const self: any;

self.addEventListener("push", (event: any) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Expense Tracker", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-96.png",
      tag: data.tag || "expense-notification",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list: any[]) => {
        const existing = list.find((c) => c.url.includes(self.location.origin));
        if (existing) return existing.focus();
        return self.clients.openWindow(event.notification.data?.url || "/");
      })
  );
});
