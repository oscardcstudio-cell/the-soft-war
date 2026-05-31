import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PROJECTS_DIR = path.join(process.cwd(), "projects");

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

export async function listProjects(): Promise<Array<{ projectId: string; meta: Record<string, unknown> | null; hasResults: boolean }>> {
  try {
    const dirs = await fs.readdir(UPLOADS_DIR);
    const projects = await Promise.all(
      dirs.map(async (projectId) => {
        const metaPath = path.join(UPLOADS_DIR, projectId, "_meta.json");
        let meta: Record<string, unknown> | null = null;
        try {
          meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
        } catch {
          // missing meta = skip
        }
        let hasResults = false;
        try {
          const resultsDir = path.join(PROJECTS_DIR, projectId);
          const files = await fs.readdir(resultsDir);
          hasResults = files.some((f) => f.endsWith(".md"));
        } catch {
          // no results yet
        }
        return { projectId, meta, hasResults };
      }),
    );
    // Most recent first
    return projects
      .filter((p) => p.meta)
      .sort((a, b) => {
        const aDate = (a.meta?.uploadedAt as string) || "";
        const bDate = (b.meta?.uploadedAt as string) || "";
        return bDate.localeCompare(aDate);
      });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export async function getProjectResults(projectId: string): Promise<Array<{ module: string; markdown: string }>> {
  const resultsDir = path.join(PROJECTS_DIR, projectId);
  try {
    const files = await fs.readdir(resultsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    return Promise.all(
      mdFiles.map(async (f) => ({
        module: f.replace(/\.md$/, ""),
        markdown: await fs.readFile(path.join(resultsDir, f), "utf8"),
      })),
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}
