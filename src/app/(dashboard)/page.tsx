"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GroupState = "Groen" | "Geel" | "Oranje" | "Rood";
type Group = { id: string; name: string; state: GroupState; note?: string };

function readLocal<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; }
  catch { return fallback; }
}

function todayNL() {
  const now = new Date();
  return now.toLocaleDateString("nl-NL", { weekday: "long", day: "2-digit", month: "2-digit" });
}

export default function DashboardPage() {
  const [today, setToday] = useState("—");
  const [groups, setGroups] = useState<Group[]>([]);
  const [indicaties, setIndicaties] = useState<any[]>([]);
  const [mutaties, setMutaties] = useState<any[]>([]);
  const [overdrachten, setOverdrachten] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      setGroups(readLocal<Group[]>("groups", []));
      setIndicaties(readLocal<any[]>("indicaties", []));
      setMutaties(readLocal<any[]>("sportmutaties", []));
      setOverdrachten(readLocal<any[]>("overdrachten", []));
    };
    load();
    setToday(todayNL());

    const onStorage = (e: StorageEvent) => {
      if (!e.key || ["groups", "indicaties", "sportmutaties", "overdrachten"].includes(e.key)) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rood = useMemo(() => groups.filter(g => g.state === "Rood"), [groups]);
  const lastOverdracht = useMemo(
    () => [...overdrachten].sort((a,b)=> (b?.createdAt??0)-(a?.createdAt??0))[0],
    [overdrachten]
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="tile-title">Vandaag</div>
          <div className="mt-2 text-xl font-semibold capitalize">{today}</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="tile-title">Rode groepen</div>
              <div className="tile-value">{rood.length}</div>
            </div>
            <Link href="/groepen" className="link">bekijk</Link>
          </div>
        </div>

        <div className="card">
          <div className="tile-title">Meldingen</div>
          <Link href="/diagnose" className="mt-1 inline-block link">naar Diagnose</Link>
        </div>

        <div className="card">
          <div className="tile-title">Indicaties</div>
          <div className="tile-value">{indicaties.length}</div>
        </div>

        <div className="card">
          <div className="tile-title">Sportmutaties</div>
          <div className="tile-value">{mutaties.length}</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="tile-title">Laatste overdracht</div>
              <div className="mt-1 text-sm">
                {lastOverdracht ? (lastOverdracht.title ?? "Overdracht") : "Geen overdrachten gevonden."}
              </div>
            </div>
            <Link href="/overdrachten" className="link">naar Overdrachten</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Rode groepen (snelle info)</div>
          <Link href="/groepen" className="link">alle groepen</Link>
        </div>

        {rood.length === 0 ? (
          <div className="text-sm text-zinc-500">Geen rode groepen.</div>
        ) : (
          <ul className="divide-y">
            {rood.map(g => (
              <li key={g.id} className="py-2 flex items-start justify-between">
                <div>
                  <div className="font-medium">{g.name}</div>
                  {g.note ? <div className="text-xs text-zinc-500">{g.note}</div> : null}
                </div>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-600 mt-2"></span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
