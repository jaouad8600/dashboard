"use client";
import { useState } from "react";
import { addRestriction, loadRestrictions, saveRestrictions, Restriction, GROUPS } from "@/lib/clientStore";
import { format } from "date-fns";
import nl from "date-fns/locale/nl";

export default function Indicaties(){
  const [list,setList]=useState<Restriction[]>(()=>loadRestrictions());
  const [f,setF]=useState({group:"Algemeen",label:"Extra toezicht",note:"",active:true});

  function add(){
    if(!f.label.trim()) return;
    addRestriction(f as any);
    setList(loadRestrictions());
    setF({group:"Algemeen",label:"Extra toezicht",note:"",active:true});
  }
  function toggle(id:string){
    const next=list.map(r=>r.id===id?{...r,active:!r.active}:r);
    saveRestrictions(next); setList(next);
  }
  function remove(id:string){ const next=list.filter(r=>r.id!==id); saveRestrictions(next); setList(next); }

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Indicaties / Extra beperkingen</h1>
      <div className="grid md:grid-cols-5 gap-2 p-3 rounded-2xl border bg-white">
        <div><div className="text-xs opacity-70 mb-1">Groep</div>
          <select value={f.group} onChange={e=>setF(v=>({...v,group:e.target.value}))} className="px-2 py-2 rounded-xl border w-full">
            {GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
          </select></div>
        <div className="md:col-span-2"><div className="text-xs opacity-70 mb-1">Label</div>
          <input value={f.label} onChange={e=>setF(v=>({...v,label:e.target.value}))} className="px-2 py-2 rounded-xl border w-full" placeholder="Bijv. 'Geen buitensport'"/></div>
        <div className="md:col-span-2"><div className="text-xs opacity-70 mb-1">Notitie</div>
          <input value={f.note} onChange={e=>setF(v=>({...v,note:e.target.value}))} className="px-2 py-2 rounded-xl border w-full"/></div>
        <div className="md:col-span-5"><button onClick={add} className="px-3 py-2 rounded-xl border">Toevoegen</button></div>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50"><tr><th className="text-left p-2">Datum</th><th className="text-left p-2">Groep</th><th className="text-left p-2">Label</th><th className="text-left p-2">Notitie</th><th className="text-left p-2">Actief</th><th className="p-2"></th></tr></thead>
          <tbody>
            {list.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-2">{format(new Date(r.createdAt),"d MMM HH:mm",{locale:nl})}</td>
                <td className="p-2">{r.group}</td>
                <td className="p-2">{r.label}</td>
                <td className="p-2">{r.note||"—"}</td>
                <td className="p-2">{r.active? <span className="badge badge-warning">actief</span> : <span className="badge">uit</span>}</td>
                <td className="p-2 text-right">
                  <button onClick={()=>toggle(r.id)} className="px-2 py-1 rounded-lg border mr-2">Toggle</button>
                  <button onClick={()=>remove(r.id)} className="px-2 py-1 rounded-lg border">Verwijder</button>
                </td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="p-3 text-sm opacity-70" colSpan={6}>Nog geen indicaties.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
