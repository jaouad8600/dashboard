import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rows = await prisma.groep.findMany();
    const rood = rows.filter(g => {
      const k = (g.kleur || "").toString().toLowerCase();
      return k === "red" || k === "rood";
    }).map(g => ({ id: g.id, naam: g.naam }));
    return NextResponse.json(rood);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}
