"use client";
import { useEffect, useState } from "react";
import { toArray } from "@/lib/toArray";

type MutSummary = { open: number; totaal: number };
type IndSummary = { open: number; inBehandeling: number; afgerond: number; totaal: number };

function usePoll<T>(url: string, intervalMs = 5000, init: T): T {
  const [data, setData] = useState<T>(init);
  useEffect(() => {
    let stop = false;
    const fetchOnce = async () => {
      try {
        const r = await fetch(url, { cache: "no-store" });
        const j = await r.json();
        if (!stop) setData(j as T);
      } catch {}
    };
    fetchOnce();
    const h = setInterval(fetchOnce, intervalMs);
    return () => {
      stop = true;
      clearInterval(h);
    };
  }, [url, intervalMs]);
  return data;
}

export default function DashboardPage() {
  const mut = usePoll<MutSummary>("/api/mutaties/summary", 4000, { open: 0, totaal: 0 });
  const ind = usePoll<IndSummary>("/api/indicaties/summary", 4000, {
    open: 0,
    inBehandeling: 0,
    afgerond: 0,
    totaal: 0,
  });
  const roodResp = usePoll<any>("/api/groepen/rode", 4000, { list: [] });
  const rodeNamen = toArray<string>(roodResp);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Tegels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-500">Mutaties (open)</div>
          <div className="text-3xl font-semibold">{mut.open ?? 0}</div>
          <div className="text-xs text-zinc-400">Totaal: {mut.totaal ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-500">Indicaties (open)</div>
          <div className="text-3xl font-semibold">{ind.open ?? 0}</div>
          <div className="text-xs text-zinc-400">
            In behandeling: {ind.inBehandeling ?? 0} • Afgerond: {ind.afgerond ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-500">Rood (groepen)</div>
          <div className="text-sm">{rodeNamen.length ? rodeNamen.join(", ") : "—"}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-500">Planning vandaag</div>
          <div className="text-sm text-zinc-400">Bekijk kalender voor details</div>
        </div>
      </div>
    </div>
  );
}
