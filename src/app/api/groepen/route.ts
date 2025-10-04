import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groepen = await prisma.groep.findMany({
    orderBy: { naam: "asc" },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(groepen);
}

export async function POST(req: Request) {
  const { naam, kleur } = await req.json();
  const created = await prisma.groep.create({ data: { naam, kleur } });
  return NextResponse.json(created, { status: 201 });
}
