import { NextResponse } from 'next/server';
// Minimal fallback-implementatie zodat build niet faalt.
// Pas later aan als mutaties persistenter moeten worden.

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // Hier zou je uit data/app-data.json kunnen verwijderen; voor nu altijd 204.
  return NextResponse.json({ ok: true, id: params.id }, { status: 200 });
}
