export type Groep = { id: string; naam: string; kleur: string };
export type GroepNotitie = { tekst: string; auteur?: string; datumISO: string };

const BASE = "/api/groepen";

export async function listGroepen(): Promise<Groep[]> {
  const r = await fetch(BASE, { cache: "no-store" }).catch(() => null);
  if (!r || !r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function setKleur(id: string, kleur: string) {
  const r = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kleur }),
  });
  if (!r.ok) throw new Error("setKleur mislukt");
  return r.json();
}

export async function addGroepNotitie(id: string, tekst: string, auteur?: string) {
  if (!id) throw new Error("id ontbreekt");
  const clean = String(tekst || "").trim();
  if (!clean) throw new Error("tekst ontbreekt");
  const r = await fetch(`${BASE}/${id}/notities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tekst: clean, auteur: auteur?.trim() || undefined }),
  });
  if (!r.ok) throw new Error("addGroepNotitie mislukt");
  return r.json() as Promise<GroepNotitie>;
}

/** Legacy no-op zodat oude listeners niet crashen */
export function onGroepenChange(_: () => void) { return () => {}; }

/** default export erbij voor slordige imports */
const api = { listGroepen, setKleur, addGroepNotitie, onGroepenChange };
export default api;
