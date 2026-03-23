"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getFirebaseMessaging,
  getToken,
  onMessage,
} from "@/lib/firebase-messaging";
import { toast } from "sonner";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;
const SW_PATH = "/firebase-messaging-sw.js";

export function useFCM() {
  const { user } = useUser();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Detect browser support
  useEffect(() => {
    const supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  // Auto-restore if permission was already granted in a previous session
  useEffect(() => {
    if (!isSupported || !user) return;
    if (Notification.permission !== "granted") return;

    (async () => {
      try {
        // Register SW if not already registered (handles case where first enable() failed mid-way)
        let swReg = await navigator.serviceWorker
          .getRegistration(SW_PATH)
          .catch(() => undefined);
        if (!swReg) {
          swReg = await navigator.serviceWorker.register(SW_PATH);
        }

        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        }).catch(() => null);

        if (token) {
          await setDoc(doc(db, "users", user.id, "fcmTokens", token), {
            updatedAt: new Date(),
            userAgent: navigator.userAgent,
          });
          setIsEnabled(true);
          setupForegroundHandler(messaging);
        }
      } catch {
        // Silent — auto-restore is best-effort
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, user]);

  const setupForegroundHandler = useCallback((messaging: ReturnType<typeof getFirebaseMessaging>) => {
    if (!messaging || unsubscribeRef.current) return;
    unsubscribeRef.current = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "Expense Tracker";
      const body = payload.notification?.body ?? "";
      toast(title, { description: body });
    });
  }, []);

  const enable = useCallback(async () => {
    try {
      if (!user || !isSupported) return;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const swReg = await navigator.serviceWorker.register(SW_PATH);
      const messaging = getFirebaseMessaging();
      if (!messaging) return;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });
      if (!token) return;

      await setDoc(doc(db, "users", user.id, "fcmTokens", token), {
        updatedAt: new Date(),
        userAgent: navigator.userAgent,
      });

      setIsEnabled(true);
      setupForegroundHandler(messaging);
      toast.success("Notifications enabled");
    } catch (err) {
      console.error("[FCM] enable failed:", err);
    }
  }, [user, isSupported, setupForegroundHandler]);

  const disable = useCallback(async () => {
    if (!user || !isSupported) return;

    const swReg = await navigator.serviceWorker
      .getRegistration(SW_PATH)
      .catch(() => undefined);
    if (!swReg) return;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    }).catch(() => null);

    if (token) {
      await deleteDoc(doc(db, "users", user.id, "fcmTokens", token));
    }

    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setIsEnabled(false);
  }, [user, isSupported]);

  const notify = useCallback(
    async (title: string, body: string) => {
      if (!isEnabled) return;
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      }).catch(console.error);
    },
    [isEnabled]
  );

  return { permission, isEnabled, isSupported, enable, disable, notify };
}
