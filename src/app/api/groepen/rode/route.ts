import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
const headers = { 'cache-control': 'no-store' as const };

function isRood(v?: string){ return ['rood','red'].includes(String(v||'').toLowerCase()); }
function arr<T>(v:any): T[] { return Array.isArray(v) ? v : []; }
function normId(g:any){
  return String(g?.id ?? g?.slug ?? g?.code ?? g?.name ?? g?.naam ?? '').toLowerCase();
}
function cleanName(g:any){
  const raw = String(g?.naam ?? g?.name ?? normId(g));
  // verwijder 'eb' of 'vloed' + eventuele '-' of spatie in de weergavenaam
  return raw.replace(/\b(eb|vloed)[-\s]*/gi, '').trim() || raw;
}
function excludeEbVloed(g:any){
  const id = normId(g);
  return !(id.startsWith('eb-') || id.startsWith('vloed-'));
}

export async function GET(req: Request){
  let db:any={};
  try { db = JSON.parse(await fs.readFile(DB_PATH,'utf8')); } catch {}
  let groups = arr<any>(db.groepen?.length ? db.groepen : db.groups);

  // Filter op rood
  let items = groups.filter((g:any)=>isRood(g?.kleur));

  // Optioneel eb/vloed verbergen (default = verbergen)
  const url = new URL(req.url);
  const hideEbVloed = url.searchParams.get('hideEbVloed') !== 'false';
  if (hideEbVloed) items = items.filter(excludeEbVloed);

  // Mooie displayName
  items = items.map((g:any)=>({ ...g, displayName: cleanName(g) }));

  const total = items.length;

  // Default: puur ARRAY teruggeven (verwacht door veel frontends)
  // Meta-variant: ?meta=1 -> { items, count }
  if (url.searchParams.get('meta') === '1') {
    return NextResponse.json({ items, count: total }, { headers: { ...headers } });
  }

  return new NextResponse(JSON.stringify(items), {
    headers: { ...headers, 'content-type': 'application/json', 'x-total-count': String(total) }
  });
}
