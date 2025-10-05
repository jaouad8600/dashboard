import { NextResponse } from "next/server";
import { setGroepKleur, type Kleur } from "@/lib/groepen.data";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const b = await req.json().catch(() => ({}));
  if (!b.kleur) return NextResponse.json({ error: "kleur ontbreekt" }, { status: 400 });
  const updated = setGroepKleur(id, b.kleur as Kleur);
  return NextResponse.json(updated);
}
