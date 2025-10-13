import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");

function readDb() {
  if (!fs.existsSync(DB_PATH))
    return { groepen: [], planning: { items: [] }, extraSportmomenten: [] };
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const db = JSON.parse(raw || "{}");
  // normaliseer
  let groepen: any[] = [];
  if (Array.isArray(db.groepen)) groepen = db.groepen;
  else if (db.groepen && typeof db.groepen === "object")
    groepen = Object.values(db.groepen);
  let extra: any[] = Array.isArray(db.extraSportmomenten)
    ? db.extraSportmomenten
    : Array.isArray(db.extra_sportmomenten)
      ? db.extra_sportmomenten
      : [];
  return {
    ...db,
    groepen,
    extraSportmomenten: extra,
    planning: db.planning || { items: [] },
  };
}

function writeDb(db: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const aggregate = url.searchParams.get("aggregate") === "1";
  const db = readDb();

  if (aggregate) {
    const byGroup: Record<string, number> = {};
    for (const m of db.extraSportmomenten) {
      const gid = String(
        m?.groepId || m?.groupId || m?.groep || m?.group || "",
      );
      if (!gid) continue;
      byGroup[gid] = (byGroup[gid] || 0) + 1;
    }
    const groups = Array.isArray(db.groepen) ? db.groepen : [];
    const rows = groups
      .map((g: any) => ({
        groepId: g.id,
        groepNaam: g.naam || g.name || g.title || g.id,
        aantal: byGroup[g.id] || 0,
      }))
      .sort((a, b) => b.aantal - a.aantal);

    const totaal = rows.reduce((s, r) => s + r.aantal, 0);
    return NextResponse.json({ rows, totaal, byGroup });
  }

  // optioneel filter op groepId
  const groepId = url.searchParams.get("groepId");
  const items = groepId
    ? db.extraSportmomenten.filter(
        (m: any) => String(m.groepId) === String(groepId),
      )
    : db.extraSportmomenten;

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const db = readDb();
  const body = await req.json().catch(() => ({}) as any);
  const groepId = String(body?.groepId || body?.groupId || "").trim();
  if (!groepId)
    return NextResponse.json(
      { error: "groepId is verplicht" },
      { status: 400 },
    );

  const groepBestaat =
    Array.isArray(db.groepen) &&
    db.groepen.some((g: any) => String(g.id) === groepId);
  if (!groepBestaat)
    return NextResponse.json({ error: "Groep niet gevonden" }, { status: 404 });

  const item = {
    id: body.id || crypto.randomUUID(),
    groepId,
    datum: body.datum || new Date().toISOString(),
    duurMinuten: body.duurMinuten ?? 60,
    reden: body.reden || null,
    gebruiker: body.gebruiker || null,
  };
  db.extraSportmomenten.push(item);
  writeDb(db);
  return NextResponse.json({ ok: true, item });
}
