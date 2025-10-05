import { NextResponse } from "next/server";
import { listGroepen } from "@/lib/groepen.data";

export async function GET() {
  return NextResponse.json(listGroepen());
}
