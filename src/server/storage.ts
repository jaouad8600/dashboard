import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export type Kleur = 'GREEN'|'YELLOW'|'ORANGE'|'RED';
export type Notitie = { id: string; tekst: string; auteur?: string; createdAt: string };
export type Groep = { id: string; naam: string; afdeling: 'EB'|'VLOED'; kleur: Kleur; notities: Notitie[] };

export type Indicatie = {
  id: string;
  naam: string;
  type?: string;
  status?: 'Open'|'In behandeling'|'Afgerond';
  start?: string;
  eind?: string;
  opmerking?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Overdracht = {
  id: string;
  bericht: string;
  auteur?: string;
  belangrijk?: boolean;
  datumISO: string;  // YYYY-MM-DD
  tijd: string;      // HH:mm
  createdAt: string;
};

export type Mutatie = {
  id: string;
  titel: string;
  status?: 'Open'|'Afgehandeld';
  createdAt: string;
};

type PlanningItem = { tijd: string; activiteit: string; locatie?: string };

type AppData = {
  groepen: { list: Groep[] };
  indicaties: Indicatie[];
  mutaties: Mutatie[];
  overdrachten: Overdracht[];
  planning: { byDate: Record<string, PlanningItem[]> };
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'app-data.json');

async function readJSON(): Promise<AppData> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw) as AppData;
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const seed: AppData = {
      groepen: { list: [] },
      indicaties: [],
      mutaties: [],
      overdrachten: [],
      planning: { byDate: {} }
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

async function writeJSON(data: AppData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function uuid() { return crypto.randomUUID(); }

const EB_GROEPEN = ['Poel','Lier','Zijl','Nes','Vliet','Gaag','Kust','Golf'];
const VLOED_GROEPEN = ['Zift','Lei','Kade','Kreek','Duin','Rak','Bron','Dijk'];

async function ensureSeed(data: AppData): Promise<AppData> {
  if (!data.groepen?.list || data.groepen.list.length === 0) {
    const list: Groep[] = [
      ...EB_GROEPEN.map(naam => ({ id: uuid(), naam, afdeling: 'EB' as const, kleur: 'GREEN' as Kleur, notities: [] })),
      ...VLOED_GROEPEN.map(naam => ({ id: uuid(), naam, afdeling: 'VLOED' as const, kleur: 'GREEN' as Kleur, notities: [] }))
    ];
    data.groepen = { list };
  }
  return data;
}

/** PUBLIC API (server-only) */
export async function getGroepen(): Promise<Groep[]> {
  let data = await readJSON();
  data = await ensureSeed(data);
  await writeJSON(data);
  return data.groepen.list.sort((a,b)=>a.naam.localeCompare(b.naam,'nl'));
}
export async function setGroepKleur(id: string, kleur: Kleur): Promise<Groep|null> {
  const data = await readJSON();
  const g = data.groepen.list.find(x => x.id === id);
  if (!g) return null;
  g.kleur = kleur;
  await writeJSON(data);
  return g;
}
export async function addGroepNotitie(groepId: string, tekst: string, auteur?: string): Promise<Notitie|null> {
  const data = await readJSON();
  const g = data.groepen.list.find(x => x.id === groepId);
  if (!g) return null;
  const n: Notitie = { id: uuid(), tekst, auteur, createdAt: new Date().toISOString() };
  g.notities.unshift(n);
  await writeJSON(data);
  return n;
}
export async function getRodeGroepen() {
  const list = await getGroepen();
  const items = list.filter(g => g.kleur === 'RED');
  return { count: items.length, items };
}

export async function getIndicaties(): Promise<Indicatie[]> {
  const data = await readJSON();
  return data.indicaties.sort((a,b)=>(b.updatedAt??b.createdAt).localeCompare(a.updatedAt??a.createdAt));
}
export async function addIndicatie(input: Partial<Indicatie>): Promise<Indicatie> {
  const data = await readJSON();
  const item: Indicatie = {
    id: uuid(),
    naam: input.naam?.trim() || 'Onbekend',
    type: input.type || 'Sport',
    status: input.status || 'Open',
    start: input.start,
    eind: input.eind,
    opmerking: input.opmerking,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.indicaties.unshift(item);
  await writeJSON(data);
  return item;
}
export async function patchIndicatie(id: string, patch: Partial<Indicatie>): Promise<Indicatie|null> {
  const data = await readJSON();
  const i = data.indicaties.find(x=>x.id===id);
  if (!i) return null;
  Object.assign(i, patch);
  i.updatedAt = new Date().toISOString();
  await writeJSON(data);
  return i;
}
export async function getIndicatiesSummary() {
  const list = await getIndicaties();
  const open = list.filter(x=>x.status==='Open').length;
  const inb  = list.filter(x=>x.status==='In behandeling').length;
  const afr  = list.filter(x=>x.status==='Afgerond').length;
  return { open, inBehandeling: inb, afgerond: afr, totaal: list.length };
}
