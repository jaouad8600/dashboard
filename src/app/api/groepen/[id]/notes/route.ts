import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const notes = await prisma.groepNotitie.findMany({
    where: { groepId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { tekst, auteur } = await req.json();
  const note = await prisma.groepNotitie.create({
    data: { groepId: params.id, tekst, auteur },
  });
  return NextResponse.json(note, { status: 201 });
}
