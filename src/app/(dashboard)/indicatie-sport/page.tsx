"use client";

import { useEffect, useMemo, useState } from "react";
import { EB_GROUPS, VLOED_GROUPS } from "@/lib/wk";

type Row = {
  id: string;
  naam: string;
  group: string;
  tide: "eb"|"vloed";
  status: "indicatie"|"goedgekeurd"|"afgewezen";
  notitie?: string;
  ts: number;
};

const K = "indicaties-v1";

function readRows(): Row[] {
  try { return JSON.parse(localStorage.getItem(K) || "[]"); } catch { return []; }
}
function writeRows(rows: Row[]){
  try { localStorage.setItem(K, JSON.stringify(rows)); } catch {}
}

function uid(){ return Math.random().toString(36).slice(2); }

export default function IndicatieSport(){
  const groupsEb = EB_GROUPS as unknown as string[];
  const groupsVl = VLOED_GROUPS as unknown as string[];

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [tide, setTide] = useState<"eb"|"vloed">("eb");
  const [group, setGroup] = useState<string>(groupsEb[0]);
  const [naam, setNaam] = useState("");
  const [status, setStatus] = useState<Row["status"]>("indicatie");
  const [notitie, setNotitie] = useState("");

  useEffect(()=>{ setRows(readRows()); },[]);
  useEffect(()=>{ setGroup(tide==="eb" ? groupsEb[0] : groupsVl[0]); },[tide]);

  function add(){
    if(!naam.trim()) return alert("Naam ontbreekt");
    const r: Row = { id: uid(), naam: naam.trim(), group, tide, status, notitie: notitie.trim() || undefined, ts: Date.now() };
    const next = [r, ...rows].slice(0, 400);
    setRows(next); writeRows(next);
    setNaam(""); setNotitie("");
  }
  function update(id:string, patch: Partial<Row>){
    const next = rows.map(r => r.id===id ? {...r, ...patch} : r);
    setRows(next); writeRows(next);
  }
  function remove(id:string){
    const next = rows.filter(r => r.id!==id);
    setRows(next); writeRows(next);
  }

  const visible = useMemo(()=>{
    const term = q.trim().toLowerCase();
    return rows.filter(r => !term || r.naam.toLowerCase().includes(term) || r.group.toLowerCase().includes(term));
  },[rows,q]);

  const stats = useMemo(()=>{
    const s = { indicatie:0, goedgekeurd:0, afgewezen:0 };
    for(const r of rows){ (s as any)[r.status]++; }
    return s;
  },[rows]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Indicatie activiteit</h1>
        <div className="text-xs opacity-70">
          Totaal: {rows.length} • Indicatie: {stats.indicatie} • Goedgekeurd: {stats.goedgekeurd} • Afgewezen: {stats.afgewezen}
        </div>
      </div>

      <section className="grid gap-2 border rounded-2xl p-3 bg-white">
        <div className="grid md:grid-cols-5 gap-2">
          <select value={tide} onChange={e=>setTide(e.target.value as any)} className="border rounded-lg px-2 py-2">
            <option value="eb">Eb</option>
            <option value="vloed">Vloed</option>
          </select>
          <select value={group} onChange={e=>setGroup(e.target.value)} className="border rounded-lg px-2 py-2">
            {(tide==="eb" ? groupsEb : groupsVl).map(g=>(
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <input value={naam} onChange={e=>setNaam(e.target.value)} placeholder="Naam jongere" className="border rounded-lg px-2 py-2" />
          <select value={status} onChange={e=>setStatus(e.target.value as any)} className="border rounded-lg px-2 py-2">
            <option value="indicatie">Indicatie</option>
            <option value="goedgekeurd">Goedgekeurd</option>
            <option value="afgewezen">Afgewezen</option>
          </select>
          <button onClick={add} className="px-3 py-2 rounded-lg border bg-white hover:bg-zinc-50">Toevoegen</button>
        </div>
        <textarea value={notitie} onChange={e=>setNotitie(e.target.value)} placeholder="Notitie (optioneel)" className="border rounded-lg px-2 py-2 min-h-[80px]" />
      </section>

      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoeken op naam of groep…" className="border rounded-lg px-2 py-2 w-full max-w-md" />
        <a href="/back-up" className="ml-3 text-sm underline">Back-up</a>
      </div>

      <section className="grid gap-2">
        {visible.length===0 ? (
          <div className="border rounded-2xl p-3 bg-zinc-50 text-sm opacity-70">Geen resultaten.</div>
        ) : visible.map(r=>(
          <div key={r.id} className="border rounded-2xl p-3 bg-white grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
            <div><div className="text-xs opacity-70">Naam</div><div className="font-medium">{r.naam}</div></div>
            <div><div className="text-xs opacity-70">Groep</div><div>{r.group} ({r.tide})</div></div>
            <div>
              <div className="text-xs opacity-70">Status</div>
              <select value={r.status} onChange={e=>update(r.id,{status:e.target.value as any})} className="border rounded-lg px-2 py-1 text-sm">
                <option value="indicatie">Indicatie</option>
                <option value="goedgekeurd">Goedgekeurd</option>
                <option value="afgewezen">Afgewezen</option>
              </select>
            </div>
            <div>
              <div className="text-xs opacity-70">Notitie</div>
              <input value={r.notitie||""} onChange={e=>update(r.id,{notitie:e.target.value})} className="border rounded-lg px-2 py-1 text-sm w-full"/>
            </div>
            <div className="flex items-end justify-end">
              <button onClick={()=>remove(r.id)} className="px-2 py-1 rounded-lg border text-sm hover:bg-zinc-50">Verwijder</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
