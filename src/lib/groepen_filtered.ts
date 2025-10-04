export type Groep = { id: string; naam: string; kleur: string };
export type GroepNotitie = { id: string; tekst: string; auteur?: string; datumISO: string };

const BASE = "/api/groepen";

export async function listGroepen(): Promise<Groep[]> {
  const r = await fetch(BASE, { cache: "no-store" }).catch(()=>null);
  if (!r || !r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : [];
}

export async function setKleur(id: string, kleur: string) {
  const r = await fetch(`${BASE}/${id}`, {
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ kleur })
  });
  if (!r.ok) throw new Error("setKleur mislukt");
  return r.json();
}

export async function listGroepNotities(id: string): Promise<GroepNotitie[]> {
  const r = await fetch(`${BASE}/${id}/notities`, { cache:"no-store" }).catch(()=>null);
  if (!r || !r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : [];
}

export async function addGroepNotitie(id: string, tekst: string, auteur?: string) {
  const clean = String(tekst||"").trim();
  if (!id) throw new Error("id ontbreekt");
  if (!clean) throw new Error("tekst ontbreekt");
  const r = await fetch(`${BASE}/${id}/notities`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ tekst: clean, auteur: auteur?.trim() || undefined })
  });
  if (!r.ok) throw new Error("addGroepNotitie mislukt");
  return r.json() as Promise<GroepNotitie>;
}

export async function updateGroepNotitie(groepId: string, noteId: string, data: { tekst?: string; auteur?: string }) {
  if (!groepId || !noteId) throw new Error("groepId/noteId ontbreken");
  const r = await fetch(`${BASE}/${groepId}/notities/${noteId}`, {
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });
  if (!r.ok) throw new Error("updateGroepNotitie mislukt");
  return r.json() as Promise<GroepNotitie>;
}

export async function removeGroepNotitie(groepId: string, noteId: string) {
  if (!groepId || !noteId) throw new Error("groepId/noteId ontbreken");
  const r = await fetch(`${BASE}/${groepId}/notities/${noteId}`, { method:"DELETE" });
  if (!r.ok) throw new Error("removeGroepNotitie mislukt");
  return true;
}

// legacy hook, no-op
export function onGroepenChange(_: () => void) { return () => {}; }

const api = { listGroepen, setKleur, listGroepNotities, addGroepNotitie, updateGroepNotitie, removeGroepNotitie, onGroepenChange };
export default api;
