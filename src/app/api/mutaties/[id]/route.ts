import { NextResponse } from 'next/server';
import { deleteMutatie, patchMutatie } from '@/lib/stores/db';

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const row = await patchMutatie(params.id, await req.json());
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(row);
}
export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  return NextResponse.json({ ok: await deleteMutatie(params.id) });
}
