import { NextRequest, NextResponse } from "next/server";
import { getNotesStore } from "@/lib/notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let backlogRef: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.backlog_ref === "string") {
      backlogRef = body.backlog_ref.slice(0, 200);
    }
  } catch {
    // ignore — body is optional
  }
  const store = getNotesStore();
  const note = await store.markProcessed(id, backlogRef);
  if (!note) {
    return NextResponse.json({ error: `unknown note id "${id}"` }, { status: 404 });
  }
  return NextResponse.json({ ok: true, note });
}
