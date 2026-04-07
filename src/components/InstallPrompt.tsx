"use client";

import { useState, useEffect } from "react";
import { X, Share } from "lucide-react";

// BeforeInstallPromptEvent is not in standard TS types
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !("MSStream" in window);

    setIsIOS(ios);

    if (ios) {
      // On iOS, show manual instructions immediately
      setShow(true);
      return;
    }

    // Android/Chrome: check if event was already captured before React mounted
    const captured = (window as unknown as { __installPromptEvent?: BeforeInstallPromptEvent }).__installPromptEvent;
    if (captured) {
      setDeferredPrompt(captured);
      setShow(true);
      return;
    }

    // Otherwise listen for it
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-[calc(3.5rem+2.5rem+min(env(safe-area-inset-bottom,0px),16px))] left-0 right-0 z-40 px-3 pb-2 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <div className="text-xl shrink-0">💰</div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">
            Install Expense Tracker
          </div>
          {isIOS ? (
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
              Tap <Share className="w-3 h-3 inline shrink-0" /> then
              <span className="font-medium text-foreground">&ldquo;Add to Home Screen&rdquo;</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-0.5">
              Add to home screen for the best experience
            </div>
          )}
        </div>

        {!isIOS && (
          <button
            onClick={handleInstall}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
          >
            Install
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="shrink-0 p-1.5 rounded-md hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
