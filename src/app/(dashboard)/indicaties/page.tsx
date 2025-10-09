"use client";
import { useEffect, useMemo, useState } from "react";

type Groep = { id:string; naam:string; afdeling:"EB"|"VLOED" };
type Row = {
  id?:string; naam?:string; type?:string;
  status?:"open"|"in-behandeling"|"afgerond";
  start?:string; eind?:string; groepId?:string; opmerking?:string;
};

export default function IndicatiesPage(){
  const [rows,setRows] = useState<Row[]>([]);
  const [groepen,setGroepen] = useState<Groep[]>([]);
  const [q,setQ] = useState("");
  const [sel,setSel] = useState<Row|undefined>(undefined);

  async function load(){
    const [ri, rg] = await Promise.all([
      fetch("/api/indicaties", { cache:"no-store" }).then(r=>r.json()).catch(()=>[]),
      fetch("/api/groepen", { cache:"no-store" }).then(r=>r.json()).catch(()=>[])
    ]);
    setRows(Array.isArray(ri)? ri : []);
    setGroepen(Array.isArray(rg)? rg : []);
  }
  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(()=>{
    const f = (rows||[]).filter(r =>
      !q.trim() ||
      (r.naam||"").toLowerCase().includes(q.toLowerCase()) ||
      (r.type||"").toLowerCase().includes(q.toLowerCase()) ||
      (r.opmerking||"").toLowerCase().includes(q.toLowerCase())
    );
    return f;
  }, [rows, q]);

  async function save(){
    if(!sel) return;
    const base = {
      naam: sel.naam||"",
      type: sel.type||"",
      status: sel.status||"open",
      start: sel.start||"",
      eind: sel.eind||"",
      groepId: sel.groepId||"",
      opmerking: sel.opmerking||""
    };
    if (!sel.id){
      const r = await fetch("/api/indicaties", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(base) });
      if (!r.ok){ alert("Fout bij toevoegen"); return; }
    } else {
      const r = await fetch(`/api/indicaties`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ ...base, id: sel.id }) });
      if (!r.ok){ alert("Fout bij opslaan"); return; }
    }
    setSel(undefined);
    load();
  }

  async function remove(id?:string){
    if (!id) return;
    // simpel: update naar afgerond of filter via backend? Voor nu: client-side verwijderen via POST + remove bestaat niet -> demo.
    const left = (rows||[]).filter(r=>r.id!==id);
    setRows(left);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Indicaties</h1>
        <button onClick={()=>setSel({ status:"open" })}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded">+ Nieuwe indicatie</button>
      </div>

      <div className="flex gap-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter…" className="border rounded px-2 py-1 w-full"/>
      </div>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Naam</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Start</th>
              <th className="text-left px-3 py-2">Eind</th>
              <th className="text-right px-3 py-2">Acties</th>
            </tr>
          </thead>
          <tbody>
            {(filtered||[]).map((r:any)=>(
              <tr key={r.id} className="border-b">
                <td className="px-3 py-2">
                  <button onClick={()=>setSel(r)} className="text-left text-blue-700 hover:underline">{r.naam}</button>
                </td>
                <td className="px-3 py-2">{r.type||'-'}</td>
                <td className="px-3 py-2">
                  <span className={
                    r.status==='open' ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded'
                    : r.status==='in-behandeling' ? 'text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded'
                    : 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded'
                  }>{r.status}</span>
                </td>
                <td className="px-3 py-2">{(r.start||'').slice(0,10)||'-'}</td>
                <td className="px-3 py-2">{(r.eind||'').slice(0,10)||'-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-end">
                    <button onClick={()=>setSel(r)} className="text-blue-600 hover:underline">Bewerken</button>
                    <button onClick={()=>remove(r.id)} className="text-rose-600 hover:underline">Verwijderen</button>
                  </div>
                </td>
              </tr>
            ))}
            {(!filtered || filtered.length===0) && (
              <tr><td className="px-3 py-4 text-center text-gray-500" colSpan={6}>Geen resultaten</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple modal */}
      {sel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow max-w-xl w-full p-4 space-y-3">
            <div className="text-lg font-semibold">{sel.id ? "Indicatie bewerken" : "Nieuwe indicatie"}</div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Naam</div>
                <input value={sel.naam||""} onChange={e=>setSel({...sel, naam:e.target.value})} className="border rounded px-2 py-1 w-full"/>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Type</div>
                <input value={sel.type||""} onChange={e=>setSel({...sel, type:e.target.value})} className="border rounded px-2 py-1 w-full"/>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <select value={sel.status||"open"} onChange={e=>setSel({...sel, status:e.target.value as any})} className="border rounded px-2 py-1 w-full">
                  <option value="open">open</option>
                  <option value="in-behandeling">in-behandeling</option>
                  <option value="afgerond">afgerond</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Groep</div>
                <select value={sel.groepId||""} onChange={e=>setSel({...sel, groepId:e.target.value})} className="border rounded px-2 py-1 w-full">
                  {(Array.isArray(groepen)? groepen:[]).map(g=>(
                    <option key={g.id} value={g.id}>{g.afdeling} · {g.naam}</option>
                  ))}
                  {(!groepen || (groepen||[]).length===0) && <option value="">(geen groepen)</option>}
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Start</div>
                <input type="date" value={(sel.start||"").slice(0,10)} onChange={e=>setSel({...sel, start:e.target.value})} className="border rounded px-2 py-1 w-full"/>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Eind</div>
                <input type="date" value={(sel.eind||"").slice(0,10)} onChange={e=>setSel({...sel, eind:e.target.value})} className="border rounded px-2 py-1 w-full"/>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 mb-1">Opmerking</div>
                <textarea value={sel.opmerking||""} onChange={e=>setSel({...sel, opmerking:e.target.value})} className="border rounded px-2 py-1 w-full" rows={3}/>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setSel(undefined)} className="px-3 py-1.5 rounded border">Annuleren</button>
              <button onClick={save} className="px-3 py-1.5 rounded bg-green-600 text-white">Opslaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
