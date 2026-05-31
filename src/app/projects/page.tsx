import Link from "next/link";
import { listProjects } from "@/lib/projects/storage";
import { getNotesStore } from "@/lib/notes";
import UploadZone from "./upload-zone";
import NotesFloating from "./notes-floating";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProjectsPage() {
  const projects = await listProjects();
  const notes = await getNotesStore().list();
  const pending = notes.filter((n) => n.status === "pending").slice(0, 20);
  const processed = notes.filter((n) => n.status === "processed").slice(0, 10);

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="font-serif text-4xl mb-2">The soft War</h1>
          <p className="text-sm text-zinc-500">
            Upload a film script — Claude Code picks it up from the backlog and writes the dev bible.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Drop a script</h2>
          <UploadZone />
        </section>

        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400">Projects</h2>
            <span className="text-xs text-zinc-600">{projects.length}</span>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-zinc-600 italic">No projects yet. Drop a script above.</p>
          ) : (
            <ul className="divide-y divide-zinc-900 border border-zinc-900 rounded">
              {projects.map((p) => (
                <li key={p.projectId} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <Link
                      href={`/p/${p.projectId}`}
                      className="text-zinc-100 hover:text-amber-200 font-mono"
                    >
                      {p.projectId}
                    </Link>
                    <span className="text-zinc-500 text-xs">
                      {String(p.meta?.originalFilename ?? "?")}
                      {" · "}
                      {p.meta?.uploadedAt ? String(p.meta.uploadedAt).slice(0, 16).replace("T", " ") : ""}
                    </span>
                  </div>
                  <span
                    className={
                      p.hasResults
                        ? "text-[10px] uppercase tracking-wider text-emerald-400"
                        : "text-[10px] uppercase tracking-wider text-zinc-600"
                    }
                  >
                    {p.hasResults ? "ready" : "queued"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400">Backlog — pending</h2>
            <span className="text-xs text-zinc-600">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-zinc-600 italic">No pending notes.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {pending.map((n) => (
                <li key={n.id} className="text-zinc-300 font-mono text-xs leading-relaxed">
                  <span className="text-zinc-600">{n.created_at.slice(11, 16)}</span>{" "}
                  {n.text}
                </li>
              ))}
            </ul>
          )}
        </section>

        {processed.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Recently processed</h2>
            <ul className="space-y-1 text-xs text-zinc-600 font-mono">
              {processed.map((n) => (
                <li key={n.id} className="line-through opacity-70">
                  {n.text}
                  {n.backlog_ref ? <span className="not-italic ml-2 text-zinc-700">→ {n.backlog_ref}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <NotesFloating />
    </main>
  );
}
