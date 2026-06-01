"use client";

import { useCallback, useRef, useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "open" }
  | { kind: "dragging" }
  | { kind: "uploading"; filename: string }
  | { kind: "done"; filename: string }
  | { kind: "error"; message: string };

const ACCEPTED = ".docx,.pdf,.fountain,.txt";

const GOLD = "#c9a95c";
const NAVY = "#16202c";
const BORDER = "#243447";
const TEXT = "#dce8f0";
const MUTED = "#7fa8c4";
const MONO = "'DM Mono', 'Courier New', monospace";
const SERIF = "'Cormorant Garamond', Georgia, serif";

export default function SubmitOverlay() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setState({ kind: "uploading", filename: file.name });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setState({ kind: "done", filename: data.filename ?? file.name });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "upload failed",
      });
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file) void upload(file);
    },
    [upload],
  );

  const panelOpen =
    state.kind === "open" ||
    state.kind === "dragging" ||
    state.kind === "uploading" ||
    state.kind === "done" ||
    state.kind === "error";

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setState({ kind: "open" })}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10000,
          background: GOLD,
          color: "#1a1208",
          border: "none",
          borderRadius: 999,
          padding: "12px 20px",
          cursor: "pointer",
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: 0.5,
          boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
          display: panelOpen ? "none" : "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        + Soumettre un script
      </button>

      {/* Panel */}
      {panelOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            background: "rgba(6,10,16,0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && state.kind !== "uploading") {
              setState({ kind: "idle" });
            }
          }}
        >
          <div
            style={{
              width: "min(460px, 100%)",
              background: NAVY,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: 28,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 26,
                  fontWeight: 400,
                  color: TEXT,
                  margin: 0,
                }}
              >
                Soumettre un script
              </h2>
              {state.kind !== "uploading" && (
                <button
                  onClick={() => setState({ kind: "idle" })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: MUTED,
                    fontSize: 22,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  aria-label="Fermer"
                >
                  ×
                </button>
              )}
            </div>

            {(state.kind === "open" || state.kind === "dragging") && (
              <>
                <div
                  onDrop={onDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setState({ kind: "dragging" });
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setState({ kind: "open" });
                  }}
                  onClick={() => inputRef.current?.click()}
                  style={{
                    border: `2px dashed ${state.kind === "dragging" ? GOLD : BORDER}`,
                    borderRadius: 10,
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background:
                      state.kind === "dragging"
                        ? "rgba(201,169,92,0.06)"
                        : "transparent",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void upload(f);
                      e.target.value = "";
                    }}
                  />
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: 20,
                      color: TEXT,
                      margin: "0 0 6px",
                    }}
                  >
                    {state.kind === "dragging"
                      ? "Lâchez pour envoyer…"
                      : "Glissez votre script ici"}
                  </p>
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: MUTED,
                      margin: 0,
                    }}
                  >
                    .docx · .pdf · .fountain · .txt — 10 Mo max
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: MUTED,
                    marginTop: 16,
                    lineHeight: 1.6,
                  }}
                >
                  Le script part dans le backlog. Le développement est généré à
                  la main — il n&apos;apparaît pas tout de suite.
                </p>
              </>
            )}

            {state.kind === "uploading" && (
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  color: TEXT,
                  textAlign: "center",
                  padding: "30px 0",
                }}
              >
                Envoi de <span style={{ color: GOLD }}>{state.filename}</span>…
              </p>
            )}

            {state.kind === "done" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 22,
                    color: "#7fd4a8",
                    margin: "0 0 12px",
                  }}
                >
                  Script reçu.
                </p>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: TEXT,
                    margin: "0 0 20px",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>{state.filename}</strong> est dans le backlog.
                </p>
                <div
                  style={{
                    border: `1px solid ${GOLD}`,
                    background: "rgba(201,169,92,0.08)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    fontFamily: MONO,
                    fontSize: 13,
                    color: GOLD,
                    lineHeight: 1.6,
                  }}
                >
                  📞 Appelle Oscar pour avoir le résultat.
                </div>
                <button
                  onClick={() => setState({ kind: "idle" })}
                  style={{
                    marginTop: 20,
                    background: "transparent",
                    border: `1px solid ${BORDER}`,
                    color: MUTED,
                    borderRadius: 8,
                    padding: "8px 18px",
                    cursor: "pointer",
                    fontFamily: MONO,
                    fontSize: 12,
                  }}
                >
                  Fermer
                </button>
              </div>
            )}

            {state.kind === "error" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "#e05a6b",
                    margin: "0 0 20px",
                  }}
                >
                  Erreur : {state.message}
                </p>
                <button
                  onClick={() => setState({ kind: "open" })}
                  style={{
                    background: GOLD,
                    border: "none",
                    color: "#1a1208",
                    borderRadius: 8,
                    padding: "8px 18px",
                    cursor: "pointer",
                    fontFamily: MONO,
                    fontSize: 12,
                  }}
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
