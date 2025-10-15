import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
const headers = { 'cache-control': 'no-store', 'content-type': 'application/json' };

type Group = { id?:string; slug?:string; code?:string; naam?:string; name?:string; kleur?:string };
type Agg = { id:string; naam:string; kleur?:string; aliases:string[] };

function arr<T>(v:any): T[] { return Array.isArray(v) ? v : []; }
function normId(g:any){ return String(g?.id ?? g?.slug ?? g?.code ?? g?.name ?? g?.naam ?? '').toLowerCase(); }
function cleanKey(id:string){ return id.replace(/^(eb|vloed)[-\s]*/i,'').toLowerCase(); }
function cleanName(g:any){
  const raw = String(g?.naam ?? g?.name ?? normId(g) ?? '');
  return raw.replace(/^(eb|vloed)[-\s]*/i,'').trim() || raw;
}
function normKleur(v?:string){
  const x = String(v||'').toLowerCase();
  if (['rood','red'].includes(x)) return 'rood';
  if (['oranje','orange'].includes(x)) return 'oranje';
  if (['geel','yellow'].includes(x)) return 'geel';
  if (['groen','green'].includes(x)) return 'groen';
  return undefined;
}
function severity(k?:string){ return k==='rood'?3:k==='oranje'?2:k==='geel'?1:0; }

export async function GET(){
  let db:any={}; try{ db = JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{}
  const src: Group[] = arr<Group>(db.groepen?.length ? db.groepen : db.groups);

  const map = new Map<string, Agg>();
  for (const g of src){
    const id = normId(g);
    if (!id || id === 'list') continue;
    const key = cleanKey(id);               // canonieke sleutel zonder eb/vloed
    const name = cleanName(g);
    const kleur = normKleur(g?.kleur);

    const cur = map.get(key);
    if (!cur){
      map.set(key, { id, naam: name, kleur, aliases:[id] });
    } else {
      // kies “ergste” kleur (rood > oranje > geel > groen)
      const best = severity(kleur) > severity(cur.kleur) ? kleur : cur.kleur;
      // kies representatieve id: die met “ergste” kleur, anders laat staan
      const rep = (best === kleur && kleur) ? id : cur.id;
      cur.id = rep;
      cur.kleur = best;
      cur.naam = cur.naam || name;
      if (!cur.aliases.includes(id)) cur.aliases.push(id);
    }
  }

  // sorteer op naam en geef alleen id/naam/kleur terug (geen eb/vloed zichtbaar)
  const items = Array.from(map.values())
    .map(g => ({ id: g.id, naam: g.naam, kleur: g.kleur }))
    .sort((a,b)=> String(a.naam||'').localeCompare(String(b.naam||''), 'nl'));

  return new NextResponse(JSON.stringify(items), { headers: { ...headers, 'x-total-count': String(items.length) } });
}
