"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { FCMProvider } from "@/context/FCMContext";
import { OfflineBanner } from "@/components/OfflineBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FCMProvider>
      <TooltipProvider>
        <OfflineBanner />
        {children}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </FCMProvider>
  );
}
