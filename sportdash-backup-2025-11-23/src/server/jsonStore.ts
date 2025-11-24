import "server-only";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

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
  afdeling: "EB" | "VLOED";
  kleur: Kleur;
  notities: Note[];
};

export type Indicatie = {
  id: string;
  titel: string;
  status?: "Open" | "In behandeling" | "Afgerond";
  datum?: string;
  inhoud?: string;
  aanmelder?: string;
  docUrl?: string;
};

export type Mutatie = {
  id: string;
  titel: string;
  type?: string;
  status?: "Open" | "In behandeling" | "Afgerond";
  tijd?: string;
  omschrijving?: string;
};

export type AppData = {
  groepen: { list: Groep[] };
  indicaties: Indicatie[];
  mutaties: Mutatie[];
  overdrachten?: any[];
  planning?: any;
};

const filePath = path.join(process.cwd(), "data", "app-data.json");

async function ensureFile() {
  try {
    await access(filePath, constants.F_OK);
  } catch {
    await mkdir(path.dirname(filePath), { recursive: true });
    const empty: AppData = {
      groepen: { list: [] },
      indicaties: [],
      mutaties: [],
      overdrachten: [],
      planning: {},
    };
    await writeFile(filePath, JSON.stringify(empty, null, 2), "utf8");
  }
}

export async function readData(): Promise<AppData> {
  await ensureFile();
  const raw = await readFile(filePath, "utf8");
  try {
    const json = JSON.parse(raw);
    json.groepen ||= { list: [] };
    json.indicaties ||= [];
    json.mutaties ||= [];
    return json;
  } catch {
    const empty: AppData = {
      groepen: { list: [] },
      indicaties: [],
      mutaties: [],
      overdrachten: [],
      planning: {},
    };
    await writeFile(filePath, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

export async function writeData(next: AppData) {
  await ensureFile();
  await writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
}
