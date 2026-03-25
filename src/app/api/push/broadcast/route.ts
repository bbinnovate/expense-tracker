import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import webpush from "web-push";

export async function POST(req: NextRequest) {
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

  const { title, body } = await req.json();
  const payload = JSON.stringify({ title, body, url: "/" });

  // Query all pushSubscriptions across all users
  const snapshot = await adminDb.collectionGroup("pushSubscriptions").get();

  if (snapshot.empty) {
    return NextResponse.json({ ok: true, sent: 0, results: [] });
  }

  const results = await Promise.allSettled(
    snapshot.docs.map(async (d) => {
      const { subscription, userAgent } = d.data() as { subscription: webpush.PushSubscription; userAgent?: string };
      await webpush.sendNotification(subscription, payload);
      return { userId: d.ref.parent.parent?.id, userAgent };
    })
  );

  // Clean up truly expired subscriptions
  await Promise.all(
    results.map((r, i) => {
      if (r.status === "rejected") {
        const status = (r.reason as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) return snapshot.docs[i].ref.delete();
      }
      return null;
    }).filter(Boolean) as Promise<unknown>[]
  );

  const delivered = results
    .map((r) => r.status === "fulfilled" ? r.value : null)
    .filter(Boolean);

  const errors = results
    .map((r, i) => r.status === "rejected" ? {
      userId: snapshot.docs[i].ref.parent.parent?.id,
      error: (r.reason as Error)?.message
    } : null)
    .filter(Boolean);

  return NextResponse.json({ ok: true, sent: delivered.length, total: snapshot.size, delivered, errors });
}
