import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const rows = await prisma.notitie.findMany({
    where: { groepId: params.id },
    orderBy: { datumISO: "asc" },
    select: { id:true, tekst:true, auteur:true, datumISO:true }
  });
  return NextResponse.json(rows.map(n => ({
    id: n.id, tekst:n.tekst, auteur:n.auteur ?? undefined, datumISO:n.datumISO.toISOString()
  })));
}

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const b = await req.json();
  const created = await prisma.notitie.create({
    data: {
      groepId: params.id,
      tekst: String(b.tekst || "").slice(0, 2000),
      auteur: b.auteur ? String(b.auteur) : null
    },
    select: { id:true, tekst:true, auteur:true, datumISO:true }
  });
  return NextResponse.json({
    id: created.id,
    tekst: created.tekst,
    auteur: created.auteur ?? undefined,
    datumISO: created.datumISO.toISOString()
  }, { status: 201 });
}
