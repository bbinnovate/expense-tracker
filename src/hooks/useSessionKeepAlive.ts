"use client";

import { useEffect } from "react";

export function useSessionKeepAlive() {
  useEffect(() => {
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/ping", { cache: "no-store" }).catch(() => {});
    };

    ping();

    document.addEventListener("visibilitychange", ping);
    return () => document.removeEventListener("visibilitychange", ping);
  }, []);
}
