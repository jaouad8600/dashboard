import { NextResponse } from "next/server";
import { setGroepKleur } from "@/lib/fsdb";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const b = await req.json().catch(()=>({}));
  const kleur = b?.kleur;
  const allowed = ["gray","green","yellow","orange","red"];
  if (!allowed.includes(kleur)) {
    return NextResponse.json({ error: "Ongeldige kleur" }, { status: 400 });
  }
  const row = await setGroepKleur(params.id, kleur);
  if (!row) return NextResponse.json({ error: "Groep niet gevonden" }, { status: 404 });
  return NextResponse.json(row);
}
