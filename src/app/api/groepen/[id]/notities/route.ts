import { NextResponse } from 'next/server';
import { getGroep, addNote } from '@/lib/groepen.store';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  try {
    const g = await getGroep(params.id);
    if (!g) return NextResponse.json({ error: 'groep niet gevonden' }, { status: 404 });
    return NextResponse.json(g.notities ?? []);
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'fout' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string }}) {
  try {
    const b = await req.json();
    const note = await addNote(params.id, b?.tekst, b?.auteur);
    return NextResponse.json(note, { status: 201 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'fout' }, { status: 400 });
  }
}
