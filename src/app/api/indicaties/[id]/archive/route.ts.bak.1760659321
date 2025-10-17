import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const reason: string | undefined = body?.reason;
    const item = await prisma.indicatie.update({
      where: { id: params.id },
      data: {
        archivedAt: new Date(),
        archivedReason: reason ?? null,
      },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    console.error("POST /api/indicaties/[id]/archive", e);
    return NextResponse.json({ error: e?.message || "Archiveren mislukt" }, { status: 500 });
  }
}
