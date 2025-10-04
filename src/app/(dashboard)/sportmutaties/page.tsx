"use client";
import { useEffect, useMemo, useState } from "react";
import { listMutaties, createMutatie, patchMutatie, deleteMutatie, onMutatiesChange, type Mutatie } from "@/lib/mutaties";

const GROUPS = ["Poel A","Poel B","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf","Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Eb","Vloed"];
const TYPES  = ["Totaal sportverbod","Alleen fitness"];

export default function Page(){
  const [items,setItems]=useState<Mutatie[]>([]);
  const [group,setGroup]=useState(GROUPS[0]);
  const [naam,setNaam]=useState("");
  const [dienst,setDienst]=useState("");
  const [type,setType]=useState(TYPES[0]);
  const [notitie,setNotitie]=useState("");
  const [by,setBy]=useState("");

  useEffect(()=>{
    const load=()=>listMutaties().then(setItems).catch(()=>{});
    load(); const off=onMutatiesChange(load); return off;
  },[]);

  const grouped = useMemo(()=>{
    const m = new Map<string,Mutatie[]>();
    for(const it of items){ if(!m.has(it.group)) m.set(it.group,[]); m.get(it.group)!.push(it); }
    return Array.from(m.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  },[items]);

  async function add(e:React.FormEvent){
    e.preventDefault();
    if(!naam.trim()) return alert("Naam verplicht");
    await createMutatie({ group, naam, dienst, type, notitie, by });
    setNaam(""); setDienst(""); setNotitie("");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sportmutaties</h1>
      <form onSubmit={add} className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-3">
        <div><label className="block text-sm mb-1">Groep</label>
          <select className="w-full rounded-lg border px-3 py-2" value={group} onChange={e=>setGroup(e.target.value)}>
            {GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div><label className="block text-sm mb-1">Naam</label>
          <input className="w-full rounded-lg border px-3 py-2" value={naam} onChange={e=>setNaam(e.target.value)} />
        </div>
        <div><label className="block text-sm mb-1">Medische dienst</label>
          <input className="w-full rounded-lg border px-3 py-2" value={dienst} onChange={e=>setDienst(e.target.value)} placeholder="optioneel"/>
        </div>
        <div><label className="block text-sm mb-1">Soort mutatie</label>
          <select className="w-full rounded-lg border px-3 py-2" value={type} onChange={e=>setType(e.target.value)}>
            {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="block text-sm mb-1">Toegevoegd door</label>
          <input className="w-full rounded-lg border px-3 py-2" value={by} onChange={e=>setBy(e.target.value)} placeholder="optioneel"/>
        </div>
        <div className="md:col-span-3"><label className="block text-sm mb-1">Notitie (optioneel)</label>
          <textarea className="w-full rounded-lg border px-3 py-2 min-h-[80px]" value={notitie} onChange={e=>setNotitie(e.target.value)} />
        </div>
        <div className="md:col-span-3">
          <button className="rounded-lg border px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" type="submit">Toevoegen</button>
        </div>
      </form>

      {grouped.length===0 ? <div className="rounded-2xl border bg-white p-6 text-center text-zinc-500">Nog geen mutaties.</div> :
        <div className="grid md:grid-cols-2 gap-6">
          {grouped.map(([g,list])=>(
            <div key={g} className="rounded-2xl border bg-white p-4">
              <div className="font-semibold mb-2">{g}</div>
              <ul className="space-y-2">
                {list.map(r=>(
                  <li key={r.id} className="rounded border p-2">
                    <div className="text-sm font-medium">{r.naam}{r.by ? ` (door ${r.by})` : ""}</div>
                    <div className="text-xs text-zinc-600">{r.type}{r.dienst ? ` • ${r.dienst}` : ""} • {new Date(r.ts).toLocaleString("nl-NL")}</div>
                    {r.notitie ? <div className="mt-1 text-sm whitespace-pre-wrap">{r.notitie}</div> : null}
                    <div className="mt-2 flex items-center gap-2">
                      <button className="rounded border px-2 py-1 text-xs" onClick={()=>patchMutatie(r.id,{active:!r.active})}>
                        {r.active?"Deactiveer":"Activeer"}
                      </button>
                      <button className="rounded border px-2 py-1 text-xs text-red-600" onClick={()=>{ if(confirm("Verwijderen?")) deleteMutatie(r.id); }}>
                        Verwijder
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>}
    </div>
  );
}
