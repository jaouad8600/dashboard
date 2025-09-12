"use client";
import { useEffect, useMemo, useState } from "react";
import { ensureDefaults, getGroups, onGroupsChange, setGroupState, type Group, type GroupState } from "@/lib/groups";

const STATES: GroupState[] = ["Groen","Geel","Oranje","Rood"];
const dot = (s:GroupState)=>({Groen:"bg-emerald-500",Geel:"bg-yellow-500",Oranje:"bg-orange-500",Rood:"bg-red-600"}[s]);

export default function GroepenPage(){
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(()=>{ ensureDefaults(); setGroups(getGroups()); const off=onGroupsChange(()=>setGroups(getGroups())); return off; },[]);
  const sorted = useMemo(()=>[...groups].sort((a,b)=>a.name.localeCompare(b.name,"nl-NL",{numeric:true})),[groups]);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Groepen</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {sorted.map(g=>(
          <div key={g.id} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-lg">{g.name}</div>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-full ${dot(g.state)}`} />
                <select className="rounded-lg border px-2 py-1 text-sm" value={g.state}
                  onChange={(e)=>setGroupState(g.id, e.target.value as GroupState)}>
                  {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
