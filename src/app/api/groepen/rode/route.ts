import { NextResponse } from "next/server";
import { getRodeGroepen } from "@/lib/groepen.data";

export async function GET() {
  return NextResponse.json(getRodeGroepen());
}
