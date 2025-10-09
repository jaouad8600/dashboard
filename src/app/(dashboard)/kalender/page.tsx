"use client";
import { useMemo, useState } from "react";
function ym(d=new Date()){ return [d.getFullYear(), d.getMonth()]; }
function daysInMonth(y:number,m:number){ return new Date(y, m+1, 0).getDate(); }
export default function KalenderPage(){
  const [base,setBase] = useState(new Date());
  const [y,m] = ym(base);
  const dcount = daysInMonth(y,m);
  const days = useMemo(()=> Array.from({length:dcount},(_,i)=>i+1),[y,m,dcount]);
  function fmt(d:number){ return new Date(y,m,d).toISOString().slice(0,10); }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kalender</h1>
        <div className="flex gap-2">
          <button onClick={()=>setBase(new Date(y, m-1, 1))} className="px-3 py-1.5 rounded bg-green-600 text-white">Vorige</button>
          <button onClick={()=>setBase(new Date())} className="px-3 py-1.5 rounded border">Vandaag</button>
          <button onClick={()=>setBase(new Date(y, m+1, 1))} className="px-3 py-1.5 rounded bg-green-600 text-white">Volgende</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(d=>(
          <a key={d} href={`/planning?date=${fmt(d)}`} className="block bg-white rounded-xl shadow p-3 hover:ring">
            <div className="font-semibold">{d}</div>
            <div className="text-xs text-gray-500">Klik voor dagplanning</div>
          </a>
        ))}
      </div>
    </div>
  );
}
