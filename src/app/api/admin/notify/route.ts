import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import webpush from "web-push";

const PAGE_PASSWORD = "growbig8080";

export async function POST(req: NextRequest) {
  const { password, title, body } = await req.json();

  if (password !== PAGE_PASSWORD) {
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

  const payload = JSON.stringify({ title, body, url: "/" });
  const snapshot = await adminDb.collectionGroup("pushSubscriptions").get();

  if (snapshot.empty) {
    return NextResponse.json({ ok: true, sent: 0, total: 0, delivered: [], errors: [] });
  }

  const results = await Promise.allSettled(
    snapshot.docs.map(async (d) => {
      const { subscription, userAgent } = d.data() as { subscription: webpush.PushSubscription; userAgent?: string };
      await webpush.sendNotification(subscription, payload);
      return { userId: d.ref.parent.parent?.id, userAgent };
    })
  );

  await Promise.all(
    results.map((r, i) => {
      if (r.status === "rejected") {
        const status = (r.reason as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) return snapshot.docs[i].ref.delete();
      }
      return null;
    }).filter(Boolean) as Promise<unknown>[]
  );

  const delivered = results.map((r) => r.status === "fulfilled" ? r.value : null).filter(Boolean);
  const errors = results.map((r, i) => r.status === "rejected" ? {
    userId: snapshot.docs[i].ref.parent.parent?.id,
    error: (r.reason as Error)?.message,
  } : null).filter(Boolean);

  return NextResponse.json({ ok: true, sent: delivered.length, total: snapshot.size, delivered, errors });
}
