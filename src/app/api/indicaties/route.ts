import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Indicatie = {
  id: string;
  naam: string;
  type?: string;
  status: 'open' | 'in-behandeling' | 'afgerond';
  groepId?: string | null;
  start?: string | null;
  eind?: string | null;
  opmerking?: string | null;
};

const DATA = path.join(process.cwd(), 'data', 'app-data.json');
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,8);

function readDB(): any {
  if(!fs.existsSync(DATA)) return { indicaties:{items:[]}, groepen:[] };
  try {
    const j = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
    if(!j.indicaties || !Array.isArray(j.indicaties.items)) j.indicaties={items:[]};
    return j;
  } catch {
    return { indicaties:{items:[]}, groepen:[] };
  }
}
function writeDB(db:any){ fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function GET() {
  const db = readDB();
  return NextResponse.json({ items: db.indicaties.items ?? [] }, { status:200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const naam = String(body.naam || '').trim();
  if(!naam) return NextResponse.json({error:'Naam is verplicht'}, {status:400});

  const item: Indicatie = {
    id: uid(),
    naam,
    type: body.type ? String(body.type) : undefined,
    status: (['open','in-behandeling','afgerond'].includes(body.status) ? body.status : 'open') as any,
    groepId: body.groepId ? String(body.groepId) : null,
    start: body.start ? String(body.start) : null,
    eind: body.eind ? String(body.eind) : null,
    opmerking: body.opmerking ? String(body.opmerking) : null,
  };
  const db = readDB();
  db.indicaties.items.push(item);
  writeDB(db);
  return NextResponse.json({ item }, { status:201 });
}
