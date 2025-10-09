"use client";
import { useEffect, useState } from "react";
export default function usePollJSON<T>(url:string, intervalMs=5000, initial:T) {
  const [data,setData] = useState<T>(initial);
  const [error,setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    const run = async () => {
      try{
        const u = url + (url.includes('?')?'&':'?') + 't=' + Date.now();
        const r = await fetch(u, { cache:'no-store' });
        const j = r.ok ? await r.json() : initial;
        if(active){ setData(j as T); setError(""); }
      } catch(e:any){
        if(active) setError(e?.message||"fetch error");
      }
    };
    run();
    const h = setInterval(run, intervalMs);
    return () => { active=false; clearInterval(h); };
  }, [url, intervalMs]);

  return { data, error };
}
