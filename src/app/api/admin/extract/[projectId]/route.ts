import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_ROOT = process.env.DATA_DIR ?? process.cwd();
const UPLOADS_DIR = path.join(DATA_ROOT, "uploads");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  if (!/^[A-Za-z0-9_-]+$/.test(projectId)) {
    return new NextResponse("bad id", { status: 400 });
  }

  const uploadDir = path.join(UPLOADS_DIR, projectId);
  let files: string[];
  try {
    files = await fs.readdir(uploadDir);
  } catch (e) {
    const diag = {
      DATA_ROOT,
      UPLOADS_DIR,
      uploadDir,
      error: String(e),
      cwd: process.cwd(),
      DATA_DIR_env: process.env.DATA_DIR ?? "(unset)",
    };
    return NextResponse.json({ error: "not found", diag }, { status: 404 });
  }

  const docx = files.find((f) => f.endsWith(".docx"));
  if (!docx) {
    return new NextResponse("no docx in this project", { status: 404 });
  }

  const buf = await fs.readFile(path.join(uploadDir, docx));
  const result = await mammoth.extractRawText({ buffer: buf });
  return new NextResponse(result.value, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
