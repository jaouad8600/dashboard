"use client";

import { useEffect, useMemo, useState } from "react";
import TableFilter from "@/components/TableFilter";
import { toArray } from "@/lib/toArray";

type Mutatie = {
  id: string;
  titel?: string;
  title?: string;
  status?: string;
  datum?: string; // ISO date
  date?: string;
  omschrijving?: string;
  note?: string;
  [key: string]: any;
};

export default function MutatiesTable() {
  const [rows, setRows] = useState<Mutatie[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/mutaties", { cache: "no-store" });
        const json = res.ok ? await res.json().catch(() => []) : [];
        if (active) setRows(toArray(json));
      } catch {
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = toArray<Mutatie>(rows);
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((r) => JSON.stringify(r).toLowerCase().includes(term));
  }, [rows, q]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Mutaties</h3>
        <TableFilter value={q} onChange={setQ} placeholder="Filter mutaties…" />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-700">
            <tr className="border-b">
              <th className="px-3 py-2 text-left font-medium">Titel</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Datum</th>
              <th className="px-3 py-2 text-left font-medium">Omschrijving</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-zinc-500">
                  Laden…
                </td>
              </tr>
            ) : toArray(filtered).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-zinc-500">
                  Geen resultaten.
                </td>
              </tr>
            ) : (
              toArray(filtered).map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{r.titel || r.title || "-"}</td>
                  <td className="px-3 py-2">{r.status || "-"}</td>
                  <td className="px-3 py-2">
                    {(r.datum || r.date || "").slice(0, 10) || "-"}
                  </td>
                  <td className="px-3 py-2">
                    {(r.omschrijving || r.note || "")
                      .toString()
                      .slice(0, 120) || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
