import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Connection pool — singleton across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __postgres: postgres.Sql | undefined;
}

const client =
  globalThis.__postgres ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    prepare: false, // Required for Supabase / Railway Postgres
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__postgres = client;
}

export const db = drizzle(client, { schema });
export { schema };
export * from "./schema";
