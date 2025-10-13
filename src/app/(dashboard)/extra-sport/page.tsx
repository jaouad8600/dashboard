"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getGroupsForExtra,
  getCounts,
  inc,
  setCount,
  resetWeek,
  onExtraSportChange,
  weekKeyFromDate,
  shiftWeek,
  type WeekKey,
} from "@/lib/extraSport";

export default function ExtraSportPage() {
  const [mounted, setMounted] = useState(false);
  const [week, setWeek] = useState<WeekKey>(weekKeyFromDate());
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    setGroups(getGroupsForExtra());
    setCounts(getCounts(week));
    const off = onExtraSportChange(() => setCounts(getCounts(week)));
    return off;
  }, [week]);

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + (Number(b) || 0), 0),
    [counts],
  );

  const prev = () => setWeek((w) => shiftWeek(w, -1));
  const next = () => setWeek((w) => shiftWeek(w, +1));

  if (!mounted) return null; // voorkom hydration-mismatch

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Extra sportmomenten</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="rounded-lg border px-3 py-1 text-sm btn"
          >
            ← Vorige week
          </button>
          <div className="px-3 py-1 text-sm rounded-lg border bg-white">
            {week}
          </div>
          <button
            onClick={next}
            className="rounded-lg border px-3 py-1 text-sm btn"
          >
            Volgende week →
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left p-3">Groep</th>
              <th className="text-center p-3">Aantal (deze week)</th>
              <th className="text-right p-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-zinc-500">
                  Geen groepen gevonden.
                </td>
              </tr>
            ) : (
              groups.map((g) => {
                const c = Number(counts[g.id] ?? 0);
                return (
                  <tr key={g.id} className="border-t">
                    <td className="p-3 font-medium">{g.name}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block min-w-[3ch]">{c}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="rounded-lg border px-2 py-1 btn"
                          onClick={() => inc(g.id, -1, week)}
                          title="−1"
                        >
                          −
                        </button>
                        <button
                          className="rounded-lg border px-2 py-1 btn"
                          onClick={() => inc(g.id, +1, week)}
                          title="+1"
                        >
                          +
                        </button>
                        <button
                          className="text-red-600 hover:underline btn"
                          onClick={() => setCount(g.id, 0, week)}
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="border-t bg-zinc-50">
              <td className="p-3 font-semibold">Totaal</td>
              <td className="p-3 text-center font-semibold">{total}</td>
              <td className="p-3 text-right">
                <button
                  className="text-red-600 hover:underline btn"
                  onClick={() => resetWeek(week)}
                  title="Reset alle groepen voor deze week"
                >
                  Reset hele week
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-zinc-500">
        Opslag: lokaal in je browser (key <code>extraSport</code>). Back-up via{" "}
        <b>Back-up / Herstel</b>.
      </p>
    </div>
  );
}
