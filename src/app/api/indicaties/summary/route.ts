import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [open, inBehandeling, afgerond, totaal] = await Promise.all([
    prisma.indicatie.count({ where: { status: "OPEN" } }),
    prisma.indicatie.count({ where: { status: "IN_BEHANDELING" } }),
    prisma.indicatie.count({ where: { status: "AFGEROND" } }),
    prisma.indicatie.count(),
  ]);
  return NextResponse.json({ open, inBehandeling, afgerond, totaal });
}
