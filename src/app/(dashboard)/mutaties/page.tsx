"use client";

import { useEffect, useMemo, useState } from "react";
import { broadcast } from "@/lib/live";

type Mutatie = {
  id: string;
  leerling?: string;
  onderwerp: string;
  status: 'open' | 'afgehandeld';
  datum: string;
  opmerking?: string;
};

async function apiJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, { ...init, headers: { "content-type": "application/json", ...(init?.headers||{}) } });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function MutatiesPage() {
  const [rows, setRows] = useState<Mutatie[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Mutatie>>({ status: "open", datum: new Date().toISOString() });
  const [editingId, setEditingId] = useState<string | null>(null);
  const today = useMemo(()=> new Date().toISOString().slice(0,10), []);

  async function load() {
    setLoading(true);
    try {
      const data = await apiJSON<Mutatie[]>("/api/mutaties");
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      leerling: form.leerling?.trim() || undefined,
      onderwerp: (form.onderwerp || "").trim(),
      status: form.status === "afgehandeld" ? "afgehandeld" : "open",
      datum: form.datum || new Date().toISOString(),
      opmerking: form.opmerking?.trim() || undefined
    };
    if (!payload.onderwerp) return alert("Onderwerp is verplicht");

    if (editingId) {
      await apiJSON(`/api/mutaties/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await apiJSON("/api/mutaties", { method: "POST", body: JSON.stringify(payload) });
    }
    setForm({ status: "open", datum: new Date().toISOString() });
    setEditingId(null);
    broadcast("mutaties-changed");
    await load();
  }

  async function handleEdit(m: Mutatie) {
    setEditingId(m.id);
    setForm(m);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Verwijderen?")) return;
    await apiJSON(`/api/mutaties/${id}`, { method: "DELETE" });
    broadcast("mutaties-changed");
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mutaties</h1>
      <p className="text-sm text-zinc-500">Toevoegen, bewerken en verwijderen. Dashboard-tegel ververst live via BroadcastChannel.</p>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-3 bg-white p-4 rounded-xl shadow">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Leerling (optioneel)"
          value={form.leerling || ""}
          onChange={e=>setForm(f=>({...f, leerling: e.target.value}))}
        />
        <input
          className="border rounded-md px-3 py-2 md:col-span-2"
          placeholder="Onderwerp *"
          value={form.onderwerp || ""}
          onChange={e=>setForm(f=>({...f, onderwerp: e.target.value}))}
          required
        />
        <select
          className="border rounded-md px-3 py-2"
          value={form.status || "open"}
          onChange={e=>setForm(f=>({...f, status: e.target.value as any}))}
        >
          <option value="open">Open</option>
          <option value="afgehandeld">Afgehandeld</option>
        </select>
        <input
          type="date"
          className="border rounded-md px-3 py-2"
          value={(form.datum || new Date().toISOString()).slice(0,10)}
          onChange={e=>setForm(f=>({...f, datum: new Date(e.target.value+'T00:00:00').toISOString()}))}
        />
        <textarea
          className="border rounded-md px-3 py-2 md:col-span-5"
          placeholder="Opmerking (optioneel)"
          rows={2}
          value={form.opmerking || ""}
          onChange={e=>setForm(f=>({...f, opmerking: e.target.value}))}
        />
        <div className="md:col-span-5 flex gap-2">
          <button type="submit" className="rounded-md bg-black text-white px-3 py-2 text-sm">
            {editingId ? "Opslaan" : "Toevoegen"}
          </button>
          {editingId && (
            <button type="button" onClick={()=>{ setEditingId(null); setForm({ status:'open', datum:new Date().toISOString() }); }}
              className="rounded-md border px-3 py-2 text-sm">Annuleren</button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50">
              <th className="text-left px-3 py-2">Datum</th>
              <th className="text-left px-3 py-2">Leerling</th>
              <th className="text-left px-3 py-2">Onderwerp</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Opmerking</th>
              <th className="px-3 py-2">Acties</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-500">Laden…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-500">Nog geen mutaties.</td></tr>
            )}
            {rows.map(m => (
              <tr key={m.id} className="border-b">
                <td className="px-3 py-2">{(m.datum || '').slice(0,10) || '-'}</td>
                <td className="px-3 py-2">{m.leerling || '-'}</td>
                <td className="px-3 py-2">{m.onderwerp}</td>
                <td className="px-3 py-2">
                  <span className={m.status === 'open' ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded' : 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded'}>
                    {m.status}
                  </span>
                </td>
                <td className="px-3 py-2">{m.opmerking || '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-end">
                    <button onClick={()=>handleEdit(m)} className="text-blue-600 hover:underline">Bewerken</button>
                    <button onClick={()=>handleDelete(m.id)} className="text-rose-600 hover:underline">Verwijderen</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {!loading && rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={6} className="px-3 py-2 text-zinc-500">
                  Vandaag ({today}): {rows.filter(x=> (x.datum||'').slice(0,10)===today).length} •
                  &nbsp;Open: {rows.filter(x=> x.status!=='afgehandeld').length} •
                  &nbsp;Totaal: {rows.length}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
