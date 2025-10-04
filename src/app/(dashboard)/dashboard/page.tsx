"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listGroepen, onGroepenChange, type Groep } from "@/lib/groepen.filtered";
import { listMutaties, onMutatiesChange, type SportMutatie } from "@/lib/mutaties";
import { listOverdrachten, onOverdrachtenChange, type Overdracht } from "@/lib/overdrachten";

export default function DashboardPage() {
  const [groepen, setGroepen] = useState<Groep[]>(listGroepen());
  const [mutaties, setMutaties] = useState<SportMutatie[]>(listMutaties());
  const [overdrachten, setOverdrachten] = useState<Overdracht[]>(listOverdrachten());

  useEffect(() => onGroepenChange(() => setGroepen(listGroepen())), []);
  useEffect(() => onMutatiesChange(() => setMutaties(listMutaties())), []);
  useEffect(() => onOverdrachtenChange(() => setOverdrachten(listOverdrachten())), []);

  const rodeGroepen = useMemo(() => groepen.filter(g => g.kleur === "red"), [groepen]);

  const openTotal   = useMemo(() => mutaties.filter(m => m.status !== "Afgerond").length, [mutaties]);
  const openFitness = useMemo(() => mutaties.filter(m => m.status !== "Afgerond" && m.type === "FITNESS_ALLEEN").length, [mutaties]);
  const openVerbod  = useMemo(() => mutaties.filter(m => m.status !== "Afgerond" && m.type === "SPORTVERBOD_TOTAAL").length, [mutaties]);

  const laatsteOverdracht = overdrachten[0];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

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
                <span className="group-title">{g.naam}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/mutaties" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Open sportmutaties</div>
          <div className="mt-1 text-3xl font-bold">{openTotal}</div>
          <div className="mt-1 flex gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              Fitness alleen: {openFitness}
            </span>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200">
              Totaal verbod: {openVerbod}
            </span>
          </div>
        </Link>

        <Link href="/overdrachten" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Laatste overdracht</div>
          <div className="mt-1 text-sm">
            {laatsteOverdracht ? (
              <span className="line-clamp-2 text-zinc-800" suppressHydrationWarning>
                {laatsteOverdracht.datumISO} • {laatsteOverdracht.tijd}
                {laatsteOverdracht.auteur ? ` • ${laatsteOverdracht.auteur}` : ""} — {laatsteOverdracht.bericht}
              </span>
            ) : <span className="text-zinc-500">Nog geen overdrachten</span>}
          </div>
        </Link>

        <Link href="/kalender" className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50">
          <div className="text-sm text-zinc-500">Kalender</div>
          <div className="mt-1 text-sm text-zinc-800">Bekijk dag/week overzicht</div>
        </Link>
      </div>
    </div>
  );
}
