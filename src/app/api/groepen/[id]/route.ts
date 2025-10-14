import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function loadDB() {
  const p = path.join(process.cwd(), 'data', 'app-data.json');
  let j: any = {};
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
  if (!Array.isArray(j.groepen) && Array.isArray(j.groups)) j.groepen = j.groups;
  if (!Array.isArray(j.groepen)) j.groepen = [];
  return { j, p };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { j, p } = loadDB();
  const id = params.id;
  const body = await req.json().catch(() => ({}));
  const kleur = (body.kleur ?? body.color ?? body.kleurKey ?? '').toString().toLowerCase();

  const idx = j.groepen.findIndex((g: any) => g.id === id);
  if (idx === -1) {
    return NextResponse.json({ ok:false, error:'Groep niet gevonden' }, { status: 404 });
  }

  if (kleur) j.groepen[idx].kleur = kleur;
  j.groups = j.groepen; // legacy mirror
  fs.writeFileSync(p, JSON.stringify(j, null, 2));
  return NextResponse.json({ ok:true, groep: j.groepen[idx] }, { status: 200 });
}
