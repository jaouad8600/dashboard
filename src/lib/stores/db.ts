import 'server-only';
import { randomUUID } from 'node:crypto';
import { readJSON, writeJSON } from '@/server/fsjson';
import type { DB, Indicatie, Mutatie, Groep, Kleur } from './schema';

const PATH = 'data/app-data.json';
const SEED_GROEPEN = [
  "Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf",
  "Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Dijk"
];

async function load(): Promise<DB> {
  const db = await readJSON<DB>(PATH, { indicaties: [], mutaties: [], groepen: { list: [] } });
  if (!db.groepen) db.groepen = { list: [] };
  if (!Array.isArray(db.groepen.list)) db.groepen.list = [];
  if (db.groepen.list.length === 0) {
    db.groepen.list = SEED_GROEPEN.map(n => ({
      id: n.toLowerCase(),
      naam: n,
      kleur: 'GREEN',
      notities: []
    }));
    await writeJSON(PATH, db);
  }
  if (!Array.isArray(db.indicaties)) db.indicaties = [];
  if (!Array.isArray(db.mutaties)) db.mutaties = [];
  return db;
}
async function save(db: DB) { await writeJSON(PATH, db); }

/* ---------- Indicaties ---------- */
export async function listIndicaties(): Promise<Indicatie[]> {
  const db = await load();
  return [...db.indicaties].sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
}
export async function addIndicatie(input: Omit<Indicatie,'id'|'createdAt'>): Promise<Indicatie> {
  const db = await load();
  const row: Indicatie = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
  db.indicaties.push(row); await save(db); return row;
}
export async function patchIndicatie(id: string, patch: Partial<Indicatie>) {
  const db = await load();
  const i = db.indicaties.findIndex(x => x.id === id);
  if (i < 0) return null;
  db.indicaties[i] = { ...db.indicaties[i], ...patch };
  await save(db);
  return db.indicaties[i];
}
export async function deleteIndicatie(id: string) {
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
  return { open, inBehandeling, afgerond, totaal: list.length };
}

/* ---------- Mutaties ---------- */
export async function listMutaties(): Promise<Mutatie[]> {
  const db = await load();
  return [...db.mutaties].sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
}
export async function addMutatie(input: Omit<Mutatie,'id'|'createdAt'>) {
  const db = await load();
  const row: Mutatie = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
  db.mutaties.push(row); await save(db); return row;
}
export async function patchMutatie(id: string, patch: Partial<Mutatie>) {
  const db = await load();
  const i = db.mutaties.findIndex(x => x.id === id);
  if (i < 0) return null;
  db.mutaties[i] = { ...db.mutaties[i], ...patch };
  await save(db);
  return db.mutaties[i];
}
export async function deleteMutatie(id: string) {
  const db = await load();
  const before = db.mutaties.length;
  db.mutaties = db.mutaties.filter(x => x.id !== id);
  await save(db);
  return db.mutaties.length < before;
}
export async function summaryMutaties() {
  const list = await listMutaties();
  const open = list.filter(x => x.status === 'open').length;
  const inBehandeling = list.filter(x => x.status === 'in-behandeling').length;
  const afgerond = list.filter(x => x.status === 'afgerond').length;
  return { open, inBehandeling, afgerond, totaal: list.length };
}

/* ---------- Groepen ---------- */
export async function listGroepen(): Promise<Groep[]> {
  const db = await load();
  return db.groepen.list;
}
export async function patchGroep(id: string, patch: Partial<Groep> & { addNote?: { tekst: string; auteur?: string }, updateNote?: { id: string; tekst?: string; auteur?: string }, removeNoteId?: string }) {
  const db = await load();
  const g = db.groepen.list.find(x => x.id === id);
  if (!g) return null;
  if (patch.kleur) g.kleur = patch.kleur as Kleur;
  if (patch.addNote) {
    g.notities.unshift({ id: randomUUID(), tekst: patch.addNote.tekst, auteur: patch.addNote.auteur, createdAt: new Date().toISOString() });
  }
  if (patch.updateNote) {
    const n = g.notities.find(x => x.id === patch.updateNote!.id);
    if (n) {
      if (typeof patch.updateNote.tekst === 'string') n.tekst = patch.updateNote.tekst;
      if (typeof patch.updateNote.auteur === 'string') n.auteur = patch.updateNote.auteur;
    }
  }
  if (patch.removeNoteId) g.notities = g.notities.filter(n => n.id !== patch.removeNoteId);
  await save(db);
  return g;
}
export async function rodeGroepen() {
  const rows = await listGroepen();
  return rows.filter(g => g.kleur === 'RED').map(g => g.naam);
}
