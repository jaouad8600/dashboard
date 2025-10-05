"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "OPEN" | "IN_BEHANDELING" | "AFGEROND";
type IndicatieItem = {
  id: string;
  naam: string;
  type: string;
  start?: string | null;
  eind?: string | null;
  status: Status;
  opmerking?: string | null;
};

type Summary = { open: number; inBehandeling: number; afgerond: number; totaal: number };

export default function IndicatiesPage() {
  const [items, setItems] = useState<IndicatieItem[]>([]);
  const [sum, setSum] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // Form-state nieuw item
  const [naam, setNaam] = useState("");
  const [type, setType] = useState("Sport");
  const [start, setStart] = useState<string>("");
  const [eind, setEind] = useState<string>("");
  const [status, setStatus] = useState<Status>("OPEN");
  const [opmerking, setOpmerking] = useState("");

  async function reload() {
    setLoading(true);
    const [r1, r2] = await Promise.all([
      fetch("/api/indicaties", { cache: "no-store" }),
      fetch("/api/indicaties/summary", { cache: "no-store" }),
    ]);
    const list = (await r1.json()) as IndicatieItem[];
    const s = (await r2.json()) as Summary;
    setItems(list);
    setSum(s);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function addIndicatie() {
    const body = {
      naam,
      type,
      start: start || undefined,
      eind: eind || undefined,
      status,
      opmerking: opmerking || undefined,
    };
    await fetch("/api/indicaties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    // reset form + refresh
    setNaam(""); setType("Sport"); setStart(""); setEind(""); setStatus("OPEN"); setOpmerking("");
    await reload();
  }

  async function updateStatus(id: string, status: Status) {
    await fetch(`/api/indicaties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await reload();
  }

  async function removeIndicatie(id: string) {
    await fetch(`/api/indicaties/${id}`, { method: "DELETE" });
    await reload();
  }

  const rows = useMemo(() => items, [items]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Indicaties</h1>
      <p className="text-sm text-zinc-500">Overzicht en beheer van sport-indicaties.</p>

      {/* Tegels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Tile title="Open" value={sum?.open ?? (loading ? "…" : 0)} />
        <Tile title="In behandeling" value={sum?.inBehandeling ?? (loading ? "…" : 0)} />
        <Tile title="Afgerond" value={sum?.afgerond ?? (loading ? "…" : 0)} />
        <Tile title="Totaal" value={sum?.totaal ?? (loading ? "…" : 0)} />
      </div>

      {/* Nieuw item */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold mb-3">Nieuwe indicatie</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="rounded-lg border p-2" placeholder="Naam"
                 value={naam} onChange={(e)=>setNaam(e.target.value)} />
          <input className="rounded-lg border p-2" placeholder="Type"
                 value={type} onChange={(e)=>setType(e.target.value)} />
          <input className="rounded-lg border p-2" type="date" value={start}
                 onChange={(e)=>setStart(e.target.value)} />
          <input className="rounded-lg border p-2" type="date" value={eind}
                 onChange={(e)=>setEind(e.target.value)} />
          <select className="rounded-lg border p-2" value={status}
                  onChange={(e)=>setStatus(e.target.value as Status)}>
            <option value="OPEN">Open</option>
            <option value="IN_BEHANDELING">In behandeling</option>
            <option value="AFGEROND">Afgerond</option>
          </select>
          <input className="rounded-lg border p-2 md:col-span-2" placeholder="Opmerking"
                 value={opmerking} onChange={(e)=>setOpmerking(e.target.value)} />
        </div>
        <div className="mt-3">
          <button onClick={addIndicatie}
                  className="rounded-lg bg-black text-white px-4 py-2 hover:opacity-90">
            Toevoegen
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm overflow-x-auto">
        <table className="min-w-[800px] w-full">
          <thead>
            <tr className="text-left text-sm text-zinc-500">
              <th className="py-2">Naam</th>
              <th>Type</th>
              <th>Start</th>
              <th>Eind</th>
              <th>Status</th>
              <th>Opmerking</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-sm text-zinc-500">
                {loading ? "Laden…" : "Geen indicaties gevonden."}
              </td></tr>
            )}
            {rows.map((r)=>(
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.naam}</td>
                <td>{r.type}</td>
                <td>{r.start ? new Date(r.start).toLocaleDateString() : "-"}</td>
                <td>{r.eind ? new Date(r.eind).toLocaleDateString() : "-"}</td>
                <td>
                  <select
                    className="rounded-lg border p-1 text-sm"
                    value={r.status}
                    onChange={(e)=>updateStatus(r.id, e.target.value as Status)}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_BEHANDELING">In behandeling</option>
                    <option value="AFGEROND">Afgerond</option>
                  </select>
                </td>
                <td className="max-w-[280px] truncate">{r.opmerking ?? "-"}</td>
                <td className="text-right">
                  <button onClick={()=>removeIndicatie(r.id)} className="text-red-600 hover:underline text-sm">Verwijderen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile(props: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-zinc-500">{props.title}</div>
      <div className="text-2xl font-bold mt-1">{props.value}</div>
    </div>
  );
}
