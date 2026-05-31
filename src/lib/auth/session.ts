import { randomBytes } from "node:crypto";
import { db, sessions, users, type User } from "@/lib/db";
import { eq, lt } from "drizzle-orm";
import { cookies } from "next/headers";

const SESSION_TTL_DAYS = 30;
const SESSION_COOKIE = "tsw_session";

export async function createSession(userId: string): Promise<string> {
  const sessionId = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionId;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });
  if (!session || session.expiresAt < new Date()) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  return user ?? null;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Janitorial : delete expired sessions. Call from a cron or on login.
 */
export async function purgeExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
