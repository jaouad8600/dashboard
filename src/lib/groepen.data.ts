export type Kleur = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export type GroepNote = {
  id: string;
  tekst: string;
  auteur?: string;
  createdAt: string;
};

export type Groep = {
  id: string;
  naam: string;
  kleur: Kleur;
  notities: GroepNote[];
};

const LABELS: Record<Kleur, string> = {
  GREEN: "Groen",
  YELLOW: "Geel",
  ORANGE: "Oranje",
  RED: "Rood",
};
export const KLEUR_LABELS = LABELS;

declare global {
  // eslint-disable-next-line no-var
  var __GROEP_STORE__: Groep[] | undefined;
}

const DEFAULT_NAMEN = [
  "Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf",
  "Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Dijk"
];

function makeId(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

const initial: Groep[] = DEFAULT_NAMEN.map((naam) => ({
  id: makeId(naam),
  naam,
  kleur: "GREEN",
  notities: [],
}));

const store: Groep[] = (globalThis as any).__GROEP_STORE__ ?? initial;
(globalThis as any).__GROEP_STORE__ = store;

export function listGroepen(): Groep[] {
  return store.map((g) => ({ ...g, notities: [...g.notities] }));
}

export function getGroep(id: string): Groep | undefined {
  return store.find((g) => g.id === id);
}

export function setGroepKleur(id: string, kleur: Kleur): Groep {
  const g = getGroep(id);
  if (!g) throw new Error("Groep niet gevonden");
  g.kleur = kleur;
  return { ...g, notities: [...g.notities] };
}

export function addGroepNotitie(id: string, tekst: string, auteur?: string): Groep {
  const g = getGroep(id);
  if (!g) throw new Error("Groep niet gevonden");
  const note: GroepNote = {
    id: crypto.randomUUID(),
    tekst: tekst.trim(),
    auteur: auteur?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  g.notities.unshift(note);
  return { ...g, notities: [...g.notities] };
}

export function updateGroepNotitie(id: string, noteId: string, data: Partial<Pick<GroepNote, "tekst" | "auteur">>): Groep {
  const g = getGroep(id);
  if (!g) throw new Error("Groep niet gevonden");
  const n = g.notities.find((n) => n.id === noteId);
  if (!n) throw new Error("Notitie niet gevonden");
  if (typeof data.tekst === "string") n.tekst = data.tekst;
  if (typeof data.auteur === "string") n.auteur = data.auteur || undefined;
  return { ...g, notities: [...g.notities] };
}

export function removeGroepNotitie(id: string, noteId: string): Groep {
  const g = getGroep(id);
  if (!g) throw new Error("Groep niet gevonden");
  g.notities = g.notities.filter((n) => n.id !== noteId);
  return { ...g, notities: [...g.notities] };
}

export function getRodeGroepen(): Groep[] {
  return listGroepen().filter((g) => g.kleur === "RED");
}
