"use client";

import { useEffect, useState } from "react";
import { loadSportmutaties } from "@/lib/clientStore";

type SM = ReturnType<typeof loadSportmutaties>[number];

export default function SportmutatiesPage(){
  const [rows, setRows] = useState<SM[]>([]);

  useEffect(()=>{
    try { setRows(loadSportmutaties()); } catch {}
  },[]);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Sportmutaties</h1>

      <div className="rounded-2xl border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left px-3 py-2">Jongere</th>
              <th className="text-left px-3 py-2">Groep</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Aangemaakt</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center opacity-70">Nog geen sportmutaties.</td></tr>
            )}
            {rows.map((m)=> {
              const name = m.title || "Onbekend";
              const dt = m.createdAt ? new Date(m.createdAt) : null;
              const when = dt ? dt.toLocaleString("nl-NL") : "—";
              const status = (m.status || "open");
              return (
                <tr key={m.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{name}</td>
                  <td className="px-3 py-2">{m.group || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-lg border ${status==="gesloten"?"opacity-60":"border-blue-200"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{when}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs opacity-70">
        Tip: in je parser vul je <code>title</code> met de naam van de jongere en <code>createdAt</code> met een ISO-string. Dan vult deze lijst zichzelf.
      </p>
    </div>
  );
}
