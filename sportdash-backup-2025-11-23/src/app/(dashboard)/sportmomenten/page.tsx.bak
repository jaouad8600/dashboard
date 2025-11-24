'use client';
import { useEffect, useMemo, useState } from 'react';

type Groep = { id: string; naam?: string; name?: string; title?: string };
type CellKey = string;

function startOfWeekMonday(d=new Date()){ const x=new Date(d); const k=(x.getDay()+6)%7; x.setDate(x.getDate()-k); x.setHours(0,0,0,0); return x; }
function addDays(d:Date,n:number){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d:Date){ const p=(n:number)=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; }

export default function SportmomentenPage(){
  const [groepen,setGroepen]=useState<Groep[]>([]);
  const [weekStart,setWeekStart]=useState<Date>(startOfWeekMonday());
  const days = useMemo(()=>[0,1,2,3,4],[]); // ma-vr
  const [checked,setChecked]=useState<Record<CellKey,boolean>>({});
  const [loading,setLoading]=useState(false);

  const load = async(ws:Date)=>{
    setLoading(true);
    try{
      const [gRes,mRes]=await Promise.all([
        fetch('/api/groepen',{cache:'no-store'}),
        fetch(`/api/sportmomenten?weekStart=${iso(ws)}&days=5`,{cache:'no-store'}),
      ]);
      const gJ=await gRes.json().catch(()=>({items:[]}));
      const mJ=await mRes.json().catch(()=>({items:[]}));
      setGroepen((gJ.items||gJ||[]).map((g:any)=>({id:g.id,naam:g.naam||g.name||g.title||g.id})));
      const map:Record<CellKey,boolean>={};
      (mJ.items||[]).forEach((i:any)=>{ if(i?.groepId&&i?.datum){ map[`${i.groepId}:${i.datum}`]=!!i.aanwezig; }});
      setChecked(map);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(weekStart); },[]);

  const wd = days.map(n=>addDays(weekStart,n));
  const goPrev=()=>{ const d=addDays(weekStart,-7); setWeekStart(d); load(d); };
  const goNext=()=>{ const d=addDays(weekStart, 7); setWeekStart(d); load(d); };
  const goToday=()=>{ const d=startOfWeekMonday(new Date()); setWeekStart(d); load(d); };

  const toggle = async(gid:string,date:string)=>{
    const key=`${gid}:${date}`, newVal=!checked[key];
    setChecked(prev=>({...prev,[key]:newVal}));
    const r=await fetch('/api/sportmomenten',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({groepId:gid,datum:date,aanwezig:newVal})});
    if(!r.ok){ setChecked(prev=>({...prev,[key]:!newVal})); alert('Opslaan mislukt'); }
  };

  const rowTotal = (gid:string)=>wd.reduce((acc,d)=>acc + (checked[`${gid}:${iso(d)}`]?1:0),0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sportmomenten</h1>
          <p className="text-gray-500">Klik op een vakje om te turven (autosave). Rechts staat het totaal per groep.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border bg-white hover:bg-gray-50" onClick={goPrev}>Vorige</button>
          <button className="px-3 py-2 rounded border bg-white hover:bg-gray-50" onClick={goToday}>Vandaag</button>
          <button className="px-3 py-2 rounded border bg-white hover:bg-gray-50" onClick={goNext}>Volgende</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left w-48">Groep</th>
              {wd.map((d,i)=>(
                <th key={i} className="px-3 py-3 text-center">
                  {['ma','di','wo','do','vr'][i]} {iso(d)}
                </th>
              ))}
              <th className="px-3 py-3 text-center w-24">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-6 text-gray-500" colSpan={1+wd.length+1}>Laden…</td></tr>}
            {!loading && groepen.length===0 && <tr><td className="px-3 py-6 text-gray-500" colSpan={1+wd.length+1}>Geen groepen gevonden.</td></tr>}
            {!loading && groepen.map(g=>(
              <tr key={g.id} className="border-t">
                <td className="px-3 py-2">{g.naam||g.id}</td>
                {wd.map((d,i)=>{
                  const date=iso(d); const key=`${g.id}:${date}`; const on=!!checked[key];
                  return (
                    <td key={i} className="px-3 py-2">
                      <button
                        className={`w-10 h-10 rounded border transition ${on?'bg-emerald-600 text-white border-emerald-700':'bg-white text-gray-700'}`}
                        onClick={()=>toggle(g.id,date)} aria-pressed={on} title={on?'Ja':'Nee'}
                      >
                        {on?'Ja':'Nee'}
                      </button>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center font-semibold">{rowTotal(g.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
