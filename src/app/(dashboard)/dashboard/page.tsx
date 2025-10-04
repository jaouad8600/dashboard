"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listOverdrachten } from "@/lib/overdrachten";
import { listPlanning, type Planning } from "@/lib/planning";
import { fetchRodeGroepen, fetchMutatiesSummary, fetchIndicatiesSummary } from "@/lib/dashboard-data";

type Overdracht = {
  id: string; auteur: string; bericht: string; datumISO: string; tijd: string; belangrijk: boolean;
};
type RodeGroep = { id: string; naam: string };

export default function DashboardPage() {
  // Rode groepen
  const [rodeGroepen, setRodeGroepen] = useState<RodeGroep[]>([]);
  // Mutaties
  const [mutSumm, setMutSumm] = useState({ total: 0, fitnessAlleen: 0, sportverbodTotaal: 0 });
  // Indicaties
  const [indSumm, setIndSumm] = useState({ total: 0 });
  // Laatste overdracht
  const [laatste, setLaatste] = useState<Overdracht | null>(null);
  // Dagplanning
  const [planning, setPlanning] = useState<Planning[]>([]);

  useEffect(() => {
    (async () => {
      const [rg, ms, ins, ov] = await Promise.all([
        fetchRodeGroepen(),
        fetchMutatiesSummary(),
        fetchIndicatiesSummary(),
        listOverdrachten(),
      ]);
      setRodeGroepen(Array.isArray(rg) ? rg : []);
      setMutSumm(ms || { total: 0, fitnessAlleen: 0, sportverbodTotaal: 0 });
      setIndSumm(ins || { total: 0 });
      setLaatste(Array.isArray(ov) && ov.length > 0 ? ov[0] : null);
    })();
  }, []);

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth()+1).padStart(2,"0");
    const dd = String(now.getDate()).padStart(2,"0");
    const dateISO = `${yyyy}-${mm}-${dd}`;
    (async () => {
      const rows = await listPlanning(dateISO);
      setPlanning(Array.isArray(rows) ? rows : []);
    })();
  }, []);

  const dag = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("nl-NL", { weekday: "long", day: "2-digit", month: "long" });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Rode groepen kaart */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Rode groepen</div>
          <Link href="/groepen" className="text-sm text-indigo-600 hover:underline">Beheer groepen</Link>
        </div>
        {rodeGroepen.length === 0 ? (
          <div className="text-sm text-zinc-500">Geen rode groepen ✔️</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {rodeGroepen.map(g => (
              <span key={g.id} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-red-700 ring-1 ring-red-200">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {g.naam}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tegelrij: Mutaties, Indicaties, Kalender */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/mutaties" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Open sportmutaties</div>
          <div className="mt-1 text-3xl font-bold">{mutSumm.total}</div>
          <div className="mt-1 flex gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              Fitness alleen: {mutSumm.fitnessAlleen}
            </span>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200">
              Totaal verbod: {mutSumm.sportverbodTotaal}
            </span>
          </div>
        </Link>

        <Link href="/indicaties" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Indicaties</div>
          <div className="mt-1 text-3xl font-bold">{indSumm.total}</div>
          <div className="mt-1 text-xs text-zinc-500">Totaal aantal actieve indicaties</div>
        </Link>

        <Link href="/kalender" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Kalender</div>
          <div className="mt-1 text-sm text-zinc-800">Bekijk dag/week overzicht</div>
        </Link>
      </div>

      {/* Laatste overdracht + dagplanning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link href="/overdrachten" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Laatste overdracht</div>
          <div className="mt-2 text-sm">
            {laatste ? (
              <span className="line-clamp-2 text-zinc-800">
                {new Date(laatste.datumISO).toISOString().slice(0,10)} • {laatste.tijd}
                {laatste.auteur ? ` • ${laatste.auteur}` : ""} — {laatste.bericht}
              </span>
            ) : (
              <span className="text-zinc-500">Nog geen overdrachten</span>
            )}
          </div>
        </Link>

        <Link href="/kalender" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Dagplanning</div>
          <div className="mt-1 text-sm text-zinc-800">{dag}</div>
          <div className="mt-2 space-y-2">
            {planning.length === 0 ? (
              <div className="text-sm text-zinc-500">Geen activiteiten gepland</div>
            ) : (
              planning.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <div className="font-medium">{p.titel}</div>
                    <div className="text-xs text-zinc-500">{p.locatie}</div>
                  </div>
                  <div className="text-xs text-zinc-600">
                    {new Date(p.start).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}
                    {" – "}
                    {new Date(p.eind).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              ))
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
