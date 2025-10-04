"use client";
import { useEffect, useState } from "react";
import {
  listOverdrachten,
  addOverdracht,
  patchOverdracht,
  deleteOverdracht,
  type Overdracht
} from "@/lib/overdrachten";

export default function OverdrachtenPage() {
  const [items, setItems] = useState<Overdracht[]>([]);
  const [loading, setLoading] = useState(true);
  const [auteur, setAuteur] = useState("");
  const [bericht, setBericht] = useState("");
  const [belangrijk, setBelangrijk] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editAuteur, setEditAuteur] = useState("");
  const [editBericht, setEditBericht] = useState("");
  const [editBelangrijk, setEditBelangrijk] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listOverdrachten();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleAdd() {
    if (!bericht.trim()) return;
    await addOverdracht(auteur.trim() || "Onbekend", bericht.trim(), belangrijk);
    setAuteur(""); setBericht(""); setBelangrijk(false);
    await refresh();
  }

  function startEdit(o: Overdracht) {
    setEditId(o.id);
    setEditAuteur(o.auteur || "");
    setEditBericht(o.bericht || "");
    setEditBelangrijk(Boolean(o.belangrijk));
  }

  async function saveEdit() {
    if (!editId) return;
    await patchOverdracht(editId, {
      auteur: editAuteur,
      bericht: editBericht,
      belangrijk: editBelangrijk
    });
    setEditId(null);
    await refresh();
  }

  async function toggleBelangrijk(id: string, cur: boolean) {
    await patchOverdracht(id, { belangrijk: !cur });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Weet je zeker dat je deze overdracht wilt verwijderen?")) return;
    await deleteOverdracht(id);
    await refresh();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Overdrachten</h1>

      {/* Toevoegen */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_3fr_auto_auto] items-center">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Auteur"
            value={auteur}
            onChange={(e)=>setAuteur(e.target.value)}
          />
        <input
            className="rounded-lg border px-3 py-2"
            placeholder="Bericht"
            value={bericht}
            onChange={(e)=>setBericht(e.target.value)}
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={belangrijk} onChange={(e)=>setBelangrijk(e.target.checked)} />
            Belangrijk
          </label>
          <button
            onClick={handleAdd}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
          >
            Toevoegen
          </button>
        </div>
      </div>

      {/* Lijst */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-zinc-500">Laden…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-500">Nog geen overdrachten</div>
        ) : (
          items.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              {editId === o.id ? (
                <div className="grid gap-3 sm:grid-cols-[1fr_3fr_auto_auto] items-start">
                  <input
                    className="rounded-lg border px-3 py-2"
                    value={editAuteur}
                    onChange={(e)=>setEditAuteur(e.target.value)}
                  />
                  <textarea
                    className="rounded-lg border px-3 py-2 min-h-[60px]"
                    value={editBericht}
                    onChange={(e)=>setEditBericht(e.target.value)}
                  />
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editBelangrijk} onChange={(e)=>setEditBelangrijk(e.target.checked)} />
                    Belangrijk
                  </label>
                  <div className="flex gap-2 justify-end">
                    <button onClick={()=>setEditId(null)} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Annuleer</button>
                    <button onClick={saveEdit} className="rounded-lg bg-green-600 px-3 py-2 text-white text-sm hover:bg-green-700">Opslaan</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-2 w-2 rounded-full ${o.belangrijk ? "bg-red-500" : "bg-zinc-300"}`} />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-500">
                      {new Date(o.datumISO).toISOString().slice(0,10)} • {o.tijd}{o.auteur ? ` • ${o.auteur}` : ""}
                    </div>
                    <div className="mt-1">{o.bericht}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={()=>toggleBelangrijk(o.id, o.belangrijk)}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50"
                    >
                      {o.belangrijk ? "Markeer normaal" : "Markeer belangrijk"}
                    </button>
                    <button
                      onClick={()=>startEdit(o)}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50"
                    >
                      Bewerk
                    </button>
                    <button
                      onClick={()=>remove(o.id)}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 text-red-600"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
