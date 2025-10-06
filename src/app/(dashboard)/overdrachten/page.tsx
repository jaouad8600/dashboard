"use client";
import { useEffect, useState } from 'react';

type Overdracht = {
  id: string;
  titel: string;
  inhoud: string;
  auteur?: string;
  createdAt: string;
  updatedAt?: string;
  status?: 'open' | 'afgerond';
};

export default function OverdrachtenPage() {
  const [items, setItems] = useState<Overdracht[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ titel: '', inhoud: '', auteur: '' });

  async function load() {
    setLoading(true);
    const res = await fetch('/api/overdrachten', { cache: 'no-store' });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/overdrachten', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'open' }),
    });
    if (res.ok) {
      setForm({ titel: '', inhoud: '', auteur: '' });
      await load();
    }
  }

  async function setStatus(id: string, status: 'open' | 'afgerond') {
    await fetch(`/api/overdrachten/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/overdrachten/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Overdrachten</h1>

      <form onSubmit={add} className="grid gap-3 max-w-2xl bg-white p-4 rounded-xl border">
        <input
          className="border rounded px-3 py-2"
          placeholder="Titel"
          value={form.titel}
          onChange={(e) => setForm({ ...form, titel: e.target.value })}
        />
        <textarea
          className="border rounded px-3 py-2 min-h-[120px]"
          placeholder="Inhoud"
          value={form.inhoud}
          onChange={(e) => setForm({ ...form, inhoud: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Auteur (optioneel)"
          value={form.auteur}
          onChange={(e) => setForm({ ...form, auteur: e.target.value })}
        />
        <button className="bg-black text-white rounded px-4 py-2 w-fit">Toevoegen</button>
      </form>

      <div className="grid gap-3">
        {loading ? (
          <div>Laden…</div>
        ) : items.length === 0 ? (
          <div className="text-zinc-500">Geen overdrachten.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="bg-white p-4 rounded-xl border">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{it.titel}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(it.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{it.inhoud}</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span
                  className={`px-2 py-1 rounded ${
                    it.status === 'afgerond'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {it.status ?? 'open'}
                </span>
                {it.auteur ? <span className="text-zinc-500">• {it.auteur}</span> : null}
                <button
                  onClick={() => setStatus(it.id, it.status === 'afgerond' ? 'open' : 'afgerond')}
                  className="ml-auto underline"
                >
                  Markeer {it.status === 'afgerond' ? 'open' : 'afgerond'}
                </button>
                <button onClick={() => remove(it.id)} className="text-rose-600 underline">
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
