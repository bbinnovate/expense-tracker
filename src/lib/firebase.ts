import { initializeApp, getApps } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqJCrml0KEzL2ijjqfz9tRiZTM10_eUUE",
  authDomain: "expense-tracker-358a4.firebaseapp.com",
  projectId: "expense-tracker-358a4",
  storageBucket: "expense-tracker-358a4.firebasestorage.app",
  messagingSenderId: "1090282183350",
  appId: "1:1090282183350:web:0eacef6074ab73f50a2417",
  measurementId: "G-1F4YWNB748",
};

// Prevent re-initialization during hot reload in Next.js
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use persistent cache — works across multiple tabs, queues writes offline
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;
