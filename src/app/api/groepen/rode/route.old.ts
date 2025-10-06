import { NextResponse } from 'next/server';
import { ensureSeedGroepen, readDB } from '@/server/fsdb';

export async function GET() {
  await ensureSeedGroepen();
  const db = await readDB();
  const rood = db.groepen.list.filter(g => g.kleur === 'RED');
  return NextResponse.json({ data: rood }, { status: 200 });
}
