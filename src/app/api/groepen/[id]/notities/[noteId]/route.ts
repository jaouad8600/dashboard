import { NextResponse } from "next/server";
import { updateGroepNotitie, removeGroepNotitie } from "@/lib/groepen.data";

export async function PATCH(req: Request, { params }: { params: { id: string; noteId: string } }) {
  const { id, noteId } = params;
  const b = await req.json().catch(() => ({}));
  const updated = updateGroepNotitie(id, noteId, {
    tekst: b.tekst !== undefined ? String(b.tekst) : undefined,
    auteur: b.auteur !== undefined ? String(b.auteur) : undefined,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string; noteId: string } }) {
  const { id, noteId } = params;
  const updated = removeGroepNotitie(id, noteId);
  return NextResponse.json(updated);
}
