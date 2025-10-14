'use client';

import { useEffect, useMemo, useState } from 'react';

type Groep = { id:string; naam?:string; name?:string; title?:string; kleur?:string };
type SM = { id:string; groepId:string; datum:string; aanwezig:boolean };

function isoDate(d: Date){
  const y=d.getFullYear(), m=(d.getMonth()+1).toString().padStart(2,'0'), dd=d.getDate().toString().padStart(2,'0');
  return `${y}-${m}-${dd}`;
}
function startOfWeekMonday(date = new Date()){
  const d=new Date(date); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); d.setHours(0,0,0,0); return d;
}

export default function SportmomentenPage(){
  const [groepen, setGroepen] = useState<Groep[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set()); // key = groepId:YYYY-MM-DD
  const [cursor, setCursor] = useState<Date>(startOfWeekMonday(new Date())); // huidige week (ma)

  const dagen = useMemo(()=>{
    return Array.from({length:5}).map((_,i)=>{ const d=new Date(cursor); d.setDate(d.getDate()+i); return d; });
  },[cursor]);

  const mapKey = (gid:string, d:Date)=> `${gid}:${isoDate(d)}`;

  useEffect(()=>{ (async()=>{
    // Groepen
    const gRes = await fetch('/api/groepen').then(r=>r.json()).catch(()=>[]);
    const arr:Groep[] = Array.isArray(gRes) ? gRes
      : (gRes.groepen ?? gRes.groups ?? gRes.items ?? []);
    setGroepen(arr||[]);
    // Sportmomenten
    const sRes = await fetch('/api/sportmomenten').then(r=>r.json()).catch(()=>({items:[]}));
    const items:SM[] = Array.isArray(sRes) ? sRes : (sRes.items ?? []);
    const s = new Set<string>();
    for(const it of items){ if(it.aanwezig) s.add(`${it.groepId}:${it.datum}`); }
    setChecked(s);
  })(); },[]);

  async function toggle(gid:string, d:Date){
    const key = mapKey(gid, d);
    const datum = isoDate(d);
    const wasOn = checked.has(key);
    const next = new Set(checked);
    if (wasOn) next.delete(key); else next.add(key);
    setChecked(next); // optimistisch updaten

    try{
      const r = await fetch('/api/sportmomenten', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ groepId: gid, datum, aanwezig: !wasOn })
      });
      if(!r.ok){
        // revert bij fout
        const rev = new Set(next);
        if(wasOn) rev.add(key); else rev.delete(key);
        setChecked(rev);
        console.error('Opslaan mislukt', await r.text());
      }
    }catch(e){
      const rev = new Set(next);
      if(wasOn) rev.add(key); else rev.delete(key);
      setChecked(rev);
      console.error(e);
    }
  }

  const totalFor = (gid:string)=> {
    let t=0;
    for(const d of dagen){ if(checked.has(mapKey(gid,d))) t++; }
    return t;
  };

  function weekBack(){ const d=new Date(cursor); d.setDate(d.getDate()-7); setCursor(startOfWeekMonday(d)); }
  function weekNext(){ const d=new Date(cursor); d.setDate(d.getDate()+7); setCursor(startOfWeekMonday(d)); }
  function weekNow(){ setCursor(startOfWeekMonday(new Date())); }

  return (
    <main data-page="sportmomenten" className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <button className="btn bg-emerald-600 text-white px-3 py-2 rounded" onClick={weekBack}>Vorige week</button>
        <button className="btn bg-emerald-600 text-white px-3 py-2 rounded" onClick={weekNow}>Deze week</button>
        <button className="btn bg-emerald-600 text-white px-3 py-2 rounded" onClick={weekNext}>Volgende week</button>
        <div className="ml-auto text-sm text-gray-600">
          Week van <strong>{isoDate(dagen[0] ?? cursor)}</strong> t/m <strong>{isoDate(dagen[4] ?? cursor)}</strong>
        </div>
      </div>

      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Groep</th>
              {dagen.map((d,i)=>(
                <th key={i} className="px-2 py-2 text-center font-semibold">{d.toLocaleDateString('nl-NL', { weekday:'short', day:'2-digit', month:'2-digit' })}</th>
              ))}
              <th className="px-3 py-2 text-center font-semibold">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {groepen.map((g)=> {
              const gNaam = g.naam || g.name || g.title || g.id;
              return (
                <tr key={g.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{gNaam}</td>
                  {dagen.map((d,i)=>{
                    const key = mapKey(g.id, d);
                    const on = checked.has(key);
                    return (
                      <td key={i} className="px-2 py-2 text-center">
                        <button
                          className={`toggle-cell${on?' on':''}`}
                          aria-pressed={on}
                          aria-label={`${gNaam} ${isoDate(d)} ${on?'Ja':'Nee'}`}
                          onClick={()=>toggle(g.id, d)}
                        >
                          {on ? '✓' : ''}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-semibold">{totalFor(g.id)}</td>
                </tr>
              );
            })}
            {groepen.length===0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Geen groepen gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
