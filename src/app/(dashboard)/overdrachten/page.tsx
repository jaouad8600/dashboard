"use client";

import { useEffect, useState } from "react";
import {
  listOverdrachten,
  onOverdrachtenChange,
  createOverdracht,
  patchOverdracht,
  deleteOverdracht,
  type Overdracht,
} from "@/lib/overdrachten";

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowHHMM = () => {
  const d = new Date(); const z = (n:number)=>String(n).padStart(2,"0");
  return `${z(d.getHours())}:${z(d.getMinutes())}`;
};

export default function OverdrachtenPage() {
  const [items, setItems] = useState<Overdracht[]>(listOverdrachten());
  const [datumISO, setDatumISO] = useState(todayISO());
  const [tijd, setTijd] = useState(nowHHMM());
  const [auteur, setAuteur] = useState("");
  const [bericht, setBericht] = useState("");
  const [belangrijk, setBelangrijk] = useState(false);

  useEffect(() => onOverdrachtenChange(() => setItems(listOverdrachten())), []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = bericht.trim();
    if (!text) return;
    createOverdracht({ datumISO, tijd, auteur: auteur || undefined, bericht: text, belangrijk });
    setBericht("");
    setBelangrijk(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Overdrachten</h1>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border bg-white p-4 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3"
      >
        <div>
          <label className="text-xs text-zinc-500">Datum</label>
          <input type="date" className="w-full rounded-lg border px-3 py-2 text-sm"
                 value={datumISO} onChange={(e)=>setDatumISO(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Tijd</label>
          <input type="time" className="w-full rounded-lg border px-3 py-2 text-sm"
                 value={tijd} onChange={(e)=>setTijd(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Auteur</label>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Optioneel"
                 value={auteur} onChange={(e)=>setAuteur(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-zinc-500">Bericht</label>
          <input className="w-full rounded-lg border px-3 py-2 text-sm"
                 placeholder="Wat moet de volgende dienst weten?"
                 value={bericht} onChange={(e)=>setBericht(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={belangrijk}
                   onChange={(e)=>setBelangrijk(e.target.checked)} />
            Belangrijk
          </label>
          <button type="submit"
                  className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
            Plaatsen
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-zinc-500">
            Nog geen overdrachten.
          </div>
        ) : items.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className={`mt-1 h-2 w-2 rounded-full ${o.belangrijk ? "bg-red-500" : "bg-zinc-300"}`} />
              <div className="flex-1">
                <div className="text-sm text-zinc-500">
                  {o.datumISO} • {o.tijd}{o.auteur ? ` • ${o.auteur}` : ""}
                </div>
                <div className="mt-1">{o.bericht}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => patchOverdracht(o.id, { belangrijk: !o.belangrijk })}
                  className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50"
                >
                  {o.belangrijk ? "Markeer normaal" : "Markeer belangrijk"}
                </button>
                <button
                  onClick={() => deleteOverdracht(o.id)}
                  className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
