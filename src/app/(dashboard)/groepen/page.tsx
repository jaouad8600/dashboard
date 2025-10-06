"use client";
import { useEffect, useMemo, useState } from "react";

type Kleur = "GREEN"|"YELLOW"|"ORANGE"|"RED";
type Note = { id: string; tekst: string; auteur?: string; createdAt: string };
type Groep = { id: string; naam: string; afdeling: "EB"|"VLOED"; kleur: Kleur; notities: Note[] };

const KLEUR_LABEL: Record<Kleur,string> = { GREEN:"Groen", YELLOW:"Geel", ORANGE:"Oranje", RED:"Rood" };
const KLEUR_BG: Record<Kleur,string> = {
  GREEN:"bg-emerald-100 text-emerald-800",
  YELLOW:"bg-amber-100 text-amber-800",
  ORANGE:"bg-orange-100 text-orange-800",
  RED:"bg-rose-100 text-rose-800",
};

function asArray(x:any): Groep[] {
  if (Array.isArray(x)) return x;
  if (x && Array.isArray(x.list)) return x.list;
  if (x && typeof x === "object") return Object.values(x);
  return [];
}

export default function GroepenPage() {
  const [groepen, setGroepen] = useState<Groep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/groepen", { cache:"no-store" });
      if (!r.ok) throw new Error("API /api/groepen faalde");
      const raw = await r.json();
      setGroepen(asArray(raw));
    } catch (e:any) { setError(e.message||"Kon groepen niet laden"); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  async function updateKleur(id:string, kleur:Kleur) {
    const prev = groepen;
    setGroepen(prev.map(g=>g.id===id?{...g,kleur}:g));
    const r = await fetch(`/api/groepen/${id}/kleur`, {
      method:"PATCH", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ kleur })
    });
    if (!r.ok) { setGroepen(prev); alert("Kleur bijwerken mislukt"); }
  }

  async function addNote(id:string, tekst:string, auteur?:string) {
    const r = await fetch(`/api/groepen/${id}/notities`, {
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ tekst, auteur })
    });
    if (r.ok) {
      const note = await r.json() as Note;
      setGroepen(list => list.map(g => g.id===id ? { ...g, notities:[note, ...g.notities] } : g));
    } else { alert("Notitie toevoegen mislukt"); }
  }

  const eb = useMemo(()=> groepen.filter(g=>g.afdeling==="EB"), [groepen]);
  const vloed = useMemo(()=> groepen.filter(g=>g.afdeling==="VLOED"), [groepen]);

  if (loading) return <div className="p-6">Laden…</div>;
  if (error) return <div className="p-6 text-rose-600">{error}</div>;

  function GroupCard({ g }: { g: Groep }) {
    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="font-medium">{g.naam}</div>
          <span className={`text-xs px-2 py-1 rounded ${KLEUR_BG[g.kleur]}`}>{KLEUR_LABEL[g.kleur]}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(["GREEN","YELLOW","ORANGE","RED"] as Kleur[]).map(k=>(
            <button key={k} onClick={()=>updateKleur(g.id, k)}
              className={`text-xs rounded border px-2 py-1 ${g.kleur===k?"bg-zinc-900 text-white":"hover:bg-zinc-50"}`}>
              {KLEUR_LABEL[k]}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <form className="flex gap-2"
            onSubmit={async (e)=>{
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const fd = new FormData(form);
              const tekst = String(fd.get("tekst")||"").trim();
              const auteur = String(fd.get("auteur")||"").trim();
              if (!tekst) return;
              form.reset();
              await addNote(g.id, tekst, auteur||undefined);
            }}>
            <input name="tekst" placeholder="Nieuwe notitie…" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
            <input name="auteur" placeholder="Auteur" className="w-36 rounded-lg border px-3 py-2 text-sm" />
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Toevoegen</button>
          </form>

          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {g.notities.map(n=>(
              <div key={n.id} className="rounded-lg border bg-zinc-50 px-3 py-2 text-sm">
                <div className="text-xs text-zinc-500">
                  {new Date(n.createdAt).toLocaleString("nl-NL")} {n.auteur ? `• ${n.auteur}` : ""}
                </div>
                <div className="mt-1">{n.tekst}</div>
              </div>
            ))}
            {g.notities.length===0 && <div className="text-xs text-zinc-400">Nog geen notities.</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Groepen</h1>
        <p className="text-sm text-zinc-500">Kleurstatus en notities per groep.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Afdeling EB</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {eb.map(g => <GroupCard key={g.id} g={g} />)}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Afdeling Vloed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {vloed.map(g => <GroupCard key={g.id} g={g} />)}
        </div>
      </section>
    </div>
  );
}
