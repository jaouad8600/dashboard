import { NextResponse } from "next/server";
import { readDB } from "@/lib/serverStore";

export async function GET() {
  const db = await readDB();
  const reds = db.groepen.filter(g => g.kleur === "RED").map(g => ({ id:g.id, naam:g.naam, afdeling:g.afdeling }));
  return NextResponse.json(reds);
}
