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
    <main className="min-h-dvh bg-paper text-ink font-mono flex flex-col">

      {/* Top bar */}
      <header className="shrink-0 border-b border-rule h-9 px-6 sm:px-10 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] uppercase text-ink-3">
          The soft War
        </span>
        <Link
          href="/"
          className="text-[10px] text-ink-3 hover:text-ink transition-colors duration-150"
        >
          ← home
        </Link>
      </header>

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-10 py-12 space-y-12">

        {/* Upload */}
        <section>
          <p className="text-[9px] tracking-[0.24em] uppercase text-ink-3 mb-4">Upload</p>
          <UploadZone />
        </section>

        <div className="border-t border-rule" />

        {/* Projects */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <p className="text-[9px] tracking-[0.24em] uppercase text-ink-3">Projects</p>
            <span className="text-[10px] text-ink-3 tabular-nums">{projects.length}</span>
          </div>
          {projects.length === 0 ? (
            <p className="text-[12px] text-ink-3 italic">No projects yet.</p>
          ) : (
            <ul className="border-t border-rule divide-y divide-rule">
              {projects.map((p, i) => (
                <li key={p.projectId} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-baseline gap-4 min-w-0">
                    <span className="text-[10px] text-ink-3 tabular-nums shrink-0 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/p/${p.projectId}`}
                      className="text-[12px] text-ink hover:text-accent transition-colors duration-150 font-mono truncate"
                    >
                      {p.projectId}
                    </Link>
                    <span className="text-[10px] text-ink-3 truncate hidden sm:block">
                      {String(p.meta?.originalFilename ?? "?")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] text-ink-3 tabular-nums hidden sm:block">
                      {p.meta?.uploadedAt
                        ? String(p.meta.uploadedAt).slice(0, 16).replace("T", " ")
                        : ""}
                    </span>
                    <span
                      className={[
                        "text-[9px] tracking-[0.16em] uppercase",
                        p.hasResults ? "text-success" : "text-ink-3",
                      ].join(" ")}
                    >
                      {p.hasResults ? "ready" : "queued"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {pending.length > 0 && (
          <>
            <div className="border-t border-rule" />
            <section>
              <div className="flex items-baseline justify-between mb-5">
                <p className="text-[9px] tracking-[0.24em] uppercase text-ink-3">Backlog</p>
                <span className="text-[10px] text-ink-3 tabular-nums">{pending.length}</span>
              </div>
              <ul className="space-y-2">
                {pending.map((n) => (
                  <li key={n.id} className="flex items-baseline gap-3">
                    <span className="text-[10px] text-ink-3 tabular-nums shrink-0">
                      {n.created_at.slice(11, 16)}
                    </span>
                    <span className="text-[12px] text-ink-2 leading-snug">{n.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {processed.length > 0 && (
          <>
            <div className="border-t border-rule" />
            <section>
              <p className="text-[9px] tracking-[0.24em] uppercase text-ink-3 mb-4">
                Recently processed
              </p>
              <ul className="space-y-1.5">
                {processed.map((n) => (
                  <li key={n.id} className="flex items-baseline gap-3">
                    <span className="text-[10px] line-through text-ink-3 leading-snug truncate">
                      {n.text}
                    </span>
                    {n.backlog_ref && (
                      <span className="text-[10px] text-ink-3 shrink-0">
                        → {n.backlog_ref}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

      </div>

      {/* Footer bar */}
      <footer className="shrink-0 border-t border-rule h-9 px-6 sm:px-10 flex items-center">
        <span className="text-[10px] text-ink-3">
          Admin · magic link auth
        </span>
      </footer>

      <NotesFloating />
    </main>
  );
}
