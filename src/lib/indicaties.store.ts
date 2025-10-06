import 'server-only';
import { randomUUID } from 'node:crypto';
import { readJSON, writeJSON } from '@/server/fsjson';

export type Indicatie = {
  id: string;
  naam: string;          // leerling of onderwerp
  type?: string;         // bijv: sport, zorg, etc.
  status: 'open' | 'in-behandeling' | 'afgerond';
  start?: string;        // ISO date
  eind?: string;         // ISO date
  opmerking?: string;    // korte notitie
  inhoud?: string;       // geplakte tekst/inhoud
  createdAt: string;     // ISO datetime
};

type DB = { indicaties: Indicatie[] };
const DB_PATH = 'data/app-data.json';

async function load(): Promise<DB> {
  return readJSON<DB>(DB_PATH, { indicaties: [] as Indicatie[] });
}
async function save(db: DB) { await writeJSON(DB_PATH, db); }

export async function listIndicaties(): Promise<Indicatie[]> {
  const db = await load();
  return [...db.indicaties].sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function addIndicatie(input: Omit<Indicatie,'id'|'createdAt'>): Promise<Indicatie> {
  const db = await load();
  const item: Indicatie = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
  db.indicaties.push(item);
  await save(db);
  return item;
}

export async function patchIndicatie(id: string, patch: Partial<Indicatie>): Promise<Indicatie|null> {
  const db = await load();
  const i = db.indicaties.findIndex(x => x.id === id);
  if (i < 0) return null;
  db.indicaties[i] = { ...db.indicaties[i], ...patch };
  await save(db);
  return db.indicaties[i];
}

export async function deleteIndicatie(id: string): Promise<boolean> {
  const db = await load();
  const before = db.indicaties.length;
  db.indicaties = db.indicaties.filter(x => x.id !== id);
  await save(db);
  return db.indicaties.length < before;
}

export async function summaryIndicaties() {
  const list = await listIndicaties();
  const open = list.filter(x => x.status === 'open').length;
  const inBehandeling = list.filter(x => x.status === 'in-behandeling').length;
  const afgerond = list.filter(x => x.status === 'afgerond').length;
  const totaal = list.length;
  return { open, inBehandeling, afgerond, totaal };
}
