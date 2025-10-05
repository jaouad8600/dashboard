"use client";
import { useEffect, useMemo, useState } from "react";
import { toArray } from "@/lib/toArray";

type Groep = {
  id: string;
  naam: string;
  kleur?: string;     // "red" | "green" | "yellow" | "orange" | "gray" | ...
  notities?: Array<{ id: string; tekst: string; auteur?: string; createdAt?: string }>;
};

function kleurBadge(kleur?: string) {
  const map: Record<string, string> = {
    red:    "bg-red-50 text-red-700 ring-red-200",
    green:  "bg-green-50 text-green-700 ring-green-200",
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
    gray:   "bg-zinc-50 text-zinc-700 ring-zinc-200"
  };
  return map[kleur || "gray"] || map.gray;
}

export default function GroepenPage() {
  const [raw, setRaw] = useState<any>([]);
  const groepen: Groep[] = useMemo(() => toArray<Groep>(raw), [raw]);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch("/api/groepen", { cache: "no-store" });
        const data = await res.json();
        if (!abort) setRaw(data);
      } catch (e) {
        console.error("Groepen laden fout:", e);
        if (!abort) setRaw([]);
      }
    })();
    return () => { abort = true; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groepen</h1>
        <div className="text-sm text-zinc-500">Beheer kleurstatus en notities per groep.</div>
      </div>

      {groepen.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-zinc-500">
          Geen groepen gevonden. Voeg iets toe in je database of controleer /api/groepen.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groepen.map((g) => (
            <div key={g.id || g.naam} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${kleurBadge(g.kleur)}`}>
                    <span className={`h-2 w-2 rounded-full ${g.kleur ? `bg-${g.kleur}-500` : "bg-zinc-500"}`} />
                    {g.kleur || "onbekend"}
                  </span>
                  <div className="text-lg font-semibold">{g.naam}</div>
                </div>
              </div>

              {Array.isArray(g.notities) && g.notities.length > 0 && (
                <div className="mt-3 space-y-2">
                  {g.notities.slice(0, 3).map((n) => (
                    <div key={n.id} className="rounded-md border px-3 py-2 text-sm">
                      <div className="text-zinc-800">{n.tekst}</div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {n.auteur ? `${n.auteur} • ` : ""}{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  ))}
                  {g.notities.length > 3 && (
                    <div className="text-xs text-zinc-500">+{g.notities.length - 3} meer…</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
