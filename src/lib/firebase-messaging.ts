import { getMessaging, type Messaging } from "firebase/messaging";
import app from "./firebase";

// Lazy-init to avoid SSR crash (window/navigator not available server-side)
let messaging: Messaging | null = null;

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!messaging) messaging = getMessaging(app);
  return messaging;
}

export { getToken, onMessage } from "firebase/messaging";
