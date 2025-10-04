import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const { id } = params;
  try {
    const body = await req.json();
    const created = await prisma.notitie.create({
      data: {
        tekst: String(body.tekst ?? "").slice(0, 2000),
        auteur: body.auteur ? String(body.auteur) : null,
        groepId: id,
      },
    });
    return NextResponse.json({
      tekst: created.tekst,
      auteur: created.auteur ?? undefined,
      datumISO: created.datumISO.toISOString(),
    }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kan notitie niet toevoegen" }, { status: 500 });
  }
}
