"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type State =
  | { kind: "idle" }
  | { kind: "dragging" }
  | { kind: "uploading"; filename: string }
  | { kind: "success"; projectId: string; filename: string }
  | { kind: "error"; message: string };

const ACCEPTED = ".docx,.pdf,.fountain,.txt";

export default function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>({ kind: "idle" });

  const onUpload = useCallback(
    async (file: File) => {
      setState({ kind: "uploading", filename: file.name });
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
        setState({ kind: "success", projectId: data.projectId, filename: data.filename });
        // Refresh the projects list
        router.refresh();
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "upload failed",
        });
      }
    },
    [router],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file) void onUpload(file);
    },
    [onUpload],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState((s) => (s.kind === "uploading" ? s : { kind: "dragging" }));
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState((s) => (s.kind === "dragging" ? { kind: "idle" } : s));
  }, []);

  const onFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void onUpload(file);
      e.target.value = "";
    },
    [onUpload],
  );

  const isActive = state.kind === "dragging" || state.kind === "uploading";

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors select-none
        ${isActive ? "border-amber-400 bg-amber-400/5" : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/40"}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={onFileSelected}
        className="hidden"
      />
      {state.kind === "idle" && (
        <>
          <p className="text-zinc-300 font-serif text-xl mb-1">Drop your script here</p>
          <p className="text-xs text-zinc-500 font-mono">
            .docx · .pdf · .fountain · .txt — 10 MB max
          </p>
        </>
      )}
      {state.kind === "dragging" && (
        <p className="text-amber-300 font-serif text-xl">Release to upload…</p>
      )}
      {state.kind === "uploading" && (
        <p className="text-zinc-300 font-mono text-sm">
          Uploading <span className="text-amber-300">{state.filename}</span>…
        </p>
      )}
      {state.kind === "success" && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-emerald-300 font-serif text-lg">Uploaded.</p>
          <p className="text-xs text-zinc-500 font-mono">
            {state.filename} → project{" "}
            <span className="text-zinc-300">{state.projectId}</span>
          </p>
          <p className="text-xs text-zinc-600">
            Queued in backlog. Run Claude Code to process.
          </p>
        </div>
      )}
      {state.kind === "error" && (
        <p className="text-red-400 font-mono text-sm">Error : {state.message}</p>
      )}
    </div>
  );
}
