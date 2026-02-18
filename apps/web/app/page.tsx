"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { HealthResponse, Note, WhoAmIResponse } from "@kc/shared-types";

interface NotesPayload {
  notes: Note[];
}

interface StatusPayload {
  nextjs: {
    status: "ok";
    timestamp: string;
    apiBaseUrl: string;
  };
  api: HealthResponse | null;
  apiReachable: boolean;
}

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [roundRobin, setRoundRobin] = useState<WhoAmIResponse[]>([]);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !loading,
    [title, content, loading]
  );

  async function loadNotes() {
    const res = await fetch("/api/notes", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load notes");
    const data = (await res.json()) as NotesPayload;
    setNotes(data.notes);
  }

  async function loadStatus() {
    const res = await fetch("/api/status", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load status");
    const data = (await res.json()) as StatusPayload;
    setStatus(data);
  }

  useEffect(() => {
    void loadNotes();
    void loadStatus();
  }, []);

  async function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });

      if (!res.ok) throw new Error("Failed to create note");

      setTitle("");
      setContent("");
      await loadNotes();
      await loadStatus();
    } catch (error) {
      console.error(error);
      alert("Failed to create note. Check browser console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function runRoundRobinDemo() {
    const calls = 10;
    const results: WhoAmIResponse[] = [];

    for (let index = 0; index < calls; index += 1) {
      const res = await fetch("/api/roundrobin", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Round-robin call failed");
      }
      const payload = (await res.json()) as WhoAmIResponse;
      results.push(payload);
    }

    setRoundRobin(results);
  }

  return (
    <main>
      <h1>K8s Competence Playground</h1>
      <p className="muted">
        Flow: <span className="code">Browser</span> {"->"}{" "}
        <span className="code">Next.js Route</span> {"->"}{" "}
        <span className="code">Express API</span> {"->"} <span className="code">Postgres</span>
      </p>

      <div className="grid">
        <section className="card">
          <h2>System Status</h2>
          {!status ? (
            <p className="muted">Loading status...</p>
          ) : (
            <>
              <p>
                Next.js: <span className="code">{status.nextjs.status}</span>
              </p>
              <p>
                API reachable: <span className="code">{String(status.apiReachable)}</span>
              </p>
              <p>
                API DB status: <span className="code">{status.api?.database ?? "unknown"}</span>
              </p>
              <p>
                API pod: <span className="code">{status.api?.podName ?? "n/a"}</span>
              </p>
            </>
          )}
          <button type="button" onClick={() => void loadStatus()}>
            Refresh Status
          </button>
        </section>

        <section className="card">
          <h2>Round-Robin Demo</h2>
          <p className="muted">
            Scale API to multiple replicas, then run repeated calls.
          </p>
          <button type="button" onClick={() => void runRoundRobinDemo()}>
            Run 10 Calls
          </button>
          <div className="list" style={{ marginTop: "0.8rem" }}>
            {roundRobin.map((entry, index) => (
              <div key={`${entry.instanceId}-${index}`} className="muted">
                #{index + 1}: <span className="code">{entry.podName}</span> ({entry.instanceId.slice(0, 8)})
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card">
        <h2>Create Note</h2>
        <form onSubmit={handleCreateNote}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What did you learn in Kubernetes today?"
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your note"
            />
          </div>
          <button type="submit" disabled={!canSubmit}>
            {loading ? "Saving..." : "Save Note"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Notes</h2>
        <button type="button" onClick={() => void loadNotes()} style={{ marginBottom: "0.75rem" }}>
          Refresh Notes
        </button>

        <div className="list">
          {notes.length === 0 ? (
            <p className="muted">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="card" style={{ marginBottom: 0 }}>
                <strong>{note.title}</strong>
                <p>{note.content}</p>
                <p className="muted">
                  Created: <span className="code">{new Date(note.createdAt).toLocaleString()}</span>
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
