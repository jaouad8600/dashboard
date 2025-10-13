import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  return DATA_DIR;
}

export async function readJSON<T>(file: string, fallback: T): Promise<T> {
  const dir = await ensureDataDir();
  const p = path.join(dir, file);
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(file: string, data: T): Promise<void> {
  const dir = await ensureDataDir();
  const p = path.join(dir, file);
  const tmp = p + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, p);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
