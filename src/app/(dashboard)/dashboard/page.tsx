"use client";

import DagplanningTile from "./DagplanningTile";
import { useEffect, useMemo, useState } from "react";

type SumMut = { open: number; totaal: number };
type SumInd = {
  open: number;
  inBehandeling: number;
  afgerond: number;
  totaal: number;
};
type Groep = {
  id: string;
  naam: string;
  afdeling: "EB" | "VLOED";
  kleur: "GREEN" | "YELLOW" | "ORANGE" | "RED";
};
type Plan = {
  id: string;
  date: string;
  tijd?: string;
  titel: string;
  locatie?: string;
  afdeling?: "EB" | "VLOED";
};

function usePoll<T>(url: string, intervalMs = 5000, init: T) {
  const [data, setData] = useState<T>(init);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  useEffect(() => {
    let stop = false;
    const fetchOnce = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const j = await res.json();
        if (!stop) {
          setData(j);
          setError(undefined);
          setLoading(false);
        }
      } catch (e: any) {
        if (!stop) {
          setError(e?.message || "error");
          setLoading(false);
        }
      }
    };
    fetchOnce();
    const h = setInterval(fetchOnce, intervalMs);
    return (
) => {
      clearInterval(h);
    };
  }, [url, intervalMs]);
  return { data, loading, error };
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10
  <div className="mt-6"><DagplanningTile /></div>
);
}

export default function DashboardPage() {
  const date = todayStr();
  const { data: mut, loading: lm } = usePoll<SumMut>(
    "/api/mutaties/summary",
    5000,
    { open: 0, totaal: 0 },
  );
  const { data: ind } = usePoll<SumInd>("/api/indicaties/summary", 5000, {
    open: 0,
    inBehandeling: 0,
    afgerond: 0,
    totaal: 0,
  });
  const { data: rode } = usePoll<Groep[] | any>("/api/groepen/rode", 5000, []);
  const { data: plan } = usePoll<Plan[] | any>(
    `/api/planning?date=${date}`,
    5000,
    [],
  );

  const rodeNamen = useMemo(() => {
    const arr = Array.isArray(rode) ? rode : (rode?.data ?? []);
    return Array.isArray(arr) ? arr.map((g: any) => g.naam).join(", ") : "";
  }, [rode]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-sm text-gray-500">v0.1 demo</div>
      </div>

      {/* Tegels */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Sportmutaties (live)</div>
          <div className="mt-2 text-3xl font-bold">{mut.totaal}</div>
          <div className="text-xs text-amber-700 mt-1">Open: {mut.open}</div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Indicaties</div>
          <div className="mt-2 text-3xl font-bold">{ind.totaal}</div>
          <div className="text-xs mt-1">
            <span className="mr-2 text-amber-700">Open: {ind.open}</span>
            <span className="mr-2 text-indigo-700">
              In beh.: {ind.inBehandeling}
            </span>
            <span className="text-emerald-700">Afgerond: {ind.afgerond}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Rode groepen</div>
          <div className="mt-2 text-3xl font-bold">
            {Array.isArray(rode) ? rode.length : 0}
          </div>
          <div className="text-xs text-rose-700 mt-1 truncate">
            {rodeNamen || "—"}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Dagplanning</div>
          <div className="mt-2 text-base">
            {Array.isArray(plan) && plan.length > 0 ? (
              plan.slice(0, 4).map((p: any) => (
                <div key={p.id} className="text-sm flex gap-2">
                  <span className="w-14 text-gray-500">
                    {p.tijd || "--:--"}
                  </span>
                  <span className="font-medium">{p.titel}</span>
                  <span className="text-gray-500">· {p.locatie || "-"}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">
                Geen items voor vandaag.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
