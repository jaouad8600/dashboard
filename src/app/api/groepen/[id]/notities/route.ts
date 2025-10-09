export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { addNote } from '@/server/store';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const b = await req.json().catch(()=> ({}));
    const note = await addNote(params.id, b.tekst || '', b.auteur);
    return NextResponse.json(note, { status: 201 });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Onbekende fout' }, { status: 400 });
  }
}
