"use client";
import React, { useEffect, useMemo, useState } from "react";

type Groep = { id:string; naam?:string; name?:string; kleur?:string };
type Moment = { groepId:string; datum:string };

const iso = (d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const startOfWeek = (d:Date)=>{ const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; };
const addDays = (d:Date,n:number)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const startOfMonth = (d:Date)=>new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d:Date)=>new Date(d.getFullYear(), d.getMonth()+1, 0);

export default function Page(){
  const [groepen,setGroepen]=useState<Groep[]>([]);
  const [items,setItems]=useState<Moment[]>([]);
  const [mode,setMode]=useState<"week"|"maand">("maand");
  const [cursor,setCursor]=useState<Date>(new Date());
  const [stats, setStats] = useState<any|null>(null);
  const [statsGroep, setStatsGroep] = useState<Groep|null>(null);

  useEffect(()=>{ (async()=>{
    const g = await fetch("/api/groepen", {cache:"no-store"}).then(r=>r.json()).catch(()=>[]);
    setGroepen(Array.isArray(g)? g : (g?.items||[]));
    const j = await fetch("/api/sportmomenten",{cache:"no-store"}).then(r=>r.json()).catch(()=>({items:[]}));
    setItems(j.items||[]);
  })(); },[]);

  const days = useMemo(()=>{
    if(mode==="week"){
      const a=startOfWeek(cursor);
      return Array.from({length:7},(_,i)=>addDays(a,i));
    } else {
      const a=startOfMonth(cursor), b=endOfMonth(cursor);
      const list:Date[]=[];
      for(let d=new Date(a); d<=b; d.setDate(d.getDate()+1)) list.push(new Date(d));
      return list;
    }
  },[mode,cursor]);

  const map = useMemo(()=>{
    const m = new Set(items.map(x=>`${x.groepId}__${x.datum}`));
    return m;
  },[items]);

  async function toggle(gid:string, date:Date){
    const key = `${gid}__${iso(date)}`;
    const value = !map.has(key);
    await fetch("/api/sportmomenten",{
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ groepId: gid, datum: iso(date), value })
    });
    setItems(prev=>{
      const has = prev.some(p=>p.groepId===gid && p.datum===iso(date));
      if(value && !has) return [...prev, {groepId:gid, datum:iso(date)}];
      if(!value && has) return prev.filter(p=>!(p.groepId===gid && p.datum===iso(date)));
      return prev;
    });
  }

  function rowTotal(gid:string){
    const set = new Set(days.map(d=>iso(d)));
    return items.filter(x=>x.groepId===gid && set.has(x.datum)).length;
  }

  async function openStats(g:Groep){
    setStatsGroep(g); setStats(null);
    const s = await fetch(`/api/sportmomenten/stats?groepId=${encodeURIComponent(g.id)}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>null);
    setStats(s);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={()=>setCursor(new Date())} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Vandaag</button>
        <button onClick={()=>setCursor(addDays(cursor, mode==="week"? -7 : -30))} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">← Vorige</button>
        <button onClick={()=>setCursor(addDays(cursor, mode==="week"? 7 : 30))} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Volgende →</button>
        <div className="ml-4 inline-flex rounded overflow-hidden border">
          <button onClick={()=>setMode("week")} className={`px-3 py-2 ${mode==="week"?"bg-green-600 text-white":"bg-white"}`}>Week</button>
          <button onClick={()=>setMode("maand")} className={`px-3 py-2 ${mode==="maand"?"bg-green-600 text-white":"bg-white"}`}>Maand</button>
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left w-48">Groep</th>
              {days.map((d,i)=>(
                <th key={i} className="px-2 py-2 text-center whitespace-nowrap">
                  {["Zo","Ma","Di","Wo","Do","Vr","Za"][d.getDay()]}<br/>
                  {String(d.getDate()).padStart(2,"0")}-{String(d.getMonth()+1).padStart(2,"0")}
                </th>
              ))}
              <th className="px-3 py-2 text-right">Totaal</th>
              <th className="px-3 py-2 text-center">Statistiek</th>
            </tr>
          </thead>
          <tbody>
            {groepen.map((g)=>(
              <tr key={g.id} className="border-t">
                <td className="px-3 py-2 font-medium">{g.naam || g.name}</td>
                {days.map((d,i)=>{
                  const on = map.has(`${g.id}__${iso(d)}`);
                  return (
                    <td key={i} className="px-2 py-2">
                      <button
                        onClick={()=>toggle(g.id, d)}
                        className={`w-8 h-8 border rounded grid place-items-center ${on?"bg-green-600 text-white":"bg-white"}`}
                        title={on?"Ja":"Nee"}
                      >
                        {on ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right font-semibold">{rowTotal(g.id)}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={()=>openStats(g)} className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statsGroep && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white rounded-lg p-5 w-[420px] shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Statistiek — {statsGroep.naam || statsGroep.name}</h3>
              <button className="px-2 py-1 rounded bg-gray-200" onClick={()=>setStatsGroep(null)}>Sluiten</button>
            </div>
            {!stats ? (
              <p>Bezig met laden…</p>
            ) : stats.error ? (
              <p className="text-red-600">Kan statistiek niet laden.</p>
            ) : (
              <ul className="space-y-1">
                <li><b>Deze maand:</b> {stats.dezeMaand}</li>
                <li><b>Vorige maand:</b> {stats.vorigeMaand}</li>
                <li><b>Dit jaar:</b> {stats.ditJaar}</li>
                <li><b>Laatste 30 dagen:</b> {stats.laatste30Dagen}</li>
                <li><b>Totaal:</b> {stats.totaal}</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
