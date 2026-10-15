/**
 * sync-phases.mjs — copie un SNAPSHOT des .md de chaque agent "phases" vers ./phases/<agentId>/.
 * À lancer avant `railway up` (le relais n'a pas accès au worktree du PC).
 * Le live (édité par l'agent dans le worktree) ne se reflète qu'au prochain sync+deploy.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AGENTS } from "./agents.config.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

if (process.argv[1]?.endsWith("sync-phases.mjs")) {
  for (const [id, a] of Object.entries(AGENTS)) {
    if (a.mode !== "phases") continue;
    const src = path.resolve(HERE, a.phasesSrc);
    const out = path.join(HERE, "phases", id);
    fs.mkdirSync(out, { recursive: true });
    for (const p of a.phases) {
      const from = path.join(src, p.file);
      if (fs.existsSync(from)) { fs.copyFileSync(from, path.join(out, p.file)); console.log(`✓ ${id}/${p.file}`); }
      else { fs.writeFileSync(path.join(out, p.file), `# ${p.label}\n\n*(snapshot indisponible)*\n`); console.log(`⚠ ${id}/${p.file} absent → placeholder`); }
    }
  }
  console.log("Snapshot phases OK.");
}
