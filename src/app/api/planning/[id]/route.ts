import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const { id } = params;
  try {
    const b = await req.json();
    const updated = await prisma.planning.update({
      where: { id },
      data: {
        titel: b.titel ?? undefined,
        locatie: b.locatie ?? undefined,
        start: b.start ? new Date(b.start) : undefined,
        eind: b.eind ? new Date(b.eind) : undefined,
        notitie: b.notitie ?? undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kan niet bijwerken" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  const { id } = params;
  try {
    await prisma.planning.delete({ where: { id }});
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kan niet verwijderen" }, { status: 500 });
  }
}
