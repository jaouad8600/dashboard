"use client";

import { useEffect, useState } from "react";
import { loadSportRestrictions } from "@/lib/clientStore";

type R = ReturnType<typeof loadSportRestrictions>[number];

export default function IndicatieSportPage(){
  const [rows, setRows] = useState<R[]>([]);
  useEffect(()=>{ try{ setRows(loadSportRestrictions()); }catch{} },[]);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Indicatie sport</h1>

      <div className="rounded-2xl border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left px-3 py-2">Groep</th>
              <th className="text-left px-3 py-2">Label</th>
              <th className="text-left px-3 py-2">Notitie</th>
              <th className="text-left px-3 py-2">Actief</th>
              <th className="text-left px-3 py-2">Tot</th>
            </tr>
          </thead>
          <tbody>
            {rows.length===0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center opacity-70">Geen indicaties gevonden.</td></tr>
            )}
            {rows.map((r)=> {
              const until = r.until ? new Date(r.until).toLocaleDateString("nl-NL") : "—";
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.group || "—"}</td>
                  <td className="px-3 py-2 font-medium">{r.label || "—"}</td>
                  <td className="px-3 py-2">{r.note || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-lg border ${r.active ? "border-green-200" : "opacity-60"}`}>
                      {r.active ? "Ja" : "Nee"}
                    </span>
                  </td>
                  <td className="px-3 py-2">{until}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs opacity-70">
        Data komt uit <code>sport-restrictions-v1</code> in <code>localStorage</code>. Jouw parser kan dit vullen.
      </p>
    </div>
  );
}
