import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  // Allow drizzle-kit generate to work without DB connection
  console.warn("DATABASE_URL not set — only generate/check will work");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://invalid",
  },
  strict: true,
  verbose: true,
});
