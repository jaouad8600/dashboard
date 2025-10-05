"use client";
import { useEffect, useMemo, useState } from "react";
import {
  listMaterialen,
  addMateriaal,
  duplicateMateriaal,
  deleteMateriaal,
  updateMateriaal,
  type Materiaal
} from "@/lib/materialen";

const LOCATIES = ["Eb Fitness","Fitness Vloed","Gymzaal Vloed","Gymzaal Eb","Sportveld","Dojo"];
const STATUSSEN = ["Beschikbaar","Uitgeleend","Kapot"];

export default function InventarisPage() {
  const safeList = () => (Array.isArray(listMaterialen()) ? listMaterialen() : []);
  const [items, setItems] = useState<Materiaal[]>(safeList());

  const [naam, setNaam] = useState("");
  const [aantal, setAantal] = useState<number>(1);
  const [locatie, setLocatie] = useState(LOCATIES[0]);
  const [status, setStatus] = useState(STATUSSEN[0]);

  const [fltLocatie, setFltLocatie] = useState<string>("ALLE");
  const [fltStatus, setFltStatus] = useState<string>("ALLE");
  const [query, setQuery] = useState("");

  useEffect(()=>{ setItems(safeList()); },[]);

  const gefilterd = useMemo(()=>{
    let rows = items.slice();
    if (fltLocatie !== "ALLE") rows = rows.filter(r => r.locatie === fltLocatie);
    if (fltStatus !== "ALLE") rows = rows.filter(r => r.status === fltStatus);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(r =>
        (r.naam||"").toLowerCase().includes(q) ||
        (r.locatie||"").toLowerCase().includes(q) ||
        (r.status||"").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [items, fltLocatie, fltStatus, query]);

  async function handleAdd() {
    const n = naam.trim(); if (!n) return;
    await addMateriaal({ naam: n, aantal, locatie, status });
    setItems(safeList());
    setNaam(""); setAantal(1); setLocatie(LOCATIES[0]); setStatus(STATUSSEN[0]);
  }
  async function handleDup(id: string) { await duplicateMateriaal(id); setItems(safeList()); }
  async function handleDel(id: string) { await deleteMateriaal(id); setItems(safeList()); }
  async function handleUpdate(m: Materiaal, patch: Partial<Materiaal>) {
    await updateMateriaal(m.id, patch); setItems(safeList());
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventaris</h1>
        <span className="text-sm text-zinc-500">PDF export staat uit. Rest werkt.</span>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <input className="rounded-lg border px-3 py-2" placeholder="Naam"
                 value={naam} onChange={(e)=>setNaam(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" type="number" min={0}
                 value={aantal} onChange={(e)=>setAantal(parseInt(e.target.value||"0",10))} />
          <select className="rounded-lg border px-3 py-2" value={locatie} onChange={(e)=>setLocatie(e.target.value)}>
            {LOCATIES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="rounded-lg border px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
            {STATUSSEN.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleAdd}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700">
            Toevoegen
          </button>

          <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="Zoeken…"
                 value={query} onChange={(e)=>setQuery(e.target.value)} />
          <select className="rounded-lg border px-3 py-2" value={fltLocatie} onChange={(e)=>setFltLocatie(e.target.value)}>
            <option value="ALLE">Alle locaties</option>
            {LOCATIES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="rounded-lg border px-3 py-2" value={fltStatus} onChange={(e)=>setFltStatus(e.target.value)}>
            <option value="ALLE">Alle statussen</option>
            {STATUSSEN.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <table className="w-full table-fixed border-separate [border-spacing:0]">
          <thead>
            <tr className="text-left text-sm text-zinc-500">
              <th className="py-2 px-3">Naam</th>
              <th className="py-2 px-3 w-24">Aantal</th>
              <th className="py-2 px-3 w-40">Locatie</th>
              <th className="py-2 px-3 w-40">Status</th>
              <th className="py-2 px-3 w-56 text-right">Acties</th>
            </tr>
          </thead>
          <tbody>
            {gefilterd.map((m)=>(
              <tr key={m.id} className="border-b last:border-0">
                <td className="py-2 px-3">
                  <input className="w-full rounded-md border px-2 py-1"
                         value={m.naam} onChange={(e)=>handleUpdate(m,{ naam: e.target.value })}/>
                </td>
                <td className="py-2 px-3">
                  <input type="number" min={0} className="w-full rounded-md border px-2 py-1"
                         value={m.aantal} onChange={(e)=>handleUpdate(m,{ aantal: parseInt(e.target.value||"0",10) })}/>
                </td>
                <td className="py-2 px-3">
                  <select className="w-full rounded-md border px-2 py-1"
                          value={m.locatie} onChange={(e)=>handleUpdate(m,{ locatie: e.target.value })}>
                    {LOCATIES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </td>
                <td className="py-2 px-3">
                  <select className="w-full rounded-md border px-2 py-1"
                          value={m.status} onChange={(e)=>handleUpdate(m,{ status: e.target.value })}>
                    {STATUSSEN.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>handleDup(m.id)}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">Dupliceer</button>
                    <button onClick={()=>handleDel(m.id)}
                            className="rounded-md bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200">Verwijder</button>
                  </div>
                </td>
              </tr>
            ))}
            {gefilterd.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-zinc-500 text-sm">Geen items gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
