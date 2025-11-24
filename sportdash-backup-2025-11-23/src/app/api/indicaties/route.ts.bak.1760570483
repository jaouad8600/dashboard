import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
const headers = { 'cache-control': 'no-store' };

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH,'utf8')); } catch { return {}; }
}
async function writeDB(db:any){ 
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db,null,2));
}
const normStatus = (v?:string)=>{
  const x = String(v||'').toLowerCase().trim();
  if(['in-behandeling','in behandeling','in_progress','processing'].includes(x)) return 'in-behandeling';
  if(['afgerond','closed','done','resolved'].includes(x)) return 'afgerond';
  return 'open';
};
const newid = ()=> 'ind_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);

export async function GET(req: Request){
  const url = new URL(req.url);
  const groupId = url.searchParams.get('groupId') || url.searchParams.get('groepId') || undefined;
  const id = url.searchParams.get('id') || undefined;
  const includeArchived = ['1','true','yes'].includes(String(url.searchParams.get('includeArchived')||'').toLowerCase());

  const db = await readDB();
  const items: any[] = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  let list = items;

  if (id) {
    const one = items.find(i => String(i.id) === String(id));
    if (!one) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404, headers });
    return NextResponse.json({ item: one }, { headers });
  }

  if (groupId) list = list.filter(i => String(i.groupId||i.groepId||'').toLowerCase() === String(groupId).toLowerCase());
  if (!includeArchived) list = list.filter(i => !i.archived);

  // Laatste bovenaan
  list.sort((a,b)=> String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));

  return NextResponse.json({ items: list }, { headers });
}

export async function POST(req: Request){
  const db = await readDB();
  db.indicaties = db.indicaties && Array.isArray(db.indicaties.items) ? db.indicaties : { items: [] };
  const body = await req.json().catch(()=> ({}));
  const src = body?.item ?? body ?? {};
  const now = new Date().toISOString();

  const groupId = src.groupId ?? src.groepId;
  const text = src.text ?? src.opmerking ?? src.description ?? '';
  const title = src.title ?? src.titel ?? '';
  const status = normStatus(src.status);
  const archived = !!src.archived;

  if (!groupId) return NextResponse.json({ error: "groupId is verplicht" }, { status: 400, headers });

  const item = {
    id: src.id ?? newid(),
    groupId: String(groupId),
    title,
    text,
    status,
    archived,
    createdAt: src.createdAt ?? now,
    updatedAt: now,
  };

  db.indicaties.items.push(item);
  await writeDB(db);
  return NextResponse.json({ item }, { status: 201, headers });
}

export async function PUT(req: Request){
  const url = new URL(req.url);
  const qid = url.searchParams.get('id') || undefined;

  const db = await readDB();
  const items: any[] = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  const body = await req.json().catch(()=> ({}));
  const src = body?.item ?? body ?? {};

  const id = src.id ?? qid;
  if (!id) return NextResponse.json({ error: "id is verplicht" }, { status: 400, headers });

  const idx = items.findIndex(i => String(i.id) === String(id));
  if (idx === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404, headers });

  const cur = items[idx];
  const now = new Date().toISOString();

  const patch:any = { ...cur };
  if (src.groupId || src.groepId) patch.groupId = String(src.groupId ?? src.groepId);
  if (typeof src.title !== 'undefined' || typeof src.titel !== 'undefined') patch.title = src.title ?? src.titel ?? '';
  if (typeof src.text !== 'undefined' || typeof src.opmerking !== 'undefined' || typeof src.description !== 'undefined') patch.text = src.text ?? src.opmerking ?? src.description ?? '';
  if (typeof src.status !== 'undefined') patch.status = normStatus(src.status);
  if (typeof src.archived !== 'undefined') patch.archived = !!src.archived;

  patch.updatedAt = now;

  items[idx] = patch;
  db.indicaties.items = items;
  await writeDB(db);

  return NextResponse.json({ item: items[idx] }, { headers });
}

export async function DELETE(req: Request){
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || undefined;
  if (!id) return NextResponse.json({ error: "id is verplicht" }, { status: 400, headers });

  const db = await readDB();
  const items: any[] = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  const idx = items.findIndex(i => String(i.id) === String(id));
  if (idx === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404, headers });

  const [removed] = items.splice(idx,1);
  db.indicaties.items = items;
  await writeDB(db);

  return NextResponse.json({ ok: true, removed }, { headers });
}
