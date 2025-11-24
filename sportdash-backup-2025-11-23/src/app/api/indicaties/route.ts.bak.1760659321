import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.indicatie.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/indicaties", e);
    return NextResponse.json({ error: e?.message || "DB leesfout" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { naam, type, status, groepId, start, eind, opmerking } = body || {};
    if (!naam || !type || !status) {
      return NextResponse.json({ error: "naam, type, status verplicht" }, { status: 400 });
    }
    const item = await prisma.indicatie.create({
      data: {
        naam,
        type,
        status,
        groepId: groepId || null,
        start: start ? new Date(start) : null,
        eind: eind ? new Date(eind) : null,
        opmerking: opmerking ?? null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/indicaties", e);
    return NextResponse.json({ error: e?.message || "DB schrijffout" }, { status: 500 });
  }
}
