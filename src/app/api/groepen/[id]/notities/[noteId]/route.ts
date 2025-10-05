import { NextResponse } from "next/server";
import { removeGroepNotitie, updateGroepNotitie } from "@/lib/fsdb";

export async function PATCH(req: Request, { params }: { params: { id: string; noteId: string } }) {
  const b = await req.json().catch(()=>({}));
  const patch: any = {};
  if (typeof b.tekst === "string")  patch.tekst  = b.tekst;
  if (typeof b.auteur === "string") patch.auteur = b.auteur;
  const note = await updateGroepNotitie(params.id, params.noteId, patch);
  if (!note) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(note);
}

export async function DELETE(_req: Request, { params }: { params: { id: string; noteId: string } }) {
  const ok = await removeGroepNotitie(params.id, params.noteId);
  if (!ok) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
