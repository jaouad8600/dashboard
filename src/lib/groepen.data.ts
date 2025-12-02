import { readJSON, writeJSON, uid } from "./store";

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

const FILE = "groepen.json";

const DEFAULT_NAMEN = [
  "Poel A",
  "Poel B",
  "Lier",
  "Zijl",
  "Nes",
  "Vliet",
  "Gaag",
  "Kust",
  "Golf",
  "Zift",
  "Lei",
  "Kade",
  "Kreek",
  "Duin",
  "Rak",
  "Bron",
  "Dijk",
];

export async function loadGroepen(): Promise<Groep[]> {
  let data = await readJSON<Groep[]>(FILE, []);
  if (data.length === 0) {
    data = DEFAULT_NAMEN.map((n) => ({
      id: uid("grp"),
      naam: n,
      kleur: "GREEN",
      notities: [],
    }));
    await writeJSON(FILE, data);
  }
  return data;
}

export async function saveGroepen(list: Groep[]) {
  await writeJSON(FILE, list);
}

export async function setKleur(groepId: string, kleur: Kleur) {
  const list = await loadGroepen();
  const g = list.find((x) => x.id === groepId);
  if (!g) throw new Error("Groep niet gevonden");
  g.kleur = kleur;
  await saveGroepen(list);
  return g;
}

export async function addNotitie(
  groepId: string,
  tekst: string,
  auteur?: string,
) {
  const list = await loadGroepen();
  const g = list.find((x) => x.id === groepId);
  if (!g) throw new Error("Groep niet gevonden");
  const note: GroepNote = {
    id: uid("note"),
    tekst,
    auteur,
    createdAt: new Date().toISOString(),
  };
  g.notities.unshift(note);
  await saveGroepen(list);
  return note;
}

export async function updateNotitie(
  groepId: string,
  noteId: string,
  tekst?: string,
  auteur?: string,
) {
  const list = await loadGroepen();
  const g = list.find((x) => x.id === groepId);
  if (!g) throw new Error("Groep niet gevonden");
  const n = g.notities.find((nn) => nn.id === noteId);
  if (!n) throw new Error("Notitie niet gevonden");
  if (typeof tekst === "string") n.tekst = tekst;
  if (typeof auteur === "string") n.auteur = auteur;
  await saveGroepen(list);
  return n;
}

export async function removeNotitie(groepId: string, noteId: string) {
  const list = await loadGroepen();
  const g = list.find((x) => x.id === groepId);
  if (!g) throw new Error("Groep niet gevonden");
  g.notities = g.notities.filter((n) => n.id !== noteId);
  await saveGroepen(list);
  return true;
}

export async function getRodeGroepen() {
  const list = await loadGroepen();
  const rode = list.filter((g) => g.kleur === "RED");
  return {
    count: rode.length,
    items: rode.map((g) => ({ id: g.id, naam: g.naam, kleur: g.kleur })),
  };
}
