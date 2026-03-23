import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import webpush from "web-push";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    webpush.setVapidDetails(
      "mailto:" + (process.env.VAPID_CONTACT_EMAIL || "admin@expensetracker.app"),
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "",
      process.env.VAPID_PRIVATE_KEY || ""
    );
  } catch (err) {
    return NextResponse.json({ error: "VAPID config error: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get all users who have push subscriptions
  const usersSnap = await adminDb.collectionGroup("pushSubscriptions").get();

  // Deduplicate by userId
  const userIds = [...new Set(usersSnap.docs.map((d) => d.ref.parent.parent!.id))];

  let notified = 0;

  await Promise.all(
    userIds.map(async (userId) => {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const lastEntryAt: string | undefined = userDoc.data()?.lastEntryAt;

      const lastSeen: string | undefined = userDoc.data()?.lastSeen?.toDate?.()?.toISOString();

      // Skip if last entry is within 24h
      if (lastEntryAt && lastEntryAt > cutoff) return;
      // Skip new users who haven't even opened the app yet (lastSeen within 24h but no entry ever)
      // Only notify if they've been active for at least a day without logging
      if (!lastEntryAt && lastSeen && lastSeen > cutoff) return;

      const subsSnap = await adminDb
        .collection("users")
        .doc(userId)
        .collection("pushSubscriptions")
        .get();

      const payload = JSON.stringify({
        title: "Don't forget to log today 📝",
        body: "You haven't added any expenses in the last 24 hours.",
        url: "/",
      });

      const results = await Promise.allSettled(
        subsSnap.docs.map(async (d) => {
          const { subscription } = d.data() as { subscription: webpush.PushSubscription };
          await webpush.sendNotification(subscription, payload);
        })
      );

      // Clean up expired subscriptions
      const cleanups = results
        .map((r, i) => (r.status === "rejected" ? subsSnap.docs[i].ref.delete() : null))
        .filter(Boolean);
      await Promise.all(cleanups as Promise<FirebaseFirestore.WriteResult>[]);

      notified++;
    })
  );

  return NextResponse.json({ ok: true, notified });
}
