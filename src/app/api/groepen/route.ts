import { NextResponse } from "next/server";
import { readDB, writeDB, seedGroepen } from "@/lib/serverStore";

export async function GET() {
  const db = await readDB();
  if (!db.groepen?.length) {
    db.groepen = seedGroepen();
    await writeDB(db);
  }
  return NextResponse.json(db.groepen);
}
