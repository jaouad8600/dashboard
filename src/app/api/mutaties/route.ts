import { NextResponse } from 'next/server';
import { addMutatie, listMutaties } from '@/lib/stores/db';

export async function GET() {
  return NextResponse.json(await listMutaties(), { headers: { 'cache-control': 'no-store' }});
}
export async function POST(req: Request) {
  const b = await req.json();
  if (!b?.titel) return NextResponse.json({ error: 'titel verplicht' }, { status: 400 });
  const row = await addMutatie({
    titel: String(b.titel).trim(),
    omschrijving: b.omschrijving ? String(b.omschrijving).trim() : undefined,
    datum: b.datum || new Date().toISOString(),
    status: (['open','in-behandeling','afgerond'] as const).includes(b.status) ? b.status : 'open'
  });
  return NextResponse.json(row, { status: 201 });
}
