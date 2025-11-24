import path from "path";
import fs from "fs/promises";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");

type Note = {
  id: string;
  groupId: string;
  text: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH,"utf8")); } catch { return {}; }
}
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB_PATH),{recursive:true}); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2)); }

function normalize(n:any): Note {
  return {
    id: String(n?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    groupId: String(n?.groupId ?? n?.groepId ?? ""),
    text: String(n?.text ?? n?.opmerking ?? n?.content ?? n?.body ?? "").trim(),
    archived: !!n?.archived,
    createdAt: n?.createdAt ?? new Date().toISOString(),
    updatedAt: n?.updatedAt ?? new Date().toISOString(),
  };
}

export async function listNotes(groupId?: string, includeArchived=false): Promise<Note[]> {
  const db = await readDB();
  const items = Array.isArray(db?.aantekeningen?.items) ? db.aantekeningen.items : [];
  let notes: Note[] = items.map(normalize);
  if (groupId) notes = notes.filter(n => (n.groupId||"").toLowerCase() === groupId.toLowerCase());
  if (!includeArchived) notes = notes.filter(n => !n.archived);
  notes.sort((a,b)=> (b.updatedAt||"").localeCompare(a.updatedAt||""));
  return notes;
}

export async function createNote(input: { groupId: string; text: string }): Promise<Note> {
  const db = await readDB();
  db.aantekeningen = db.aantekeningen && Array.isArray(db.aantekeningen.items) ? db.aantekeningen : { items: [] };
  const base = normalize({ ...input, createdAt: new Date().toISOString() });
  base.updatedAt = base.createdAt;
  db.aantekeningen.items.push(base);
  await writeDB(db);
  return base;
}

export async function updateNote(id: string, patch: Partial<Note>): Promise<Note|null> {
  const db = await readDB();
  const arr = Array.isArray(db?.aantekeningen?.items) ? db.aantekeningen.items : [];
  const idx = arr.findIndex((x:any) => String(x?.id) === String(id));
  if (idx === -1) return null;
  const cur = normalize(arr[idx]);
  const next = normalize({ ...cur, ...patch, updatedAt: new Date().toISOString() });
  arr[idx] = next;
  db.aantekeningen.items = arr;
  await writeDB(db);
  return next;
}

export async function deleteNote(id: string): Promise<boolean> {
  const db = await readDB();
  const arr = Array.isArray(db?.aantekeningen?.items) ? db.aantekeningen.items : [];
  const before = arr.length;
  db.aantekeningen.items = arr.filter((x:any)=> String(x?.id)!==String(id));
  await writeDB(db);
  return db.aantekeningen.items.length < before;
}
