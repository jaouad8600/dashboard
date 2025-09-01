"use client";
import { useEffect, useMemo, useState } from "react";
import { isSameDay, isSameWeek, startOfWeek, addDays } from "date-fns";
import nl from "date-fns/locale/nl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { loadEvents } from "@/lib/clientStore";

type DagGroup = { group:string; sfeer?:string; timeouts?:string[]; incidenten?:string[]; sancties?:string[]; };
type DagOverdracht = { groups?: DagGroup[] };
type SportBlock = { group:string; bijzonderheden?:string; sportmoment?:string };
type SportRapport = { blocks: SportBlock[] };
type Severity = "danger"|"warning"|"info";
type AlertItem = { id:string; severity:Severity; title:string; desc?:string; group?:string };

const cls = {
  danger:  { left:"border-l-4 border-l-danger",  text:"text-danger-fg"  },
  warning: { left:"border-l-4 border-l-warning", text:"text-warning-fg" },
  info:    { left:"border-l-4 border-l-info",    text:"text-info-fg"    },
};
const h=(s:string)=>String([...s].reduce((a,c)=>((a*31+c.charCodeAt(0))|0),0));
const mk=(sev:Severity,t:string,d?:string,g?:string):AlertItem=>({id:h([sev,t,d,g].filter(Boolean).join("|")),severity:sev,title:t,desc:d,group:g});

function extractAlerts():AlertItem[]{
  let dag:DagOverdracht|undefined, sport:SportRapport|undefined;
  try{ const d=localStorage.getItem("overdracht-last-json"); if(d) dag=JSON.parse(d);}catch{}
  try{ const s=localStorage.getItem("overdracht-sport-last-json"); if(s) sport=JSON.parse(s);}catch{}
  const out:AlertItem[]=[];
  for(const g of dag?.groups||[]){
    const group=g.group; const red=/alarm|vechtpartij|fysiek|bloedneus|dreig/i;
    if(red.test(g.sfeer||"")||(g.incidenten||[]).some(l=>red.test(l))) out.push(mk("danger","Alarm/incident gemeld",(g.sfeer||"").slice(0,220),group));
    for(const l of g.incidenten||[]) out.push(mk("danger",`Incident (${group})`,l,group));
    for(const l of g.sancties||[])  out.push(mk("warning",`Sanctie (${group})`,l,group));
    for(const l of g.timeouts||[])   out.push(mk("info",`Time-out (${group})`,l,group));
  }
  for(const b of sport?.blocks||[]){
    const txt=[b.bijzonderheden,b.sportmoment].filter(Boolean).join(" | "); if(!txt) continue;
    if(/alarm|bedreigd|stopgezet|weiger|agress|vecht|respectloos/i.test(txt)) out.push(mk("warning",`Sport: aandacht (${b.group})`,txt.slice(0,220),b.group));
  }
  const m=new Map(out.map(a=>[a.id,a])); return [...m.values()].slice(0,12);
}

export default function Admin(){
  const [events,setEvents]=useState(()=>loadEvents());
  useEffect(()=>{ const on=()=>setEvents(loadEvents()); window.addEventListener("focus",on); const id=setInterval(on,2000); return ()=>{window.removeEventListener("focus",on); clearInterval(id);}; },[]);
  const today=new Date(); const wStart=startOfWeek(today,{weekStartsOn:1,locale:nl});
  const week=events.filter(e=>isSameWeek(e.start,today,{weekStartsOn:1,locale:nl}));
  const kToday=events.filter(e=>isSameDay(e.start,today)).length, kWeek=week.length, kEb=week.filter(e=>e.tide==="eb").length, kVloed=week.filter(e=>e.tide==="vloed").length;
  const chart=Array.from({length:7},(_,i)=>{ const d=addDays(wStart,i); return {name:d.toLocaleDateString("nl-NL",{weekday:"short"}),count:week.filter(e=>isSameDay(e.start,d)).length}; });

  const [mounted,setMounted]=useState(false); const [alerts,setAlerts]=useState<AlertItem[]>([]); const [dismissed,setDismissed]=useState<string[]>([]);
  useEffect(()=>{ setMounted(true); try{setDismissed(JSON.parse(localStorage.getItem("dashboard-dismissed-alerts")||"[]"));}catch{} setAlerts(extractAlerts()); },[]);
  useEffect(()=>{ try{localStorage.setItem("dashboard-dismissed-alerts",JSON.stringify(dismissed));}catch{} },[dismissed]);
  const visible=useMemo(()=>alerts.filter(a=>!dismissed.includes(a.id)),[alerts,dismissed]);

  return (
    <div className="grid gap-4">
      {/* KPI’s */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="text-zinc-500">Vandaag</CardHeader><CardContent><div className="text-3xl font-bold text-brand-700">{kToday}</div></CardContent></Card>
        <Card><CardHeader className="text-zinc-500">Deze week</CardHeader><CardContent><div className="text-3xl font-bold text-brand-700">{kWeek}</div></CardContent></Card>
        <Card><CardHeader className="text-zinc-500">Eb (week)</CardHeader><CardContent><div className="text-3xl font-bold text-brand-700">{kEb}</div></CardContent></Card>
        <Card><CardHeader className="text-zinc-500">Vloed (week)</CardHeader><CardContent><div className="text-3xl font-bold text-brand-700">{kVloed}</div></CardContent></Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>Meldingen</CardHeader>
        <CardContent className="grid gap-3">
          {mounted && visible.length>0 ? (
            <>
              <div className="flex items-center justify-end">
                <Button variant="outline" onClick={()=>setDismissed([...new Set([...dismissed,...alerts.map(a=>a.id)])])}>Alles verbergen</Button>
              </div>
              {visible.map(a=>{
                const s=cls[a.severity];
                return (
                  <div key={a.id} className={`rounded-xl border ${s.left}`}>
                    <div className="p-3 grid gap-1">
                      <div className="flex items-center justify-between">
                        <div className={`font-semibold ${s.text}`}>{a.group?`${a.group} • `:""}{a.title}</div>
                        <Button onClick={()=>setDismissed(d=>[...d,a.id])}>Sluiten</Button>
                      </div>
                      {a.desc && <div className="opacity-80 whitespace-pre-wrap">{a.desc}</div>}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-sm opacity-80">Geen nieuwe meldingen. Ga naar <a className="underline text-brand-700" href="/overdrachten">Overdrachten</a> en klik <b>Parse</b>.</div>
          )}
        </CardContent>
      </Card>

      {/* Grafiek met merkkleur */}
      <Card>
        <CardHeader>Tellingen per weekdag</CardHeader>
        <CardContent>
          <div style={{width:"100%",height:280}} className="text-brand-600">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="currentColor" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
