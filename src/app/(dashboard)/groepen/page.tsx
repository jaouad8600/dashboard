"use client";
import { useEffect, useState } from "react";
import { GROUPS, getActiveGroup, setActiveGroup } from "@/lib/clientStore";

export default function GroupsPage(){
  const [active,setActive] = useState<string | null>(null);
  useEffect(()=>{ setActive(getActiveGroup()); },[]);
  function choose(g:string){ setActive(g); setActiveGroup(g); }
  function clear(){ setActive(null); setActiveGroup(null); }

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Groepen</h1>
      <div className="text-sm opacity-80">
        Actieve groep: <b>{active ?? "—"}</b>
        {active && <button onClick={clear} className="ml-3 px-2 py-1 rounded-lg border">Leegmaken</button>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {GROUPS.map(g=>{
          const on=g===active;
          return (
            <button key={g} onClick={()=>choose(g)}
              className={`text-left border rounded-2xl p-3 bg-white ${on?"ring-2 ring-brand-600":""}`}>
              <div className="font-semibold">{g}</div>
              <div className="text-xs opacity-70">{on?"Actief":"Niet actief"}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
