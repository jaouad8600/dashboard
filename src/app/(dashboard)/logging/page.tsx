"use client";
import { useState } from "react";
import { loadLogs, saveLogs, LogEntry } from "@/lib/clientStore";
import { format } from "date-fns";
import nl from "date-fns/locale/nl";

export default function Logging(){
  const [list,setList]=useState<LogEntry[]>(()=>loadLogs());
  const [text,setText]=useState("");

  function add(){
    if(!text.trim()) return;
    const entry:LogEntry={ id:crypto.randomUUID(), ts:new Date().toISOString(), text:text.trim() };
    const next=[entry, ...list]; saveLogs(next); setList(next); setText("");
  }
  function remove(id:string){ const next=list.filter(l=>l.id!==id); saveLogs(next); setList(next); }

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Logging</h1>
      <div className="grid gap-2 p-3 rounded-2xl border bg-white">
        <textarea value={text} onChange={e=>setText(e.target.value)} className="min-h-[120px] p-3 rounded-xl border" placeholder="Korte notitie..."></textarea>
        <div><button onClick={add} className="px-3 py-2 rounded-xl border">Opslaan</button></div>
      </div>
      <div className="rounded-2xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50"><tr><th className="text-left p-2">Datum</th><th className="text-left p-2">Log</th><th className="p-2"></th></tr></thead>
          <tbody>
            {list.map(l=>(
              <tr key={l.id} className="border-t">
                <td className="p-2">{format(new Date(l.ts),"d MMM HH:mm",{locale:nl})}</td>
                <td className="p-2 whitespace-pre-wrap">{l.text}</td>
                <td className="p-2 text-right"><button onClick={()=>remove(l.id)} className="px-2 py-1 rounded-lg border">Verwijder</button></td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="p-3 text-sm opacity-70" colSpan={3}>Nog geen logs.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
