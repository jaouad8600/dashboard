// Eenvoudige JSON-bestandsopslag voor Groepen
import { promises as fs } from "fs";
import path from "path";

export type Notitie = {
  id: string;
  tekst: string;
  auteur?: string;
  createdAt: string; // ISO
};
export type Groep = {
  id: string;
  naam: string;
  kleur: "gray" | "green" | "yellow" | "orange" | "red";
  notities: Notitie[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "groepen.json");

function uuid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

async function ensureSeed() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(FILE); return; } catch {}
  const seed: Groep[] = [
    { id: uuid(), naam: "Poel",  kleur: "red",   notities: [] },
    { id: uuid(), naam: "Vloed", kleur: "green", notities: [] },
    { id: uuid(), naam: "Eb",    kleur: "yellow", notities: [] },
  ];
  await fs.writeFile(FILE, JSON.stringify(seed, null, 2), "utf8");
}

export async function loadGroepen(): Promise<Groep[]> {
  await ensureSeed();
  const raw = await fs.readFile(FILE, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveGroepen(rows: Groep[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function setGroepKleur(id: string, kleur: Groep["kleur"]) {
  const rows = await loadGroepen();
  const i = rows.findIndex(g => g.id === id);
  if (i === -1) return null;
  rows[i].kleur = kleur;
  await saveGroepen(rows);
  return rows[i];
}

export async function addGroepNotitie(id: string, tekst: string, auteur?: string) {
  const rows = await loadGroepen();
  const i = rows.findIndex(g => g.id === id);
  if (i === -1) return null;
  const note: Notitie = { id: uuid(), tekst, auteur, createdAt: new Date().toISOString() };
  rows[i].notities.unshift(note);
  await saveGroepen(rows);
  return note;
}

export async function updateGroepNotitie(id: string, noteId: string, patch: Partial<Pick<Notitie,"tekst"|"auteur">>) {
  const rows = await loadGroepen();
  const g = rows.find(x => x.id === id);
  if (!g) return null;
  const n = g.notities.find(x => x.id === noteId);
  if (!n) return null;
  if (typeof patch.tekst === "string") n.tekst = patch.tekst;
  if (typeof patch.auteur === "string") n.auteur = patch.auteur;
  await saveGroepen(rows);
  return n;
}

export async function removeGroepNotitie(id: string, noteId: string) {
  const rows = await loadGroepen();
  const g = rows.find(x => x.id === id);
  if (!g) return false;
  const orig = g.notities.length;
  g.notities = g.notities.filter(n => n.id !== noteId);
  const changed = g.notities.length !== orig;
  if (changed) await saveGroepen(rows);
  return changed;
}
