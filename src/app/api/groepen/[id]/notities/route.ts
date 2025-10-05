import { NextResponse } from "next/server";
import { addGroepNotitie } from "@/lib/fsdb";

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const b = await req.json().catch(()=>({}));
  const tekst  = typeof b.tekst  === "string" ? b.tekst.trim()  : "";
  const auteur = typeof b.auteur === "string" ? b.auteur.trim() : undefined;
  if (!tekst) return NextResponse.json({ error: "Lege tekst" }, { status: 400 });
  const note = await addGroepNotitie(params.id, tekst, auteur);
  if (!note) return NextResponse.json({ error: "Groep niet gevonden" }, { status: 404 });
  return NextResponse.json(note, { status: 201 });
}
