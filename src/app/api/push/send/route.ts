import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import webpush from "web-push";

export async function POST(req: NextRequest) {
  try {
    webpush.setVapidDetails(
      "mailto:" + (process.env.VAPID_CONTACT_EMAIL || "admin@expensetracker.app"),
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
        "BOxFY-e5ghVsfJOYKeyM-EugNy6sbFREyPu8Au28OZFRKAmi_O2vaEQzcsKp4mgeBAYYjr-KphrQudV3WJOnUsU",
      process.env.VAPID_PRIVATE_KEY || ""
    );
  } catch (err) {
    return NextResponse.json({ error: "VAPID config error: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, url } = await req.json();

  const snapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("pushSubscriptions")
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const payload = JSON.stringify({ title, body, url: url || "/" });

  const results = await Promise.allSettled(
    snapshot.docs.map(async (d) => {
      const { subscription } = d.data() as { subscription: webpush.PushSubscription };
      await webpush.sendNotification(subscription, payload);
    })
  );

  const errors = results
    .map((r, i) => r.status === "rejected" ? { doc: snapshot.docs[i].id, error: (r.reason as Error)?.message } : null)
    .filter(Boolean);

  // Only clean up truly expired subscriptions (410 Gone)
  const cleanups = results
    .map((r, i) => {
      if (r.status === "rejected") {
        const status = (r.reason as { statusCode?: number })?.statusCode;
        return status === 410 || status === 404 ? snapshot.docs[i].ref.delete() : null;
      }
      return null;
    })
    .filter(Boolean);
  await Promise.all(cleanups as Promise<FirebaseFirestore.WriteResult>[]);

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ ok: true, sent, errors });
}
