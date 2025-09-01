"use client";
import { GROUPS, getActiveGroup, setActiveGroup } from "@/lib/clientStore";
import { useState } from "react";
export default function Groepen(){
  const [active,setActive]=useState(getActiveGroup());
  const change=(g:string)=>{ setActive(g); setActiveGroup(g); };
  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Groepen</h1>
      <div className="rounded-2xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50"><tr><th className="text-left p-2">Groep</th><th className="text-left p-2">Actief</th></tr></thead>
          <tbody>
            {GROUPS.map(g=>(
              <tr key={g} className="border-t">
                <td className="p-2">{g}</td>
                <td className="p-2">
                  <button onClick={()=>change(g)} className={"px-2 py-1 rounded-lg border "+(active===g?"bg-zinc-100":"")}>
                    {active===g?"Actief":"Maak actief"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
