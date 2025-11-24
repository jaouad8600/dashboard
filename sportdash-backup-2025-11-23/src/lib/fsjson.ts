import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "app-data.json");

export async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initial = {
      groepen: { list: [] },
      indicaties: [],
      mutaties: [],
      overdrachten: [],
      planning: {},
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

export async function readJSON<T = any>(): Promise<T> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJSON<T = any>(data: T): Promise<void> {
  await ensureDataFile();
  const tmp = DATA_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}
