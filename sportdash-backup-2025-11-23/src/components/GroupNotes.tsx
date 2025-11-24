"use client";

import { useEffect, useState } from "react";
import {
  getNotes,
  addNote,
  deleteNote,
  togglePin,
  onNotesChange,
  type Note,
} from "@/lib/notes";

export default function GroupNotes({ groupId }: { groupId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (!groupId) return;
    setNotes(getNotes(groupId));
    const off = onNotesChange(() => setNotes(getNotes(groupId)));
    return off;
  }, [groupId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    addNote(groupId, body, author);
    setBody("");
  };

  const fmt = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mt-3 rounded-xl border bg-zinc-50 p-3">
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          placeholder="Nieuwe notitie…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          className="w-48 rounded-lg border px-3 py-2 text-sm"
          placeholder="Auteur (optioneel)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button
          className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 btn"
          type="submit"
        >
          Toevoegen
        </button>
      </form>

      {notes.length === 0 ? (
        <div className="text-xs text-zinc-500">Nog geen notities.</div>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border bg-white p-2 text-sm flex items-start gap-2"
            >
              <button
                className={`mt-0.5 text-xs rounded px-2 py-1 border ${
                  n.pinned
                    ? "bg-yellow-100 border-yellow-300"
                    : "border-zinc-200"
                }`}
                onClick={() => {
                  togglePin(groupId, n.id);
                  setNotes(getNotes(groupId));
                }}
                title={n.pinned ? "Losmaken" : "Vastzetten"}
              >
                📌
              </button>
              <div className="flex-1">
                <div className="whitespace-pre-wrap">{n.body}</div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {n.author || "Onbekend"} • {fmt(n.createdAt)}
                </div>
              </div>
              <button
                className="text-[11px] text-red-600 hover:underline btn"
                onClick={() => {
                  deleteNote(groupId, n.id);
                  setNotes(getNotes(groupId));
                }}
              >
                Verwijderen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
