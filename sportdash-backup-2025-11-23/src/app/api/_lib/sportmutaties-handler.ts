import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

let prisma: any = null;
async function getPrisma() {
  if (prisma) return prisma;
  try {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
  } catch {
    prisma = null;
  }
  return prisma;
}

const FILE = path.join(process.cwd(), "data", "sportmutaties.json");

type RecordIn = {
  titel?: string;
  name?: string;
  naam?: string;
  title?: string;
  status?: string;
  groepId?: string;
  groep?: string;
  groep_id?: string;
  omschrijving?: string;
  beschrijving?: string;
  opmerking?: string;
  description?: string;
};

type Mutatie = {
  id: string;
  titel: string;
  status: "OPEN" | "IN_BEHANDELING" | "AFGEROND";
  groepId?: string | null;
  omschrijving?: string | null;
  createdAt: string;
  updatedAt: string;
};

const normalizeStatus = (v?: string): Mutatie["status"] => {
  const s = (v || "").toUpperCase();
  if (s === "AFGEROND") return "AFGEROND";
  if (s === "IN_BEHANDELING" || s === "IN BEHANDELING" || s === "IN-BEHANDELING") return "IN_BEHANDELING";
  return "OPEN";
};

const pickTitle = (b: RecordIn) => (b.titel || b.name || b.naam || b.title || "").toString().trim();
const pickGroepId = (b: RecordIn) => (b.groepId || b.groep || b.groep_id || "").toString().trim() || undefined;
const pickOms = (b: RecordIn) =>
  (b.omschrijving || b.beschrijving || b.opmerking || b.description || "").toString().trim() || undefined;

/** FILE FALLBACK  */
async function fileRead(): Promise<Mutatie[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}
async function fileWrite(arr: Mutatie[]) {
  await fs.writeFile(FILE, JSON.stringify(arr, null, 2));
}

/** GET lijst */
export async function list() {
  // Probeer prisma → anders file
  const p = await getPrisma();
  if (p?.sportMutatie) {
    try {
      const rows = await p.sportMutatie.findMany({ orderBy: { createdAt: "desc" } });
      return NextResponse.json(rows, { status: 200 });
    } catch (e: any) {
      // fallback
    }
  }
  const rows = await fileRead();
  // onlangs eerst
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(rows, { status: 200 });
}

/** POST nieuw */
export async function create(req: Request) {
  let body: RecordIn;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const titel = pickTitle(body);
  if (!titel) {
    return NextResponse.json({ error: "Titel (of Naam) is verplicht" }, { status: 400 });
  }
  const status = normalizeStatus(body.status);
  const groepId = pickGroepId(body);
  const omschrijving = pickOms(body);

  // Eerst prisma, dan file
  const p = await getPrisma();
  if (p?.sportMutatie) {
    try {
      const made = await p.sportMutatie.create({
        data: { titel, status, groepId: groepId || null, omschrijving: omschrijving || null },
      });
      return NextResponse.json(made, { status: 201 });
    } catch (e: any) {
      // Prisma faalde -> val terug op file
    }
  }

  const now = new Date().toISOString();
  const item: Mutatie = {
    id: Math.random().toString(36).slice(2),
    titel,
    status,
    groepId: groepId || null,
    omschrijving: omschrijving || null,
    createdAt: now,
    updatedAt: now,
  };
  const arr = await fileRead();
  arr.push(item);
  await fileWrite(arr);
  return NextResponse.json(item, { status: 201 });
}
