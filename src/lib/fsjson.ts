import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';

export async function readJSON<T>(relPath: string, fallback: T): Promise<T> {
  const abs = path.isAbsolute(relPath) ? relPath : path.join(process.cwd(), relPath);
  try {
    const raw = await fs.readFile(abs, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

export async function writeJSON<T>(relPath: string, data: T): Promise<void> {
  const abs = path.isAbsolute(relPath) ? relPath : path.join(process.cwd(), relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, JSON.stringify(data, null, 2));
}
