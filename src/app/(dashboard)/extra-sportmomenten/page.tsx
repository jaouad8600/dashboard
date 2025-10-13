"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Row = { groepId: string; groepNaam: string; aantal: number };
type ExtraItem = {
  id: string;
  groepId: string;
  groepNaam?: string;
  datum: string;
  duur: number;
  notities?: string;
  createdAt: string;
};

export default function ExtraSportmomentenPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [items, setItems] = useState<ExtraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [aggRes, listRes] = await Promise.all([
        fetch("/api/extra-sportmomenten?aggregate=1").then((r) => r.json()),
        fetch("/api/extra-sportmomenten").then((r) => r.json()),
      ]);
      setRows(aggRes.rows || []);
      setItems(listRes.items || []);
    } catch (e: any) {
      setError(e?.message || "Fout bij laden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function turf(groepId: string) {
    setPosting(groepId);
    setError(null);
    try {
      const res = await fetch("/api/extra-sportmomenten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groepId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Kon niet turven");
      }
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Kon niet turven");
    } finally {
      setPosting(null);
    }
  }

  async function undo(id: string) {
    setError(null);
    const res = await fetch(
      `/api/extra-sportmomenten?id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Kon item niet verwijderen");
    } else {
      await refresh();
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Extra sportmomenten</h1>
          <p className="text-sm text-gray-500">
            Turf hoe vaak elke groep een extra sportmoment heeft gehad.
          </p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-ghost" href="/dashboard">
            Terug naar dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Groep</th>
              <th className="px-3 py-2 text-left font-medium">
                Extra momenten
              </th>
              <th className="px-3 py-2 text-left font-medium">Actie</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-3" colSpan={3}>
                  Laden…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-3" colSpan={3}>
                  Geen groepen gevonden.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.groepId} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 font-medium">{r.groepNaam}</td>
                <td className="px-3 py-2">{r.aantal}</td>
                <td className="px-3 py-2">
                  <button
                    className="btn"
                    onClick={() => turf(r.groepId)}
                    disabled={posting === r.groepId}
                    aria-busy={posting === r.groepId}
                  >
                    {posting === r.groepId ? "Opslaan…" : "Turf +1"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Laatste turfs</h2>
        <div className="rounded-xl border divide-y">
          {items.length === 0 && (
            <div className="p-3 text-sm text-gray-500">
              Nog geen extra momenten.
            </div>
          )}
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between p-3">
              <div className="text-sm">
                <div className="font-medium">{i.groepNaam || i.groepId}</div>
                <div className="text-gray-500">
                  {new Date(i.datum || i.createdAt).toLocaleString()}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => undo(i.id)}>
                Ongedaan maken
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
