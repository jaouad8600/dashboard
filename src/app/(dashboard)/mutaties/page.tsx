"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listMutaties,
  onMutatiesChange,
  createMutatie,
  patchMutatie,
  deleteMutatie,
  setStatus,
  setType,
  type Mutatie,
  type MutatieType,
  type MutatieStatus,
} from "@/lib/mutaties";

const TYPE_LABEL: Record<MutatieType,string> = {
  FITNESS_ALLEEN: "Fitness alleen",
  SPORTVERBOD_TOTAAL: "Totaal sportverbod",
};
const STATUS_LABEL: Record<MutatieStatus,string> = {
  Open: "Open",
  "In behandeling": "In behandeling",
  Afgerond: "Afgerond",
};

function TypeBadge({ t }: { t: MutatieType }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1";
  if (t === "FITNESS_ALLEEN") return <span className={`${base} bg-blue-50 text-blue-700 ring-blue-200`}>{TYPE_LABEL[t]}</span>;
  return <span className={`${base} bg-red-50 text-red-700 ring-red-200`}>{TYPE_LABEL[t]}</span>;
}
function StatusBadge({ s }: { s: MutatieStatus }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1";
  if (s === "Open") return <span className={`${base} bg-amber-50 text-amber-700 ring-amber-200`}>{STATUS_LABEL[s]}</span>;
  if (s === "In behandeling") return <span className={`${base} bg-indigo-50 text-indigo-700 ring-indigo-200`}>{STATUS_LABEL[s]}</span>;
  return <span className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-200`}>{STATUS_LABEL[s]}</span>;
}

export default function MutatiesPage() {
  const [items, setItems] = useState<Mutatie[]>(listMutaties());
  useEffect(() => onMutatiesChange(() => setItems(listMutaties())), []);

  const openTotal = useMemo(() => items.filter(i => i.status !== "Afgerond").length, [items]);
  const openFitness = useMemo(() => items.filter(i => i.status !== "Afgerond" && i.type === "FITNESS_ALLEEN").length, [items]);
  const openVerbod = useMemo(() => items.filter(i => i.status !== "Afgerond" && i.type === "SPORTVERBOD_TOTAAL").length, [items]);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Sportmutaties</h1>
        <p className="text-zinc-600">Beheer fitness-alleen en totaal sportverbod.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-zinc-500">Open totaal</div>
          <div className="mt-1 text-3xl font-bold">{openTotal}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-zinc-500">Open – Fitness alleen</div>
          <div className="mt-1 text-3xl font-bold">{openFitness}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-zinc-500">Open – Totaal sportverbod</div>
          <div className="mt-1 text-3xl font-bold">{openVerbod}</div>
        </div>
      </div>

      <NewForm />

      <div className="rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr className="[&>th]:p-3 [&>th]:text-left">
              <th>Titel</th>
              <th>Groep</th>
              <th>Type</th>
              <th>Status</th>
              <th>Datum</th>
              <th className="text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="[&>tr>td]:p-3">
            {items.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="font-medium text-zinc-900">{m.titel}</td>
                <td className="text-zinc-700">{m.groep ?? "-"}</td>
                <td><TypeBadge t={m.type} /></td>
                <td><StatusBadge s={m.status} /></td>
                <td className="text-zinc-600">
                  {/* stabiele weergave uit ISO */}
                  {m.datumISO.slice(0,10)} {m.datumISO.slice(11,16)}
                </td>
                <td className="text-right">
                  <div className="inline-flex gap-2">
                    <select value={m.type} onChange={(e)=>setType(m.id, e.target.value as MutatieType)} className="rounded-lg border px-2 py-1 text-xs">
                      <option value="FITNESS_ALLEEN">{TYPE_LABEL.FITNESS_ALLEEN}</option>
                      <option value="SPORTVERBOD_TOTAAL">{TYPE_LABEL.SPORTVERBOD_TOTAAL}</option>
                    </select>
                    <select value={m.status} onChange={(e)=>setStatus(m.id, e.target.value as MutatieStatus)} className="rounded-lg border px-2 py-1 text-xs">
                      <option>Open</option>
                      <option>In behandeling</option>
                      <option>Afgerond</option>
                    </select>
                    <button onClick={()=>setStatus(m.id,"Afgerond")} className="rounded-lg border px-2 py-1 text-xs hover:bg-zinc-50">
                      Markeer afgerond
                    </button>
                    <button onClick={()=>deleteMutatie(m.id)} className="rounded-lg border px-2 py-1 text-xs text-red-700 hover:bg-red-50">
                      Verwijder
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-zinc-500">Nog geen mutaties.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewForm() {
  const [titel, setTitel] = useState("");
  const [groep, setGroep] = useState("");
  const [type, setTypeSel] = useState<MutatieType>("FITNESS_ALLEEN");
  const [auteur, setAuteur] = useState("");

  const submit = () => {
    if (!titel.trim()) return;
    createMutatie({
      titel: titel.trim(),
      type,
      groep: groep.trim() || undefined,
      auteur: auteur.trim() || undefined,
    });
    setTitel(""); setGroep(""); setAuteur("");
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_160px_180px_160px_auto]">
        <input value={titel} onChange={(e)=>setTitel(e.target.value)} placeholder="Titel…" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={groep} onChange={(e)=>setGroep(e.target.value)} placeholder="Groep (optioneel)" className="rounded-lg border px-3 py-2 text-sm" />
        <select value={type} onChange={(e)=>setTypeSel(e.target.value as MutatieType)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="FITNESS_ALLEEN">{TYPE_LABEL.FITNESS_ALLEEN}</option>
          <option value="SPORTVERBOD_TOTAAL">{TYPE_LABEL.SPORTVERBOD_TOTAAL}</option>
        </select>
        <input value={auteur} onChange={(e)=>setAuteur(e.target.value)} placeholder="Auteur (optioneel)" className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={submit} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Toevoegen
        </button>
      </div>
    </div>
  );
}
