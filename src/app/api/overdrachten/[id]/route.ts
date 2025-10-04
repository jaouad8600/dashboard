import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.overdracht.update({
    where: { id: params.id },
    data: {
      ...(body.bericht && { bericht: body.bericht }),
      ...(typeof body.belangrijk === "boolean" && { belangrijk: body.belangrijk }),
      ...(body.auteur && { auteur: body.auteur }),
      ...(body.datumISO && body.tijd && { datum: new Date(`${body.datumISO}T${body.tijd}:00`) }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.overdracht.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
