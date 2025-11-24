"use client";
import { useEffect, useMemo, useState } from "react";
import GroupCard from "../../../components/groups/GroupCard";

type RawGroup = any;

export default function GroepenPage() {
  const [raw, setRaw] = useState<RawGroup[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/groepen", { cache: "no-store" });
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : data.items || data.groepen || data.data || [];
        setRaw(list ?? []);
      } catch {
        setRaw([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return raw;
    return raw.filter((g: any) =>
      (g?.name || g?.naam || "").toLowerCase().includes(term),
    );
  }, [raw, q]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold">Groepen</h1>
          <p className="text-slate-500">
            Kleurstatus, notities en live aantallen per groep.
          </p>
        </div>
        <input
          placeholder="Filter…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-64 h-10 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* (optioneel) afdeling kop als in screenshot */}
      <h2 className="text-sm font-semibold text-slate-600 mb-3">Afdeling EB</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((g: any) => (
          <GroupCard key={g?.id || g?.naam || g?.name} raw={g} />
        ))}
      </div>
    </div>
  );
}
