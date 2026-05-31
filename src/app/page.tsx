export default function Home() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full flex flex-col gap-8 text-center">
        <h1 className="text-5xl sm:text-6xl font-serif tracking-tight">
          The soft War
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Upload a film script.
          <br />
          Get the full development bible.
          <br />
          As a shareable web page.
        </p>
        <p className="text-sm text-zinc-600 mt-8">
          v0.1 — Phase 1 (init). Admin login coming.
        </p>
      </div>
    </main>
  );
}
