import { NextResponse } from 'next/server';
import { listOverdrachten, addOverdracht } from '@/lib/overdrachten.store';

export async function GET() {
  const items = await listOverdrachten();
  return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const titel = String(body.titel ?? '').trim();
  const inhoud = String(body.inhoud ?? '').trim();
  const auteur = body.auteur ? String(body.auteur).trim() : undefined;
  const status = body.status === 'afgerond' ? 'afgerond' : 'open';

  if (!titel || !inhoud) {
    return NextResponse.json({ error: 'titel en inhoud verplicht' }, { status: 400 });
  }

  const item = await addOverdracht({ titel, inhoud, auteur, status });
  return NextResponse.json(item, { status: 201 });
}
