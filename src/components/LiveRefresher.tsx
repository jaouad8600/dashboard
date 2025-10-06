"use client";
import { useEffect, useRef } from "react";
const channels = ["indicaties-changed","mutaties-changed","groepen-changed","overdrachten-changed","planning-changed","inventaris-changed"];
export default function LiveRefresher(){
  const t = useRef<number|undefined>(undefined);
  useEffect(()=>{
    const handlers: BroadcastChannel[] = [];
    const reload = ()=>{ if(t.current) clearTimeout(t.current); t.current = window.setTimeout(()=>location.reload(),250); };
    for (const name of channels) { try{ const bc=new BroadcastChannel(name); bc.onmessage=reload; handlers.push(bc);}catch{} }
    return ()=>{ handlers.forEach(bc=>{try{bc.close()}catch{}}); if(t.current) clearTimeout(t.current); };
  },[]);
  return null;
}
