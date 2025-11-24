import "server-only";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ROOT = process.cwd();

export async function readJSON<T>(relPath: string, fallback: T): Promise<T> {
  const abs = resolve(ROOT, relPath);
  try {
    const buf = await readFile(abs);
    return JSON.parse(buf.toString()) as T;
  } catch {
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}
export async function writeJSON<T>(relPath: string, data: T): Promise<void> {
  const abs = resolve(ROOT, relPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, JSON.stringify(data, null, 2));
}
