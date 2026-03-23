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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const subsSnap = await adminDb.collectionGroup("pushSubscriptions").get();
  const userIds = [...new Set(subsSnap.docs.map((d) => d.ref.parent.parent!.id))];

  let notified = 0;

  await Promise.all(
    userIds.map(async (userId) => {
      const expensesSnap = await adminDb
        .collection("users").doc(userId).collection("expenses")
        .where("date", ">=", weekAgo)
        .get();

      if (expensesSnap.empty) return;

      const total = expensesSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0);
      const count = expensesSnap.size;
      const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

      const payload = JSON.stringify({
        title: "Your week in expenses 📊",
        body: `You logged ${count} expense${count === 1 ? "" : "s"} totalling ${fmt(total)} this week.`,
        url: "/",
      });

      const userSubsSnap = await adminDb
        .collection("users").doc(userId).collection("pushSubscriptions").get();

      const results = await Promise.allSettled(
        userSubsSnap.docs.map(async (d) => {
          const { subscription } = d.data() as { subscription: webpush.PushSubscription };
          await webpush.sendNotification(subscription, payload);
        })
      );

      const cleanups = results
        .map((r, i) => (r.status === "rejected" ? userSubsSnap.docs[i].ref.delete() : null))
        .filter(Boolean);
      await Promise.all(cleanups as Promise<FirebaseFirestore.WriteResult>[]);

      notified++;
    })
  );

  return NextResponse.json({ ok: true, notified });
}
