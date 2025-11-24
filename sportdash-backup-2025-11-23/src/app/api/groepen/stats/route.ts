import { NextResponse } from "next/server";
import { getCountsByGroup } from "@/server/store";
export async function GET() {
  const x = await getCountsByGroup();
  return NextResponse.json(x);
}
