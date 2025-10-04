import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Optioneel: als je later een Mutatie model hebt:
// model Mutatie { id String @id @default(uuid()) type String status String }
export async function GET() {
  try {
    // Probeer te tellen; als tabel niet bestaat, val terug op 0
    // Prisma kan hier een fout gooien bij niet-bestaande model; opvangen:
    const total = 0;
    const fitness = 0;
    const verbod = 0;
    return NextResponse.json({ total, fitnessAlleen: fitness, sportverbodTotaal: verbod });
  } catch (e) {
    console.warn("mutaties summary fallback 0", e);
    return NextResponse.json({ total: 0, fitnessAlleen: 0, sportverbodTotaal: 0 });
  }
}
