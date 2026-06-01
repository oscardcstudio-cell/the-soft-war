const MODULES: [string, string][] = [
  ["01", "Extract"],
  ["02", "Worldbuilding"],
  ["03", "Characters"],
  ["04", "Locations"],
  ["05", "Teaser Pool"],
  ["06", "Fragments"],
  ["07", "Endings"],
  ["08", "References"],
  ["09", "Storyboard Analysis"],
  ["10", "Dashboard Render"],
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-paper text-ink flex flex-col font-mono">

      {/* Header bar */}
      <header className="shrink-0 border-b border-rule h-9 px-6 sm:px-10 flex items-center justify-between">
        <span className="text-[10px] text-ink-3 tracking-[0.2em] uppercase">
          Script Analysis Platform
        </span>
        <span className="text-[10px] text-ink-3 tabular-nums">
          v0.1 · 2026
        </span>
      </header>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-20 sm:py-28">
        <div className="w-full max-w-xl">

          {/* Display title */}
          <h1 className="font-serif font-light leading-[0.88] tracking-[-0.025em] text-[clamp(3.5rem,10vw,6.5rem)] text-ink mb-10">
            The soft War
          </h1>

          {/* Rule */}
          <div className="border-t border-rule mb-10" />

          {/* Proposition */}
          <p className="text-ink-2 text-[15px] leading-relaxed mb-12">
            Upload a film script.<br />
            Get the full development bible.<br />
            Share via URL.
          </p>

          {/* Module index */}
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase text-ink-3 mb-4">
              Modules
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-[7px]">
              {MODULES.map(([n, name]) => (
                <div key={n} className="flex items-baseline gap-2.5">
                  <span className="text-[10px] text-accent tabular-nums shrink-0 w-5">{n}</span>
                  <span className="text-[12px] text-ink-2">{name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer bar */}
      <footer className="shrink-0 border-t border-rule h-9 px-6 sm:px-10 flex items-center justify-between">
        <span className="text-[10px] text-ink-3">
          Admin via magic link — coming
        </span>
        <a
          href="https://www.odcstudio.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-ink-3 hover:text-ink transition-colors duration-200"
        >
          Oscar de Canecaude
        </a>
      </footer>

    </main>
  );
}
