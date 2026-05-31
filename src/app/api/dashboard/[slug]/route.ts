import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_ROOT = process.env.DATA_DIR ?? process.cwd();
const PROJECTS_DIR_VOLUME = path.join(DATA_ROOT, "projects");
const PROJECTS_DIR_REPO = path.join(process.cwd(), "projects");

// Serves the rich dashboard.html of a project (produced by meta-ui-ux / Claude Code).
// Looked up in the volume first, then in the repo-committed projects.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[A-Za-z0-9_-]+$/.test(slug)) {
    return new NextResponse("bad slug", { status: 400 });
  }

  for (const base of [PROJECTS_DIR_VOLUME, PROJECTS_DIR_REPO]) {
    const file = path.join(base, slug, "dashboard.html");
    try {
      const html = await fs.readFile(file, "utf8");
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch {
      // try next base
    }
  }
  return new NextResponse("no dashboard", { status: 404 });
}
