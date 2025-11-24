import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.indicatie.findUnique({ where: { id: params.id } });
    if (!item) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    return NextResponse.json(item, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/indicaties/[id]", e);
    return NextResponse.json({ error: e?.message || "DB fout" }, { status: 500 });
  }
}

// Bewerken (PUT = hele record / gedeeltelijk toegestaan)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: any = {};
    for (const k of ["naam","type","status","groepId","opmerking"]) {
      if (k in body) data[k] = body[k] ?? null;
    }
    if ("start" in body) data.start = body.start ? new Date(body.start) : null;
    if ("eind"  in body) data.eind  = body.eind  ? new Date(body.eind)  : null;

    const item = await prisma.indicatie.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(item);
  } catch (e: any) {
    console.error("PUT /api/indicaties/[id]", e);
    return NextResponse.json({ error: e?.message || "DB updatefout" }, { status: 500 });
  }
}
