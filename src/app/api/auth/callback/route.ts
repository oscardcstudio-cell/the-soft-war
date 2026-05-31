import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth/magic-link";
import { createSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing_token", req.url));
  }

  try {
    const userId = await consumeMagicLink(token);
    await createSession(userId);
    return NextResponse.redirect(new URL("/projects", req.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid";
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, req.url));
  }
}
