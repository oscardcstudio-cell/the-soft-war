#!/usr/bin/env node
/**
 * Drain pending notes → BACKLOG.md.
 *
 * Reads notes from the JSON file store directly (no need for an HTTP server),
 * appends each pending one below the "## À faire" marker in BACKLOG.md, and
 * marks them as processed.
 *
 * Run :
 *   node scripts/drain.mjs                # uses defaults
 *   BACKLOG_PATH=./OTHER.md node scripts/drain.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Inline minimal jsonFileStore (no npm dep — keep drain script standalone).
async function readNotes(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

async function writeNotes(filePath, notes) {
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(notes, null, 2), "utf8");
  await fs.rename(tmp, filePath);
}

function createJsonFileStore(filePath) {
  return {
    list: () => readNotes(filePath),
    markProcessed: async (id, ref) => {
      const notes = await readNotes(filePath);
      const n = notes.find((x) => x.id === id);
      if (!n) return null;
      n.status = "processed";
      n.processed_at = new Date().toISOString();
      if (ref) n.backlog_ref = ref;
      await writeNotes(filePath, notes);
      return n;
    },
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const NOTES_PATH = path.join(ROOT, "data", "notes.json");
const BACKLOG_PATH = process.env.BACKLOG_PATH ?? path.join(ROOT, "BACKLOG.md");
const MARKER = process.env.BACKLOG_MARKER ?? "## À faire";

function fmtDate(iso) {
  return iso.slice(0, 16).replace("T", " ");
}

function insertUnderMarker(markdown, marker, lines) {
  const idx = markdown.indexOf(marker);
  if (idx === -1) {
    throw new Error(`Marker "${marker}" not found in ${BACKLOG_PATH}`);
  }
  // Find the end of the marker line
  const lineEnd = markdown.indexOf("\n", idx);
  const before = markdown.slice(0, lineEnd + 1);
  const after = markdown.slice(lineEnd + 1);
  // Skip leading comments / blank lines so insertions stay grouped at top
  return `${before}\n${lines.join("\n")}\n${after}`;
}

async function main() {
  const store = createJsonFileStore(NOTES_PATH);
  const notes = await store.list();
  const pending = notes.filter((n) => n.status === "pending");

  if (pending.length === 0) {
    console.log("[drain] no pending notes — nothing to do.");
    return;
  }

  console.log(`[drain] draining ${pending.length} note(s) → ${BACKLOG_PATH}`);

  const markdown = await fs.readFile(BACKLOG_PATH, "utf8");
  const lines = pending.map(
    (n) => `- [ ] \`${n.id}\` · ${fmtDate(n.created_at)} · ${n.text}`,
  );
  const updated = insertUnderMarker(markdown, MARKER, lines);
  await fs.writeFile(BACKLOG_PATH, updated, "utf8");

  for (const n of pending) {
    await store.markProcessed(n.id, BACKLOG_PATH);
    console.log(`  ✓ ${n.id} → drained`);
  }
  console.log("[drain] done.");
}

main().catch((err) => {
  console.error("[drain] fatal :", err.message);
  process.exit(1);
});
