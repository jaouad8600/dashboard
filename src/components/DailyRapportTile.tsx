"use client";
import { useEffect, useMemo, useState } from "react";

type DagGroup = { timeouts?: string[]; incidenten?: string[]; sancties?: string[] };
type DagJson  = { header?: { datum?: string; by?: string }; groups?: DagGroup[] };
type HistItem = { id:string; dateISO:string; by?:string; raw?:string; savedAt:string; json?:DagJson };

type Mutatie = { group:string; tide:"eb"|"vloed"; dateISO:string; note?:string };
type Indicatie = { group:string; tide:"eb"|"vloed"; dateISO:string; status?:string; note?:string };

function safeParse<T>(val: string | null, fallback: T): T {
  try { return val ? JSON.parse(val) as T : fallback; } catch { return fallback; }
}
function todayISO() {
  const d = new Date(); d.setHours(0,0,0,0);
  return d.toISOString().slice(0,10);
}
const sum = (ns:number[]) => ns.reduce((a,b)=>a+b,0);

export default function DailyRapportTile(){
  const [tick, setTick] = useState(0);
  useEffect(()=>{ const t = setInterval(()=>setTick(x=>x+1), 4000); return ()=>clearInterval(t); },[]);
  const iso = todayISO();

  const data = useMemo(() => {
    if (typeof window === "undefined") return null;

    const hist = safeParse<HistItem[]>(localStorage.getItem("overdracht-history-v1"), [])
      .sort((a,b)=> new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    const odToday = hist.find(h => h.dateISO === iso) || null;

    const cnt = (() => {
      if (!odToday?.json?.groups) return { t:0,i:0,s:0 };
      const g = odToday.json.groups;
      return {
        t: sum(g.map(x=>x.timeouts?.length||0)),
        i: sum(g.map(x=>x.incidenten?.length||0)),
        s: sum(g.map(x=>x.sancties?.length||0)),
      };
    })();

    const muts = safeParse<Mutatie[]>(localStorage.getItem("sportmutaties-v1"), [])
      .filter(m => m.dateISO === iso);
    const inds = safeParse<Indicatie[]>(localStorage.getItem("indicaties-v1"), [])
      .filter(i => i.dateISO === iso || i.status === "actief");

    return { odToday, cnt, mutsCount: muts.length, indsCount: inds.length };
  }, [tick, iso]);

  const cnt = data?.cnt || { t:0,i:0,s:0 };

  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:10,
      background:"#fff", border:"1px solid #e5e7eb",
      borderRadius:16, padding:14, boxShadow:"0 4px 16px rgba(2,6,23,.06)",
      minWidth:320
    }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
          <div style={{fontSize:13, letterSpacing:".06em", textTransform:"uppercase", color:"#64748b"}}>Dagrapport</div>
          <div style={{fontSize:16, fontWeight:700}}>Vandaag ({todayISO()})</div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:8}}>
        <div style={card()}>
          <div style={kpi()}>T</div><div style={val()}>{cnt.t}</div><div style={label()}>Timeouts</div>
        </div>
        <div style={card()}>
          <div style={kpi()}>I</div><div style={val()}>{cnt.i}</div><div style={label()}>Incidenten</div>
        </div>
        <div style={card()}>
          <div style={kpi()}>S</div><div style={val()}>{cnt.s}</div><div style={label()}>Sancties</div>
        </div>
        <div style={card()}>
          <div style={kpi()}>∑</div><div style={val()}>{cnt.t+cnt.i+cnt.s}</div><div style={label()}>Totaal</div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:8}}>
        <div style={pill("#2563eb","#dbeafe")}><b>{data?.mutsCount ?? 0}</b> mutaties</div>
        <div style={pill("#16a34a","#dcfce7")}><b>{data?.indsCount ?? 0}</b> indicaties</div>
      </div>

      {!data?.odToday && (
        <div style={{fontSize:12, color:"#64748b"}}>Nog geen overdracht van vandaag gevonden.</div>
      )}
    </div>
  );
}

function card(){ return {
  display:"grid", gridTemplateColumns:"auto 1fr", alignItems:"center",
  gap:8, padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:12
} as const; }
const kpi = () => ({ fontSize:12, color:"#475569", padding:"2px 6px", borderRadius:8, background:"#f1f5f9" } as const);
const val = () => ({ fontSize:18, fontWeight:800, lineHeight:1 } as const);
const label = () => ({ fontSize:12, color:"#64748b" } as const);
function pill(ink:string,bg:string){ return { fontSize:13, color:ink, background:bg, padding:"8px 10px", borderRadius:999 } as const; }
