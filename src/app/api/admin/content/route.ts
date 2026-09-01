import { NextResponse } from "next/server";
import { getContent, resetContent, saveContent } from "@/lib/data/store";
import type { SiteContent } from "@/lib/types";

/**
 * Admin content API. Auth is delegated to the client-side session in this local-first build;
 * wire this to real server-side auth (JWT/session cookie) before production.
 */
export async function GET() {
  return NextResponse.json(await getContent());
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as SiteContent | null;
  if (!body || !Array.isArray(body.patterns) || !Array.isArray(body.products)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  await saveContent(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await resetContent();
  return NextResponse.json({ ok: true });
}
