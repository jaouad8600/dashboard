import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.indicatie.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const b = await req.json();
  const item = await prisma.indicatie.create({
    data: {
      naam: String(b.naam ?? "").trim(),
      type: (b.type ?? "Sport").toString(),
      start: b.start ? new Date(b.start) : undefined,
      eind: b.eind ? new Date(b.eind) : undefined,
      status: (b.status ?? "OPEN"),
      opmerking: b.opmerking ? String(b.opmerking) : undefined,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
