"use client";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  naam: string;
  aantal?: number;
  locatie?: string;
  status: "Beschikbaar" | "Uitgeleend" | "In bestelling" | "Defect";
  createdAt: string;
  updatedAt: string;
};
const BTN =
  "bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1.5";

export default function MaterialenPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Partial<Row>>({ status: "Beschikbaar" });

  async function load() {
    const a = await fetch("/api/materialen", { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => []);
    setRows(Array.isArray(a) ? a : []);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const xs = Array.isArray(rows) ? rows : [];
    if (!q.trim()) return xs;
    const s = q.toLowerCase();
    return xs.filter(
      (r) =>
        (r.naam || "").toLowerCase().includes(s) ||
        (r.locatie || "").toLowerCase().includes(s),
    );
  }, [rows, q]);

  async function add() {
    if (!form.naam) return alert("Naam verplicht");
    await fetch("/api/materialen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ status: "Beschikbaar" });
    await load();
  }
  async function save(r: Row) {
    await fetch("/api/materialen", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(r),
    });
    await load();
  }
  async function remove(id: string) {
    await fetch("/api/materialen", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Materialen</h1>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter..."
          className="rounded border px-3 py-1.5"
        />
        <input
          value={form.naam || ""}
          onChange={(e) => setForm((s) => ({ ...s, naam: e.target.value }))}
          placeholder="Nieuw materiaal"
          className="rounded border px-3 py-1.5"
        />
        <button onClick={add} className={BTN}>
          Toevoegen
        </button>
      </div>
      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left px-3 py-2">Naam</th>
              <th className="text-left px-3 py-2">Aantal</th>
              <th className="text-left px-3 py-2">Locatie</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Acties</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(filtered) ? filtered : []).map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-3 py-2">
                  <input
                    value={r.naam}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) =>
                          x.id === r.id ? { ...x, naam: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={r.aantal ?? 0}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) =>
                          x.id === r.id
                            ? { ...x, aantal: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                    className="rounded border px-2 py-1 w-24"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={r.locatie || ""}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) =>
                          x.id === r.id ? { ...x, locatie: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={r.status}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) =>
                          x.id === r.id
                            ? { ...x, status: e.target.value as any }
                            : x,
                        ),
                      )
                    }
                    className="rounded border px-2 py-1"
                  >
                    <option>Beschikbaar</option>
                    <option>Uitgeleend</option>
                    <option>In bestelling</option>
                    <option>Defect</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary btn"
                      onClick={() => save(r)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1.5 text-xs"
                    >
                      Opslaan
                    </button>
                    <button
                      className="btn btn-primary btn"
                      onClick={() => remove(r.id)}
                      className="text-rose-600 text-xs hover:underline"
                    >
                      Verwijderen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-zinc-500 py-6">
                  Geen materialen.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
