import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.mutatie.update({
    where: { id: params.id },
    data: {
      ...(body.titel && { titel: body.titel }),
      ...(body.beschrijving && { beschrijving: body.beschrijving }),
      ...(body.status && { status: body.status }),
      ...(body.maatregel && { maatregel: body.maatregel }),
      ...(body.groepId && { groepId: body.groepId }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.mutatie.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
