"use client";
import { useEffect, useMemo, useState } from "react";
import { getExtras, addExtra, removeExtra, onExtraSportChange, getKnownGroups, countByGroup } from "@/lib/extraSport";

export default function ExtraSportPage(){
  const [items,setItems]=useState(getExtras());
  const [groups,setGroups]=useState<{id:string;name:string}[]>([]);
  const [group,setGroup]=useState(""); const [note,setNote]=useState("");

  useEffect(()=>{ setGroups(getKnownGroups()); const off=onExtraSportChange(()=>setItems(getExtras())); return off; },[]);
  useEffect(()=>{ if(groups.length && !group) setGroup(groups[0].name); },[groups,group]);

  const stats = useMemo(()=>countByGroup(items, groups),[items,groups]);

  const add=()=>{
    if(!group) return;
    addExtra(group, Date.now(), note);
    setNote("");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Extra sport</h1>

      <div className="rounded-xl border bg-white p-4 flex gap-2 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Groep</label>
          <select className="border rounded-lg px-3 py-2" value={group} onChange={e=>setGroup(e.target.value)}>
            {groups.map(g=><option key={g.id} value={g.name}>{g.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Notitie (optioneel)</label>
          <input className="w-full border rounded-lg px-3 py-2" value={note} onChange={e=>setNote(e.target.value)} placeholder="bijv. extra zaal uur" />
        </div>
        <button onClick={add} className="px-3 py-2 rounded-lg bg-black text-white text-sm">Toevoegen</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(stats).map(([id,row])=>(
          <div key={id} className="rounded-xl border bg-white p-4">
            <div className="font-semibold">{row.name}</div>
            <div className="mt-2 text-sm text-gray-700">Totaal: {row.total} • Deze week: {row.week} • Deze maand: {row.month}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="font-semibold mb-2">Laatst toegevoegd</div>
        <ul className="space-y-1 text-sm">
          {items.slice(0,15).map(it=>(
            <li key={it.id} className="flex items-center justify-between">
              <span>{new Date(it.at).toLocaleString()} — {it.groupName}{it.note?` — ${it.note}`:""}</span>
              <button onClick={()=>removeExtra(it.id)} className="text-red-600 hover:underline text-xs">Verwijderen</button>
            </li>
          ))}
          {items.length===0 && <li className="text-gray-500 text-sm">Nog geen extra sportmomenten.</li>}
        </ul>
      </div>
    </div>
  );
}
