import { NextRequest, NextResponse } from "next/server";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;

  try {
    const { token } = await createMagicLink(email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = `${appUrl}/api/auth/callback?token=${encodeURIComponent(token)}`;
    await sendMagicLinkEmail(email, link);
    return NextResponse.json({ ok: true, message: "If the email is allowed, a link has been sent." });
  } catch {
    // Silent : don't reveal whether email is allowed
    return NextResponse.json({ ok: true, message: "If the email is allowed, a link has been sent." });
  }
}
