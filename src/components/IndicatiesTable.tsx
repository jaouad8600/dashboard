"use client";
import { useEffect, useMemo, useState } from "react";
import TableFilters, { Status } from "@/components/TableFilters";

type Indicatie = {
  id: string;
  naam: string;
  type?: string;
  status: "open" | "in-behandeling" | "afgerond";
  start?: string;
  eind?: string;
  opmerking?: string;
  inhoud?: string;
  createdAt?: string;
};

export default function IndicatiesTable({
  dense = false,
}: {
  dense?: boolean;
}) {
  const [rows, setRows] = useState<Indicatie[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [expandedId, setExpandedId] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/indicaties", { cache: "no-store" });
      const j: Indicatie[] = await r.json();
      setRows(Array.isArray(j) ? j : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("indicaties-changed");
      bc.onmessage = () => load();
    } catch {}
    return () => {
      try {
        bc?.close();
      } catch {}
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okStatus = status === "all" ? true : r.status === status;
      const hay =
        (r.naam || "") +
        " " +
        (r.type || "") +
        " " +
        (r.opmerking || "") +
        " " +
        (r.inhoud || "");
      const okQ = needle === "" ? true : hay.toLowerCase().includes(needle);
      return okStatus && okQ;
    });
  }, [rows, q, status]);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Indicaties</h3>
        {loading && <span className="text-xs text-zinc-500">Laden…</span>}
      </div>
      <div className="mb-3">
        <TableFilters
          q={q}
          onQ={setQ}
          status={status}
          onStatus={setStatus}
          placeholder="Zoek naam, type, opmerking…"
        />
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${dense ? "" : "table-auto"}`}>
          <thead>
            <tr className="text-left border-b bg-zinc-50">
              <th className="p-2">Naam</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
              <th className="p-2">Start</th>
              <th className="p-2">Eind</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-zinc-500">
                  Geen indicaties gevonden.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b hover:bg-zinc-50 cursor-pointer"
                onClick={() => setExpandedId(expandedId === r.id ? "" : r.id)}
              >
                <td className="p-2 font-medium">{r.naam}</td>
                <td className="p-2">{r.type || "—"}</td>
                <td className="p-2">
                  <span className="rounded px-2 py-0.5 text-xs border">
                    {r.status}
                  </span>
                </td>
                <td className="p-2">{r.start?.slice(0, 10) || "—"}</td>
                <td className="p-2">{r.eind?.slice(0, 10) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expandedId &&
        (() => {
          const item = rows.find((x) => x.id === expandedId);
          if (!item) return null;
          return (
            <div className="mt-3 rounded-lg border bg-zinc-50 p-3">
              <div className="text-sm">
                <div className="font-semibold">{item.naam}</div>
                <div className="text-xs text-zinc-500 mb-2">
                  {item.type || "—"} • {item.status}
                </div>
                {item.opmerking && <p className="mb-2">{item.opmerking}</p>}
                {item.inhoud && (
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: item.inhoud }} />
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
