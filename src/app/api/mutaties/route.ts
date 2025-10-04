import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const list = await prisma.mutatie.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { titel, beschrijving, status, maatregel, groepId } = await req.json();
  const created = await prisma.mutatie.create({
    data: { titel, beschrijving, status, maatregel, groepId },
  });
  return NextResponse.json(created, { status: 201 });
}
