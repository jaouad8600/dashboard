"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { loadEvents, loadSportRestrictions, loadRestrictions, loadVisits, loadFiles, loadLogs } from "@/lib/clientStore";

const ChartBars = dynamic(() => import("../../../components/ChartBars").catch(()=>({default:()=>null})), { ssr:false });

type Check = { name:string; ok:boolean; detail?:string };

const LSK = [
  "rbc-events-v1","active-group",
  "overdracht-last-raw","overdracht-last-json",
  "overdracht-sport-last-raw","overdracht-sport-last-json",
  "sportmutaties-v1","files-links-v1","logs-v1",
  "visits-v1","restrictions-v1","sport-restrictions-v1"
];

export default function Diagnose(){
  const [checks, setChecks] = useState<Check[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);

  useEffect(()=>{
    let cancelled=false;
    (async ()=>{
      const out:Check[] = [];

      // 1) /health
      try{
        const r = await fetch("/health",{cache:"no-store"});
        const ok = r.ok;
        const j = ok ? await r.json() : null;
        out.push({ name:"/health", ok, detail: ok ? JSON.stringify(j) : `HTTP ${r.status}` });
      }catch(e:any){
        out.push({ name:"/health", ok:false, detail:String(e?.message||e) });
      }

      // 2) Dynamic import ChartBars
      try{
        // Als import faalt, gooit hij error en vangen we die
        const m = await import("../../../components/ChartBars");
        out.push({ name:"Import ChartBars", ok: !!m?.default });
      }catch(e:any){
        out.push({ name:"Import ChartBars", ok:false, detail:String(e?.message||e) });
      }

      // 3) Dynamic import Sidebar
      try{
        const m = await import("../../../components/Sidebar");
        out.push({ name:"Import Sidebar", ok: !!m?.default });
      }catch(e:any){
        out.push({ name:"Import Sidebar", ok:false, detail:String(e?.message||e) });
      }

      // 4) Store-data (clientStore)
      try{
        const ev = loadEvents(); // array
        out.push({ name:"Store: events", ok: Array.isArray(ev), detail:`count=${ev.length}` });
      }catch(e:any){
        out.push({ name:"Store: events", ok:false, detail:String(e?.message||e) });
      }
      try{
        const r1 = loadRestrictions();
        const r2 = loadSportRestrictions();
        out.push({ name:"Store: indicaties (algemeen/sport)", ok: Array.isArray(r1)&&Array.isArray(r2), detail:`${r1.length}/${r2.length}` });
      }catch(e:any){
        out.push({ name:"Store: indicaties", ok:false, detail:String(e?.message||e) });
      }
      try{
        const v = loadVisits();
        out.push({ name:"Store: bezoek/bibliotheek", ok: Array.isArray(v), detail:`count=${v.length}` });
      }catch(e:any){
        out.push({ name:"Store: bezoek/bibliotheek", ok:false, detail:String(e?.message||e) });
      }
      try{
        const f = loadFiles(); const l = loadLogs();
        out.push({ name:"Store: files/logs", ok: Array.isArray(f)&&Array.isArray(l), detail:`files=${f.length} logs=${l.length}` });
      }catch(e:any){
        out.push({ name:"Store: files/logs", ok:false, detail:String(e?.message||e) });
      }

      // 5) localStorage JSON keys parsebaar
      if (typeof localStorage !== "undefined") {
        for (const k of LSK) {
          try {
            const raw = localStorage.getItem(k);
            if (raw === null) { out.push({ name:`localStorage:${k}`, ok:true, detail:"(ontbreekt, dat mag)" }); continue; }
            JSON.parse(raw);
            out.push({ name:`localStorage:${k}`, ok:true });
          } catch(e:any){
            out.push({ name:`localStorage:${k}`, ok:false, detail:"JSON parse error" });
          }
        }
      } else {
        out.push({ name:"localStorage", ok:false, detail:"niet beschikbaar" });
      }

      if(!cancelled) setChecks(out);
    })();
    return ()=>{ cancelled=true; };
  },[]);

  if(!mounted) return null;

  const allOk = checks.length>0 && checks.every(c=>c.ok);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Diagnose</h1>
      <div className="rounded-2xl border bg-white p-3">
        <div className="font-semibold mb-2">Status: {allOk ? "OK" : "⚠️ Problemen gevonden"}</div>
        <div className="grid gap-1">
          {checks.map((c,i)=>(
            <div key={i} className="flex items-start gap-2 text-sm">
              <span style={{minWidth:16}}>{c.ok ? "✅" : "❌"}</span>
              <div>
                <div className="font-medium">{c.name}</div>
                {c.detail && <div className="opacity-70">{c.detail}</div>}
              </div>
            </div>
          ))}
          {checks.length===0 && <div className="opacity-70">Bezig met checks…</div>}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-3">
        <div className="font-semibold mb-2">Mini-grafiek test (client-only)</div>
        <div className="text-sm opacity-70 mb-2">Als je hier een kleine balkgrafiek ziet, is Recharts ok en SSR vrij van drama.</div>
        <div style={{height:280}}>
          <ChartBars data={[
            {name:"ma", count:1},
            {name:"di", count:3},
            {name:"wo", count:2},
          ]}/>
        </div>
      </div>

      <div className="text-sm opacity-70">
        Extra: open <a className="underline" href="/health">/health</a> en <a className="underline" href="/admin">/admin</a> in een nieuw tabblad.
      </div>
    </div>
  );
}
