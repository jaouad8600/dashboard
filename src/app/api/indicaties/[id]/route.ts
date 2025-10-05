import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const b = await req.json();
  const item = await prisma.indicatie.update({
    where: { id },
    data: {
      naam: b.naam !== undefined ? String(b.naam) : undefined,
      type: b.type !== undefined ? String(b.type) : undefined,
      start: b.start ? new Date(b.start) : undefined,
      eind: b.eind ? new Date(b.eind) : undefined,
      status: b.status !== undefined ? b.status : undefined,
      opmerking: b.opmerking !== undefined ? String(b.opmerking) : undefined,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.indicatie.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
