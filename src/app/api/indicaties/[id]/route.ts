import { NextResponse } from "next/server";
import type { Indicatie } from "../route";

declare global {
  // eslint-disable-next-line no-var
  var __INDICATIES__: Indicatie[] | undefined;
}

const store: Indicatie[] = (globalThis as any).__INDICATIES__ ?? [];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const b = await req.json().catch(() => ({}));
  const item = store.find(i => i.id === id);
  if (!item) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  if (b.naam !== undefined) item.naam = String(b.naam);
  if (b.type !== undefined) item.type = String(b.type);
  if (b.status !== undefined && ["Open","In behandeling","Afgerond"].includes(b.status)) item.status = b.status;
  if (b.start !== undefined) item.start = String(b.start);
  if (b.eind !== undefined) item.eind = String(b.eind);
  if (b.opmerking !== undefined) item.opmerking = b.opmerking ? String(b.opmerking) : undefined;

  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const idx = store.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  const [removed] = store.splice(idx, 1);
  return NextResponse.json(removed);
}
