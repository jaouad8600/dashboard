"use client";
import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

type RawGroup = any;
type Group = {
  id: string;
  name: string;
  afdeling?: string;
  createdAt?: string;
  stats?: { mutaties?: number; indicaties?: number };
  status?: "GREEN" | "YELLOW" | "ORANGE" | "RED";
};

async function fetchNotes(groupId: string) {
  const res = await fetch(
    `/api/notities?groupId=${encodeURIComponent(groupId)}`,
    { cache: "no-store" },
  );
  return (await res.json()).items as {
    id: string;
    text: string;
    createdAt: string;
  }[];
}

export default function GroupCard({ raw }: { raw: RawGroup }) {
  const group: Group = useMemo(
    () => ({
      id:
        raw?.id ||
        raw?._id ||
        raw?.uuid ||
        raw?.slug ||
        (raw?.name || raw?.naam || "groep").toLowerCase().replace(/\s+/g, "-"),
      name: raw?.name || raw?.naam || "Groep",
      afdeling: raw?.afdeling || raw?.label || "EB",
      createdAt: raw?.createdAt,
      stats: raw?.stats || {
        mutaties: raw?.mutaties ?? 0,
        indicaties: raw?.indicaties ?? 0,
      },
      status: raw?.status || "GREEN",
    }),
    [raw],
  );

  const [notes, setNotes] = useState<
    { id: string; text: string; createdAt: string }[]
  >([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchNotes(group.id)
      .then(setNotes)
      .catch(() => { });
  }, [group.id]);

  const addNote = async () => {
    if (!note.trim()) return;
    const res = await fetch("/api/notities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group.id, text: note.trim() }),
    });
    if (res.ok) {
      const created = await res.json();
      setNotes((n) => [created, ...n]);
      setNote("");
    }
  };

  return (
    <div className="rounded-2xl border shadow-sm bg-white overflow-hidden">
      {/* Top rail in status-kleur */}
      <div
        className={
          {
            GREEN: "h-2 bg-emerald-600",
            YELLOW: "h-2 bg-amber-500",
            ORANGE: "h-2 bg-orange-500",
            RED: "h-2 bg-rose-600",
          }[group.status || "GREEN"]
        }
      />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{group.name}</h3>
            <div className="text-slate-500 text-sm">
              {group.afdeling || "EB"}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge color="green">
              open mutaties: {group.stats?.mutaties ?? 0}
            </Badge>
            <Badge color="indigo">
              open indicaties: {group.stats?.indicaties ?? 0}
            </Badge>
          </div>
        </div>

        {/* Kleurstatus chips */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-slate-500">Kleurstatus</span>
          <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            GREEN
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-400 border border-slate-200">
            YELLOW
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-400 border border-slate-200">
            ORANGE
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-400 border border-slate-200">
            RED
          </span>
        </div>

        {/* Notities invoer */}
        <div className="mt-4 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Voeg notitie toe…"
            className="flex-1 h-10 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button onClick={addNote} className="h-10">
            Toevoegen
          </Button>
        </div>

        {/* Meta */}
        <div className="mt-3 text-xs text-slate-500">
          {new Date(group.createdAt || Date.now()).toLocaleString()} —
          Aangemaakt
        </div>

        {/* Laatste notities (optioneel) */}
        {notes.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">Laatste notities</div>
            <ul className="space-y-2">
              {notes.slice(0, 3).map((n) => (
                <li
                  key={n.id}
                  className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                >
                  {n.text}
                  <span className="ml-2 text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
