import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await _.json();
  const updated = await prisma.groep.update({
    where: { id },
    data: { ...(body.naam && { naam: body.naam }), ...(body.kleur && { kleur: body.kleur }) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.groep.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
