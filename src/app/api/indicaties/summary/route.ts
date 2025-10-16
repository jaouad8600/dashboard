import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.indicatie.findMany({ select: { status: true, archivedAt: true } });
    const totaal = data.length;
    const open = data.filter(d => d.status === "OPEN" && !d.archivedAt).length;
    const inBehandeling = data.filter(d => d.status === "IN_BEHANDELING" && !d.archivedAt).length;
    const afgerond = data.filter(d => d.status === "AFGEROND" || d.archivedAt).length;
    return NextResponse.json({ totaal, open, inBehandeling, afgerond }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/indicaties/summary", e);
    return NextResponse.json({ error: e?.message || "DB fout" }, { status: 500 });
  }
}
