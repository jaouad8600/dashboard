import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string, noteId: string }}) {
  const { noteId } = params;
  const b = await req.json();
  const updated = await prisma.notitie.update({
    where: { id: noteId },
    data: {
      tekst: typeof b.tekst === "string" ? b.tekst : undefined,
      auteur: typeof b.auteur === "string" ? b.auteur : undefined
    },
    select: { id:true, tekst:true, auteur:true, datumISO:true, groepId:true }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string, noteId: string }}) {
  const { noteId } = params;
  await prisma.notitie.delete({ where: { id: noteId } });
  return new NextResponse(null, { status: 204 });
}
