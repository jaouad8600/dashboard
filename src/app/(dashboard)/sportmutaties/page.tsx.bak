"use client";

import SyncService from "@/components/SyncService";
import { useMutaties, addMutatie } from "@/lib/live";
import { getAllGroups } from "@/lib/groupColors";
import { useMemo, useState } from "react";

type Mutatie = {
  id: string;
  group: string;
  name: string;
  medic: string;
  status: "Niet sporten" | "Beperkt" | "Voorzichtig" | "Vrijgegeven";
  active: boolean;
  start?: string;
  end?: string;
  note?: string;
};

function fmt(dt?: string){ return dt ? new Date(dt).toLocaleString("nl-NL") : ""; }

export default function SportmutatiesPage(){
  const [mutaties, setMutaties] = useMutaties();
  const groups = getAllGroups();

  // form state
  const [group, setGroup] = useState(groups[0] ?? "");
  const [name, setName]   = useState("");
  const [medic, setMedic] = useState("");
  const [status, setStatus] = useState<Mutatie["status"]>("Niet sporten");
  const [note, setNote] = useState("");

  const addManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !name || !medic || !status) return;
    const item: Mutatie = {
      id: "mut_" + Date.now(),
      group, name, medic, status,
      active: status !== "Vrijgegeven",
      start: new Date().toISOString(),
      note: note || undefined,
    };
    addMutatie(item); // prepend + broadcast
    // lokaal ook refresh (direct)
    setMutaties((prev:any[]) => [item, ...(prev||[])]);
    // reset
    setName(""); setMedic(""); setStatus("Niet sporten"); setNote("");
  };

  const grouped = useMemo(()=>{
    const map: Record<string, Mutatie[]> = {};
    for(const m of (mutaties as Mutatie[] || [])){
      const g = m.group || "Onbekend";
      if(!map[g]) map[g]=[];
      map[g].push(m);
    }
    return map;
  }, [mutaties]);

  const toggleActive = (id: string) => {
    setMutaties((prev:any[]) => (prev||[]).map((m:Mutatie)=> m.id===id ? { ...m, active: !m.active } : m));
  };
  const changeStatus = (id: string, next: Mutatie["status"]) => {
    setMutaties((prev:any[]) => (prev||[]).map((m:Mutatie)=> m.id===id ? { ...m, status: next, active: next!=="Vrijgegeven" } : m));
  };
  const removeItem = (id: string) => {
    setMutaties((prev:any[]) => (prev||[]).filter((m:Mutatie)=> m.id!==id));
  };

  const statuses: Mutatie["status"][] = ["Niet sporten","Beperkt","Voorzichtig","Vrijgegeven"];

  return (
    <div className="p-6 space-y-6">
      <SyncService />
      <h1 className="text-2xl font-bold">Sportmutaties</h1>

      {/* Handmatig toevoegen */}
      <form onSubmit={addManual} className="bg-white shadow rounded-2xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Groep</label>
          <select value={group} onChange={e=>setGroup(e.target.value)} className="border rounded-lg px-3 py-2 w-full">
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Naam</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="border rounded-lg px-3 py-2 w-full" placeholder="Deelnemer" required />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Medische dienst</label>
          <input value={medic} onChange={e=>setMedic(e.target.value)} className="border rounded-lg px-3 py-2 w-full" placeholder="Arts/verpleegkundige" required />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Soort mutatie</label>
          <select value={status} onChange={e=>setStatus(e.target.value as Mutatie["status"])} className="border rounded-lg px-3 py-2 w-full">
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Notitie (optioneel)</label>
          <input value={note} onChange={e=>setNote(e.target.value)} className="border rounded-lg px-3 py-2 w-full" placeholder="Bijv. alleen fitness toegestaan" />
        </div>
        <div className="md:col-span-6 flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Toevoegen</button>
        </div>
      </form>

      {/* Overzicht per groep */}
      <div className="space-y-6">
        {Object.keys(grouped).length===0 && (
          <p className="text-gray-500">Nog geen sportmutaties.</p>
        )}
        {Object.entries(grouped).map(([g, items])=>(
          <div key={g} className="bg-white shadow rounded-2xl">
            <div className="px-4 py-3 border-b font-semibold">{g}</div>
            <ul className="p-4 space-y-3">
              {items.map(m => (
                <li key={m.id} className="border rounded-lg p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{m.name} <span className="text-xs text-gray-500">({m.medic})</span></div>
                      <div className="text-sm text-gray-600">
                        {m.status}{m.note ? ` • ${m.note}` : ""} {m.start ? `• ${fmt(m.start)}` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={m.status}
                        onChange={e=>changeStatus(m.id, e.target.value as Mutatie["status"])}
                        className="border rounded px-2 py-1 text-sm"
                        title="Wijzig soort mutatie"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>

                      <button
                        onClick={()=>toggleActive(m.id)}
                        className={`px-2 py-1 rounded text-sm ${m.active ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
                        title="Actief / Gestopt"
                      >
                        {m.active ? "Actief" : "Gestopt"}
                      </button>

                      <button
                        onClick={()=>removeItem(m.id)}
                        className="px-2 py-1 rounded text-sm bg-red-50 text-red-700"
                        title="Verwijderen"
                      >
                        Verwijder
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
