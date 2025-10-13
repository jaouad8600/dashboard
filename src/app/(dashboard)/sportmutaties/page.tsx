"use client";
import { useEffect, useMemo, useState } from "react";

type Mutatie = {
  id: string;
  titel: string;
  omschrijving?: string;
  status: "Open" | "In behandeling" | "Afgerond";
  auteur?: string;
  categorie?: string;
  datumISO: string;
  createdAt: string;
};

const STATI: Mutatie["status"][] = ["Open", "In behandeling", "Afgerond"];

export default function SportmutatiesPage() {
  const [rows, setRows] = useState<Mutatie[]>([]);
  const [q, setQ] = useState("");
  const [flt, setFlt] = useState<Mutatie["status"] | "Alle">("Alle");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/mutaties?t=${Date.now()}`, {
      cache: "no-store",
    });
    const data = await r.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
        (flt === "Alle" || r.status === flt) &&
        (!s ||
          r.titel.toLowerCase().includes(s) ||
          (r.omschrijving ?? "").toLowerCase().includes(s) ||
          (r.categorie ?? "").toLowerCase().includes(s) ||
          (r.auteur ?? "").toLowerCase().includes(s)),
    );
  }, [rows, q, flt]);

  async function addMutatie(form: HTMLFormElement & any) {
    const titel = form.titel.value.trim();
    if (!titel) return;
    const body = {
      titel,
      omschrijving: form.omschrijving.value.trim() || undefined,
      auteur: form.auteur.value.trim() || undefined,
      categorie: form.categorie.value.trim() || undefined,
      datumISO: form.datumISO.value || undefined,
      status: form.status.value as Mutatie["status"],
    };
    await fetch("/api/mutaties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    form.reset();
    await load();
  }

  async function setStatus(id: string, status: Mutatie["status"]) {
    await fetch(`/api/mutaties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/mutaties/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sportmutaties</h1>
          <p className="text-sm text-zinc-500">
            Blijvend opgeslagen op schijf (data/mutaties.json).
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {(["Alle", ...STATI] as const).map((s) => (
            <button
              className="btn"
              key={s}
              onClick={() => setFlt(s as any)}
              className={`rounded-full border px-3 py-1 text-sm ${flt === s ? "bg-black text-white" : "bg-white hover:bg-zinc-50"}`}
            >
              {s}
            </button>
          ))}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-lg border p-2 w-56"
            placeholder="Zoek titel / auteur / cat…"
          />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addMutatie(e.currentTarget as any);
        }}
        className="grid grid-cols-1 md:grid-cols-6 gap-2 rounded-2xl border bg-white p-4"
      >
        <input
          name="titel"
          className="rounded-lg border p-2 md:col-span-2"
          placeholder="Titel *"
          required
        />
        <input
          name="omschrijving"
          className="rounded-lg border p-2 md:col-span-2"
          placeholder="Omschrijving (opt.)"
        />
        <input
          name="auteur"
          className="rounded-lg border p-2"
          placeholder="Auteur (opt.)"
        />
        <input
          name="categorie"
          className="rounded-lg border p-2"
          placeholder="Categorie (opt.)"
        />
        <input name="datumISO" type="date" className="rounded-lg border p-2" />
        <select name="status" className="rounded-lg border p-2">
          {STATI.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 btn">
          Toevoegen
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left px-4 py-3">Titel</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Auteur</th>
              <th className="text-left px-4 py-3">Categorie</th>
              <th className="text-left px-4 py-3">Datum</th>
              <th className="text-left px-4 py-3">Omschrijving</th>
              <th className="text-right px-4 py-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                  Geen mutaties.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                  Laden…
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{m.titel}</td>
                  <td className="px-4 py-3">
                    <select
                      value={m.status}
                      onChange={(e) => setStatus(m.id, e.target.value as any)}
                      className="rounded-md border px-2 py-1"
                    >
                      {STATI.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{m.auteur ?? "-"}</td>
                  <td className="px-4 py-3">{m.categorie ?? "-"}</td>
                  <td className="px-4 py-3">{m.datumISO}</td>
                  <td className="px-4 py-3">{m.omschrijving ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn"
                      onClick={() => remove(m.id)}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-rose-50"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
