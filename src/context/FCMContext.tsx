"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useFCM } from "@/hooks/useFCM";

type FCMContextValue = ReturnType<typeof useFCM>;

const FCMContext = createContext<FCMContextValue | null>(null);

export function FCMProvider({ children }: { children: ReactNode }) {
  const fcm = useFCM();
  return <FCMContext.Provider value={fcm}>{children}</FCMContext.Provider>;
}

export function useFCMContext() {
  const ctx = useContext(FCMContext);
  if (!ctx) throw new Error("useFCMContext must be used within FCMProvider");
  return ctx;
}
