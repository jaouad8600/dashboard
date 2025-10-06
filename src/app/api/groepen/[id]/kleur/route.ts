import { NextResponse } from "next/server";
import { readDB, writeDB, Kleur } from "@/lib/serverStore";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const body = await req.json().catch(()=>({}));
  const kleur: Kleur | undefined = body.kleur;
  const allowed: Kleur[] = ["GREEN","YELLOW","ORANGE","RED"];
  if (!kleur || !allowed.includes(kleur)) return NextResponse.json({ error:"invalid kleur" }, { status:400 });

  const db = await readDB();
  const g = db.groepen.find(x => x.id === params.id);
  if (!g) return NextResponse.json({ error:"not found" }, { status:404 });

  g.kleur = kleur;
  await writeDB(db);
  return NextResponse.json(g);
}
