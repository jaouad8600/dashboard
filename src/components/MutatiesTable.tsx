"use client";
import { useEffect, useMemo, useState } from "react";
import TableFilters, { Status } from "@/components/TableFilters";

type Mutatie = {
  id: string;
  datum: string;
  titel: string;
  omschrijving?: string;
  status: "open"|"in-behandeling"|"afgerond";
  createdAt?: string;
};

export default function MutatiesTable({ dense=false }: { dense?: boolean }) {
  const [rows, setRows] = useState<Mutatie[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [expanded, setExpanded] = useState<string>("");

  const load = async ()=>{
    setLoading(true);
    try{
      const r = await fetch("/api/mutaties", { cache:"no-store" });
      const j:Mutatie[] = await r.json();
      setRows(Array.isArray(j)? j: []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, []);
  useEffect(()=> {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("mutaties-changed");
      bc.onmessage = ()=> load();
    } catch {}
    return ()=> { try{ bc?.close(); }catch{} };
  }, []);

  const filtered = useMemo(()=>{
    const needle = q.trim().toLowerCase();
    return rows.filter(r=>{
      const okStatus = status==="all" ? true : r.status===status;
      const hay = (r.titel||"")+" "+(r.omschrijving||"");
      const okQ = needle==="" ? true : hay.toLowerCase().includes(needle);
      return okStatus && okQ;
    });
  }, [rows, q, status]);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Sportmutaties</h3>
        {loading && <span className="text-xs text-zinc-500">Laden…</span>}
      </div>
      <div className="mb-3">
        <TableFilters q={q} onQ={setQ} status={status} onStatus={setStatus} placeholder="Zoek titel of omschrijving…" />
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${dense?"":"table-auto"}`}>
          <thead>
            <tr className="text-left border-b bg-zinc-50">
              <th className="p-2">Datum</th>
              <th className="p-2">Titel</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && !loading && (
              <tr><td colSpan={3} className="p-4 text-center text-zinc-500">Geen mutaties gevonden.</td></tr>
            )}
            {filtered.map(r=>(
              <tr key={r.id} className="border-b hover:bg-zinc-50 cursor-pointer"
                  onClick={()=> setExpanded(expanded===r.id ? "" : r.id)}>
                <td className="p-2 whitespace-nowrap">{(r.datum||"").slice(0,10)}</td>
                <td className="p-2 font-medium">{r.titel}</td>
                <td className="p-2">
                  <span className="rounded px-2 py-0.5 text-xs border">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expanded && (()=> {
        const m = rows.find(x=>x.id===expanded);
        if (!m) return null;
        return (
          <div className="mt-3 rounded-lg border bg-zinc-50 p-3">
            <div className="text-sm">
              <div className="font-semibold">{m.titel}</div>
              <div className="text-xs text-zinc-500 mb-2">{m.status} • {(m.datum||"").slice(0,10)}</div>
              {m.omschrijving && <p>{m.omschrijving}</p>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
