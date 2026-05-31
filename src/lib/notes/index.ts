import path from "node:path";
import { createJsonFileStore } from "./store";
import type { NotesStore } from "./types";

export type { Note, NotesStore } from "./types";

// On Railway, DATA_DIR points to the mounted volume (/data) so notes survive
// redeploys. Locally, defaults to ./data.
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

// Lazy singleton — file store only opens at first call.
declare global {
  // eslint-disable-next-line no-var
  var __notesStore: NotesStore | undefined;
}

export function getNotesStore(): NotesStore {
  if (!globalThis.__notesStore) {
    globalThis.__notesStore = createJsonFileStore(NOTES_FILE);
  }
  return globalThis.__notesStore;
}

export const MAX_NOTE_LEN = 2000;
export const MAX_NOTES_KEPT = 200;

export function newNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeNote(text: string) {
  return {
    id: newNoteId(),
    text,
    created_at: new Date().toISOString(),
    status: "pending" as const,
    processed_at: null,
  };
}
