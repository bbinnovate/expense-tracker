import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, url } = await req.json();

  // Fetch all FCM tokens registered for this user
  const snapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("fcmTokens")
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const tokens = snapshot.docs.map((d) => d.id);

  const response = await adminMessaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: {
      notification: {
        icon: "/icon-192.png",
        badge: "/icon-96.png",
        requireInteraction: false,
      },
      fcmOptions: { link: url || "/" },
    },
  });

  // Remove any expired / invalid tokens
  const cleanups = response.responses
    .map((r, i) => (!r.success ? snapshot.docs[i].ref.delete() : null))
    .filter(Boolean);
  await Promise.all(cleanups as Promise<FirebaseFirestore.WriteResult>[]);

  return NextResponse.json({ ok: true, sent: response.successCount });
}
