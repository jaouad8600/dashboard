"use client";
import { useMemo, useState } from "react";
import { GROUPS, addSportmutatie, loadSportmutaties, saveSportmutaties, SportMutatie } from "@/lib/clientStore";
import { format } from "date-fns";
import nl from "date-fns/locale/nl";

const dl=(name:string,data:string,type:string)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();};

export default function Sportmutaties(){
  const [list,setList]=useState<SportMutatie[]>(()=>loadSportmutaties());
  const [form,setForm]=useState({ jongere:"", group:"Algemeen", type:"Materiaal", note:"", status:"open" as const });

  function add(){
    if(!form.jongere.trim()) return alert("Vul een naam in bij 'Jongere'.");
    addSportmutatie(form);
    setList(loadSportmutaties());
    setForm({ jongere:"", group:"Algemeen", type:"Materiaal", note:"", status:"open" });
  }
  function toggle(id:string){
    const next=list.map(m=>m.id===id?{...m,status:m.status==="open"?"gesloten":"open"}:m);
    saveSportmutaties(next); setList(next);
  }
  function remove(id:string){ const next=list.filter(m=>m.id!==id); saveSportmutaties(next); setList(next); }

  const csv=useMemo(()=>{
    const rows=[["createdAt","jongere","group","type","note","status"], ...list.map(m=>[m.createdAt,m.jongere,m.group,m.type,m.note||"",m.status])];
    return rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  },[list]);

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Sportmutaties</h1>
      <div className="grid md:grid-cols-6 gap-2 p-3 rounded-2xl border bg-white">
        <div><div className="text-xs opacity-70 mb-1">Jongere</div>
          <input value={form.jongere} onChange={e=>setForm(f=>({...f,jongere:e.target.value}))} className="px-2 py-2 rounded-xl border w-full" placeholder="Naam"/></div>
        <div><div className="text-xs opacity-70 mb-1">Groep</div>
          <select value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))} className="px-2 py-2 rounded-xl border w-full">
            {GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
          </select></div>
        <div><div className="text-xs opacity-70 mb-1">Type</div>
          <input value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="px-2 py-2 rounded-xl border w-full" placeholder="Materiaal, Begeleiding…"/></div>
        <div className="md:col-span-2"><div className="text-xs opacity-70 mb-1">Notitie</div>
          <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} className="px-2 py-2 rounded-xl border w-full" placeholder="Korte toelichting"/></div>
        <div className="flex items-end gap-2">
          <button onClick={add} className="px-3 py-2 rounded-xl border">Toevoegen</button>
          <button onClick={()=>dl("sportmutaties.csv",csv,"text/csv")} className="px-3 py-2 rounded-xl border">Exporteer CSV</button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left p-2">Jongere</th>
              <th className="text-left p-2">Groep</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Notitie</th>
              <th className="text-left p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(m=>(
              <tr key={m.id} className="border-t">
                <td className="p-2">{m.jongere}</td>
                <td className="p-2">{m.group}</td>
                <td className="p-2">{m.type}</td>
                <td className="p-2">{m.note||"—"}</td>
                <td className="p-2"><span className={"badge "+(m.status==="open"?"badge-warning":"badge-ok")}>{m.status}</span></td>
                <td className="p-2 text-right">
                  <button onClick={()=>toggle(m.id)} className="px-2 py-1 rounded-lg border mr-2">{m.status==="open"?"Sluit":"Heropen"}</button>
                  <button onClick={()=>remove(m.id)} className="px-2 py-1 rounded-lg border">Verwijder</button>
                </td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="p-3 text-sm opacity-70" colSpan={6}>Nog geen sportmutaties.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-zinc-500">Tip: datum/tijd wordt wel opgeslagen (voor CSV), maar de tabel toont bewust de naam voor snelheid.</div>
    </div>
  );
}
