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
  const isSuccess = state.kind === "success";
  const isError = state.kind === "error";

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => state.kind !== "success" && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Upload a script file"
      className={[
        "border p-10 sm:p-14 text-center cursor-pointer select-none",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
        isActive
          ? "border-accent bg-paper-2"
          : isSuccess
          ? "border-success cursor-default"
          : isError
          ? "border-error"
          : "border-rule hover:border-ink-3 bg-paper-2",
      ].join(" ")}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={onFileSelected}
        className="hidden"
      />

      {state.kind === "idle" && (
        <div>
          <p className="font-serif font-light text-2xl text-ink mb-2">
            Drop your script here
          </p>
          <p className="text-[10px] text-ink-3 tracking-[0.1em]">
            .docx · .pdf · .fountain · .txt — 10 MB max
          </p>
        </div>
      )}

      {state.kind === "dragging" && (
        <p className="font-serif font-light text-2xl text-accent">
          Release to upload
        </p>
      )}

      {state.kind === "uploading" && (
        <div>
          <p className="text-[12px] text-ink-2">Uploading…</p>
          <p className="text-[10px] text-accent mt-1">{state.filename}</p>
        </div>
      )}

      {state.kind === "success" && (
        <div>
          <p className="font-serif font-light text-xl text-success mb-1.5">
            Uploaded.
          </p>
          <p className="text-[10px] text-ink-3">
            {state.filename}{" "}
            <span className="text-ink-2">→ project {state.projectId}</span>
          </p>
          <p className="text-[10px] text-ink-3 mt-1">
            Queued in backlog. Run Claude Code to process.
          </p>
        </div>
      )}

      {state.kind === "error" && (
        <p className="text-[12px] text-error">Error: {state.message}</p>
      )}
    </div>
  );
}
