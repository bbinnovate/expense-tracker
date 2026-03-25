import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const SUBCOLLECTIONS = ["expenses", "categories", "members"];
const SINGLE_DOCS = [
  { col: "budgets", id: "targets" },
  { col: "settings", id: "categoryOrder" },
];

async function copyCollection(fromPath: string, toPath: string) {
  const snap = await adminDb.collection(fromPath).get();
  if (snap.empty) return 0;
  const batch = adminDb.batch();
  snap.docs.forEach((d) => batch.set(adminDb.doc(`${toPath}/${d.id}`), d.data()));
  await batch.commit();
  return snap.size;
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if already migrated
  const newUserDoc = await adminDb.doc(`users/${userId}`).get();
  if (newUserDoc.data()?.migratedAt) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const email = newUserDoc.data()?.email;
  if (!email) return NextResponse.json({ error: "No email on user doc" }, { status: 400 });

  // Find old user doc with same email but different ID
  const oldUserSnap = await adminDb
    .collection("users")
    .where("email", "==", email)
    .get();

  const oldDoc = oldUserSnap.docs.find((d) => d.id !== userId);
  if (!oldDoc) {
    // No old data found — mark as checked so we don't run again
    await adminDb.doc(`users/${userId}`).set({ migratedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ ok: true, skipped: true, reason: "no old data found" });
  }

  const oldId = oldDoc.id;
  let totalCopied = 0;

  // Copy subcollections
  for (const col of SUBCOLLECTIONS) {
    const count = await copyCollection(`users/${oldId}/${col}`, `users/${userId}/${col}`);
    totalCopied += count;
  }

  // Copy single documents
  for (const { col, id } of SINGLE_DOCS) {
    const snap = await adminDb.doc(`users/${oldId}/${col}/${id}`).get();
    if (snap.exists) {
      await adminDb.doc(`users/${userId}/${col}/${id}`).set(snap.data()!);
      totalCopied++;
    }
  }

  // Mark migration complete
  await adminDb.doc(`users/${userId}`).set({ migratedAt: FieldValue.serverTimestamp() }, { merge: true });

  return NextResponse.json({ ok: true, migratedFrom: oldId, totalCopied });
}
