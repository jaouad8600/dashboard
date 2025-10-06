import { NextResponse } from 'next/server';
import { updateNote, removeNote } from '@/lib/groepen.store';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string; noteId: string }}) {
  try {
    const b = await req.json();
    const n = await updateNote(params.id, params.noteId, { tekst: b?.tekst, auteur: b?.auteur });
    return NextResponse.json(n);
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'fout' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; noteId: string }}) {
  try {
    await removeNote(params.id, params.noteId);
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'fout' }, { status: 400 });
  }
}
