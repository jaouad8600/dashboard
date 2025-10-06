import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/serverStore";

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const { tekst, auteur } = await req.json().catch(()=>({}));
  if (!tekst || typeof tekst !== "string") return NextResponse.json({ error:"tekst verplicht" }, { status:400 });

  const db = await readDB();
  const g = db.groepen.find(x => x.id === params.id);
  if (!g) return NextResponse.json({ error:"not found" }, { status:404 });

  const note = { id: crypto.randomUUID(), tekst, auteur, createdAt: new Date().toISOString() };
  g.notities.unshift(note);
  await writeDB(db);
  return NextResponse.json(note, { status:201 });
}
