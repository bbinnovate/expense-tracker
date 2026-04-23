import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PAGE_PASSWORD = "growbig8080";

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");
  if (password !== PAGE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [userDocs, expensesSnapshot, subscriptionsSnapshot, pwaUsersSnapshot] = await Promise.all([
    adminDb.collection("users").listDocuments(),
    adminDb.collectionGroup("expenses").get(),
    adminDb.collectionGroup("pushSubscriptions").get(),
    adminDb.collection("users").where("pwaInstalledAt", "!=", null).select("pwaInstalledAt").get(),
  ]);

  let totalSpent = 0;
  const categoryTotals: Record<string, { total: number; count: number }> = {};
  const userStats: Record<string, { expenseCount: number; totalSpent: number; lastActive: string; deviceCount: number }> = {};

  // Seed every registered user so the table matches the Total Users count
  userDocs.forEach((ref) => {
    userStats[ref.id] = { expenseCount: 0, totalSpent: 0, lastActive: "", deviceCount: 0 };
  });

  expensesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const userId = doc.ref.parent.parent?.id ?? "unknown";
    const amount = typeof data.amount === "number" ? data.amount : 0;
    const categoryId = data.categoryId ?? "misc";
    const date = data.date ?? "";

    totalSpent += amount;

    if (!categoryTotals[categoryId]) categoryTotals[categoryId] = { total: 0, count: 0 };
    categoryTotals[categoryId].total += amount;
    categoryTotals[categoryId].count += 1;

    if (!userStats[userId]) userStats[userId] = { expenseCount: 0, totalSpent: 0, lastActive: "", deviceCount: 0 };
    userStats[userId].expenseCount += 1;
    userStats[userId].totalSpent += amount;
    if (date > userStats[userId].lastActive) userStats[userId].lastActive = date;
  });

  subscriptionsSnapshot.docs.forEach((doc) => {
    const userId = doc.ref.parent.parent?.id ?? "unknown";
    if (!userStats[userId]) userStats[userId] = { expenseCount: 0, totalSpent: 0, lastActive: "", deviceCount: 0 };
    userStats[userId].deviceCount += 1;
  });

  const recentExpenses = [...expensesSnapshot.docs]
    .sort((a, b) => {
      const aDate = a.data().date ?? "";
      const bDate = b.data().date ?? "";
      return bDate.localeCompare(aDate);
    })
    .slice(0, 20)
    .map((doc) => ({
      id: doc.id,
      userId: doc.ref.parent.parent?.id ?? "unknown",
      amount: doc.data().amount ?? 0,
      categoryId: doc.data().categoryId ?? "misc",
      description: doc.data().description ?? "",
      date: doc.data().date ?? "",
      whoSpent: doc.data().whoSpent ?? "",
    }));

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const users = Object.entries(userStats)
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return NextResponse.json({
    totalUsers: userDocs.length,
    totalExpenses: expensesSnapshot.size,
    totalSpent,
    activeDevices: subscriptionsSnapshot.size,
    pwaInstalls: pwaUsersSnapshot.size,
    recentExpenses,
    users,
    categoryBreakdown,
  });
}
