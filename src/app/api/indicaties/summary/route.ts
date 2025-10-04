import { NextResponse } from "next/server";
// Later kun je hier prisma.indicatie tellen per categorie
export async function GET() {
  return NextResponse.json({ total: 0 });
}
