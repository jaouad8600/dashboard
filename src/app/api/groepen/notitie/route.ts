import { NextResponse } from "next/server";
import { addGroepNotitie } from "@/server/store";
export async function POST(req:Request) {
  const body = await req.json().catch(()=> ({}));
  const { groepId, tekst, auteur } = body || {};
  if (!groepId || !tekst) return NextResponse.json({ error:"groepId en tekst verplicht" }, { status:400 });
  const g = await addGroepNotitie(groepId, tekst, auteur);
  return NextResponse.json(g, { headers:{ 'cache-control':'no-store' }});
}
