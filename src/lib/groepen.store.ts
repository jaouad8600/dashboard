import "server-only";
import { readJSON, writeJSON } from "./fsjson";
import { randomUUID } from "node:crypto";

export type Kleur = "GREEN" | "YELLOW" | "ORANGE" | "RED";
export type Note = {
  id: string;
  tekst: string;
  auteur?: string;
  createdAt: string;
};
export type Groep = {
  id: string;
  naam: string;
  afdeling?: "EB" | "VLOED"; // optioneel; UI toont secties als aanwezig
  kleur: Kleur;
  notities: Note[];
};

type DB = {
  groepen: { list: Groep[] };
  indicaties: any[];
  mutaties: any[];
  overdrachten: any[];
  planning: any;
};

const SEED_EB = [
  "Poel",
  "Lier",
  "Zijl",
  "Nes",
  "Vliet",
  "Gaag",
  "Kust",
  "Golf",
];
const SEED_VLOED = [
  "Zift",
  "Lei",
  "Kade",
  "Kreek",
  "Duin",
  "Rak",
  "Bron",
  "Dijk",
];

export async function listGroepen(): Promise<Groep[]> {
  const db = await readJSON<DB>();
  if (!db.groepen) db.groepen = { list: [] };
  // seed als leeg
  if (!db.groepen.list || db.groepen.list.length === 0) {
    const seeded: Groep[] = [
      ...SEED_EB.map((n) => ({
        id: randomUUID(),
        naam: n,
        afdeling: "EB" as "EB",
        kleur: "GREEN" as Kleur,
        notities: [],
      })),
      ...SEED_VLOED.map((n) => ({
        id: randomUUID(),
        naam: n,
        afdeling: "VLOED" as "VLOED",
        kleur: "GREEN" as Kleur,
        notities: [],
      })),
    ];
    db.groepen.list = seeded;
    await writeJSON(db);
  }
  return db.groepen.list;
}

export async function getGroep(id: string): Promise<Groep | undefined> {
  const list = await listGroepen();
  return list.find((g) => g.id === id);
}

export async function addGroep(input: {
  naam: string;
  afdeling?: "EB" | "VLOED";
  kleur?: Kleur;
}): Promise<Groep> {
  const db = await readJSON<DB>();
  if (!db.groepen) db.groepen = { list: [] };
  const nieuw: Groep = {
    id: randomUUID(),
    naam: String(input.naam ?? "").trim(),
    afdeling: input.afdeling,
    kleur: input.kleur ?? "GREEN",
    notities: [],
  };
  if (!nieuw.naam) throw new Error("naam verplicht");
  db.groepen.list.push(nieuw);
  await writeJSON(db);
  return nieuw;
}

export async function patchGroep(
  id: string,
  patch: Partial<Pick<Groep, "naam" | "afdeling" | "kleur">>,
): Promise<Groep> {
  const db = await readJSON<DB>();
  const idx = db.groepen.list.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error("groep niet gevonden");
  const cur = db.groepen.list[idx];
  db.groepen.list[idx] = { ...cur, ...patch };
  await writeJSON(db);
  return db.groepen.list[idx];
}

export async function removeGroep(id: string): Promise<void> {
  const db = await readJSON<DB>();
  db.groepen.list = db.groepen.list.filter((g) => g.id !== id);
  await writeJSON(db);
}

export async function addNote(
  groepId: string,
  tekst: string,
  auteur?: string,
): Promise<Note> {
  const db = await readJSON<DB>();
  const g = db.groepen.list.find((x) => x.id === groepId);
  if (!g) throw new Error("groep niet gevonden");
  const note: Note = {
    id: randomUUID(),
    tekst: String(tekst ?? "").trim(),
    auteur,
    createdAt: new Date().toISOString(),
  };
  if (!note.tekst) throw new Error("tekst verplicht");
  g.notities.unshift(note);
  await writeJSON(db);
  return note;
}

export async function updateNote(
  groepId: string,
  noteId: string,
  patch: Partial<Pick<Note, "tekst" | "auteur">>,
): Promise<Note> {
  const db = await readJSON<DB>();
  const g = db.groepen.list.find((x) => x.id === groepId);
  if (!g) throw new Error("groep niet gevonden");
  const i = g.notities.findIndex((n) => n.id === noteId);
  if (i === -1) throw new Error("notitie niet gevonden");
  g.notities[i] = { ...g.notities[i], ...patch };
  await writeJSON(db);
  return g.notities[i];
}

export async function removeNote(
  groepId: string,
  noteId: string,
): Promise<void> {
  const db = await readJSON<DB>();
  const g = db.groepen.list.find((x) => x.id === groepId);
  if (!g) throw new Error("groep niet gevonden");
  g.notities = g.notities.filter((n) => n.id !== noteId);
  await writeJSON(db);
}

export async function listRodeGroepen(): Promise<Groep[]> {
  const list = await listGroepen();
  return list.filter((g) => g.kleur === "RED");
}
