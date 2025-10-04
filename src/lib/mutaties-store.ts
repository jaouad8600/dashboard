export type MutatieStatus = "Open" | "In behandeling" | "Afgerond";
export type MutatieActie = "Toegevoegd" | "Bewerkt" | "Verwijderd" | "Status";
export type Severity = "laag" | "normaal" | "hoog";

export type Mutatie = {
  id: string;
  datum: string;                 // ISO
  medewerker: string;
  locatie?: string;
  actie: MutatieActie;
  beschrijving: string;
  status: MutatieStatus;
  severity?: Severity;
};

const data: Mutatie[] = [
  {
    id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    datum: new Date().toISOString(),
    medewerker: "Beheer",
    locatie: "Gym",
    actie: "Toegevoegd",
    beschrijving: "Demo-melding: basketbalnet vervangen",
    status: "Afgerond",
    severity: "laag",
  },
  {
    id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    datum: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    medewerker: "Systeem",
    locatie: "Dojo",
    actie: "Toegevoegd",
    beschrijving: "Demo-melding: matten gecontroleerd",
    status: "In behandeling",
    severity: "normaal",
  },
];

export function list(): Mutatie[] {
  return [...data].sort((a,b)=>new Date(b.datum).getTime()-new Date(a.datum).getTime());
}
export function add(input: Omit<Mutatie,"id"|"datum"|"actie"> & { datum?: string }): Mutatie {
  const nieuw: Mutatie = {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    datum: input.datum ?? new Date().toISOString(),
    actie: "Toegevoegd",
  };
  data.push(nieuw);
  return nieuw;
}
export function patch(id: string, partial: Partial<Mutatie>): Mutatie | null {
  const idx = data.findIndex(m => m.id === id);
  if (idx === -1) return null;
  const next: Mutatie = { ...data[idx], ...partial, actie: partial.status ? "Status" : "Bewerkt" };
  data[idx] = next;
  return next;
}
export function remove(id: string): boolean {
  const idx = data.findIndex(m => m.id === id);
  if (idx === -1) return false;
  data.splice(idx,1);
  return true;
}
