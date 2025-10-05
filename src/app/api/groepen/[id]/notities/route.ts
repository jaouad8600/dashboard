import { NextResponse } from "next/server";
import { addGroepNotitie } from "@/lib/groepen.data";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const b = await req.json().catch(() => ({}));
  const tekst = String(b.tekst ?? "").trim();
  if (!tekst) return NextResponse.json({ error: "tekst ontbreekt" }, { status: 400 });
  const auteur = b.auteur ? String(b.auteur) : undefined;
  const updated = addGroepNotitie(id, tekst, auteur);
  return NextResponse.json(updated);
}
