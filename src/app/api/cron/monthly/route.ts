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

  // Previous month date range
  const now = new Date();
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const monthStart = firstOfLastMonth.toISOString().slice(0, 10);
  const monthEnd = lastOfLastMonth.toISOString().slice(0, 10);
  const monthName = firstOfLastMonth.toLocaleString("en-IN", { month: "long" });

  const subsSnap = await adminDb.collectionGroup("pushSubscriptions").get();
  const userIds = [...new Set(subsSnap.docs.map((d) => d.ref.parent.parent!.id))];

  let notified = 0;

  await Promise.all(
    userIds.map(async (userId) => {
      const [expensesSnap, budgetDoc] = await Promise.all([
        adminDb.collection("users").doc(userId).collection("expenses")
          .where("date", ">=", monthStart)
          .where("date", "<=", monthEnd)
          .get(),
        adminDb.collection("users").doc(userId).collection("budgets").doc("targets").get(),
      ]);

      if (expensesSnap.empty) return;

      const budgetTargets: Record<string, number> = budgetDoc.exists ? (budgetDoc.data() as Record<string, number>) : {};
      const spentByCategory: Record<string, number> = {};
      let totalSpent = 0;

      expensesSnap.docs.forEach((d) => {
        const { categoryId, amount } = d.data();
        spentByCategory[categoryId] = (spentByCategory[categoryId] ?? 0) + amount;
        totalSpent += amount;
      });

      const categoriesWithBudget = Object.keys(budgetTargets).filter((id) => budgetTargets[id] > 0);
      const underBudget = categoriesWithBudget.filter(
        (id) => (spentByCategory[id] ?? 0) <= budgetTargets[id]
      ).length;
      const overBudget = categoriesWithBudget.length - underBudget;

      const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

      let body = `You spent ${fmt(totalSpent)} in ${monthName}.`;
      if (categoriesWithBudget.length > 0) {
        if (overBudget === 0) {
          body += ` Stayed under budget in all ${underBudget} categories — great job! 🎉`;
        } else {
          body += ` ${underBudget}/${categoriesWithBudget.length} categories under budget.`;
        }
      }

      const payload = JSON.stringify({
        title: `${monthName} wrapped up 🗓️`,
        body,
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
