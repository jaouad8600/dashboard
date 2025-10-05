"use client";
import { useEffect, useState } from "react";

type Samenvatting = { open:number; inBehandeling:number; afgerond:number; totaal:number };

export default function IndicatieSportPage() {
  const [sum, setSum] = useState<Samenvatting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const r = await fetch(`/api/indicaties/summary?t=${Date.now()}`, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (!stop) setSum(j);
        }
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, []);

  const Tile = ({label, value}:{label:string; value:number|string}) => (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Indicatie sport</h1>
        <p className="text-sm text-zinc-500">Samenvatting van sport-indicaties.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Tile label="Open" value={sum?.open ?? (loading ? "…" : 0)} />
        <Tile label="In behandeling" value={sum?.inBehandeling ?? (loading ? "…" : 0)} />
        <Tile label="Afgerond" value={sum?.afgerond ?? (loading ? "…" : 0)} />
        <Tile label="Totaal" value={sum?.totaal ?? (loading ? "…" : 0)} />
      </div>
    </div>
  );
}
