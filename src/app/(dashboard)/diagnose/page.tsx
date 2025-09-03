"use client";

import { useEffect, useState } from "react";

const KEYS = [
  "rbc-events-v1","active-group",
  "overdracht-last-raw","overdracht-last-json",
  "overdracht-sport-last-raw","overdracht-sport-last-json",
  "sportmutaties-v1","files-links-v1","logs-v1",
  "visits-v1","restrictions-v1","sport-restrictions-v1"
];

function sizeOf(v:any){
  try{ return new Blob([JSON.stringify(v)]).size; }catch{ return 0; }
}

export default function Diagnose(){
  const [rows, setRows] = useState<{key:string, size:number, preview:string}[]>([]);

  useEffect(()=>{
    const r:any[]=[];
    for(const k of KEYS){
      let v:any=null; try{ v=JSON.parse(localStorage.getItem(k) || "null"); }catch{}
      r.push({ key:k, size:sizeOf(v), preview: typeof v==="object" ? JSON.stringify(v).slice(0,120) : String(v) });
    }
    setRows(r);
  },[]);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Diagnose</h1>
      <div className="rounded-2xl border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left px-3 py-2">Key</th>
              <th className="text-left px-3 py-2">Size (bytes)</th>
              <th className="text-left px-3 py-2">Preview</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.key} className="border-t">
                <td className="px-3 py-2 font-medium">{r.key}</td>
                <td className="px-3 py-2">{r.size}</td>
                <td className="px-3 py-2">{r.preview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs opacity-70">Open /overdrachten om nieuwe data te parsen; het dashboard gebruikt deze keys voor Meldingen.</p>
    </div>
  );
}
