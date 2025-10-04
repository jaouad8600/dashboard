import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rows = await prisma.overdracht.findMany({
      orderBy: [{ datumISO: "desc" }]
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date();
    const nieuw = await prisma.overdracht.create({
      data: {
        auteur: body.auteur ?? "Onbekend",
        bericht: String(body.bericht ?? "").slice(0, 2000),
        datumISO: now,
        tijd: now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
        belangrijk: Boolean(body.belangrijk) || false,
      },
    });
    return NextResponse.json(nieuw, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kan niet toevoegen" }, { status: 500 });
  }
}
