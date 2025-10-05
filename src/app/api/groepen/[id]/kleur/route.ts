import { NextResponse } from "next/server";
import { setGroepKleur, getById, type Kleur } from "@/lib/groepen.data";
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const kleur = body?.kleur as Kleur | undefined;
  if (!kleur || !["GREEN","YELLOW","ORANGE","RED"].includes(kleur)) {
    return NextResponse.json({ error: "Ongeldige kleur" }, { status: 400 });
  }
  const g = getById(id);
  if (!g) return NextResponse.json({ error: "Groep niet gevonden" }, { status: 404 });
  setGroepKleur(id, kleur);
  return NextResponse.json({ ok: true, id, kleur });
}
