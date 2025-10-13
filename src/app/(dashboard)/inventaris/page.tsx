"use client";

import { useEffect, useMemo, useState } from "react";
import TableFilter from "@/components/TableFilter";
import { toArray } from "@/lib/toArray";

type Materiaal = {
  id: string;
  naam: string;
  categorie?: string;
  status?: "Beschikbaar" | "Uitgeleend" | "In bestelling" | "Defect";
  locatie?: string;
  opmerking?: string;
};

async function apiList(): Promise<Materiaal[]> {
  const res = await fetch("/api/materialen", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json().catch(() => []);
  return toArray<Materiaal>(json);
}
async function apiCreate(row: Partial<Materiaal>): Promise<Materiaal | null> {
  const res = await fetch("/api/materialen", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(row),
  });
  if (!res.ok) return null;
  return await res.json().catch(() => null);
}
async function apiUpdate(
  id: string,
  patch: Partial<Materiaal>,
): Promise<Materiaal | null> {
  const res = await fetch(`/api/materialen/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  return await res.json().catch(() => null);
}
async function apiRemove(id: string): Promise<boolean> {
  const res = await fetch(`/api/materialen/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.ok;
}

const STATUSSEN = ["Beschikbaar", "Uitgeleend", "In bestelling", "Defect"];
const LOCATIES = [
  "Eb Fitness",
  "Fitness Vloed",
  "Gymzaal Vloed",
  "Gymzaal Eb",
  "Sportveld",
  "Dojo",
];

export default function InventarisPage() {
  const [rows, setRows] = useState<Materiaal[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Materiaal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const list = await apiList();
        if (active) setRows(toArray(list));
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
    const list = toArray<Materiaal>(rows);
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (r) =>
        (r.naam || "").toLowerCase().includes(term) ||
        (r.categorie || "").toLowerCase().includes(term) ||
        (r.status || "").toLowerCase().includes(term) ||
        (r.locatie || "").toLowerCase().includes(term) ||
        (r.opmerking || "").toLowerCase().includes(term),
    );
  }, [rows, q]);

  function beginNew() {
    setEditing({
      id: "",
      naam: "",
      categorie: "",
      status: "Beschikbaar",
      locatie: "",
      opmerking: "",
    });
  }
  function beginEdit(r: Materiaal) {
    setEditing({ ...r });
  }

  async function save() {
    if (!editing) return;
    if (!editing.naam?.trim()) {
      setError("Naam is verplicht.");
      return;
    }
    setSaving(true);
    try {
      if (!editing.id) {
        const created = await apiCreate(editing);
        if (created) setRows((prev) => [created, ...toArray(prev)]);
      } else {
        const updated = await apiUpdate(editing.id, editing);
        if (updated)
          setRows((prev) =>
            toArray(prev).map((x) => (x.id === updated.id ? updated : x)),
          );
      }
      setEditing(null);
    } catch {
      setError("Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Verwijderen?")) return;
    const ok = await apiRemove(id);
    if (ok) setRows((prev) => toArray(prev).filter((x) => x.id !== id));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventaris</h1>
          <p className="text-sm text-zinc-500">
            Filter op naam, categorie, status, locatie…
          </p>
        </div>
        <div className="flex gap-2">
          <TableFilter
            value={q}
            onChange={setQ}
            placeholder="Filter materialen…"
          />
          <button
            onClick={beginNew}
            className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 btn"
          >
            Nieuw
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-700">
            <tr className="border-b">
              <th className="px-3 py-2 text-left font-medium">Naam</th>
              <th className="px-3 py-2 text-left font-medium">Categorie</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Locatie</th>
              <th className="px-3 py-2 text-left font-medium">Opmerking</th>
              <th className="px-3 py-2 text-right font-medium">Acties</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                  Laden…
                </td>
              </tr>
            ) : toArray(filtered).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                  Geen resultaten.
                </td>
              </tr>
            ) : (
              toArray(filtered).map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{r.naam}</td>
                  <td className="px-3 py-2">{r.categorie || "-"}</td>
                  <td className="px-3 py-2">
                    <select
                      className="rounded border bg-white px-2 py-1"
                      value={r.status || "Beschikbaar"}
                      onChange={(e) =>
                        setRows((prev) =>
                          toArray(prev).map((x) =>
                            x.id === r.id
                              ? { ...x, status: e.target.value as any }
                              : x,
                          ),
                        )
                      }
                    >
                      {STATUSSEN.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">{r.locatie || "-"}</td>
                  <td className="px-3 py-2">{r.opmerking || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="text-blue-600 hover:underline btn"
                        onClick={() => beginEdit(r)}
                      >
                        Bewerken
                      </button>
                      <button
                        className="text-rose-600 hover:underline btn"
                        onClick={() => remove(r.id)}
                      >
                        Verwijderen
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setEditing(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[540px] bg-white shadow-2xl border-l p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editing.id ? "Materiaal bewerken" : "Nieuw materiaal"}
              </h2>
              <button
                className="btn"
                onClick={() => setEditing(null)}
                className="text-zinc-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm">
                <span className="block text-zinc-700 mb-1">Naam *</span>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={editing.naam || ""}
                  onChange={(e) =>
                    setEditing((s) => (s ? { ...s, naam: e.target.value } : s))
                  }
                />
              </label>
              <label className="text-sm">
                <span className="block text-zinc-700 mb-1">Categorie</span>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={editing.categorie || ""}
                  onChange={(e) =>
                    setEditing((s) =>
                      s ? { ...s, categorie: e.target.value } : s,
                    )
                  }
                />
              </label>
              <label className="text-sm">
                <span className="block text-zinc-700 mb-1">Status</span>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  value={editing.status || "Beschikbaar"}
                  onChange={(e) =>
                    setEditing((s) =>
                      s ? { ...s, status: e.target.value as any } : s,
                    )
                  }
                >
                  {STATUSSEN.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-zinc-700 mb-1">Locatie</span>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  value={editing.locatie || ""}
                  onChange={(e) =>
                    setEditing((s) =>
                      s ? { ...s, locatie: e.target.value } : s,
                    )
                  }
                >
                  <option value="">- kies -</option>
                  {LOCATIES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-zinc-700 mb-1">Opmerking</span>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
                  value={editing.opmerking || ""}
                  onChange={(e) =>
                    setEditing((s) =>
                      s ? { ...s, opmerking: e.target.value } : s,
                    )
                  }
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn"
                onClick={() => setEditing(null)}
                className="rounded-md border px-3 py-2 text-sm"
                disabled={saving}
              >
                Annuleren
              </button>
              <button
                onClick={save}
                className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 disabled:opacity-50 btn"
                disabled={saving}
              >
                {saving ? "Opslaan…" : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
