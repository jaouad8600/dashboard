import { NextResponse } from "next/server";
import { listPlanningByDate, addPlanning } from "@/server/store";

export async function GET(req:Request) {
  const u = new URL(req.url);
  const date = u.searchParams.get("date");
  if (!date) return NextResponse.json({ error:"date=YYYY-MM-DD verplicht" }, { status:400 });
  const data = await listPlanningByDate(date);
  return NextResponse.json(data, { headers:{ 'cache-control':'no-store' }});
}

export async function POST(req:Request) {
  try {
    const body = await req.json();
    const it = await addPlanning(body);
    return NextResponse.json(it, { headers:{ 'cache-control':'no-store' }});
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Kon niet toevoegen" }, { status:400 });
  }
}
