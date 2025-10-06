export type Kleur = "GREEN" | "YELLOW" | "ORANGE" | "RED";
export type GroepNote = { id: string; tekst: string; auteur?: string; createdAt: string };
export type Groep = {
  id: string;
  naam: string;
  afdeling: "EB" | "VLOED";
  kleur: Kleur;
  notities: GroepNote[];
};

let _groups: Groep[] | null = null;

// Jouw definitieve sets
const EB: string[]    = ["Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf"];
const VLOED: string[] = ["Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Dijk"];

function slug(s: string) { return s.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9\-]/g,""); }

function init(): Groep[] {
  if (_groups) return _groups;
  _groups = [
    ...EB.map(n => ({ id: slug(n), naam: n, afdeling: "EB" as const, kleur: "GREEN" as Kleur, notities: [] })),
    ...VLOED.map(n => ({ id: slug(n), naam: n, afdeling: "VLOED" as const, kleur: "GREEN" as Kleur, notities: [] })),
  ];
  return _groups;
}

export function allGroepen(): Groep[] { return init(); }
export function getGroep(id: string): Groep | undefined { return init().find(g => g.id === id); }

export function setKleur(id: string, kleur: Kleur): Groep | undefined {
  const g = getGroep(id);
  if (g) g.kleur = kleur;
  return g;
}

export function addNote(id: string, tekst: string, auteur?: string): GroepNote | undefined {
  const g = getGroep(id);
  if (!g) return;
  const note: GroepNote = { id: crypto.randomUUID(), tekst, auteur, createdAt: new Date().toISOString() };
  g.notities.unshift(note);
  return note;
}

export function updateNote(id: string, noteId: string, tekst?: string, auteur?: string): GroepNote | undefined {
  const g = getGroep(id);
  if (!g) return;
  const n = g.notities.find(x => x.id === noteId);
  if (!n) return;
  if (typeof tekst === "string") n.tekst = tekst;
  if (typeof auteur === "string") n.auteur = auteur;
  return n;
}

export function removeNote(id: string, noteId: string): boolean {
  const g = getGroep(id);
  if (!g) return false;
  const before = g.notities.length;
  g.notities = g.notities.filter(n => n.id !== noteId);
  return g.notities.length !== before;
}

export function rodeGroepen() {
  const list = allGroepen().filter(g => g.kleur === "RED");
  return { count: list.length, items: list.map(g => ({ id: g.id, naam: g.naam, kleur: g.kleur })) };
}
