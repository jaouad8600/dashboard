export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readDB } from "@/server/fsdb";

export async function GET() {
  const db = await readDB();
  const rood = db.groepen.list.filter((g) => g.kleur === "RED").map((g) => g.naam);
  return NextResponse.json({ list: rood });
}
