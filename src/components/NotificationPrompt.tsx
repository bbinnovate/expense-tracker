"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useFCMContext } from "@/context/FCMContext";

export function NotificationPrompt() {
  const { enable, isEnabled } = useFCMContext();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("notif-prompt-dismissed")) return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "denied") return;

    // Permission default → ask straight away
    if (Notification.permission === "default") {
      setShow(true);
      return;
    }

    // Permission granted but token not saved yet → wait for auto-restore then check
    if (Notification.permission === "granted") {
      const t = setTimeout(() => {
        if (!isEnabled) setShow(true); // still not enabled after 3s → something went wrong
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isEnabled]);

  const handleEnable = async () => {
    setShow(false);
    await enable();
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("notif-prompt-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleDismiss} />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>

          <div>
            <div className="text-base font-semibold text-foreground">
              Stay on top of your budget
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Get notified when any category goes over budget.
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full mt-1">
            <button
              onClick={handleEnable}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Enable Notifications
            </button>
            <button
              onClick={handleDismiss}
              className="w-full h-10 rounded-xl bg-secondary text-muted-foreground text-sm transition-colors hover:bg-secondary/80"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
