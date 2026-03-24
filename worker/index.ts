/* eslint-disable @typescript-eslint/no-explicit-any */

(self as any).addEventListener("push", (event: any) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    (self as any).registration.showNotification(data.title || "Expense Tracker", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-96.png",
      tag: data.tag || "expense-notification",
      data: { url: data.url || "/" },
    })
  );
});

(self as any).addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  event.waitUntil(
    (self as any).clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list: any[]) => {
        const existing = list.find((c: any) =>
          c.url.includes((self as any).location.origin)
        );
        if (existing) return existing.focus();
        return (self as any).clients.openWindow(event.notification.data?.url || "/");
      })
  );
});
