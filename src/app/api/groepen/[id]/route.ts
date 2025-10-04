import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const { id } = params;
  try {
    const body = await req.json();
    const updated = await prisma.groep.update({
      where: { id },
      data: {
        kleur: typeof body.kleur === "string" ? body.kleur : undefined,
        naam: typeof body.naam === "string" ? body.naam : undefined,
      },
    });
    return NextResponse.json({ id: updated.id, naam: updated.naam, kleur: updated.kleur });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kan groep niet bijwerken" }, { status: 500 });
  }
}
