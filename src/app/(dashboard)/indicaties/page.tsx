"use client";

import { useEffect, useMemo, useState } from "react";

type Indicatie = {
  id: string;
  naam: string;
  type: string;
  status: "Open" | "In behandeling" | "Afgerond";
  start?: string;
  eind?: string;
  opmerking?: string;
};

const STATI: Indicatie["status"][] = ["Open","In behandeling","Afgerond"];

export default function IndicatiesPage() {
  const [items, setItems] = useState<Indicatie[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [flt, setFlt] = useState<Indicatie["status"] | "Alle">("Alle");

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/indicaties?t=${Date.now()}`, { cache: "no-store" });
    const data = await r.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return items.filter(i => {
      const passStatus = flt === "Alle" ? true : i.status === flt;
      const passSearch =
        !s ||
        i.naam.toLowerCase().includes(s) ||
        i.type.toLowerCase().includes(s) ||
        (i.opmerking ?? "").toLowerCase().includes(s);
      return passStatus && passSearch;
    });
  }, [items, q, flt]);

  async function addIndicatie(form: HTMLFormElement & { naam: HTMLInputElement; type: HTMLInputElement; opmerking: HTMLInputElement; }) {
    const naam = form.naam.value.trim();
    const type = form.type.value.trim();
    const opmerking = form.opmerking.value.trim();
    if (!naam || !type) return;
    await fetch("/api/indicaties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, type, opmerking }),
    });
    form.reset();
    await load();
  }

  async function updateStatus(id: string, status: Indicatie["status"]) {
    await fetch(`/api/indicaties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Indicaties</h1>
          <p className="text-sm text-zinc-500">Overzicht van (sport)indicaties.</p>
        </div>
        <form
          className="hidden md:flex items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); addIndicatie(e.currentTarget as any); }}
        >
          <input name="naam" className="rounded-lg border p-2" placeholder="Naam…" />
          <input name="type" className="rounded-lg border p-2" placeholder="Type (bv. Sportindicatie)…" />
          <input name="opmerking" className="rounded-lg border p-2 w-64" placeholder="Opmerking (optioneel)…" />
          <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Toevoegen</button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["Alle", ...STATI] as const).map(s => (
          <button
            key={s}
            onClick={() => setFlt(s as any)}
            className={`rounded-full border px-3 py-1 text-sm ${flt===s ? "bg-black text-white" : "bg-white hover:bg-zinc-50"}`}
          >
            {s}
          </button>
        ))}
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          className="ml-auto rounded-lg border p-2 w-[220px]"
          placeholder="Zoek naam / type / opm…"
        />
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left px-4 py-3">Naam</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Start</th>
              <th className="text-left px-4 py-3">Eind</th>
              <th className="text-left px-4 py-3">Opmerking</th>
              <th className="text-right px-4 py-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-zinc-500">Laden…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-zinc-500">Geen resultaten.</td></tr>
            )}
            {!loading && filtered.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-4 py-3">{i.naam}</td>
                <td className="px-4 py-3">{i.type}</td>
                <td className="px-4 py-3">
                  <select
                    value={i.status}
                    onChange={(e)=>updateStatus(i.id, e.target.value as any)}
                    className="rounded-md border px-2 py-1"
                  >
                    {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">{i.start ?? "-"}</td>
                <td className="px-4 py-3">{i.eind ?? "-"}</td>
                <td className="px-4 py-3">{i.opmerking ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  {/* ruimte voor extra acties */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobiel formulier */}
      <div className="md:hidden">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => { e.preventDefault(); addIndicatie(e.currentTarget as any); }}
        >
          <input name="naam" className="rounded-lg border p-2" placeholder="Naam…" />
          <input name="type" className="rounded-lg border p-2" placeholder="Type (bv. Sportindicatie)…" />
          <input name="opmerking" className="rounded-lg border p-2" placeholder="Opmerking (optioneel)…" />
          <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Toevoegen</button>
        </form>
      </div>
    </div>
  );
}
