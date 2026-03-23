"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  "BOxFY-e5ghVsfJOYKeyM-EugNy6sbFREyPu8Au28OZFRKAmi_O2vaEQzcsKp4mgeBAYYjr-KphrQudV3WJOnUsU";

const SW_PATH = "/firebase-messaging-sw.js";

// Convert base64url string → Uint8Array (required by pushManager.subscribe)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function useFCM() {
  const { user } = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);
  }, []);

  // Auto-restore on load if permission already granted
  useEffect(() => {
    if (!isSupported || !user) return;
    if (Notification.permission !== "granted") return;

    (async () => {
      try {
        await navigator.serviceWorker.register(SW_PATH);
        const swReg = await navigator.serviceWorker.ready;
        const sub = await swReg.pushManager.getSubscription();
        if (!sub) return;

        // If VAPID key changed, unsubscribe the stale subscription so the prompt re-appears
        const storedKey = localStorage.getItem("vapid-public-key");
        if (storedKey !== VAPID_PUBLIC_KEY) {
          await sub.unsubscribe();
          localStorage.removeItem("vapid-public-key");
          localStorage.removeItem("notif-prompt-dismissed");
          return; // isEnabled stays false → prompt will show
        }

        setIsEnabled(true);
      } catch {
        // silent
      }
    })();
  }, [isSupported, user]);

  const enable = useCallback(async () => {
    try {
      if (!user) { toast.error("DBG: no user"); return; }
      if (!isSupported) { toast.error("DBG: push not supported"); return; }

      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast.error("DBG: perm=" + perm); return; }

      await navigator.serviceWorker.register(SW_PATH);
      const swReg = await navigator.serviceWorker.ready;
      toast("DBG: SW ready");

      const sub = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      toast("DBG: subscribed");

      await setDoc(doc(db, "users", user.id, "pushSubscriptions", btoa(sub.endpoint).slice(-20)), {
        subscription: sub.toJSON(),
        updatedAt: new Date(),
        userAgent: navigator.userAgent,
      });

      localStorage.setItem("vapid-public-key", VAPID_PUBLIC_KEY);
      setIsEnabled(true);
      toast.success("Notifications enabled ✓");
    } catch (err) {
      toast.error("DBG: " + (err instanceof Error ? err.message : String(err)));
    }
  }, [user, isSupported]);

  const disable = useCallback(async () => {
    if (!user || !isSupported) return;
    try {
      const swReg = await navigator.serviceWorker.ready;
      const sub = await swReg.pushManager.getSubscription();
      if (sub) {
        const key = btoa(sub.endpoint).slice(-20);
        await sub.unsubscribe();
        await deleteDoc(doc(db, "users", user.id, "pushSubscriptions", key));
      }
      setIsEnabled(false);
    } catch {
      // silent
    }
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

  return { isEnabled, isSupported, enable, disable, notify };
}
