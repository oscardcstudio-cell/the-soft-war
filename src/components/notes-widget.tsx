"use client";

/**
 * NotesWidget — local port of `notes-backlog/src/client/NotesWidget.jsx`.
 * Same behavior, TSX, no external deps. See notes/ in this dir for store + API.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Note } from "@/lib/notes/types";

type Props = {
  apiBase?: string;
  title?: string;
  placeholder?: string;
  buttonLabel?: string;
  maxLength?: number;
  accentColor?: string;
};

function fmtWhen(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function NotesWidget({
  apiBase = "/api/notes",
  title = "📝 Note → Backlog",
  placeholder = "Idée, bug, observation, instruction…",
  buttonLabel = "NOTE",
  maxLength = 2000,
  accentColor = "#fbbf24",
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ msg: string; color: string }>({ msg: "", color: "#64748b" });
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const r = await fetch(apiBase);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      setNotes(Array.isArray(data.notes) ? data.notes.slice(0, 12) : []);
    } catch (e) {
      setStatus({
        msg: "Erreur chargement: " + (e instanceof Error ? e.message : "?"),
        color: "#ef4444",
      });
    }
  }, [apiBase]);

  useEffect(() => {
    if (open) {
      void loadHistory();
      taRef.current?.focus();
    }
  }, [open, loadHistory]);

  const send = useCallback(async () => {
    const t = text.trim();
    if (!t) {
      setStatus({ msg: "Note vide", color: "#64748b" });
      return;
    }
    setSending(true);
    setStatus({ msg: "Envoi…", color: "#64748b" });
    try {
      const r = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "HTTP " + r.status);
      setText("");
      setStatus({ msg: "✓ Envoyée", color: "#4ade80" });
      void loadHistory();
    } catch (e) {
      setStatus({
        msg: "Échec: " + (e instanceof Error ? e.message : "?"),
        color: "#ef4444",
      });
    } finally {
      setSending(false);
    }
  }, [text, apiBase, loadHistory]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void send();
      }
    },
    [send],
  );

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Prendre une note → backlog"
        style={{
          position: "fixed",
          top: 18,
          right: 20,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: accentColor,
          color: "#000",
          border: "none",
          borderRadius: 999,
          padding: "8px 14px",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#000",
            opacity: 0.6,
          }}
        />
        {buttonLabel}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: 58,
            right: 20,
            width: 320,
            maxWidth: "calc(100vw - 40px)",
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 14,
            zIndex: 1001,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{title}</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            maxLength={maxLength}
            placeholder={placeholder}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#e2e8f0",
              padding: 8,
              fontSize: 13,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 11, color: status.color }}>{status.msg}</span>
            <button
              onClick={send}
              disabled={sending}
              style={{
                background: accentColor,
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "6px 14px",
                cursor: sending ? "default" : "pointer",
                fontSize: 12,
                fontWeight: 600,
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? "..." : "Envoyer"}
            </button>
          </div>

          <div
            style={{
              marginTop: 12,
              maxHeight: 220,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {notes.length === 0 ? (
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Aucune note pour l&apos;instant.
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  style={{ background: "#1e293b", borderRadius: 6, padding: "6px 8px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      fontSize: 10,
                      color: "#94a3b8",
                      marginBottom: 3,
                    }}
                  >
                    <span>{fmtWhen(n.created_at)}</span>
                    {n.status === "processed" ? (
                      <span style={{ color: "#4ade80" }}>✓ traitée</span>
                    ) : (
                      <span style={{ color: "#fbbf24" }}>⏳ en attente</span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#e2e8f0",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {n.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default NotesWidget;
