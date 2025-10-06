export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readDB } from "@/server/fsdb";

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ list: db.groepen.list });
}
