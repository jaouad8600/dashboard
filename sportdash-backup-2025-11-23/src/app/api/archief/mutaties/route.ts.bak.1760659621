import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const F_MUT = path.join(process.cwd(), "data", "sportmutaties.json");

async function getPrisma(): Promise<any|null> {
  try {
    const mod = await import("@prisma/client");
    const prisma = new (mod as any).PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

export async function GET() {
  const prisma = await getPrisma();
  if (prisma?.sportMutatie) {
    try {
      const rows = await prisma.sportMutatie.findMany({
        where: { archivedAt: { not: null } },
        orderBy: { archivedAt: "desc" },
      });
      return NextResponse.json(rows, { status: 200 });
    } catch (e:any) {
      console.error("[archief][mutaties][prisma]", e);
    }
  }
  // File fallback
  try {
    const raw = await fs.readFile(F_MUT, "utf8").catch(()=> "[]");
    const arr = JSON.parse(raw);
    const out = (Array.isArray(arr)?arr:[])
      .filter((x:any)=> x?.archivedAt)
      .sort((a:any,b:any)=> new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());
    return NextResponse.json(out, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
