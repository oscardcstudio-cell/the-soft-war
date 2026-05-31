"use client";

import { NotesWidget } from "@/components/notes-widget";

export default function NotesFloating() {
  return (
    <NotesWidget
      apiBase="/api/notes"
      title="📝 Note → Backlog"
      placeholder="Quick note for Claude…"
      buttonLabel="NOTE"
      accentColor="#fbbf24"
    />
  );
}
