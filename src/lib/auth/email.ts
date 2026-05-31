import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendMagicLinkEmail(email: string, link: string): Promise<void> {
  if (!resend) {
    // Dev fallback : log to console
    console.log(`\n[MAGIC LINK for ${email}]\n${link}\n`);
    return;
  }

  await resend.emails.send({
    from: `The soft War <${fromEmail}>`,
    to: email,
    subject: "Your sign-in link",
    text: `Click to sign in to The soft War:\n\n${link}\n\nThis link expires in 15 minutes.`,
    html: `<p>Click to sign in to <strong>The soft War</strong>:</p><p><a href="${link}">${link}</a></p><p style="color:#888;font-size:13px">This link expires in 15 minutes.</p>`,
  });
}
