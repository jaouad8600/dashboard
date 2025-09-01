"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const ROLES = ["Sportdocent","GL","Coördinator","TL","AV","Gast"];

export default function Topbar(){
  const [actor,setActor]=useState("");
  const [role,setRole]=useState(ROLES[0]);

  useEffect(()=>{
    try{
      const a=localStorage.getItem("x-actor"); if(a) setActor(a);
      const r=localStorage.getItem("x-role");  if(r) setRole(r);
    }catch{}
  },[]);
  useEffect(()=>{
    try{ localStorage.setItem("x-actor",actor); localStorage.setItem("x-role",role); }catch{}
  },[actor,role]);

  return (
    <header className="h-14 border-b bg-white/95 backdrop-blur flex items-center gap-3 px-3 sticky top-0 z-40">
      <div className="flex items-center gap-2 text-sm text-zinc-600 border rounded-xl px-2 py-1">
        <Search size={16} className="text-brand-600" />
        <input className="outline-none text-sm placeholder:text-zinc-400" placeholder="Zoeken…" />
      </div>
      <div className="ml-auto flex items-center gap-2 text-sm">
        <input
          value={actor}
          onChange={(e)=>setActor(e.target.value)}
          placeholder="Naam (bijv. Joey)"
          className="px-2 py-1 rounded-lg border"
          style={{minWidth:160}}
        />
        <select value={role} onChange={(e)=>setRole(e.target.value)} className="px-2 py-1 rounded-lg border">
          {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </header>
  );
}
