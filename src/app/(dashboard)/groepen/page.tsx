"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listGroepen,
  onGroepenChange,
  setKleur,
  addGroepNotitie,
  updateGroepNotitie,
  removeGroepNotitie,
  type GroepType,
  type NotitieType,
  type GroupColor,
} from "@/lib/groepen.filtered";

const COLORS: { key: GroupColor; label: string; ring: string; dot: string; bg: string; text: string }[] = [
  { key: "green",  label: "Groen",  ring: "ring-emerald-200", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  { key: "yellow", label: "Geel",   ring: "ring-yellow-200",  dot: "bg-yellow-500",  bg: "bg-yellow-50",  text: "text-yellow-700" },
  { key: "orange", label: "Oranje", ring: "ring-orange-200",  dot: "bg-orange-500",  bg: "bg-orange-50",  text: "text-orange-700" },
  { key: "red",    label: "Rood",   ring: "ring-red-200",     dot: "bg-red-500",     bg: "bg-red-50",     text: "text-red-700" },
];

function ColorPill({ color, active, onClick }: { color: GroupColor; active: boolean; onClick: () => void }) {
  const meta = COLORS.find(c => c.key === color)!;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ${meta.ring} ${active ? meta.bg + " " + meta.text : "bg-white text-zinc-700"} hover:bg-zinc-50`}
      aria-label={`Zet kleur ${meta.label}`}
      title={meta.label}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      <span className="text-xs">{meta.label}</span>
    </button>
  );
}

function NoteRow({
  groepId,
  note,
  onSave,
  onDelete,
}: {
  groepId: string;
  note: NotitieType;
  onSave: (text: string, author?: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [author, setAuthor] = useState(note.author || "Onbekend");

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-zinc-500">
            Aangemaakt: {new Date(note.createdAt).toLocaleString()} {note.updatedAt ? `• Laatst bewerkt: ${new Date(note.updatedAt).toLocaleString()}` : ""}
            {note.author ? ` • ${note.author}` : " • Onbekend"}
          </div>
          {!editing ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{note.text}</p>
          ) : (
            <div className="mt-2 space-y-2">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Auteur"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Notitie…"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { onSave(text, author); setEditing(false); }}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                >
                  Opslaan
                </button>
                <button
                  onClick={() => { setEditing(false); setText(note.text); setAuthor(note.author || "Onbekend"); }}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
        {!editing && (
          <div className="shrink-0 space-x-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Bewerken
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg border px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
            >
              Verwijderen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GroepenPage() {
  const [groepen, setGroepen] = useState<GroepType[]>(listGroepen());
  useEffect(() => onGroepenChange(() => setGroepen(listGroepen())), []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Groepen</h1>
        <p className="text-zinc-600">Beheer kleurstatus en notities per groep.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {groepen.map((g) => (
          <GroupCard key={g.id} groep={g} />
        ))}
      </div>
    </div>
  );
}

function GroupCard({ groep }: { groep: GroepType }) {
  const [author, setAuthor] = useState("");
  const [note, setNote] = useState("");

  const onAdd = () => {
    if (!note.trim()) return;
    addGroepNotitie(groep.id, note.trim(), author.trim() || undefined);
    setNote("");
  };

  const meta = useMemo(() => COLORS.find(c => c.key === groep.kleur)!, [groep.kleur]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ${meta.ring} ${meta.bg} ${meta.text}`}>
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <span className="group-title">{groep.naam}</span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <ColorPill
                key={c.key}
                color={c.key}
                active={c.key === groep.kleur}
                onClick={() => setKleur(groep.id, c.key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Nieuwe notitie + opslaan */}
      <div className="mt-4 rounded-xl border bg-zinc-50 p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_auto]">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Auteur"
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nieuwe notitie…"
            rows={2}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={onAdd}
            className="h-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Opslaan
          </button>
        </div>
      </div>

      {/* Lijst met notities */}
      <div className="mt-3 space-y-3">
        {groep.notities.length === 0 ? (
          <div className="text-sm text-zinc-500 italic">Nog geen notities.</div>
        ) : (
          groep.notities.map((n) => (
            <NoteRow
              key={n.id}
              groepId={groep.id}
              note={n}
              onSave={(text, author) => updateGroepNotitie(groep.id, n.id, { text, author })}
              onDelete={() => removeGroepNotitie(groep.id, n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
