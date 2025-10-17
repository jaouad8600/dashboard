"use client";

import { useEffect, useMemo, useState } from "react";

type Indicatie = {
  id: string;
  naam: string;
  type: string;
  status: string;
  groepId?: string | null;
  start?: string | null;
  eind?: string | null;
  opmerking?: string | null;
  archivedAt?: string | null;
  archivedReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Evaluatie = {
  id: string;
  indicatieId: string;
  type: "TUSSEN" | "EIND";
  inhoud: string;
  ontvanger?: string | null;
  createdAt: string;
};

type Groep = { id: string; naam: string } | Record<string, any>;

const toISODate = (v?: string | null) =>
  v ? new Date(v).toISOString().slice(0, 10) : "";

export default function IndicatiesClient() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Indicatie[]>([]);
  const [groups, setGroups] = useState<Groep[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // nieuw/bewerk form
  const emptyForm: Partial<Indicatie> = {
    naam: "",
    type: "OVERIG",
    status: "OPEN",
    groepId: "",
    start: "",
    eind: "",
    opmerking: "",
  };
  const [form, setForm] = useState<Partial<Indicatie>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // evaluatie form
  const [evalForId, setEvalForId] = useState<string | null>(null);
  const [evalText, setEvalText] = useState("");
  const [evalOntv, setEvalOntv] = useState("medischaideienst"); // of "gedragswetenschapper"

  const groepOptions = useMemo(() => {
    // probeer id/naam te mappen, fallback naar key-zoek
    return groups.map((g: any) => ({
      id: g.id ?? g.slug ?? g.value ?? g.key ?? g.code ?? "",
      naam: g.naam ?? g.title ?? g.label ?? g.name ?? String(g.id ?? ""),
    }));
  }, [groups]);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [a, b, c] = await Promise.all([
        fetch("/api/indicaties", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/indicaties/summary", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/groepen", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
      ]);
      setList(Array.isArray(a) ? a : []);
      setSummary(b || {});
      setGroups(Array.isArray(c) ? c : (c?.data ?? []));
    } catch (e: any) {
      setError(e?.message || "Fout bij laden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function saveNewOrEdit() {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        naam: form.naam,
        type: form.type,
        status: form.status,
        groepId: form.groepId || null,
        start: form.start || null,
        eind: form.eind || null,
        opmerking: form.opmerking ?? null,
      };
      if (editingId) {
        const res = await fetch(`/api/indicaties/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch("/api/indicaties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || "Opslaan mislukt");
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(it: Indicatie) {
    setEditingId(it.id);
    setForm({
      naam: it.naam,
      type: it.type,
      status: it.status,
      groepId: it.groepId || "",
      start: toISODate(it.start),
      eind: toISODate(it.eind),
      opmerking: it.opmerking ?? "",
    });
    setShowForm(true);
  }

  async function archive(id: string) {
    const reason = prompt("Reden voor archiveren (optioneel):") || "";
    setLoading(true);
    try {
      const res = await fetch(`/api/indicaties/${id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || "Archiveren mislukt");
    } finally {
      setLoading(false);
    }
  }

  function openEval(id: string) {
    setEvalForId(id);
    setEvalText("");
    setEvalOntv("medischaideienst");
  }

  async function submitEval() {
    if (!evalForId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/indicaties/${evalForId}/evaluaties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inhoud: evalText,
          ontvanger: evalOntv,
          type: "TUSSEN",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEvalForId(null);
      setEvalText("");
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || "Opslaan evaluatie mislukt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Indicaties</h1>
        <div className="text-sm text-gray-500">
          Totaal: {summary?.totaal ?? 0}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={fetchAll}
          className="btn btn-primary px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 border"
        >
          Herladen
        </button>
        <button
          onClick={startNew}
          className="btn btn-primary px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Nieuwe indicatie
        </button>
      </div>

      {error && (
        <div className="p-2 rounded bg-red-100 text-red-800 text-sm">{String(error)}</div>
      )}

      {showForm && (
        <div className="rounded border p-4 grid gap-3 bg-white">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Naam</span>
              <input
                className="border rounded px-2 py-1"
                value={form.naam || ""}
                onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Groep</span>
              <select
                className="border rounded px-2 py-1"
                value={form.groepId || ""}
                onChange={(e) => setForm((f) => ({ ...f, groepId: e.target.value }))}
              >
                <option value="">— kies groep —</option>
                {groepOptions.map((g) => (
                  <option key={g.id} value={String(g.id)}>{g.naam}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Type</span>
              <select
                className="border rounded px-2 py-1"
                value={form.type || "OVERIG"}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option>OVERIG</option>
                <option>MEDISCH</option>
                <option>GEDRAG</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Status</span>
              <select
                className="border rounded px-2 py-1"
                value={form.status || "OPEN"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option>OPEN</option>
                <option>IN_BEHANDELING</option>
                <option>AFGEROND</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Start</span>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={(form.start as string) || ""}
                onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Eind</span>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={(form.eind as string) || ""}
                onChange={(e) => setForm((f) => ({ ...f, eind: e.target.value }))}
              />
            </label>

            <label className="md:col-span-2 grid gap-1">
              <span className="text-xs text-gray-600">Opmerking</span>
              <textarea
                className="border rounded px-2 py-1"
                rows={3}
                value={form.opmerking || ""}
                onChange={(e) => setForm((f) => ({ ...f, opmerking: e.target.value }))}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveNewOrEdit}
              disabled={loading}
              className="btn btn-primary px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {editingId ? "Opslaan (bewerken)" : "Opslaan"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-3 py-2 rounded border"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-2">Naam</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Groep</th>
              <th className="text-left p-2">Start</th>
              <th className="text-left p-2">Eind</th>
              <th className="text-left p-2">Acties</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td className="p-3 text-gray-400" colSpan={7}>Geen indicaties.</td>
              </tr>
            )}
            {list.map((it) => (
              <tr key={it.id} className={it.archivedAt ? "opacity-60" : ""}>
                <td className="p-2">{it.naam}</td>
                <td className="p-2">{it.type}</td>
                <td className="p-2">{it.status}{it.archivedAt ? " (gearchiveerd)" : ""}</td>
                <td className="p-2">{it.groepId || "—"}</td>
                <td className="p-2">{toISODate(it.start)}</td>
                <td className="p-2">{toISODate(it.eind)}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary px-2 py-1 rounded border"
                      onClick={() => startEdit(it)}
                      disabled={!!it.archivedAt}
                    >
                      Bewerk
                    </button>
                    <button
                      className="btn btn-primary px-2 py-1 rounded border"
                      onClick={() => archive(it.id)}
                      disabled={!!it.archivedAt}
                    >
                      Archiveer
                    </button>
                    <button
                      className="btn btn-primary px-2 py-1 rounded border"
                      onClick={() => openEval(it.id)}
                    >
                      Tussentijdse evaluatie
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {evalForId && (
        <div className="rounded border p-4 grid gap-3 bg-white">
          <div className="text-sm font-medium">Tussentijdse evaluatie</div>
          <label className="grid gap-1">
            <span className="text-xs text-gray-600">Ontvanger</span>
            <select
              className="border rounded px-2 py-1"
              value={evalOntv}
              onChange={(e) => setEvalOntv(e.target.value)}
            >
              <option value="medischaideienst">Medische dienst</option>
              <option value="gedragswetenschapper">Gedragswetenschapper</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-gray-600">Inhoud</span>
            <textarea
              className="border rounded px-2 py-1"
              rows={5}
              value={evalText}
              onChange={(e) => setEvalText(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={submitEval}
              disabled={loading || !evalText.trim()}
              className="btn btn-primary px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Opslaan evaluatie
            </button>
            <button
              onClick={() => setEvalForId(null)}
              className="px-3 py-2 rounded border"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
