import { NextResponse } from "next/server";

let prisma: any = null;
try {
  // Alleen als je prisma/lib hebt
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prisma = require("@/lib/db").prisma;
} catch {}

export async function GET() {
  try {
    if (prisma?.groep?.findMany) {
      const rows = await prisma.groep.findMany({
        include: { notities: true },
        orderBy: { naam: "asc" }
      });
      return NextResponse.json(rows);
    }
  } catch (e) {
    console.error("GET /api/groepen prisma fout:", e);
  }
  // Fallback zodat UI niet omvalt
  return NextResponse.json([
    { id: "demo-1", naam: "Poel",  kleur: "red",   notities: [] },
    { id: "demo-2", naam: "Vloed", kleur: "green", notities: [] }
  ]);
}
