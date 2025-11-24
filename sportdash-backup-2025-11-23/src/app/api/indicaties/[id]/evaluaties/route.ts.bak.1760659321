import { NextResponse } from "next/server";
import { PrismaClient, EvaluatieType } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const list = await prisma.evaluatie.findMany({
      where: { indicatieId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/indicaties/[id]/evaluaties", e);
    return NextResponse.json({ error: e?.message || "DB fout" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { inhoud, ontvanger, type } = body || {};
    if (!inhoud) return NextResponse.json({ error: "inhoud verplicht" }, { status: 400 });

    const item = await prisma.evaluatie.create({
      data: {
        indicatieId: params.id,
        inhoud,
        ontvanger: ontvanger ?? null,
        type: type === "EIND" ? EvaluatieType.EIND : EvaluatieType.TUSSEN,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/indicaties/[id]/evaluaties", e);
    return NextResponse.json({ error: e?.message || "Aanmaken evaluatie mislukt" }, { status: 500 });
  }
}
