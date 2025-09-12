"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMaterials,
  onMaterialsChange,
  addMaterial,
  updateMaterial,
  removeMaterial,
  adjustCount,
  ensureSeed,
  MATERIAL_LOCATIONS,
  MATERIAL_STATUSES,
  type Material,
  type MaterialLocation,
  type MaterialStatus,
  isLowStock,
} from "../../../lib/materials";

export default function MaterialenPage() {
  const [items, setItems] = useState<Material[]>([]);

  useEffect(() => {
    ensureSeed();
    setItems(getMaterials());
    const off = onMaterialsChange(() => setItems(getMaterials()));
    return off;
  }, []);

  const [name, setName] = useState("");
  const [location, setLocation] = useState<MaterialLocation>("Fitnesszaal EB");
  const [status, setStatus] = useState<MaterialStatus>("Goed");
  const [count, setCount] = useState<number>(1);
  const [minCount, setMinCount] = useState<number>(1);
  const [ticket, setTicket] = useState("");
  const [note, setNote] = useState("");

  const byLocation = useMemo(() => {
    const map: Record<string, Material[]> = {};
    for (const m of items) (map[m.location] ||= []).push(m);
    return map;
  }, [items]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addMaterial({
      name: String(name ?? "").trim(),
      location,
      status,
      count: Number(count ?? 0),
      minCount: Number(minCount ?? 0),
      ticket: ticket ? String(ticket) : undefined,
      note: note ? String(note) : undefined,
    });
    setName(""); setCount(1); setMinCount(1); setTicket(""); setNote("");
  };

  const pill = (s: MaterialStatus) =>
    ({
      Goed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Defect: "bg-red-100 text-red-700 border-red-200",
      Besteld: "bg-amber-100 text-amber-700 border-amber-200",
      Topdesk: "bg-blue-100 text-blue-700 border-blue-200",
    }[s]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Materialen</h1>

      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 bg-white border rounded-2xl p-4">
        <input className="border rounded-lg px-3 py-2" placeholder="Naam materiaal" value={name} onChange={(e)=>setName(e.target.value)} required />
        <select className="border rounded-lg px-3 py-2" value={location} onChange={(e)=>setLocation(e.target.value as MaterialLocation)}>
          {MATERIAL_LOCATIONS.map((l)=>(<option key={l} value={l}>{l}</option>))}
        </select>
        <select className="border rounded-lg px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value as MaterialStatus)}>
          {MATERIAL_STATUSES.map((s)=>(<option key={s} value={s}>{s}</option>))}
        </select>
        <input type="number" min={0} className="border rounded-lg px-3 py-2" placeholder="Aantal" value={Number.isFinite(count)?count:0} onChange={(e)=>setCount(Number(e.target.value||0))}/>
        <input type="number" min={0} className="border rounded-lg px-3 py-2" placeholder="Minimum" value={Number.isFinite(minCount)?minCount:0} onChange={(e)=>setMinCount(Number(e.target.value||0))}/>
        <input className="border rounded-lg px-3 py-2" placeholder="Topdesk / ticketnr. (optioneel)" value={ticket} onChange={(e)=>setTicket(e.target.value)} />
        <textarea className="md:col-span-2 lg:col-span-3 border rounded-lg px-3 py-2" placeholder="Notitie (optioneel)" rows={2} value={note} onChange={(e)=>setNote(e.target.value)} />
        <div className="md:col-span-2 lg:col-span-3">
          <button className="rounded-lg bg-black text-white px-4 py-2">Toevoegen</button>
        </div>
      </form>

      <div className="space-y-6">
        {MATERIAL_LOCATIONS.map((loc)=> {
          const list = byLocation[loc] || [];
          return (
            <div key={loc} className="bg-white border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{loc}</h2>
                <div className="text-sm text-zinc-500">{list.length} items</div>
              </div>
              {list.length===0 ? (
                <div className="text-sm text-zinc-500">Geen materialen op deze locatie.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500">
                        <th className="py-2 pr-4">Naam</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Aantal</th>
                        <th className="py-2 pr-4">Minimum</th>
                        <th className="py-2 pr-4">Ticket</th>
                        <th className="py-2 pr-4">Notitie</th>
                        <th className="py-2">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((m)=>(
                        <tr key={m.id} className="border-t">
                          <td className="py-2 pr-4">{m.name}</td>
                          <td className="py-2 pr-4">
                            <span className={`inline-block px-2 py-1 rounded border ${pill(m.status)}`}>{m.status}</span>
                          </td>
                          <td className="py-2 pr-4">
                            <div className="inline-flex items-center gap-2">
                              <button className="px-2 py-1 rounded border" onClick={()=>adjustCount(m.id,-1)} type="button">−</button>
                              <span className={`px-2 py-1 rounded ${isLowStock(m)?"bg-red-50 text-red-700":"bg-zinc-50"}`}>{m.count ?? 0}</span>
                              <button className="px-2 py-1 rounded border" onClick={()=>adjustCount(m.id,+1)} type="button">+</button>
                            </div>
                          </td>
                          <td className="py-2 pr-4">{m.minCount ?? 1}</td>
                          <td className="py-2 pr-4">{m.ticket || "-"}</td>
                          <td className="py-2 pr-4">{m.note || "-"}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              <select className="border rounded px-2 py-1" value={m.status} onChange={(e)=>updateMaterial(m.id,{status:e.target.value as MaterialStatus})}>
                                {MATERIAL_STATUSES.map((s)=>(<option key={s} value={s}>{s}</option>))}
                              </select>
                              <button className="text-red-600 hover:underline" onClick={()=>removeMaterial(m.id)} type="button">Verwijderen</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
