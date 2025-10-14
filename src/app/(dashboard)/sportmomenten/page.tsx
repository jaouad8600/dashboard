'use client';
import { useEffect, useMemo, useState } from 'react';
import { addDays, startOfWeek, format, startOfMonth, addWeeks } from 'date-fns';

type Groep = { id: string; naam?: string; name?: string; title?: string; kleur?: string; };

function iso(d: Date){ return d.toISOString().slice(0,10); }
function naamVan(g: Groep){ return g.naam || g.name || g.title || g.id; }
function isWeekend(d: Date){ const x=d.getDay(); return x===0 || x===6; } // zo/za

type ViewMode = 'week'|'maand';

export default function SportmomentenPage(){
  const [groepen, setGroepen]   = useState<Groep[]>([]);
  const [view, setView]         = useState<ViewMode>('week');
  const [anchor, setAnchor]     = useState<Date>(() => {
    const n=new Date(); // start op maandag
    return startOfWeek(n, { weekStartsOn: 1 });
  });
  const [checked, setChecked]   = useState<Record<string, boolean>>({});
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState<{open:boolean; groep?:Groep; data?:{lastMonth:number; thisYear:number; allTime:number}}>({open:false});

  async function loadGroepen(){
    const r = await fetch('/api/groepen', { cache:'no-store' });
    const j = await r.json();
    const arr: Groep[] = Array.isArray(j) ? j
      : (Array.isArray(j.groepen) ? j.groepen
      : (Array.isArray(j.groups) ? j.groups : []));
    setGroepen(arr);
  }

  function rangeForWeek(a: Date){
    const start = startOfWeek(a, { weekStartsOn: 1 });
    const end = addDays(start, 4); // ma-vr
    return { start, end };
  }

  function rangeForMonth(a: Date){
    const m0 = startOfMonth(a);
    // raster: 6 weken vanaf maandag waarop maand start (inclusief uitloop)
    const calStart = startOfWeek(m0, { weekStartsOn: 1 });
    const weeks: Date[] = [];
    for(let w=0; w<6; w++) weeks.push(addWeeks(calStart, w));
    return weeks; // elke entry is maandag van een kalenderweek
  }

  async function loadPresence(){
    setLoading(true);
    try{
      if(view==='week'){
        const {start,end}=rangeForWeek(anchor);
        const qs = `start=${iso(start)}&end=${iso(end)}`;
        const r = await fetch(`/api/sportmomenten?${qs}`, { cache:'no-store' });
        const j = await r.json();
        const map: Record<string, boolean> = {};
        (j.items||[]).forEach((i:any)=>{ map[`${i.groepId}:${i.datum}`] = true; });
        setChecked(map);
      } else {
        // maand: laad alle 6 weken (ma-vr)
        const weeks = rangeForMonth(anchor);
        const start = weeks[0];
        const end = addDays(weeks[5], 4);
        const qs = `start=${iso(start)}&end=${iso(end)}`;
        const r = await fetch(`/api/sportmomenten?${qs}`, { cache:'no-store' });
        const j = await r.json();
        const map: Record<string, boolean> = {};
        (j.items||[]).forEach((i:any)=>{ map[`${i.groepId}:${i.datum}`] = true; });
        setChecked(map);
      }
    } finally { setLoading(false); }
  }

  useEffect(()=>{ loadGroepen(); },[]);
  useEffect(()=>{ loadPresence(); },[view, anchor.getTime()]);

  async function toggle(gid: string, d: Date){
    const key = `${gid}:${iso(d)}`;
    const on = !checked[key];
    setChecked(prev => ({ ...prev, [key]: on }));
    try{
      await fetch('/api/sportmomenten', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ groepId: gid, datum: iso(d), on })
      });
    }catch{
      // als fout: rollback simpel
      setChecked(prev => ({ ...prev, [key]: !on }));
    }
  }

  function totalForRow(gid: string, days: Date[]){
    return days.reduce((acc,d)=> acc + (checked[`${gid}:${iso(d)}`] ? 1 : 0), 0);
  }

  async function openStats(g: Groep){
    try{
      const r = await fetch(`/api/sportmomenten?aggregate=1&groupId=${encodeURIComponent(g.id)}`);
      const j = await r.json();
      setStats({ open:true, groep:g, data:j?.stats });
    }catch{
      setStats({ open:true, groep:g, data: undefined });
    }
  }

  const weekDays = useMemo(()=>{
    const { start } = rangeForWeek(anchor);
    return [0,1,2,3,4].map(i=>addDays(start,i));
  },[anchor.getTime(), view]);

  const monthGrid = useMemo(()=>{
    const weeks = rangeForMonth(anchor);
    return weeks.map(weekStart => [0,1,2,3,4].map(i=>addDays(weekStart, i))); // ma-vr
  },[anchor.getTime(), view]);

  function title(){
    if(view==='week'){
      const {start,end}=rangeForWeek(anchor);
      return `${format(start,'dd-LL')} – ${format(end,'dd-LL-yyyy')}`;
    } else {
      return format(anchor,'LLLL yyyy'); // bv. oktober 2025
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* header + acties */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-xl font-semibold">Sportmomenten</h1>
        <div className="flex flex-wrap items-center gap-2">
          {view==='week' ? (
            <>
              <button onClick={()=>setAnchor(addDays(anchor,-7))} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">← Vorige week</button>
              <button onClick={()=>setAnchor(startOfWeek(new Date(),{weekStartsOn:1}))} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">Deze week</button>
              <button onClick={()=>setAnchor(addDays(anchor,7))} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">Volgende week →</button>
            </>
          ) : (
            <>
              <button onClick={()=>setAnchor(addDays(startOfMonth(anchor),-1))} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">← Vorige maand</button>
              <button onClick={()=>setAnchor(startOfMonth(new Date()))} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">Deze maand</button>
              <button onClick={()=>setAnchor(addDays(startOfMonth(anchor),33))} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">Volgende maand →</button>
            </>
          )}
          <button onClick={()=>setView(view==='week'?'maand':'week')} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
            Weergave: {view==='week'?'Week':'Maand'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-gray-600">{loading ? 'Laden…' : title()}</div>
        <button onClick={()=>loadPresence()} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">Herladen</button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        {view==='week' ? (
          <table className="min-w-full border rounded-lg overflow-hidden bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Groep</th>
                {weekDays.map(d=>(
                  <th key={iso(d)} className="px-3 py-2 text-left">{format(d,'EEE dd-LL')}</th>
                ))}
                <th className="px-3 py-2 text-left">Totaal</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {groepen.map(g=>{
                const t = totalForRow(g.id, weekDays);
                return (
                  <tr key={g.id} className="border-t">
                    <td className="px-3 py-2">{naamVan(g)}</td>
                    {weekDays.map(d=>{
                      const key = `${g.id}:${iso(d)}`;
                      const on = !!checked[key];
                      return (
                        <td key={key} className="px-3 py-2">
                          <button
                            onClick={()=>toggle(g.id,d)}
                            className={`px-2 py-1 rounded border ${on ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            {on ? 'Ja' : 'Nee'}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 font-semibold">{t}</td>
                    <td className="px-3 py-2">
                      <button onClick={()=>openStats(g)} className="px-2 py-1 rounded border bg-white hover:bg-gray-50">Statistiek</button>
                    </td>
                  </tr>
                );
              })}
              {groepen.length===0 && (
                <tr><td className="px-3 py-4 text-gray-500" colSpan={weekDays.length+3}>Geen groepen gevonden.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full border rounded-lg overflow-hidden bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Groep</th>
                {[0,1,2,3,4].map(i=>(
                  <th key={i} className="px-3 py-2 text-left">
                    {['Ma','Di','Wo','Do','Vr'][i]}
                  </th>
                ))}
                <th className="px-3 py-2 text-left">Maandtotaal</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {groepen.map(g=>{
                // alle werkdagen (ma-vr) uit 6 weken grid
                const days = monthGrid.flat().filter(d=>!isWeekend(d));
                const t = totalForRow(g.id, days);
                return (
                  <tr key={g.id} className="border-t align-top">
                    <td className="px-3 py-2">{naamVan(g)}</td>
                    {/* we tonen 6 rijen binnen 1 cel per kolom met wrap */}
                    {[0,1,2,3,4].map(col=>{
                      const colDays = monthGrid.map(week => week[col]); // 6 waarden
                      return (
                        <td key={col} className="px-1 py-2">
                          <div className="grid gap-1">
                            {colDays.map(d=>{
                              const k = `${g.id}:${iso(d)}`;
                              const on = !!checked[k];
                              return (
                                <button key={k}
                                  onClick={()=>toggle(g.id,d)}
                                  className={`px-2 py-1 rounded border text-sm ${on ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                  {format(d,'d')}
                                  <span className="sr-only">{on ? ' Ja' : ' Nee'}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 font-semibold">{t}</td>
                    <td className="px-3 py-2">
                      <button onClick={()=>openStats(g)} className="px-2 py-1 rounded border bg-white hover:bg-gray-50">Statistiek</button>
                    </td>
                  </tr>
                );
              })}
              {groepen.length===0 && (
                <tr><td className="px-3 py-4 text-gray-500" colSpan={7}>Geen groepen gevonden.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Popup Stats */}
      {stats.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[min(92vw,420px)] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Statistiek — {stats.groep ? naamVan(stats.groep) : ''}</h2>
              <button onClick={()=>setStats({open:false})} className="px-3 py-1 rounded border bg-white hover:bg-gray-50">Sluiten</button>
            </div>
            {stats.data ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span>Laatste maand</span><strong>{stats.data.lastMonth}</strong></div>
                <div className="flex items-center justify-between"><span>Dit jaar</span><strong>{stats.data.thisYear}</strong></div>
                <div className="flex items-center justify-between"><span>Sinds begin</span><strong>{stats.data.allTime}</strong></div>
              </div>
            ) : (
              <div className="text-gray-500">Kan statistiek niet laden.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
