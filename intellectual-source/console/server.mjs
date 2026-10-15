/**
 * server.mjs — hub : 1 URL, un pote (token) converse avec TOUS les agents.
 * Les agents sont AUTO-DÉCOUVERTS par le worker (scan d'un dossier) et publiés ici (/_hub/agents).
 * Le token est une "personne" (project_id = "*") ; l'agent ciblé voyage en header x-project-id.
 * Prod (Railway) : DATABASE_URL → Postgres. Local : memory store. Auth réelle (devBypass:false).
 */
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { timingSafeEqual } from "node:crypto";
import { createChatRelayRouter } from "remote-claude-chat/server";
import { createMemoryStore } from "remote-claude-chat/server/stores/memory";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5180);

// Fail-closed : secrets de confort (worker token, token de secours) UNIQUEMENT si bypass dev explicite.
// En prod (Railway) les vars sont set ; sans elles ET sans bypass → on refuse de démarrer plutôt que
// de servir avec un secret PUBLIC connu (audit sécu remote-claude-chat 2026-06-23).
const DEV_BYPASS = process.env.RCC_DEV_BYPASS === "1";

const WORKER_TOKEN = process.env.WORKER_TOKEN || (DEV_BYPASS ? "local-worker-secret" : null);
if (!WORKER_TOKEN) {
  console.error("✗ WORKER_TOKEN absent et RCC_DEV_BYPASS≠1 — refus de démarrer avec un secret par défaut public. Set WORKER_TOKEN (prod) ou RCC_DEV_BYPASS=1 (dev local).");
  process.exit(1);
}

// Comparaison à temps constant (anti timing-attack) sur les comparaisons de secret hors routeur.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a ?? ""), "utf8");
  const bb = Buffer.from(String(b ?? ""), "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// Tokens (secrets, hors git) : RCC_TOKENS = JSON [{token, projectId, label}]. project_id "*" = personne (tous les agents).
function loadTokens() {
  const out = [];
  try { for (const t of JSON.parse(process.env.RCC_TOKENS || "[]")) if (t?.token && t?.projectId) out.push(t); } catch {}
  // Token de secours PUBLIC connu : seulement en bypass dev explicite. Sinon le pote doit avoir un vrai token.
  if (!out.length && DEV_BYPASS) out.push({ token: "local-dev-token", projectId: "*", label: "local-dev" });
  return out;
}
const TOKENS = loadTokens();

let store;
if (process.env.DATABASE_URL) {
  const { makeDb } = await import("./db.mjs");
  const { createDrizzlePgStore } = await import("remote-claude-chat/server/stores/drizzle-pg");
  const { db } = await makeDb(process.env.DATABASE_URL, { tokens: TOKENS });
  store = createDrizzlePgStore({ db });
  console.log(`✓ store: drizzle-pg · ${TOKENS.length} token(s)`);
} else {
  store = createMemoryStore({ tokens: TOKENS });
  console.log(`✓ store: memory · ${TOKENS.length} token(s)`);
}

let AGENTS = [];          // liste publiée par le worker (la machine hôte)
let lastWorkerSeen = 0;   // heartbeat : le worker poll /_worker toutes les ~2s (preuve qu'il tourne)

const app = express();
// Heartbeat : tout hit worker (poll/reply, ~2s) prouve que le PC est en ligne. Avant le routeur.
app.use("/_worker", (_req, _res, next) => { lastWorkerSeen = Date.now(); next(); });
app.use(createChatRelayRouter({ store, workerToken: WORKER_TOKEN, devBypass: false }));
app.use("/rcc", express.static(path.join(HERE, "node_modules", "remote-claude-chat", "src", "client")));

// Le worker publie sa liste d'agents auto-découverts (auth WORKER_TOKEN).
app.post("/_hub/agents", express.json({ limit: "64kb" }), (req, res) => {
  if (!safeEqual(req.headers["x-worker-token"], WORKER_TOKEN)) return res.status(401).json({ error: "worker non autorisé" });
  AGENTS = Array.isArray(req.body?.agents) ? req.body.agents : [];
  lastWorkerSeen = Date.now();
  res.json({ ok: true, count: AGENTS.length });
});

// Le dashboard liste les agents (auth = token du pote).
app.get("/agents", async (req, res) => {
  const t = req.headers["x-access-token"];
  if (!t) return res.status(401).json({ error: "token requis" });
  const d = await store.resolveAccessToken(String(t));
  if (!d || d.disabled) return res.status(401).json({ error: "token invalide" });
  res.json({ agents: AGENTS, workerOnline: Date.now() - lastWorkerSeen < 30000, lastSeenAgoMs: lastWorkerSeen ? Date.now() - lastWorkerSeen : null });
});

app.get("/config.js", (_req, res) => res.type("application/javascript").send(`window.RCC_CONFIG=${JSON.stringify({ apiBase: "/api/chat" })};`));
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.sendFile(path.join(HERE, "dashboard.html")));

app.listen(PORT, () => console.log(`▶ hub agents → :${PORT} · WORKER_TOKEN set=${!!process.env.WORKER_TOKEN}`));
