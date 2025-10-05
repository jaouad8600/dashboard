import { NextResponse } from "next/server";

/**
 * Eenvoudige fallback planning die altijd iets teruggeeft voor de gevraagde datum.
 * Vervang dit later door echte DB-data.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const items = [
    { tijd: "09:00", activiteit: "Ochtendronde", locatie: "Centrale hal", groep: "Poel" },
    { tijd: "11:00", activiteit: "Fitness", locatie: "Fitnesszaal", groep: "Lier" },
    { tijd: "14:00", activiteit: "Buitenactiviteit", locatie: "Sportveld", groep: "Kade" },
  ];
  return NextResponse.json({ date, items });
}
