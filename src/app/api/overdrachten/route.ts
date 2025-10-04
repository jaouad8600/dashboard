import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const list = await prisma.overdracht.findMany({ orderBy: { datum: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { datumISO, tijd, auteur, bericht, belangrijk } = await req.json();
  // datum + tijd samenvoegen (voorkomt server/client verschil)
  const iso = datumISO && tijd ? new Date(`${datumISO}T${tijd}:00`) : new Date();
  const created = await prisma.overdracht.create({
    data: { datum: iso, auteur, bericht, belangrijk: !!belangrijk },
  });
  return NextResponse.json(created, { status: 201 });
}
