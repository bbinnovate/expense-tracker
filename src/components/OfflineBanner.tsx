"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-zinc-800/95 backdrop-blur-sm px-4 py-2.5 text-sm text-zinc-300 border-b border-zinc-700/50">
      <WifiOff className="w-4 h-4 text-zinc-400 shrink-0" />
      <span>You&apos;re offline — expenses will sync when you reconnect</span>
    </div>
  );
}
