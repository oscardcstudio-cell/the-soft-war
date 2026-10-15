/**
 * db.mjs — connexion Postgres + migration idempotente + seed des tokens.
 * Utilisé seulement quand DATABASE_URL est présent (prod Railway). En local : memory store.
 */
import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pkg;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = path.join(HERE, "node_modules", "remote-claude-chat", "src", "schema", "migration.sql");

export async function makeDb(databaseUrl, { tokens = [] } = {}) {
  const pool = new Pool({
    connectionString: databaseUrl,
    // Railway interne (postgres.railway.internal) = pas de SSL. Externe = SSL permissif.
    ssl: /railway\.internal/.test(databaseUrl) ? false : { rejectUnauthorized: false },
  });

  // Migration idempotente (les 3 tables remote_chat_*).
  await pool.query(fs.readFileSync(MIGRATION, "utf8"));

  // Seed des tokens (1 par pote, scopé à un agent). Révocable : UPDATE ... SET disabled = true.
  for (const t of tokens) {
    if (!t?.token || !t?.projectId) continue;
    // Upsert : un token déjà en base voit son project_id/label réalignés sur la config (ex passage à "*").
    await pool.query(
      `INSERT INTO remote_chat_tokens (token, project_id, label)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO UPDATE SET project_id = EXCLUDED.project_id, label = EXCLUDED.label`,
      [t.token, t.projectId, t.label || null]
    );
  }

  return { db: drizzle(pool), pool };
}
