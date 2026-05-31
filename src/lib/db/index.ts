import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy singleton — only fails at first DB access, not at module import.
// This is required so `next build` can compile without DATABASE_URL set.
declare global {
  // eslint-disable-next-line no-var
  var __postgres: postgres.Sql | undefined;
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function getClient(): postgres.Sql {
  if (globalThis.__postgres) return globalThis.__postgres;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    prepare: false,
  });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__postgres = client;
  }
  return client;
}

/**
 * Drizzle client — lazy proxy. The actual connection only opens when a query runs.
 * Trying to use it without DATABASE_URL set will throw at query time, not at import.
 */
export const db = new Proxy(
  {} as ReturnType<typeof drizzle<typeof schema>>,
  {
    get(_target, prop) {
      if (!globalThis.__db) {
        globalThis.__db = drizzle(getClient(), { schema });
      }
      const value = Reflect.get(globalThis.__db, prop);
      return typeof value === "function" ? value.bind(globalThis.__db) : value;
    },
  },
);

export { schema };
export * from "./schema";
