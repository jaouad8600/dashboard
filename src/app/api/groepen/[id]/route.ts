export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/server/fsdb";
import { randomUUID } from "node:crypto";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const db = await readDB();
  const g = db.groepen.list.find(x => x.id === id);
  if (!g) return NextResponse.json({ error: "groep niet gevonden" }, { status: 404 });

  if (body.kleur) {
    const ok = ["GREEN","YELLOW","ORANGE","RED"].includes(body.kleur);
    if (!ok) return NextResponse.json({ error: "ongeldige kleur" }, { status: 400 });
    g.kleur = body.kleur;
  }

  if (body.newNote && typeof body.newNote.tekst === "string" && body.newNote.tekst.trim()) {
    g.notities.unshift({
      id: randomUUID(),
      tekst: body.newNote.tekst.trim(),
      auteur: typeof body.newNote.auteur === "string" ? body.newNote.auteur : undefined,
      createdAt: new Date().toISOString()
    });
  }

  await writeDB(db);
  return NextResponse.json({ ok: true, groep: g });
}
