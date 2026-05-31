export type Note = {
  id: string;
  text: string;
  created_at: string;
  status: "pending" | "processed";
  processed_at: string | null;
  backlog_ref?: string;
};

export type NotesStore = {
  list: () => Promise<Note[]>;
  add: (note: Note) => Promise<void>;
  markProcessed: (id: string, ref?: string) => Promise<Note | null>;
  prune: (max: number) => Promise<void>;
};
