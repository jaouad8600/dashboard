"use client";
import { useEffect, useState } from "react";
const GROUPS=["Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf","Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Dijk","Burcht","Balk"];
function parseDag(txt:string){
  const lines=txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  type G={group:string;sfeer?:string;timeouts?:string[];incidenten?:string[];sancties?:string[]};
  const out:G[]=[]; let cur:G|undefined;
  for(const l of lines){
    const g=GROUPS.find(g=>new RegExp(`^${g}\\b`,"i").test(l));
    if(g){ cur={group:g}; out.push(cur); continue; }
    if(!cur) continue;
    if(/time-?out|to\b/i.test(l)) (cur.timeouts ||= []).push(l);
    if(/incident|alarm|vecht|fysiek|bloed/i.test(l)) (cur.incidenten ||= []).push(l);
    if(/OM\b|ordemaatregel|AP-?A|OB\b|sanctie/i.test(l)) (cur.sancties ||= []).push(l);
    if(!/time-?out|incident|alarm|vecht|fysiek|bloed|OM\b|ordemaatregel|AP-?A|OB\b|sanctie/i.test(l)) {
      cur.sfeer = [cur.sfeer,l].filter(Boolean).join(" ");
    }
  }
  return { groups: out };
}
function parseSport(txt:string){
  const blocks = txt.split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean).map(b=>{
    const group = GROUPS.find(g=>new RegExp(g,"i").test(b)) || "Algemeen";
    return { group, bijzonderheden: b };
  });
  return { blocks };
}
export default function Overdrachten(){
  const [dag,setDag]=useState(""); const [sport,setSport]=useState("");
  useEffect(()=>{ const a=localStorage.getItem("overdracht-last-raw"); if(a) setDag(a); const b=localStorage.getItem("overdracht-sport-last-raw"); if(b) setSport(b);},[]);
  const save=()=>{ localStorage.setItem("overdracht-last-raw",dag); localStorage.setItem("overdracht-sport-last-raw",sport);
    localStorage.setItem("overdracht-last-json", JSON.stringify(parseDag(dag)));
    localStorage.setItem("overdracht-sport-last-json", JSON.stringify(parseSport(sport)));
    alert("Geparsed en opgeslagen."); };
  const clear=()=>{ ["overdracht-last-raw","overdracht-sport-last-raw","overdracht-last-json","overdracht-sport-last-json"].forEach(k=>localStorage.removeItem(k)); setDag(""); setSport(""); };
  const loadDemo=()=>{ setDag(`Gaag
De sfeer op de Gaag is wisselend. Alarm om 18:15 wegens hard slaan op pingpongtafel.
Time-out: Rayan korte TO wegens grote mond.
Sanctie: Abdullahi OM om 17:00.
Kust
Sfeer prima. Geen incidenten.
`); setSport(`Groep: De Golf
Bijzonderheden: sportmoment stopgezet wegens onsportief gedrag en scheldwoorden.
Groep: De Zift
Bijzonderheden: gevoetbald tegen de Duin, goede sfeer.`); };
  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Overdrachten</h1>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-2">
          <div className="text-sm font-medium">Dag overdracht</div>
          <textarea value={dag} onChange={e=>setDag(e.target.value)} className="min-h-[300px] p-3 rounded-xl border" placeholder="Plak je dag-overdracht hier"/>
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-medium">Sport & Activiteiten</div>
          <textarea value={sport} onChange={e=>setSport(e.target.value)} className="min-h-[300px] p-3 rounded-xl border" placeholder="Plak je sport-rapport hier"/>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={save} className="px-3 py-2 rounded-xl border">Parse + Opslaan</button>
        <button onClick={clear} className="px-3 py-2 rounded-xl border">Leegmaken</button>
        <button onClick={loadDemo} className="px-3 py-2 rounded-xl border">Laad demo-tekst</button>
        <a className="px-3 py-2 rounded-xl border" href="/admin">Naar Dashboard</a>
      </div>
    </div>
  );
}
