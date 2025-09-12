"use client";
import { useEffect, useState } from "react";

export default function SeedPage(){
  const [msg, setMsg] = useState<string>("");

  function todayISO(){
    const d = new Date(); d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }

  function setDemo(){
    const iso = todayISO();
    // Overdracht (1 item van vandaag)
    const item = {
      id: "od:"+iso,
      dateISO: iso,
      by: "Demo-gebruiker",
      raw: "Voorbeeld overdrachtstekst",
      savedAt: new Date().toISOString(),
      json: {
        header: { datum: new Date().toLocaleDateString("nl-NL"), by: "Demo-gebruiker" },
        groups: [
          { timeouts:["A","B"], incidenten:["X"], sancties:[] },
          { timeouts:[], incidenten:["Y","Z"], sancties:["S1"] }
        ]
      }
    };
    const cur = JSON.parse(localStorage.getItem("overdracht-history-v1") || "[]");
    const next = [item, ...cur.filter((x:any)=>x.id!==item.id)];
    localStorage.setItem("overdracht-history-v1", JSON.stringify(next));

    // Mutaties & Indicaties
    localStorage.setItem("sportmutaties-v1", JSON.stringify([
      { group:"Gaag", tide:"eb", dateISO: iso, note:"Keeper ontbreekt" },
      { group:"Kreek", tide:"vloed", dateISO: iso, note:"Start 15 min later" }
    ]));
    localStorage.setItem("indicaties-v1", JSON.stringify([
      { group:"Nes",  tide:"eb", dateISO: iso, status:"actief", note:"Spanning" },
      { group:"Bron", tide:"vloed", dateISO: iso, status:"stopt", note:"Tijdelijk stop" }
    ]));

    setMsg("Demo-data gezet. Ga naar /admin.");
  }

  function clearAll(){
    ["overdracht-history-v1","sportmutaties-v1","indicaties-v1"].forEach(k=>localStorage.removeItem(k));
    setMsg("Demo-data gewist.");
  }

  // SSR safety
  const [mounted,setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);
  if(!mounted) return null;

  return (
    <div style={{maxWidth:680, margin:"40px auto", padding:"0 16px", fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"}}>
      <h1>Seed demo-data</h1>
      <p>Met de knoppen hieronder zet je voorbeelddata in <code>localStorage</code>.</p>
      <div style={{display:"flex", gap:10}}>
        <button onClick={setDemo} style={btn("#1d4ed8","#dbeafe")}>Zet demo-data</button>
        <button onClick={clearAll} style={btn("#991b1b","#fee2e2")}>Wis demo-data</button>
      </div>
      {msg && <p style={{marginTop:12, color:"#334155"}}>{msg}</p>}
      <p style={{marginTop:24}}>Tip: ga daarna naar <a href="/admin">/admin</a> om de widgets te zien.</p>
    </div>
  );
}

function btn(ink:string,bg:string){
  return {
    border:"1px solid #e5e7eb", borderRadius:12, padding:"10px 12px",
    background:bg, color:ink, cursor:"pointer", fontWeight:600
  } as const;
}
