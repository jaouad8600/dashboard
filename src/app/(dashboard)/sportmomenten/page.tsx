'use client';
import React, { useEffect, useMemo, useState } from 'react';

type Group = { id: string; naam?: string; name?: string; title?: string; label?: string };

function fmt(d: Date){ return d.toISOString().slice(0,10); } // YYYY-MM-DD
function startOfISOWeek(d: Date){ const x=new Date(d); const day=(x.getDay()+6)%7; x.setHours(0,0,0,0); x.setDate(x.getDate()-day); return x; }

export default function SportmomentenPage(){
  const [groups,setGroups]=useState<Group[]>([]);
  const [counts,setCounts]=useState<Record<string,number>>({});
  const [anchor,setAnchor]=useState<Date>(startOfISOWeek(new Date())); // maandag van deze week

  const days = useMemo(()=>{
    const a = startOfISOWeek(anchor);
    return Array.from({length:5}, (_,i)=>{ const d=new Date(a); d.setDate(a.getDate()+i); return d; }); // ma..vr
  },[anchor]);

  useEffect(()=>{
    (async ()=>{
      // 1) groepen
      try{
        const r = await fetch('/api/groepen',{cache:'no-store'});
        const j = await r.json();
        let arr: any[] = [];
        if(Array.isArray(j)) arr=j;
        else if(Array.isArray(j?.items)) arr=j.items;
        else if(Array.isArray(j?.groepen)) arr=j.groepen;
        else arr = [];
        const norm = arr.map((g:any)=>({ id: g.id || g.slug || g.key || String(g), naam: g.naam||g.name||g.title||g.label||g.id||g.slug }));
        setGroups(norm);
      }catch{ setGroups([]); }

      // 2) counts voor week
      const qs = new URLSearchParams({ start: fmt(days[0]), end: fmt(days[days.length-1]) }).toString();
      const r2 = await fetch(`/api/sportmomenten?${qs}`,{cache:'no-store'});
      const j2 = await r2.json();
      setCounts(j2?.counts||{});
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor]);

  function key(gid:string, d:Date){ return gid+'|'+fmt(d); }
  function labelDateNL(d:Date){
    const weekdagen = ['ma','di','wo','do','vr','za','zo'];
    return `${weekdagen[(d.getDay()+6)%7]} ${d.toLocaleDateString('nl-NL', { day:'2-digit', month:'2-digit' })}`;
  }

  async function change(gid:string, d:Date, delta:number){
    const body = { groepId: gid, date: fmt(d), delta };
    await fetch('/api/sportmomenten',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    setCounts(c=>{
      const k = key(gid,d);
      const v = Math.max(0, (c[k]||0) + delta);
      return { ...c, [k]: v };
    });
  }

  function titleOf(g:Group){ return g.naam||g.name||g.title||g.label||g.id; }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Sportmomenten (week)</h1>
        <div className="flex items-center gap-2">
          <button onClick={()=>setAnchor(a=>{const x=new Date(a); x.setDate(x.getDate()-7); return x;})} className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">← Vorige</button>
          <button onClick={()=>setAnchor(startOfISOWeek(new Date()))} className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">Vandaag</button>
          <button onClick={()=>setAnchor(a=>{const x=new Date(a); x.setDate(x.getDate()+7); return x;})} className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">Volgende →</button>
        </div>
      </div>

      <div className="overflow-auto border rounded-2xl">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left w-56">Groep</th>
              {days.map((d,i)=>(
                <th key={i} className="p-3 text-left">{labelDateNL(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(g=>(
              <tr key={g.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-3 font-medium">{titleOf(g)}</td>
                {days.map((d,i)=>{
                  const k = key(g.id, d);
                  const v = counts[k]||0;
                  const active = v>0;
                  return (
                    <td key={i} className="p-2">
                      <div className={"flex items-center gap-2 " + (active ? "bg-green-50 border border-green-200" : "bg-white border border-gray-200") + " rounded-xl px-2 py-1"}>
                        <button onClick={()=>change(g.id,d,-1)} disabled={v<=0} className={"px-2 py-1 rounded-lg " + (v>0 ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed")}>−</button>
                        <div className="min-w-8 text-center font-semibold">{v}</div>
                        <button onClick={()=>change(g.id,d,1)} className="px-2 py-1 rounded-lg bg-gray-900 text-white hover:opacity-90">+</button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {groups.length===0 && (
              <tr><td className="p-4 text-gray-500" colSpan={6}>Geen groepen gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Klik <span className="font-semibold">+</span> om een sportmoment te turven, <span className="font-semibold">−</span> om te corrigeren.
      </p>
    </div>
  );
}
