import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

// On Railway, DATA_DIR points to the mounted volume (/data) so uploads survive
// redeploys. Locally, it defaults to the project root.
const DATA_ROOT = process.env.DATA_DIR ?? process.cwd();
const UPLOADS_DIR = path.join(DATA_ROOT, "uploads");
const PROJECTS_DIR_VOLUME = path.join(DATA_ROOT, "projects");
// Repo-committed projects fallback : analyses produced locally by Claude Code
// then pushed to GitHub end up here (inside the container at /app/projects).
// They're read in addition to the volume.
const PROJECTS_DIR_REPO = path.join(process.cwd(), "projects");

async function readMdFiles(dir: string): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  try {
    const files = await fs.readdir(dir);
    for (const f of files) {
      if (!f.endsWith(".md")) continue;
      const module = f.replace(/\.md$/, "");
      result.set(module, await fs.readFile(path.join(dir, f), "utf8"));
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  return result;
}

const ALLOWED_EXTS = [".docx", ".pdf", ".fountain", ".txt"] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export class UploadError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export type SavedScript = {
  projectId: string;
  filename: string;
  ext: string;
  bytes: number;
  uploadedAt: string;
  path: string;
};

export async function saveScript(file: File): Promise<SavedScript> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTS.includes(ext as (typeof ALLOWED_EXTS)[number])) {
    throw new UploadError(
      `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTS.join(", ")}`,
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    );
  }
  if (file.size === 0) {
    throw new UploadError("File is empty");
  }

  const projectId = nanoid(10);
  const projectUploadDir = path.join(UPLOADS_DIR, projectId);
  await fs.mkdir(projectUploadDir, { recursive: true });

  // Sanitize filename : keep only basename, alphanumeric + dots/dashes/underscores
  const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(projectUploadDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Also write metadata
  const meta = {
    projectId,
    originalFilename: file.name,
    safeFilename: safeName,
    ext,
    mimeType: file.type || "application/octet-stream",
    bytes: file.size,
    uploadedAt: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(projectUploadDir, "_meta.json"),
    JSON.stringify(meta, null, 2),
    "utf8",
  );

  return {
    projectId,
    filename: safeName,
    ext,
    bytes: file.size,
    uploadedAt: meta.uploadedAt,
    path: filePath,
  };
}

async function hasMdResults(projectId: string): Promise<boolean> {
  for (const base of [PROJECTS_DIR_VOLUME, PROJECTS_DIR_REPO]) {
    try {
      const files = await fs.readdir(path.join(base, projectId));
      if (files.some((f) => f.endsWith(".md"))) return true;
    } catch {
      // try next
    }
  }
  return false;
}

export async function listProjects(): Promise<Array<{ projectId: string; meta: Record<string, unknown> | null; hasResults: boolean }>> {
  const ids = new Set<string>();
  try {
    const dirs = await fs.readdir(UPLOADS_DIR);
    for (const d of dirs) ids.add(d);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  // Also surface projects that only exist in the repo (analyses without
  // a corresponding upload — useful for seeded demos).
  try {
    const dirs = await fs.readdir(PROJECTS_DIR_REPO);
    for (const d of dirs) ids.add(d);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  const projects = await Promise.all(
    Array.from(ids).map(async (projectId) => {
      const metaPath = path.join(UPLOADS_DIR, projectId, "_meta.json");
      let meta: Record<string, unknown> | null = null;
      try {
        meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
      } catch {
        // No upload meta — synthesize a stub from the project dir name if there are .md files
        const hasRepo = await hasMdResults(projectId);
        if (hasRepo) {
          meta = {
            originalFilename: projectId,
            uploadedAt: new Date(0).toISOString(),
          };
        }
      }
      const hasResults = await hasMdResults(projectId);
      return { projectId, meta, hasResults };
    }),
  );

  return projects
    .filter((p) => p.meta)
    .sort((a, b) => {
      const aDate = (a.meta?.uploadedAt as string) || "";
      const bDate = (b.meta?.uploadedAt as string) || "";
      return bDate.localeCompare(aDate);
    });
}

export async function getProjectResults(projectId: string): Promise<Array<{ module: string; markdown: string }>> {
  // Read both sources, repo first (committed analyses), then volume overrides
  // (online-produced analyses take priority on a name collision).
  const repoFiles = await readMdFiles(path.join(PROJECTS_DIR_REPO, projectId));
  const volumeFiles = await readMdFiles(path.join(PROJECTS_DIR_VOLUME, projectId));
  const merged = new Map<string, string>();
  for (const [k, v] of repoFiles) merged.set(k, v);
  for (const [k, v] of volumeFiles) merged.set(k, v);

  // Stable ordering : _meta first, then alphabetical
  const entries = Array.from(merged.entries()).sort(([a], [b]) => {
    if (a === "_meta") return -1;
    if (b === "_meta") return 1;
    return a.localeCompare(b);
  });

  return entries.map(([module, markdown]) => ({ module, markdown }));
}
