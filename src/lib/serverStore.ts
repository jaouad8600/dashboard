import { promises as fs } from "fs";
import path from "path";

export type Kleur = "GREEN"|"YELLOW"|"ORANGE"|"RED";
export type Note = { id: string; tekst: string; auteur?: string; createdAt: string };
export type Groep = { id: string; naam: string; afdeling: "EB"|"VLOED"; kleur: Kleur; notities: Note[] };

export type Indicatie = {
  id: string; naam: string; type?: string; status?: string; start?: string; eind?: string; opmerking?: string;
};

export type Mutatie = {
  id: string;
  titel: string;
  type?: string;
  datumISO: string;
  groepId?: string;
  details?: string;
};

type DB = {
  groepen: any; // normaliseren we zelf
  indicaties: Indicatie[];
  mutaties: Mutatie[];
  overdrachten: any[];
  planning?: any;
};

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");

export function seedGroepen(): Groep[] {
  const eb = ["Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf"];
  const vloed = ["Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Dijk"];
  const mk = (naam:string, afdeling:"EB"|"VLOED"): Groep => ({
    id: `${afdeling}-${naam}`.toLowerCase(), naam, afdeling, kleur:"GREEN", notities:[]
  });
  return [...eb.map(n=>mk(n,"EB")), ...vloed.map(n=>mk(n,"VLOED"))];
}

function normalizeGroups(x: any): Groep[] {
  if (Array.isArray(x)) return x as Groep[];
  if (x && Array.isArray(x.list)) return x.list as Groep[];
  if (x && typeof x === "object") return Object.values(x) as Groep[];
  return seedGroepen();
}

async function ensureFile() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try { await fs.access(DB_PATH); } catch {
    const seed = { groepen: seedGroepen(), indicaties: [], mutaties: [], overdrachten: [] } as DB;
    await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2));
  }
}

export async function readDB(): Promise<Omit<DB,"groepen"> & { groepen: Groep[] }> {
  await ensureFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  let obj: DB;
  try { obj = JSON.parse(raw) as DB; }
  catch {
    obj = { groepen: seedGroepen(), indicaties: [], mutaties: [], overdrachten: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(obj, null, 2));
  }
  const groepen = normalizeGroups(obj.groepen);
  return {
    ...obj,
    groepen: groepen && groepen.length ? groepen : seedGroepen(),
    indicaties: Array.isArray(obj.indicaties)? obj.indicaties : [],
    mutaties: Array.isArray(obj.mutaties)? obj.mutaties : [],
    overdrachten: Array.isArray(obj.overdrachten)? obj.overdrachten : [],
  };
}

export async function writeDB(db: Omit<DB,"groepen"> & { groepen: Groep[] }) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}
