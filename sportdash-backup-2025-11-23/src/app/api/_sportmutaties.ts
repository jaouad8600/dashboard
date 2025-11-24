export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

const FILE = path.join(process.cwd(), "data", "sportmutaties.json");
type Mut = {
  id: string;
  titel: string;
  status: "OPEN" | "IN_BEHANDELING" | "AFGEROND";
  groepId?: string | null;
  omschrijving?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

async function ensureFile() {
  try { await fs.stat(FILE); }
  catch { await fs.writeFile(FILE, "[]"); }
}
async function readAll(): Promise<Mut[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE, "utf8");
  const arr = JSON.parse(raw);
  return Array.isArray(arr) ? arr : [];
}
async function writeAll(list: Mut[]) {
  await fs.writeFile(FILE, JSON.stringify(list, null, 2));
}

// probeer Prisma dynamisch te laden (faalt stilletjes als het niet kan)
async function getPrisma(): Promise<any | null> {
  try {
    const mod = await import("@prisma/client");
    const prisma = new (mod as any).PrismaClient();
    // check of tabel bestaat door een lichte query
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

// Normaliseer inkomende body velden
async function parseBody(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch { /* leeg body toegestaan */ }

  const titel =
    body.titel ?? body.title ?? body.naam ?? body.name ?? "";
  const statusRaw = (body.status ?? "OPEN").toString().toUpperCase();
  const status: "OPEN" | "IN_BEHANDELING" | "AFGEROND" =
    statusRaw === "IN_BEHANDELING" ? "IN_BEHANDELING" :
    statusRaw === "AFGEROND"       ? "AFGEROND"       : "OPEN";
  const groepId =
    body.groepId ?? body.groep_id ?? body.groep ?? body.groupId ?? body.group ?? null;
  const omschrijving =
    body.omschrijving ?? body.beschrijving ?? body.opmerking ?? body.description ?? null;

  return { titel, status, groepId, omschrijving };
}

// GET: lijst
export async function handleGET() {
  // eerst proberen via Prisma
  const prisma = await getPrisma();
  if (prisma?.sportMutatie) {
    try {
      const rows = await prisma.sportMutatie.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(rows, { status: 200 });
    } catch {
      // val stil terug op file
    }
  }
  const list = await readAll();
  // sorteer desc op createdAt
  list.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(list, { status: 200 });
}

// POST: toevoegen
export async function handlePOST(req: Request) {
  const { titel, status, groepId, omschrijving } = await parseBody(req);
  if (!titel || typeof titel !== "string") {
    return NextResponse.json({ error: "Titel is verplicht" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // probeer via Prisma
  const prisma = await getPrisma();
  if (prisma?.sportMutatie) {
    try {
      const created = await prisma.sportMutatie.create({
        data: {
          id: randomUUID(),
          titel,
          status,
          groepId,
          omschrijving,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        },
      });
      return NextResponse.json(created, { status: 201 });
    } catch (e: any) {
      // val terug op file
    }
  }

  // file-fallback
  const list = await readAll();
  const item: Mut = {
    id: randomUUID(),
    titel,
    status,
    groepId: groepId ?? null,
    omschrijving: omschrijving ?? null,
    createdAt: now,
    updatedAt: now,
  };
  list.push(item);
  await writeAll(list);
  return NextResponse.json(item, { status: 201 });
}

// SUMMARY: { open, totaal }
export async function handleSummaryGET() {
  // Prisma eerst
  const prisma = await getPrisma();
  if (prisma?.sportMutatie) {
    try {
      const [open, totaal] = await Promise.all([
        prisma.sportMutatie.count({ where: { status: "OPEN" } }),
        prisma.sportMutatie.count(),
      ]);
      return NextResponse.json({ open, totaal }, { status: 200 });
    } catch { /* fallback */ }
  }

  const list = await readAll();
  const open = list.filter(x => x.status === "OPEN").length;
  const totaal = list.length;
  return NextResponse.json({ open, totaal }, { status: 200 });
}
