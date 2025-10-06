import { NextResponse } from "next/server";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || todayISO();

  // TODO: later uit DB/JSON halen; nu altijd fallback-schedule
  const items = [
    { tijd: "09:00", activiteit: "Ochtendronde / opening gym" },
    { tijd: "10:30", activiteit: "Groepstraining" },
    { tijd: "12:00", activiteit: "Pauze" },
    { tijd: "13:30", activiteit: "Individuele activiteiten" },
    { tijd: "15:00", activiteit: "Balans / afsluiting" },
  ];

  return NextResponse.json({ date, items });
}
