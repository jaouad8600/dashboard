"use client";
import { useEffect, useMemo, useState } from "react";

type Group = { id?: string; slug?: string; naam?: string; name?: string };
type Item  = { groupId: string; date: string; value?: boolean };

const iso = (d: Date) => d.toISOString().slice(0,10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const startOfWeekMon = (d: Date) => { const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; };

export default function SportmomentenPage(){
  const [groups, setGroups] = useState<Group[]>([]);
  const [items, setItems]   = useState<Item[]>([]);
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [modal, setModal]   = useState<{group?: Group}|null>(null);

  const gid = (g: Group) => (g.id || g.slug || g.naam || g.name || "").toString();
  const weekStart = useMemo(()=>startOfWeekMon(anchor), [anchor]);
  const days = useMemo(()=> Array.from({length:7},(_,i)=> addDays(weekStart,i)), [weekStart]);

  // map: groupId|date -> bool
  const map = useMemo(()=>{
    const m = new Map<string, boolean>();
    for (const it of items) m.set(`${it.groupId}|${it.date}`, !!it.value);
    return m;
  }, [items]);

  const weekTotals = useMemo(()=>{
    const t = new Map<string, number>();
    for (const g of groups){
      const id = gid(g);
      let c = 0;
      for (const d of days) if (map.get(`${id}|${iso(d)}`)) c++;
      t.set(id, c);
    }
    return t;
  }, [groups, days, map]);

  async function loadAll(){
    const [gr, sm] = await Promise.all([
      fetch("/api/groepen", { cache:"no-store" }).then(r=>r.json()).catch(()=>[]),
      fetch("/api/sportmomenten", { cache:"no-store" }).then(r=>r.json()).catch(()=>({items:[]})),
    ]);
    setGroups(Array.isArray(gr)? gr : []);
    setItems(Array.isArray(sm?.items)? sm.items : []);
  }
  useEffect(()=>{ loadAll(); }, []);

  async function toggleCell(groupId: string, dateISO: string){
    const newVal = !map.get(`${groupId}|${dateISO}`);
    // Optimistisch
    setItems(prev => {
      const filtered = prev.filter(x => !(x.groupId===groupId && x.date===dateISO));
      return [...filtered, { groupId, date: dateISO, value: newVal }];
    });
    await fetch("/api/sportmomenten", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ groupId, date: dateISO, value: newVal })
    }).catch(()=>{});
  }

  function stats(g: Group){
    const id = gid(g);
    const now = new Date();
    const startMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPrevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const endPrevMonth   = new Date(now.getFullYear(), now.getMonth(), 0);
    const startYear      = new Date(now.getFullYear(), 0, 1);
    const last30From     = new Date(now.getTime() - 30*24*3600*1000);

    const list = items.filter(it => it.groupId===id && it.value);
    const inRange = (from: Date, to: Date) => {
      const a = new Date(from.toDateString()).getTime();
      const b = new Date(to.toDateString()).getTime();
      return list.filter(it => {
        const t = new Date(it.date+"T00:00:00").getTime();
        return t>=a && t<=b;
      }).length;
    };

    return {
      dezeMaand:   inRange(startMonth, now),
      vorigeMaand: inRange(startPrevMonth, endPrevMonth),
      ditJaar:     inRange(startYear, now),
      laatste30:   inRange(last30From, now),
      totaal:      list.length,
    };
  }

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        <button className="bg-emerald-600 text-white px-3 py-2 rounded" onClick={()=>setAnchor(new Date())}>Vandaag</button>
        <button className="bg-emerald-600 text-white px-3 py-2 rounded" onClick={()=>setAnchor(addDays(weekStart,-7))}>← Vorige</button>
        <button className="bg-emerald-600 text-white px-3 py-2 rounded" onClick={()=>setAnchor(addDays(weekStart, 7))}>Volgende →</button>
        <div className="px-3 py-2 rounded border">
          {weekStart.toLocaleDateString('nl-NL')} – {addDays(weekStart,6).toLocaleDateString('nl-NL')}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left p-3">Groep</th>
              {days.map(d => (
                <th key={iso(d)} className="text-center p-3 w-20">
                  {d.toLocaleDateString('nl-NL',{ weekday:'short' })}<br/>
                  {d.toLocaleDateString('nl-NL',{ day:'2-digit', month:'2-digit' })}
                </th>
              ))}
              <th className="p-3 text-center">Totaal</th>
              <th className="p-3 text-center">Statistiek</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g=>{
              const id = gid(g);
              const naam = g.naam || g.name || id;
              return (
                <tr key={id} className="border-t">
                  <td className="p-3">{naam}</td>
                  {days.map(d=>{
                    const k = `${id}|${iso(d)}`;
                    const checked = !!map.get(k);
                    return (
                      <td key={k} className="p-2 text-center">
                        <button
                          onClick={()=>toggleCell(id, iso(d))}
                          className={"inline-flex items-center justify-center w-8 h-8 rounded border " + (checked ? "bg-emerald-600 text-white" : "bg-white text-transparent")}
                          aria-label={checked ? "Ja" : "Nee"}
                          title={checked ? "Ja" : "Nee"}
                        >✓</button>
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-semibold">{weekTotals.get(id) ?? 0}</td>
                  <td className="p-3 text-center">
                    <button onClick={()=>setModal({ group: g })} className="bg-emerald-600 text-white px-3 py-1 rounded">Open</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!!modal?.group && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[480px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Statistiek — {modal.group.naam || modal.group.name || gid(modal.group)}
              </h2>
              <button onClick={()=>setModal(null)} className="bg-emerald-700 text-white px-3 py-1 rounded">Sluiten</button>
            </div>
            {(() => {
              const s = stats(modal.group!);
              return (
                <ul className="space-y-2">
                  <li><b>Deze maand:</b> {s.dezeMaand}</li>
                  <li><b>Vorige maand:</b> {s.vorigeMaand}</li>
                  <li><b>Dit jaar:</b> {s.ditJaar}</li>
                  <li><b>Laatste 30 dagen:</b> {s.laatste30}</li>
                  <li><b>Totaal:</b> {s.totaal}</li>
                </ul>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
