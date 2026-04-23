import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRef = adminDb.collection("users").doc(userId);
  const doc = await userRef.get();

  const now = new Date().toISOString();
  const update: Record<string, string> = { pwaLastSeenAt: now };
  if (!doc.exists || !doc.data()?.pwaInstalledAt) {
    update.pwaInstalledAt = now;
  }

  await userRef.set(update, { merge: true });
  return NextResponse.json({ ok: true });
}
