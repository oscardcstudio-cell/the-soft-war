import { notFound } from "next/navigation";
import { getProjectResults, listProjects } from "@/lib/projects/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Verify the project exists (has uploads/<slug>/_meta.json)
  const projects = await listProjects();
  const project = projects.find((p) => p.projectId === slug);
  if (!project) return notFound();

  const results = await getProjectResults(slug);

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-8 pb-6 border-b border-zinc-900">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Project {slug}
          </p>
          <h1 className="font-serif text-3xl mb-2">
            {String(project.meta?.originalFilename ?? "Untitled")}
          </h1>
          <p className="text-sm text-zinc-500">
            Uploaded{" "}
            {project.meta?.uploadedAt
              ? String(project.meta.uploadedAt).slice(0, 16).replace("T", " ")
              : "?"}
          </p>
        </header>

        {results.length === 0 ? (
          <section className="text-center py-16">
            <p className="text-zinc-400 font-serif text-xl mb-2">Not analyzed yet.</p>
            <p className="text-xs text-zinc-600 font-mono">
              Run Claude Code on the backlog to generate the modules.
            </p>
          </section>
        ) : (
          <>
            <nav className="mb-8 flex flex-wrap gap-2 text-xs font-mono">
              {results.map((r) => (
                <a
                  key={r.module}
                  href={`#${r.module}`}
                  className="px-2 py-1 rounded border border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-zinc-600"
                >
                  {r.module}
                </a>
              ))}
            </nav>
            {results.map((r) => (
              <section
                key={r.module}
                id={r.module}
                className="mb-12 scroll-mt-8"
              >
                <h2 className="font-serif text-2xl text-amber-200 mb-4 border-b border-zinc-900 pb-2">
                  {r.module}
                </h2>
                <pre className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed font-mono">
                  {r.markdown}
                </pre>
              </section>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
