import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rows = await prisma.groep.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(rows.map(g => ({ id: g.id, naam: g.naam, kleur: g.kleur })));
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}
