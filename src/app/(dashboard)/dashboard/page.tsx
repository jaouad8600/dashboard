"use client";

import { useEffect, useMemo, useState } from "react";

type Overdracht = { id?:string; bericht?:string; auteur?:string; datumISO?:string; tijd?:string; belangrijk?:boolean };
type PlanningItem = { id?:string; tijd?:string; activiteit?:string; locatie?:string; groep?:string };
type IndicatieSum = { open:number; inBehandeling:number; afgerond:number; totaal:number };

export default function DashboardPage() {
  const [rodeCount, setRodeCount] = useState<number>(0);
  const [mutatiesCount, setMutatiesCount] = useState<number>(0);
  const [indicatie, setIndicatie] = useState<IndicatieSum | null>(null);
  const [laatste, setLaatste] = useState<Overdracht | null>(null);
  const [planning, setPlanning] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(true);

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const [rRood, rMut, rInd, rOvd, rPlan] = await Promise.all([
          fetch(`/api/groepen/rode?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/mutaties/summary?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/indicaties/summary?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/overdrachten?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/planning?date=${todayISO()}&t=${Date.now()}`, { cache: "no-store" }),
        ]);

        if (!stop) {
          const rood = rRood.ok ? await rRood.json() : [];
          setRodeCount(Array.isArray(rood) ? rood.length : 0);

          const mut = rMut.ok ? await rMut.json() : null;
          // Probeer wat veelvoorkomende vormen (open/totaal) — val terug op 0
          setMutatiesCount(mut?.open ?? mut?.totaal ?? 0);

          const ind = rInd.ok ? await rInd.json() : null;
          setIndicatie(ind);

          const ov = rOvd.ok ? await rOvd.json() : [];
          setLaatste(Array.isArray(ov) && ov.length ? ov[0] : null);

          const pl = rPlan.ok ? await rPlan.json() : [];
          setPlanning(Array.isArray(pl) ? pl : []);
        }
      } finally {
        if (!stop) setLoading(false);
      }
    })();

    return () => { stop = true; };
  }, []);

  const dateNL = useMemo(() => new Date().toLocaleDateString("nl-NL", {
    weekday: "long", day: "2-digit", month: "2-digit"
  }), []);

  const Tile = ({title, value, href}:{title:string; value:number|string; href:string}) => (
    <a href={href} className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50 transition">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </a>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vandaag</h1>
          <div className="text-sm text-zinc-500">{dateNL}</div>
        </div>
      </div>

      {/* Tegels */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Tile title="Rode groepen" value={loading ? "…" : rodeCount} href="/groepen" />
        <Tile title="Sportmutaties" value={loading ? "…" : mutatiesCount} href="/sportmutaties" />
        <Tile title="Indicaties (open)" value={loading ? "…" : (indicatie?.open ?? 0)} href="/indicatie-sport" />
        <Tile title="Indicaties (totaal)" value={loading ? "…" : (indicatie?.totaal ?? 0)} href="/indicatie-sport" />
      </div>

      {/* Onderste rij: Laatste overdracht & Dagplanning */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">Laatste overdracht</div>
            <a className="text-xs text-zinc-600 hover:underline" href="/overdrachten">naar Overdrachten</a>
          </div>
          {laatste ? (
            <div className="space-y-1 text-sm">
              <div className="text-zinc-500">{laatste.datumISO} • {laatste.tijd} {laatste.auteur ? `• ${laatste.auteur}` : ""}</div>
              <div>{laatste.bericht}</div>
            </div>
          ) : (
            <div className="text-sm text-zinc-400">{loading ? "Laden…" : "Geen overdrachten gevonden."}</div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">Dagplanning</div>
            <a className="text-xs text-zinc-600 hover:underline" href="/kalender">naar Kalender</a>
          </div>
          {planning.length ? (
            <div className="space-y-2">
              {planning.map((p,i)=>(
                <div key={p.id ?? i} className="rounded-lg border p-2 text-sm">
                  <div className="text-xs text-zinc-500">{p.tijd} • {p.locatie ?? "—"} {p.groep ? `• ${p.groep}` : ""}</div>
                  <div>{p.activiteit ?? "Activiteit"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-400">{loading ? "Laden…" : "Geen planning gevonden voor vandaag."}</div>
          )}
        </div>
      </div>
    </div>
  );
}
