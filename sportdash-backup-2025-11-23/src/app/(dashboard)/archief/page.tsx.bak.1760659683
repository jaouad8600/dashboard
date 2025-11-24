"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Indicatie = {
  id: string;
  naam: string;
  type: "MEDISCH"|"GEDRAG"|"OVERIG";
  status: "OPEN"|"IN_BEHANDELING"|"AFGEROND";
  groepId?: string|null;
  start?: string|null;
  eind?: string|null;
  archivedAt?: string|null;
  archivedReason?: string|null;
};
type Mutatie = {
  id: string;
  titel?: string;
  status?: string;
  groepId?: string|null;
  omschrijving?: string|null;
  archivedAt?: string|null;
  archivedReason?: string|null;
};

export default function ArchiefPage() {
  const [tab, setTab] = useState<"indicaties"|"mutaties">("indicaties");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  async function load() {
    setLoading(true);
    try {
      const url = tab === "indicaties" ? "/api/archief/indicaties" : "/api/archief/mutaties";
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      setRows(Array.isArray(j) ? j : []);
      setErr(undefined);
    } catch (e:any) {
      setErr(e?.message || "Fout bij laden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, [tab]);

  const count = rows.length;
  const title = useMemo(()=> tab==="indicaties" ? "Gearchiveerde indicaties" : "Gearchiveerde sportmutaties", [tab]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Archief</h1>
        <div className="text-sm text-gray-500">Totaal: {count}</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={()=>setTab("indicaties")}
          className={`px-3 py-2 rounded-lg border ${tab==="indicaties" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"}`}
        >
          Indicaties
        </button>
        <button
          onClick={()=>setTab("mutaties")}
          className={`px-3 py-2 rounded-lg border ${tab==="mutaties" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"}`}
        >
          Sportmutaties
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={load} className="px-3 py-2 rounded-lg border hover:bg-gray-50">Herladen</button>
        </div>

        {loading && <div className="text-gray-500">Laden…</div>}
        {err && <div className="text-red-600">{err}</div>}

        {!loading && !err && (
          <div className="overflow-x-auto">
            {tab === "indicaties" ? (
              <table className="min-w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-600">
                  <tr>
                    <th className="px-4 py-2">Naam</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Groep</th>
                    <th className="px-4 py-2">Periode</th>
                    <th className="px-4 py-2">Gearchiveerd</th>
                    <th className="px-4 py-2">Reden</th>
                    <th className="px-4 py-2">Acties</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.length===0 && (
                    <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">Geen items.</td></tr>
                  )}
                  {rows.map((r:Indicatie)=>(
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-2">{r.naam}</td>
                      <td className="px-4 py-2">{r.type}</td>
                      <td className="px-4 py-2">{r.status}</td>
                      <td className="px-4 py-2">{r.groepId || "—"}</td>
                      <td className="px-4 py-2">{(r.start||"—")} → {(r.eind||"—")}</td>
                      <td className="px-4 py-2">{(r.archivedAt||"").toString().slice(0,10) || "—"}</td>
                      <td className="px-4 py-2">{r.archivedReason || "—"}</td>
                      <td className="px-4 py-2">
                        <Link href={`/indicaties/${r.id}`} className="px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Bekijken</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-600">
                  <tr>
                    <th className="px-4 py-2">Titel</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Groep</th>
                    <th className="px-4 py-2">Omschrijving</th>
                    <th className="px-4 py-2">Gearchiveerd</th>
                    <th className="px-4 py-2">Reden</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.length===0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Geen items.</td></tr>
                  )}
                  {rows.map((m:Mutatie)=>(
                    <tr key={m.id} className="border-t">
                      <td className="px-4 py-2">{m.titel || "—"}</td>
                      <td className="px-4 py-2">{m.status || "—"}</td>
                      <td className="px-4 py-2">{m.groepId || "—"}</td>
                      <td className="px-4 py-2 whitespace-pre-wrap">{m.omschrijving || "—"}</td>
                      <td className="px-4 py-2">{(m.archivedAt||"").toString().slice(0,10) || "—"}</td>
                      <td className="px-4 py-2">{m.archivedReason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
