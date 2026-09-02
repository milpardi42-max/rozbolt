import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, verifyCredentials } from "@/lib/auth";
import { withNoStore } from "@/lib/http";

/** Never let a cached answer sit in front of a login: it sets (or clears) the session cookie. */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) return NextResponse.json({ ok: false, error: "invalid_payload" }, withNoStore({ status: 400 }));
  const result = verifyCredentials(body.email, body.password);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, withNoStore({ status: 401 }));
  const res = NextResponse.json({ ok: true, user: result.user }, withNoStore());
  res.cookies.set(SESSION_COOKIE, await createSessionToken(result.user), sessionCookieOptions());
  return res;
}
