"use client";

import { Bell, BellOff } from "lucide-react";
import { useFCMContext } from "@/context/FCMContext";

export function NotificationBell() {
  const { isEnabled, isSupported, enable, disable } = useFCMContext();

  if (!isSupported) return null;

  const handleToggle = () => (isEnabled ? disable() : enable());

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-secondary transition-colors"
      title={isEnabled ? "Disable notifications" : "Enable notifications"}
    >
      {isEnabled ? (
        <Bell className="w-4 h-4 text-primary" />
      ) : (
        <BellOff className="w-4 h-4 text-muted-foreground/60" />
      )}
    </button>
  );
}
