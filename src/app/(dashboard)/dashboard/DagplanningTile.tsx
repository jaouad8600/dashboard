"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = { id?:string; title?:string; start?:string; end?:string; allDay?:boolean; groepId?:string };

function fmt(t?:string){
  if(!t) return "";
  try{
    const d = new Date(t);
    return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  }catch{ return t||""; }
}

export default function DagplanningTile(){
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(()=>{
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,'0');
    const d = String(now.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  },[]);

  async function load(){
    setLoading(true);
    try{
      const res = await fetch(`/api/planning?date=${today}`, { cache: "no-store" });
      const data = await res.json();
      const list: Plan[] = Array.isArray(data?.items) ? data.items : [];
      // sorteer op starttijd
      list.sort((a,b)=> String(a.start||'').localeCompare(String(b.start||'')));
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); },[]);
  // optioneel elke 60s verversen
  // useEffect(()=>{ const id=setInterval(load, 60000); return ()=>clearInterval(id); },[]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dagplanning</h2>
        <button onClick={load} className="btn btn-primary text-xs px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-50">Vernieuw</button>
      </div>

      {loading && <div className="text-sm text-zinc-500">Laden…</div>}

      {!loading && items.length === 0 && (
        <div className="text-sm text-zinc-500">Geen planning voor vandaag.</div>
      )}

      <ul className="space-y-2">
        {items.map((p, i)=>(
          <li key={p.id || i} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate font-medium">{p.title || "Zonder titel"}</div>
              <div className="text-xs text-zinc-500">{fmt(p.start)} – {fmt(p.end)}</div>
            </div>
            {p.groepId && <span className="ml-3 shrink-0 text-xs rounded px-2 py-0.5 bg-zinc-100 border border-zinc-200">{p.groepId}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
