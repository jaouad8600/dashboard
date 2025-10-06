"use client";

import { useEffect, useMemo, useState } from "react";
import { broadcast } from "@/lib/live";

type Indicatie = {
  id: string;
  naam: string;
  type?: string;
  status: 'open' | 'in-behandeling' | 'afgerond';
  start?: string;
  eind?: string;
  opmerking?: string;
  inhoud?: string;
  createdAt: string;
};

async function apiJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, { ...init, headers: { "content-type": "application/json", ...(init?.headers||{}) } });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function IndicatiesPage() {
  const [rows, setRows] = useState<Indicatie[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Indicatie>>({ status: "open" });

  async function load() {
    setLoading(true);
    try {
      const data = await apiJSON<Indicatie[]>("/api/indicaties");
      setRows(data);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(r =>
      (r.naam||'').toLowerCase().includes(t) ||
      (r.type||'').toLowerCase().includes(t) ||
      (r.opmerking||'').toLowerCase().includes(t) ||
      (r.inhoud||'').toLowerCase().includes(t)
    );
  }, [rows, q]);

  function beginNew() {
    setOpenId(null);
    setDraft({ status: "open" });
  }
  function beginEdit(item: Indicatie) {
    setOpenId(item.id);
    setDraft(item);
  }
  async function save() {
    const payload = {
      naam: (draft.naam||"").trim(),
      type: draft.type?.trim() || undefined,
      status: (['open','in-behandeling','afgerond'] as const).includes(draft.status as any) ? draft.status : 'open',
      start: draft.start || undefined,
      eind: draft.eind || undefined,
      opmerking: draft.opmerking?.trim() || undefined,
      inhoud: draft.inhoud || undefined
    };
    if (!payload.naam) return alert("Naam is verplicht");

    if (openId) {
      await apiJSON(`/api/indicaties/${openId}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await apiJSON(`/api/indicaties`, { method: "POST", body: JSON.stringify(payload) });
    }
    setOpenId(null);
    setDraft({ status: "open" });
    broadcast("indicaties-changed");
    await load();
  }
  async function remove(id: string) {
    if (!confirm("Verwijderen?")) return;
    await apiJSON(`/api/indicaties/${id}`, { method: "DELETE" });
    if (openId === id) { setOpenId(null); setDraft({ status: "open" }); }
    broadcast("indicaties-changed");
    await load();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Indicaties</h1>
          <p className="text-sm text-zinc-500">Klik op de naam om te bekijken/bewerken. Je kunt tekst rechtstreeks plakken in de inhoud.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={q} onChange={e=>setQ(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm" placeholder="Zoeken…"
          />
          <button onClick={beginNew} className="rounded-md bg-black text-white px-3 py-2 text-sm">Nieuwe indicatie</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50">
              <th className="text-left px-3 py-2">Naam</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Start</th>
              <th className="text-left px-3 py-2">Eind</th>
              <th className="px-3 py-2">Acties</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-500">Laden…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-500">Geen resultaten.</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} className="border-b">
                <td className="px-3 py-2">
                  <button onClick={()=>beginEdit(r)} className="text-left text-blue-700 hover:underline">{r.naam}</button>
                </td>
                <td className="px-3 py-2">{r.type || '-'}</td>
                <td className="px-3 py-2">
                  <span className={
                    r.status==='open' ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded' :
                    r.status==='in-behandeling' ? 'text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded' :
                    'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded'
                  }>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2">{(r.start||'').slice(0,10) || '-'}</td>
                <td className="px-3 py-2">{(r.eind||'').slice(0,10) || '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-end">
                    <button onClick={()=>beginEdit(r)} className="text-blue-600 hover:underline">Bewerken</button>
                    <button onClick={()=>remove(r.id)} className="text-rose-600 hover:underline">Verwijderen</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer / Editor */}
      {(openId !== null || draft.naam || draft.type || draft.opmerking || draft.inhoud) && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={()=>{ setOpenId(null); setDraft({ status:'open' }); }}>
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl p-4 overflow-y-auto"
               onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{openId ? "Indicatie bewerken" : "Nieuwe indicatie"}</h2>
              <button onClick={()=>{ setOpenId(null); setDraft({ status:'open' }); }} className="text-zinc-500 hover:text-zinc-800">✕</button>
            </div>

            <div className="grid gap-3">
              <input className="border rounded-md px-3 py-2" placeholder="Naam *"
                     value={draft.naam || ''} onChange={e=>setDraft(d=>({...d, naam:e.target.value}))}/>
              <input className="border rounded-md px-3 py-2" placeholder="Type (optioneel)"
                     value={draft.type || ''} onChange={e=>setDraft(d=>({...d, type:e.target.value}))}/>
              <div className="grid grid-cols-3 gap-3">
                <select className="border rounded-md px-3 py-2 col-span-3 sm:col-span-1"
                        value={draft.status || 'open'}
                        onChange={e=>setDraft(d=>({...d, status: e.target.value as any}))}>
                  <option value="open">Open</option>
                  <option value="in-behandeling">In behandeling</option>
                  <option value="afgerond">Afgerond</option>
                </select>
                <input type="date" className="border rounded-md px-3 py-2 col-span-3 sm:col-span-1"
                       value={(draft.start||'').slice(0,10)}
                       onChange={e=>setDraft(d=>({...d, start: e.target.value ? new Date(e.target.value+'T00:00:00').toISOString() : undefined}))}/>
                <input type="date" className="border rounded-md px-3 py-2 col-span-3 sm:col-span-1"
                       value={(draft.eind||'').slice(0,10)}
                       onChange={e=>setDraft(d=>({...d, eind: e.target.value ? new Date(e.target.value+'T00:00:00').toISOString() : undefined}))}/>
              </div>
              <input className="border rounded-md px-3 py-2" placeholder="Korte opmerking (optioneel)"
                     value={draft.opmerking || ''} onChange={e=>setDraft(d=>({...d, opmerking:e.target.value}))}/>
              <label className="text-xs text-zinc-500">Inhoud (plak hier tekst uit Word/e-mail)</label>
              <textarea className="border rounded-md px-3 py-2 min-h-[200px]"
                        value={draft.inhoud || ''} onChange={e=>setDraft(d=>({...d, inhoud:e.target.value}))}/>
              <div className="flex gap-2 pt-2">
                <button onClick={save} className="rounded-md bg-black text-white px-3 py-2 text-sm">Opslaan</button>
                <button onClick={()=>{ setOpenId(null); setDraft({ status:'open' }); }} className="rounded-md border px-3 py-2 text-sm">Annuleren</button>
                {!!openId && (
                  <button onClick={()=>remove(openId)} className="ml-auto rounded-md bg-rose-600 text-white px-3 py-2 text-sm">Verwijderen</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
