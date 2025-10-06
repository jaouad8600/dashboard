import 'server-only';
import { randomUUID } from 'node:crypto';
import { readJSON, writeJSON } from '@/server/fsjson';

export type Mutatie = {
  id: string;
  leerling?: string;
  onderwerp: string;
  status: 'open' | 'afgehandeld';
  datum: string;        // ISO string
  opmerking?: string;
};

type DB = { mutaties: Mutatie[] };

const DB_PATH = 'data/app-data.json';

async function load(): Promise<DB> {
  return readJSON<DB>(DB_PATH, { mutaties: [] });
}
async function save(db: DB) { await writeJSON(DB_PATH, db); }

export async function listMutaties(): Promise<Mutatie[]> {
  const db = await load();
  return [...db.mutaties].sort((a,b) => b.datum.localeCompare(a.datum));
}

export async function addMutatie(input: Omit<Mutatie,'id'>): Promise<Mutatie> {
  const db = await load();
  const item: Mutatie = { id: randomUUID(), ...input };
  db.mutaties.push(item);
  await save(db);
  return item;
}

export async function patchMutatie(id: string, patch: Partial<Mutatie>): Promise<Mutatie|null> {
  const db = await load();
  const i = db.mutaties.findIndex(m => m.id === id);
  if (i < 0) return null;
  db.mutaties[i] = { ...db.mutaties[i], ...patch };
  await save(db);
  return db.mutaties[i];
}

export async function deleteMutatie(id: string): Promise<boolean> {
  const db = await load();
  const before = db.mutaties.length;
  db.mutaties = db.mutaties.filter(m => m.id !== id);
  await save(db);
  return db.mutaties.length < before;
}

export async function summaryMutaties(todayISO: string) {
  const list = await listMutaties();
  const open = list.filter(m => m.status !== 'afgehandeld').length;
  const vandaag = list.filter(m => (m.datum ?? '').slice(0,10) === todayISO).length;
  return { open, vandaag, totaal: list.length };
}
