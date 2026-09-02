import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getContent, resetContent, saveContent } from "@/lib/data/store";
import type { SiteContent } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Admin content API — protected by the signed HttpOnly session cookie (see src/lib/auth.ts). */
async function requireAdmin() {
  const user = await getSession();
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getContent());
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as SiteContent | null;
  if (!body || !Array.isArray(body.patterns) || !Array.isArray(body.products)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  await saveContent(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  await resetContent();
  return NextResponse.json({ ok: true });
}
