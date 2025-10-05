"use client";
import { useEffect, useMemo, useState } from "react";

type Notitie = { id: string; tekst: string; auteur?: string; createdAt?: string };
type Groep   = { id: string; naam: string; kleur: "gray"|"green"|"yellow"|"orange"|"red"; notities: Notitie[] };

const KLEUREN: Array<{ key: Groep["kleur"]; label: string }> = [
  { key: "green",  label: "Groen" },
  { key: "yellow", label: "Geel" },
  { key: "orange", label: "Oranje" },
  { key: "red",    label: "Rood" },
  { key: "gray",   label: "Onbekend" },
];

function badgeClass(k: Groep["kleur"]) {
  const map: Record<Groep["kleur"], string> = {
    red:    "bg-red-50 text-red-700 ring-red-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    green:  "bg-green-50 text-green-700 ring-green-200",
    gray:   "bg-zinc-50 text-zinc-700 ring-zinc-200",
  };
  return map[k] || map.gray;
}

export default function GroepenPage() {
  const [raw, setRaw] = useState<any>([]);
  const groepen: Groep[] = useMemo(() => Array.isArray(raw) ? raw : [], [raw]);
  const [filter, setFilter] = useState<Groep["kleur"] | "alle">("alle");

  async function load() {
    const res = await fetch("/api/groepen", { cache: "no-store" });
    const data = await res.json();
    setRaw(Array.isArray(data) ? data : []);
  }
  useEffect(()=>{ load(); }, []);

  const zichtbaar = useMemo(()=>{
    if (filter === "alle") return groepen;
    return groepen.filter(g => g.kleur === filter);
  }, [groepen, filter]);

  async function setKleur(id: string, kleur: Groep["kleur"]) {
    await fetch(`/api/groepen/${id}/kleur`, {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ kleur }),
    });
    await load();
  }

  async function addNote(id: string, tekst: string, auteur?: string) {
    await fetch(`/api/groepen/${id}/notities`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ tekst, auteur }),
    });
    await load();
  }
  async function updateNote(id: string, noteId: string, patch: Partial<Pick<Notitie,"tekst"|"auteur">>) {
    await fetch(`/api/groepen/${id}/notities/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  }
  async function removeNote(id: string, noteId: string) {
    await fetch(`/api/groepen/${id}/notities/${noteId}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Groepen</h1>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e)=>setFilter(e.target.value as any)}
                  className="rounded-lg border px-3 py-2 text-sm">
            <option value="alle">Alle kleuren</option>
            {KLEUREN.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
          <a href="/dashboard" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Terug naar dashboard</a>
        </div>
      </div>

      {zichtbaar.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-zinc-500">
          Geen groepen gevonden.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zichtbaar.map(g => (
            <div key={g.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${badgeClass(g.kleur)}`}>
                    <span className="h-2 w-2 rounded-full bg-current"></span>
                    {g.kleur}
                  </span>
                  <div className="text-lg font-semibold">{g.naam}</div>
                </div>
                <select value={g.kleur} onChange={(e)=>setKleur(g.id, e.target.value as Groep["kleur"])}
                        className="rounded-md border px-2 py-1 text-sm">
                  {KLEUREN.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </div>

              {/* Notities lijst */}
              <div className="mt-3 space-y-2">
                {(g.notities || []).slice(0, 6).map(n => (
                  <div key={n.id} className="rounded-md border px-3 py-2 text-sm">
                    <div className="text-zinc-800 break-words">{n.tekst}</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                      <div>{n.auteur ? `${n.auteur} • ` : ""}{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
                      <div className="flex gap-1">
                        <button
                          onClick={()=>{
                            const nieuw = prompt("Tekst aanpassen:", n.tekst || "");
                            if (nieuw !== null) updateNote(g.id, n.id, { tekst: nieuw });
                          }}
                          className="rounded border px-2 py-0.5 hover:bg-zinc-50"
                        >Bewerk</button>
                        <button
                          onClick={()=> removeNote(g.id, n.id)}
                          className="rounded border px-2 py-0.5 hover:bg-zinc-50 text-red-600"
                        >Verwijder</button>
                      </div>
                    </div>
                  </div>
                ))}
                {g.notities?.length > 6 && (
                  <div className="text-xs text-zinc-500">+{g.notities.length - 6} meer…</div>
                )}
              </div>

              {/* Nieuwe notitie */}
              <NieuweNotitie onAdd={(tekst, auteur)=>addNote(g.id, tekst, auteur)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NieuweNotitie({ onAdd }: { onAdd: (tekst: string, auteur?: string)=>void }) {
  const [tekst, setTekst] = useState("");
  const [auteur, setAuteur] = useState("");

  return (
    <div className="mt-3 rounded-md border bg-zinc-50 p-3">
      <div className="text-sm mb-2 font-medium">Nieuwe notitie</div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-2">
        <input
          className="rounded-md border px-2 py-1 text-sm"
          placeholder="Notitietekst"
          value={tekst}
          onChange={(e)=>setTekst(e.target.value)}
        />
        <input
          className="rounded-md border px-2 py-1 text-sm"
          placeholder="Auteur (optioneel)"
          value={auteur}
          onChange={(e)=>setAuteur(e.target.value)}
        />
        <button
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
          onClick={()=>{
            const t = tekst.trim();
            if (!t) return;
            onAdd(t, auteur.trim() || undefined);
            setTekst(""); setAuteur("");
          }}
        >
          Toevoegen
        </button>
      </div>
    </div>
  );
}
