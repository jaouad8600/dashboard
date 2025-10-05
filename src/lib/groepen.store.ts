import fs from "fs";
import path from "path";
import { Groep, GroupColor, Note, makeDefault } from "./groepen.data";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "groepen.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    const init = makeDefault();
    fs.writeFileSync(FILE, JSON.stringify(init, null, 2), "utf8");
  }
}

export function readAll(): Groep[] {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as Groep[];
  } catch {}
  const fallback = makeDefault();
  try {
    fs.writeFileSync(FILE, JSON.stringify(fallback, null, 2), "utf8");
  } catch {}
  return fallback;
}

export function writeAll(rows: Groep[]) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(rows, null, 2), "utf8");
}

export function setKleur(groepId: string, kleur: GroupColor): Groep | null {
  const all = readAll();
  const idx = all.findIndex((g) => g.id === groepId);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], kleur };
  writeAll(all);
  return all[idx];
}

export function addNotitie(groepId: string, tekst: string, auteur?: string): Note | null {
  const all = readAll();
  const idx = all.findIndex((g) => g.id === groepId);
  if (idx < 0) return null;
  const note: Note = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    tekst,
    auteur: auteur?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  const g = all[idx];
  g.notities = [note, ...(g.notities || [])];
  all[idx] = g;
  writeAll(all);
  return note;
}
