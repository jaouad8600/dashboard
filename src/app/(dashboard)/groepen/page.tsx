"use client";

import { useEffect, useState } from "react";
import { toArray } from "@/lib/toArray";

type Kleur = "GREEN" | "YELLOW" | "ORANGE" | "RED";
type Note = { id: string; tekst: string; auteur?: string; createdAt: string };
type Groep = { id: string; naam: string; afdeling?: "EB" | "VLOED"; kleur: Kleur; notities: Note[] };

const COLOR_CLS: Record<Kleur, string> = {
  GREEN:  "bg-green-100 text-green-800 border-green-300",
  YELLOW: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ORANGE: "bg-orange-100 text-orange-800 border-orange-300",
  RED:    "bg-red-100 text-red-800 border-red-300",
};

export default function GroepenPage() {
  const [rows, setRows] = useState<Groep[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState<Record<string,string>>({});

  async function load() {
    try {
      const r = await fetch("/api/groepen", { cache: "no-store" });
      const j = await r.json();
      setRows(toArray<Groep>(j));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let stop = false;
    const run = async () => { if (!stop) await load(); };
    run();
    const h = setInterval(run, 5000);
    return () => { stop = true; clearInterval(h); };
  }, []);

  async function setKleur(id: string, kleur: Kleur) {
    await fetch(`/api/groepen/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kleur }),
    });
    setRows(prev => prev.map(g => g.id === id ? { ...g, kleur } : g));
  }

  async function addNote(id: string) {
    const tekst = (newNote[id] || "").trim();
    if (!tekst) return;
    await fetch(`/api/groepen/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newNote: { tekst } }),
    });
    setNewNote(m => ({ ...m, [id]: "" }));
    await load();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Groepen</h1>
      <p className="text-sm text-zinc-500">Kleurstatus en notities per groep.</p>

      {loading ? (
        <div className="text-sm text-zinc-500">Laden…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-zinc-500">Geen groepen gevonden.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((g) => (
            <div key={g.id} className="rounded-lg border bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{g.naam}</div>
                <span className={`text-xs px-2 py-1 rounded border ${COLOR_CLS[g.kleur]}`}>{g.kleur}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["GREEN","YELLOW","ORANGE","RED"] as Kleur[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setKleur(g.id, k)}
                    className={`px-3 py-1 rounded border text-sm ${k===g.kleur ? "bg-black text-white border-black" : "bg-zinc-50 hover:bg-zinc-100"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div>
                <div className="text-sm text-zinc-500 mb-1">Notities</div>
                <div className="space-y-2 max-h-36 overflow-auto pr-1">
                  {g.notities?.length ? g.notities.map(n => (
                    <div key={n.id} className="text-sm rounded bg-zinc-50 p-2 border">
                      <div className="text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</div>
                      <div>{n.tekst}</div>
                    </div>
                  )) : <div className="text-xs text-zinc-400">Nog geen notities…</div>}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={newNote[g.id] || ""}
                    onChange={(e) => setNewNote(m => ({ ...m, [g.id]: e.target.value }))}
                    placeholder="Nieuwe notitie…"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <button onClick={() => addNote(g.id)} className="px-2 text-sm rounded bg-black text-white">
                    Voeg toe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
