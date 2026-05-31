/**
 * JSON-file note store — adapted from `notes-backlog/src/server/stores/jsonFileStore.js`.
 * Copied locally because Turbopack 16 doesn't resolve subpath exports of `file:` packages.
 * If you fix that, swap back to importing from the shared package.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Note, NotesStore } from "./types";

export function createJsonFileStore(filePath: string): NotesStore {
  if (!filePath) throw new Error("createJsonFileStore: filePath required");
  let writeChain: Promise<unknown> = Promise.resolve();

  async function read(): Promise<Note[]> {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Note[]) : [];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  async function writeAtomic(notes: Note[]): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(notes, null, 2), "utf8");
    await fs.rename(tmp, filePath);
  }

  function mutate<T>(mutator: (notes: Note[]) => T | Promise<T>): Promise<T> {
    const next = writeChain.then(async () => {
      const notes = await read();
      const result = await mutator(notes);
      await writeAtomic(notes);
      return result;
    });
    writeChain = next.then(
      () => undefined,
      () => undefined,
    );
    return next as Promise<T>;
  }

  return {
    list: () => read(),
    add: (note) =>
      mutate((notes) => {
        notes.unshift(note);
      }),
    markProcessed: (id, ref) =>
      mutate((notes) => {
        const n = notes.find((x) => x.id === id);
        if (!n) return null;
        n.status = "processed";
        n.processed_at = new Date().toISOString();
        if (ref) n.backlog_ref = ref;
        return n;
      }),
    prune: (max) =>
      mutate((notes) => {
        if (notes.length > max) notes.length = max;
      }),
  };
}
