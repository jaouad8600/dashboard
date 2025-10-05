export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { listMutaties, saveMutaties, type Mutatie } from "@/lib/mutaties.store";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const { id } = params;
  const b = await req.json().catch(() => ({}));
  const all = await listMutaties();
  const i = all.findIndex(m => m.id === id);
  if (i === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const row = all[i];
  if (b.titel !== undefined) row.titel = String(b.titel);
  if (b.omschrijving !== undefined) row.omschrijving = b.omschrijving ? String(b.omschrijving) : undefined;
  if (b.auteur !== undefined) row.auteur = b.auteur ? String(b.auteur) : undefined;
  if (b.categorie !== undefined) row.categorie = b.categorie ? String(b.categorie) : undefined;
  if (b.status && (["Open","In behandeling","Afgerond"] as const).includes(b.status)) row.status = b.status;
  if (b.datumISO !== undefined) row.datumISO = String(b.datumISO);

  await saveMutaties(all);
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const { id } = params;
  const all = await listMutaties();
  const i = all.findIndex(m => m.id === id);
  if (i === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  const [removed] = all.splice(i, 1);
  await saveMutaties(all);
  return NextResponse.json(removed);
}
