import { NextResponse } from 'next/server';
import { updateOverdracht, removeOverdracht } from '@/lib/overdrachten.store';

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const patch = await req.json();
  const updated = await updateOverdracht(params.id, patch);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ok = await removeOverdracht(params.id);
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
