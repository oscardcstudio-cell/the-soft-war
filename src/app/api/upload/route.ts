import { NextRequest, NextResponse } from "next/server";
import { saveScript, UploadError } from "@/lib/projects/storage";
import { getNotesStore, MAX_NOTES_KEPT, makeNote } from "@/lib/notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "field 'file' missing" }, { status: 400 });
  }

  try {
    const saved = await saveScript(file);

    // Push a note into the backlog so Claude Code can pick it up.
    const note = makeNote(
      `[upload] Process script ${saved.projectId} — ${saved.filename} (${(saved.bytes / 1024).toFixed(1)} KB, ${saved.ext})`,
    );
    const store = getNotesStore();
    await store.add(note);
    await store.prune(MAX_NOTES_KEPT);

    return NextResponse.json({
      ok: true,
      projectId: saved.projectId,
      filename: saved.filename,
      bytes: saved.bytes,
      uploadedAt: saved.uploadedAt,
      noteId: note.id,
    });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "upload failed" },
      { status: 500 },
    );
  }
}
