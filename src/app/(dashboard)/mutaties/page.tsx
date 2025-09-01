"use client";
import { useState } from "react";
import { GROUPS, addMutatie, loadMutaties, saveMutaties, Mutatie } from "@/lib/clientStore";
import { format } from "date-fns";
import nl from "date-fns/locale/nl";

export default function Mutaties(){
  const [list,setList]=useState<Mutatie[]>(()=>loadMutaties());
  const [form,setForm]=useState({ group:"Algemeen", type:"Materiaal", note:"", status:"open" as const });

  function add(){
    if(!form.type.trim()) return;
    addMutatie(form);
    setList(loadMutaties());
    setForm({ group:"Algemeen", type:"Materiaal", note:"", status:"open" });
  }
  function toggle(id:string){
    const next=list.map(m=>m.id===id?{...m,status:m.status==="open"?"gesloten":"open"}:m);
    saveMutaties(next); setList(next);
  }
  function remove(id:string){ const next=list.filter(m=>m.id!==id); saveMutaties(next); setList(next); }

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Mutaties</h1>
      <div className="grid md:grid-cols-5 gap-2 p-3 rounded-2xl border bg-white">
        <div><div className="text-xs opacity-70 mb-1">Groep</div>
          <select value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))} className="px-2 py-2 rounded-xl border w-full">
            {GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
          </select></div>
        <div><div className="text-xs opacity-70 mb-1">Type</div>
          <input value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="px-2 py-2 rounded-xl border w-full" placeholder="Materiaal, Begeleiding, …"/></div>
        <div className="md:col-span-2"><div className="text-xs opacity-70 mb-1">Notitie</div>
          <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} className="px-2 py-2 rounded-xl border w-full" placeholder="Korte toelichting"/></div>
        <div className="flex items-end"><button onClick={add} className="px-3 py-2 rounded-xl border">Toevoegen</button></div>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr><th className="text-left p-2">Datum</th><th className="text-left p-2">Groep</th><th className="text-left p-2">Type</th><th className="text-left p-2">Notitie</th><th className="text-left p-2">Status</th><th className="p-2"></th></tr>
          </thead>
          <tbody>
            {list.map(m=>{
              const d=new Date(m.createdAt);
              return (
                <tr key={m.id} className="border-t">
                  <td className="p-2">{format(d,"d MMM HH:mm",{locale:nl})}</td>
                  <td className="p-2">{m.group}</td>
                  <td className="p-2">{m.type}</td>
                  <td className="p-2">{m.note}</td>
                  <td className="p-2">
                    <span className={"badge "+(m.status==="open"?"badge-warning":"badge-ok")}>{m.status}</span>
                  </td>
                  <td className="p-2 text-right">
                    <button onClick={()=>toggle(m.id)} className="px-2 py-1 rounded-lg border mr-2">{m.status==="open"?"Sluit":"Heropen"}</button>
                    <button onClick={()=>remove(m.id)} className="px-2 py-1 rounded-lg border">Verwijder</button>
                  </td>
                </tr>
              );
            })}
            {list.length===0 && <tr><td className="p-3 text-sm opacity-70" colSpan={6}>Nog geen mutaties.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
