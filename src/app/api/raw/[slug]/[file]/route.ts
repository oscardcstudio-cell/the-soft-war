import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_ROOT = process.env.DATA_DIR ?? process.cwd();
const PROJECTS_DIR_VOLUME = path.join(DATA_ROOT, "projects");
const PROJECTS_DIR_REPO = path.join(process.cwd(), "projects");

// Serves a raw module file (.md / .html) of a project as text.
// e.g. /api/raw/ssXZ8yfYQc/worldbuilding.md
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const p = await params;
  const slug = decodeURIComponent(p.slug).trim();
  const file = decodeURIComponent(p.file).trim();

  if (!/^[A-Za-z0-9_-]+$/.test(slug)) {
    return new NextResponse("bad slug", { status: 400 });
  }
  if (!/^[A-Za-z0-9._-]+\.(md|html)$/.test(file) || file.includes("..")) {
    return new NextResponse("bad file", { status: 400 });
  }

  const download = req.nextUrl.searchParams.get("dl") === "1";
  const isHtml = file.endsWith(".html");

  for (const base of [PROJECTS_DIR_VOLUME, PROJECTS_DIR_REPO]) {
    try {
      const content = await fs.readFile(path.join(base, slug, file), "utf8");
      const headers: Record<string, string> = {
        "Content-Type": isHtml
          ? "text/html; charset=utf-8"
          : "text/plain; charset=utf-8",
      };
      if (download) {
        headers["Content-Disposition"] = `attachment; filename="${file}"`;
      }
      return new NextResponse(content, { status: 200, headers });
    } catch {
      // try next base
    }
  }
  return new NextResponse("not found", { status: 404 });
}
