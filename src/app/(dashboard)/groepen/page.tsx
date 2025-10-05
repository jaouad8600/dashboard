"use client";

import { useEffect, useMemo, useState } from "react";
import type { Groep, Kleur } from "@/lib/groepen.data";
import { KLEUR_LABELS } from "@/lib/groepen.data";

type ResGroep = Groep;

const KLEUREN: Kleur[] = ["GREEN", "YELLOW", "ORANGE", "RED"];
const BG: Record<Kleur, string> = {
  GREEN: "bg-emerald-600",
  YELLOW: "bg-amber-500",
  ORANGE: "bg-orange-500",
  RED: "bg-rose-600",
};
const SOFT_BG: Record<Kleur, string> = {
  GREEN: "bg-emerald-50",
  YELLOW: "bg-amber-50",
  ORANGE: "bg-orange-50",
  RED: "bg-rose-50",
};
const TEXT: Record<Kleur, string> = {
  GREEN: "text-emerald-700",
  YELLOW: "text-amber-700",
  ORANGE: "text-orange-700",
  RED: "text-rose-700",
};

export default function GroepenPage() {
  const [groepen, setGroepen] = useState<ResGroep[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/groepen", { cache: "no-store" });
    const data = (await r.json()) as ResGroep[];
    setGroepen(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeKleur(id: string, kleur: Kleur) {
    await fetch(`/api/groepen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kleur }),
    });
    await load();
  }

  async function addNote(id: string, tekst: string, auteur?: string) {
    await fetch(`/api/groepen/${id}/notities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tekst, auteur }),
    });
    await load();
  }

  async function removeNote(id: string, noteId: string) {
    await fetch(`/api/groepen/${id}/notities/${noteId}`, { method: "DELETE" });
    await load();
  }

  const sorted = useMemo(
    () => [...groepen].sort((a, b) => a.naam.localeCompare(b.naam)),
    [groepen]
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Groepen</h1>
      <p className="text-sm text-zinc-500">Beheer kleurstatus en notities per groep.</p>

      {/* Grid van kaarten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full text-sm text-zinc-500">Laden…</div>
        )}

        {!loading && sorted.map((g) => (
          <div key={g.id} className={`rounded-2xl border bg-white p-4 shadow-sm`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{g.naam}</div>
                <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${SOFT_BG[g.kleur]} ${TEXT[g.kleur]} border`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${BG[g.kleur]}`} />
                  <span>{KLEUR_LABELS[g.kleur]}</span>
                </div>
              </div>

              {/* kleurkeuze */}
              <div className="flex gap-2">
                {KLEUREN.map((k) => (
                  <button
                    key={k}
                    title={KLEUR_LABELS[k]}
                    onClick={() => changeKleur(g.id, k)}
                    className={`h-6 w-6 rounded-full border ${BG[k]} ${g.kleur === k ? "ring-2 ring-black" : ""}`}
                  />
                ))}
              </div>
            </div>

            {/* notities */}
            <div className="mt-4 space-y-3">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement & { note: HTMLInputElement; auteur: HTMLInputElement; };
                  const note = form.note.value.trim();
                  const auteur = form.auteur.value.trim();
                  if (note) addNote(g.id, note, auteur || undefined);
                  form.reset();
                }}
              >
                <input name="note" className="flex-1 rounded-lg border p-2" placeholder="Nieuwe notitie…" />
                <input name="auteur" className="w-36 rounded-lg border p-2" placeholder="Auteur" />
                <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Toevoegen</button>
              </form>

              {g.notities.length === 0 && (
                <div className="text-xs text-zinc-500">Nog geen notities.</div>
              )}

              {g.notities.map((n) => (
                <div key={n.id} className="rounded-xl border bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">
                    {new Date(n.createdAt).toLocaleString()}
                    {n.auteur ? ` • ${n.auteur}` : ""}
                  </div>
                  <div className="mt-1 text-sm">{n.tekst}</div>
                  <div className="mt-2 text-right">
                    <button onClick={() => removeNote(g.id, n.id)} className="text-xs text-red-600 hover:underline">
                      Verwijderen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
