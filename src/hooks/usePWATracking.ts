"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export function usePWATracking() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const track = async () => {
      // Rate-limit: at most once per day per user per device
      const key = `pwa_tracked_${user.id}_${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(key)) return;

      try {
        const res = await fetch("/api/pwa/installed", { method: "POST" });
        if (res.ok) localStorage.setItem(key, "1");
      } catch {
        // silent — non-critical telemetry
      }
    };

    // Already running as installed PWA
    if (isStandalone()) {
      track();
    }

    // Fires when user accepts the install prompt (Android/Chrome)
    window.addEventListener("appinstalled", track);
    return () => window.removeEventListener("appinstalled", track);
  }, [user]);
}
