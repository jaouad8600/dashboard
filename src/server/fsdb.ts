import { promises as fs } from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");

export type Kleur = "GREEN" | "YELLOW" | "ORANGE" | "RED";
export type Note = { id: string; tekst: string; auteur?: string; createdAt: string };
export type Groep = { id: string; naam: string; afdeling?: "EB" | "VLOED"; kleur: Kleur; notities: Note[] };

export type DB = {
  groepen: { list: Groep[] };
  mutaties: any[];
  indicaties: any[];
  planning: { today: Array<{ tijd?: string; titel?: string; locatie?: string }> };
};

export async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as DB;
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      const seed: DB = { groepen: { list: [] }, mutaties: [], indicaties: [], planning: { today: [] } };
      await writeDB(seed);
      return seed;
    }
    throw e;
  }
}

export async function writeDB(db: DB): Promise<void> {
  const dir = path.dirname(DB_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
