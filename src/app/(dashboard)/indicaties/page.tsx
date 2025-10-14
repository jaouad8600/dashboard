"use client";
import React from "react";

type Groep = { id: string; naam: string };
type Indicatie = {
  id: string; naam: string; type?: string;
  status: "open" | "in-behandeling" | "afgehandeld";
  groepId?: string | null; start?: string | null; eind?: string | null;
  opmerking?: string | null; archived?: boolean;
  createdAt?: string; updatedAt?: string;
};

const STATUS_OPT: Array<{ key: Indicatie["status"]; label: string; cls: string }> = [
  { key: "open", label: "open", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  { key: "in-behandeling", label: "in-behandeling", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "afgehandeld", label: "afgehandeld", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
];

function Chip({ status }: { status: Indicatie["status"] }) {
  const s = STATUS_OPT.find((x) => x.key === status)!;
  return <span className={`px-2 py-0.5 text-xs border rounded ${s.cls}`}>{s.label}</span>;
}

export default function IndicatiesPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Indicatie[]>([]);
  const [groepen, setGroepen] = React.useState<Groep[]>([]);
  const [q, setQ] = React.useState("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Indicatie | null>(null);
  const [form, setForm] = React.useState<Partial<Indicatie>>({ status: "open" });

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    const [r1, r2] = await Promise.all([
      fetch(`/api/indicaties?q=${encodeURIComponent(q)}`, { cache: "no-store" }),
      fetch(`/api/groepen`, { cache: "no-store" }),
    ]);
    const i = await r1.json();
    const g = await r2.json();
    setItems(Array.isArray(i) ? i : []);
    setGroepen(Array.isArray(g) ? g : []);
    setLoading(false);
  }, [q]);

  React.useEffect(() => { loadAll(); }, [loadAll]);

  const openNew = () => {
    setEditing(null);
    setForm({ status: "open" });
    setDrawerOpen(true);
  };
  const openEdit = (row: Indicatie) => {
    setEditing(row);
    setForm({ ...row });
    setDrawerOpen(true);
  };

  const save = async () => {
    const body = {
      naam: (form.naam || "").trim(),
      type: (form.type || "").trim(),
      status: form.status || "open",
      groepId: form.groepId || null,
      start: form.start || null,
      eind: form.eind || null,
      opmerking: (form.opmerking || "").trim(),
    };
    const r = await fetch("/api/indicaties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) { alert("Opslaan mislukt"); return; }
    setDrawerOpen(false);
    await loadAll();
  };

  const update = async () => {
    if (!editing) return;
    const r = await fetch(`/api/indicaties/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!r.ok) { alert("Bijwerken mislukt"); return; }
    setDrawerOpen(false);
    await loadAll();
  };

  const removeRow = async () => {
    if (!editing) return;
    if (!confirm("Verwijderen?")) return;
    const r = await fetch(`/api/indicaties/${editing.id}`, { method: "DELETE" });
    if (!r.ok) { alert("Verwijderen mislukt"); return; }
    setDrawerOpen(false);
    await loadAll();
  };

  const toggleArchive = async (archived: boolean) => {
    if (!editing) return;
    const r = await fetch(`/api/indicaties/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived }) });
    if (!r.ok) { alert("Archiveren mislukt"); return; }
    setDrawerOpen(false);
    await loadAll();
  };

  const gName = (id?: string | null) => groepen.find((g) => String(g.id) === String(id))?.naam || "-";

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Indicaties</h1>
          <p className="text-sm text-gray-600">Beheer aanvragen en koppel ze aan een groep.</p>
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoeken…" className="border rounded px-3 py-2" />
          <button onClick={loadAll} className="px-3 py-2 rounded border bg-gray-900 text-white">Herladen</button>
          <button onClick={openNew} className="px-3 py-2 rounded border bg-emerald-600 text-white border-emerald-700">Nieuwe indicatie</button>
        </div>
      </div>

      <div className="mt-4 bg-white border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2">Naam</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Groep</th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">Eind</th>
              <th className="px-4 py-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Laden…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Geen indicaties.</td></tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  <button className="text-left underline text-gray-800" onClick={() => openEdit(it)}>{it.naam}</button>
                </td>
                <td className="px-4 py-2">{it.type || "-"}</td>
                <td className="px-4 py-2"><Chip status={it.status} /></td>
                <td className="px-4 py-2">{gName(it.groepId)}</td>
                <td className="px-4 py-2">{it.start || "-"}</td>
                <td className="px-4 py-2">{it.eind || "-"}</td>
                <td className="px-4 py-2"><button className="text-sm text-gray-600 underline" onClick={() => openEdit(it)}>Bewerken</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">{editing ? `Indicatie bewerken` : `Nieuwe indicatie`}</div>
              <button onClick={() => setDrawerOpen(false)} className="px-2 py-1 rounded border">Sluiten</button>
            </div>

            <div className="p-4 space-y-3">
              <label className="block text-sm">Naam *</label>
              <input value={form.naam || ""} onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))} className="w-full border rounded px-3 py-2" />

              <label className="block text-sm">Type</label>
              <input value={form.type || ""} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded px-3 py-2" />

              <label className="block text-sm">Status</label>
              <select value={form.status || "open"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="w-full border rounded px-3 py-2">
                {STATUS_OPT.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>

              <label className="block text-sm">Groep</label>
              <select value={form.groepId || ""} onChange={(e) => setForm((f) => ({ ...f, groepId: e.target.value || null }))} className="w-full border rounded px-3 py-2">
                <option value="">—</option>
                {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Start</label>
                  <input type="date" value={form.start || ""} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm">Eind</label>
                  <input type="date" value={form.eind || ""} onChange={(e) => setForm((f) => ({ ...f, eind: e.target.value }))} className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <label className="block text-sm">Opmerking</label>
              <textarea value={form.opmerking || ""} onChange={(e) => setForm((f) => ({ ...f, opmerking: e.target.value }))} className="w-full border rounded px-3 py-2 min-h-[120px]" />

              <div className="flex gap-2 pt-2">
                {!editing && (
                  <>
                    <button onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded border">Annuleren</button>
                    <button onClick={save} className="px-3 py-2 rounded bg-emerald-600 text-white border border-emerald-700">Opslaan</button>
                  </>
                )}
                {editing && (
                  <>
                    <button onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded border">Sluiten</button>
                    <button onClick={update} className="px-3 py-2 rounded bg-emerald-600 text-white border border-emerald-700">Bijwerken</button>
                    <button onClick={removeRow} className="px-3 py-2 rounded bg-red-600 text-white border border-red-700 ml-auto">Verwijderen</button>
                    <button onClick={() => toggleArchive(!(editing.archived ?? false))} className="px-3 py-2 rounded border">
                      {(editing.archived ?? false) ? "Uit archief" : "Archiveer"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}