import { createHash, randomBytes } from "node:crypto";
import { db, magicLinks, users } from "@/lib/db";
import { eq } from "drizzle-orm";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a magic link token for an email.
 * Only the configured ADMIN_EMAIL can request a magic link.
 */
export async function createMagicLink(email: string): Promise<{ token: string; expiresAt: Date }> {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is not configured");
  }
  if (email.toLowerCase().trim() !== adminEmail) {
    // Don't reveal that it's the wrong email — just refuse silently in the route handler
    throw new Error("Email not allowed");
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  await db.insert(magicLinks).values({
    id: crypto.randomUUID(),
    email: adminEmail,
    tokenHash,
    expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Consume a magic link token : returns user id if valid, throws otherwise.
 * Creates the user on first login.
 */
export async function consumeMagicLink(token: string): Promise<string> {
  const tokenHash = hashToken(token);
  const link = await db.query.magicLinks.findFirst({
    where: eq(magicLinks.tokenHash, tokenHash),
  });

  if (!link) throw new Error("Invalid token");
  if (link.consumedAt) throw new Error("Token already used");
  if (link.expiresAt < new Date()) throw new Error("Token expired");

  // Mark as consumed
  await db.update(magicLinks)
    .set({ consumedAt: new Date() })
    .where(eq(magicLinks.id, link.id));

  // Find or create user
  let user = await db.query.users.findFirst({
    where: eq(users.email, link.email),
  });

  if (!user) {
    const newUserId = crypto.randomUUID();
    await db.insert(users).values({
      id: newUserId,
      email: link.email,
    });
    user = { id: newUserId, email: link.email, createdAt: new Date() };
  }

  return user.id;
}
