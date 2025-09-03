"use client";

import { useEffect, useMemo, useState } from "react";
import { EB_GROUPS, VLOED_GROUPS } from "@/lib/wk";

export default function GroupsPage(){
  // Hydration-stress voorkomen
  const [mounted,setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);
  const eb = useMemo(()=>EB_GROUPS,[]);
  const vloed = useMemo(()=>VLOED_GROUPS,[]);

  if(!mounted) return null;

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Groepen</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="border rounded-2xl bg-white">
          <div className="px-4 py-3 border-b font-semibold">Eb</div>
          <ul className="p-3 grid grid-cols-2 gap-2">
            {eb.map(g => (
              <li key={g} className="border rounded-xl px-3 py-2">{g}</li>
            ))}
          </ul>
        </section>

        <section className="border rounded-2xl bg-white">
          <div className="px-4 py-3 border-b font-semibold">Vloed</div>
          <ul className="p-3 grid grid-cols-2 gap-2">
            {vloed.map(g => (
              <li key={g} className="border rounded-xl px-3 py-2">{g}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
