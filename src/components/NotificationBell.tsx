"use client";

import { Bell, BellOff } from "lucide-react";
import { useFCMContext } from "@/context/FCMContext";

export function NotificationBell() {
  const { isEnabled, isSupported, enable, disable, permission } =
    useFCMContext();

  if (!isSupported) return null;

  const handleToggle = () => (isEnabled ? disable() : enable());

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-secondary transition-colors"
      title={
        permission === "denied"
          ? "Notifications blocked — enable in browser settings"
          : isEnabled
            ? "Disable notifications"
            : "Enable notifications"
      }
    >
      {isEnabled ? (
        <Bell className="w-4 h-4 text-primary" />
      ) : (
        <BellOff className="w-4 h-4 text-muted-foreground/60" />
      )}
    </button>
  );
}
