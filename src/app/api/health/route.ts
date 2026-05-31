import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HealthResult = {
  ok: boolean;
  app: "up";
  db: { ok: boolean; latencyMs: number | null; error?: string };
  redis: { ok: boolean; latencyMs: number | null; error?: string };
  version: string;
};

async function pingDb(): Promise<HealthResult["db"]> {
  const start = Date.now();
  try {
    if (!process.env.DATABASE_URL) {
      return { ok: false, latencyMs: null, error: "DATABASE_URL not set" };
    }
    const { db } = await import("@/lib/db");
    await db.execute("select 1");
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: null,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

async function pingRedis(): Promise<HealthResult["redis"]> {
  const start = Date.now();
  try {
    if (!process.env.REDIS_URL) {
      return { ok: false, latencyMs: null, error: "REDIS_URL not set" };
    }
    const { connection } = await import("@/lib/queue");
    const pong = await connection.ping();
    if (pong !== "PONG") throw new Error(`unexpected response: ${pong}`);
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: null,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function GET() {
  const [db, redis] = await Promise.all([pingDb(), pingRedis()]);
  const result: HealthResult = {
    ok: db.ok && redis.ok,
    app: "up",
    db,
    redis,
    version: "0.1.0",
  };
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
