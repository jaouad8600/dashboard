import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  const items = await prisma.event.findMany({
    orderBy: { ts: "desc" },
    take: 200,
  });
  return NextResponse.json(items);
}
