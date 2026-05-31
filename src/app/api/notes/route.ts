import { NextRequest, NextResponse } from "next/server";
import { getNotesStore, MAX_NOTE_LEN, MAX_NOTES_KEPT, makeNote } from "@/lib/notes";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postSchema = z.object({
  text: z.string().min(1).max(MAX_NOTE_LEN),
});

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const store = getNotesStore();
  const notes = await store.list();
  const filtered = status
    ? notes.filter((n) => n.status === status)
    : notes;
  return NextResponse.json({ notes: filtered, total: notes.length });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "text required (1-" + MAX_NOTE_LEN + " chars)" },
      { status: 400 },
    );
  }
  const note = makeNote(parsed.data.text.trim());
  const store = getNotesStore();
  await store.add(note);
  await store.prune(MAX_NOTES_KEPT);
  return NextResponse.json({ ok: true, note });
}
