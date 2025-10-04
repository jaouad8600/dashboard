"use client";

import { useState } from "react";
import { useLive } from "@/lib/useLive";
import {
  materialsStore, addMaterial, updateMaterial, removeMaterial,
  LOCATIES, STATUSES, type Status, type MateriaalType
} from "@/lib/materials";

export default function MaterialenPage() {
  const materialen = useLive(materialsStore);

  const [naam, setNaam] = useState("");
  const [locatie, setLocatie] = useState<(typeof LOCATIES)[number] | "">("");
  const [status, setStat] = useState<Status>("Goed");
  const [notitie, setNotitie] = useState("");

  function add() {
    if (!naam.trim()) return;
    addMaterial({
      naam: naam.trim(),
      locatie: locatie || undefined,
      status,
      notitie: notitie.trim() || undefined,
    });
    setNaam(""); setLocatie(""); setStat("Goed"); setNotitie("");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input className="rounded-lg border px-3 py-2" placeholder="Materiaalnaam" value={naam} onChange={(e)=>setNaam(e.target.value)} />
          <select className="rounded-lg border px-3 py-2" value={locatie} onChange={(e)=>setLocatie(e.target.value as any)}>
            <option value="">— Locatie —</option>
            {LOCATIES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="rounded-lg border px-3 py-2" value={status} onChange={(e)=>setStat(e.target.value as Status)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="Notitie (optioneel)" value={notitie} onChange={(e)=>setNotitie(e.target.value)} />
        </div>
        <div className="mt-3">
          <button onClick={add} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Toevoegen</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Naam</th>
              <th className="p-3 text-left">Locatie</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Notitie</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {materialen.map((m: MateriaalType) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">{m.naam}</td>
                <td className="p-3">
                  <select
                    className="rounded-lg border px-2 py-1"
                    value={m.locatie ?? ""}
                    onChange={(e)=>updateMaterial(m.id, { locatie: (e.target.value || undefined) as any })}
                  >
                    <option value="">—</option>
                    {LOCATIES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select
                    className="rounded-lg border px-2 py-1"
                    value={m.status}
                    onChange={(e)=>updateMaterial(m.id, { status: e.target.value as Status })}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    className="w-full rounded-lg border px-2 py-1"
                    value={m.notitie ?? ""}
                    onChange={(e)=>updateMaterial(m.id, { notitie: e.target.value })}
                  />
                </td>
                <td className="p-3 text-right">
                  <button onClick={()=>removeMaterial(m.id)} className="text-red-600 hover:underline">Verwijderen</button>
                </td>
              </tr>
            ))}
            {materialen.length === 0 && (
              <tr><td className="p-3 text-zinc-500 italic" colSpan={5}>Geen materialen.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
