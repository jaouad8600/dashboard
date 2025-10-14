'use client';
import { useEffect, useState } from 'react';

type Groep = { id: string; naam?: string; name?: string; title?: string; kleur?: string; };

const KLEUREN: {key:string; label:string; hex:string}[] = [
  { key:'rood',   label:'Rood',   hex:'#ef4444' },
  { key:'oranje', label:'Oranje', hex:'#f97316' },
  { key:'geel',   label:'Geel',   hex:'#f59e0b' },
  { key:'groen',  label:'Groen',  hex:'#22c55e' },
  { key:'blauw',  label:'Blauw',  hex:'#3b82f6' },
  { key:'paars',  label:'Paars',  hex:'#8b5cf6' },
  { key:'grijs',  label:'Grijs',  hex:'#6b7280' },
];

function naamVan(g: Groep) { return g.naam || g.name || g.title || g.id; }
function kleurNaarHex(k?: string) {
  if (!k) return '#e5e7eb';
  const hit = KLEUREN.find(x => x.key === (k||'').toLowerCase());
  return hit?.hex ?? '#e5e7eb';
}

export default function GroepenPage() {
  const [groepen, setGroepen] = useState<Groep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function laad() {
    setLoading(true); setFout(null);
    try {
      const r = await fetch('/api/groepen', { cache:'no-store' });
      const j = await r.json();
      const arr: Groep[] = Array.isArray(j) ? j
        : (Array.isArray(j.groepen) ? j.groepen
        : (Array.isArray(j.groups) ? j.groups : []));
      setGroepen(arr);
    } catch {
      setFout('Kon groepen niet laden');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { laad(); }, []);

  async function kiesKleur(id: string, kleurKey: string) {
    setSaving(id); setFout(null);
    try {
      const r = await fetch(`/api/groepen/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ kleur: kleurKey }),
      });
      if (!r.ok) throw new Error();
      const { groep } = await r.json();
      setGroepen(prev => prev.map(g => g.id === id ? { ...g, kleur: groep?.kleur ?? kleurKey } : g));
    } catch {
      setFout('Opslaan mislukt');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Groepen</h1>
        <button onClick={laad} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
          Herladen
        </button>
      </div>

      {fout && <div className="p-3 border border-red-200 bg-red-50 rounded">{fout}</div>}
      {loading ? (
        <div className="text-gray-500">Laden…</div>
      ) : (
        <div className="grid gap-4">
          {groepen.map(g => (
            <div key={g.id} className="p-4 border rounded-xl bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: kleurNaarHex(g.kleur) }} />
                  <div className="font-medium">{naamVan(g)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {KLEUREN.map(k => {
                    const actief = (g.kleur || '').toLowerCase() === k.key;
                    return (
                      <button
                        key={k.key}
                        onClick={() => kiesKleur(g.id, k.key)}
                        disabled={saving === g.id}
                        title={k.label}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${actief ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                        style={{ backgroundColor: k.hex }}
                      >
                        <span className="sr-only">{k.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {saving === g.id && <div className="text-sm text-gray-500 mt-2">Opslaan…</div>}
            </div>
          ))}
          {groepen.length === 0 && <div className="text-gray-500">Geen groepen gevonden.</div>}
        </div>
      )}
    </div>
  );
}
