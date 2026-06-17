import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true }, {
    headers: {
      // Prevent SW from caching this — the whole point is a real network hit
      "Cache-Control": "no-store",
    },
  });
}
