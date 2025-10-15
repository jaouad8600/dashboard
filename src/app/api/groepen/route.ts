import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
const headers = { 'cache-control': 'no-store' as const };

type Group = { id?:string; slug?:string; code?:string; naam?:string; name?:string; kleur?:string };

function arr<T>(v:any): T[] { return Array.isArray(v) ? v : []; }
function normId(g:any){
  return String(g?.id ?? g?.slug ?? g?.code ?? g?.name ?? g?.naam ?? '').toLowerCase();
}
function isHidden(g:any){
  const id = normId(g);
  if (!id) return true;
  if (id === 'list') return true;                  // nooit tonen
  if (id.startsWith('eb-')) return true;           // eb-* weg
  if (id.startsWith('vloed-')) return true;        // vloed-* weg
  return false;
}
function cleanName(g:any){
  const raw = String(g?.naam ?? g?.name ?? normId(g));
  // verwijder 'eb' of 'vloed' aan het begin + '-' of spatie
  return raw.replace(/^(eb|vloed)[-\s]*/i, '').trim() || raw;
}

export async function GET(req: Request){
  let db:any={};
  try { db = JSON.parse(await fs.readFile(DB_PATH,'utf8')); } catch {}
  const url = new URL(req.url);

  // Optioneel: ?hideEbVloed=false om ALLES te zien (incl. eb/vloed/list)
  const hideEbVloed = url.searchParams.get('hideEbVloed') !== 'false';

  let groups: Group[] = arr<Group>(db.groepen?.length ? db.groepen : db.groups);

  if (hideEbVloed) groups = groups.filter(g => !isHidden(g));

  // Verrijk met displayName en sorteer
  const items = groups
    .map(g => ({ ...g, displayName: cleanName(g) }))
    .sort((a:any,b:any)=> String(a.displayName||'').localeCompare(String(b.displayName||''), 'nl'));

  const total = items.length;

  // Standaard: array response + x-total-count header (handig voor dashboards)
  return new NextResponse(JSON.stringify(items), {
    headers: { ...headers, 'content-type': 'application/json', 'x-total-count': String(total) }
  });
}
