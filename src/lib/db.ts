import { promises as fs } from 'fs';
import path from 'path';
import type { Database, SportItem } from '@/types/planning';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

async function fileExists(p: string) {
  try { await fs.stat(p); return true; } catch { return false; }
}

async function ensureDb(): Promise<Database> {
  if (!(await fileExists(DB_PATH))) {
    const initial: Database = { groepen: [], planning: { items: [] } };
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  try {
    const parsed: Database = JSON.parse(raw || '{}');
    // minimal shape guard
    if (!parsed.groepen) parsed.groepen = [];
    if (!parsed.planning) parsed.planning = { items: [] };
    if (!parsed.planning.items) parsed.planning.items = [];
    return parsed;
  } catch {
    const fallback: Database = { groepen: [], planning: { items: [] } };
    await fs.writeFile(DB_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

export async function readDb(): Promise<Database> {
  return ensureDb();
}

async function atomicWrite(obj: Database) {
  const tmp = DB_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf-8');
  await fs.rename(tmp, DB_PATH);
}

export async function writeDb(next: Database): Promise<void> {
  await atomicWrite(next);
}

export async function addItem(item: SportItem): Promise<SportItem> {
  const db = await readDb();
  db.planning.items.push(item);
  await writeDb(db);
  return item;
}

export async function updateItem(id: string, partial: Partial<SportItem>): Promise<SportItem | null> {
  const db = await readDb();
  const idx = db.planning.items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  db.planning.items[idx] = { ...db.planning.items[idx], ...partial };
  await writeDb(db);
  return db.planning.items[idx];
}

export async function deleteItem(id: string): Promise<boolean> {
  const db = await readDb();
  const before = db.planning.items.length;
  db.planning.items = db.planning.items.filter(i => i.id !== id);
  await writeDb(db);
  return db.planning.items.length !== before;
}

export function isSameDay(d1Iso: string, d2Iso: string) {
  const d1 = new Date(d1Iso);
  const d2 = new Date(d2Iso);
  return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth() === d2.getMonth()
      && d1.getDate() === d2.getDate();
}
