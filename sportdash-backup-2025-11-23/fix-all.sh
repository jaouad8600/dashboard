#!/usr/bin/env bash
set -euo pipefail

echo "🔪 Kill running dev servers on 3000..3005"
for p in 3000 3001 3002 3003 3004 3005; do
  lsof -ti :$p 2>/dev/null | xargs -r kill -9 || true
done
pkill -f "next dev" 2>/dev/null || true
pkill -f "node .*next" 2>/dev/null || true

echo "📦 Ensure deps"
npm i -D prisma >/dev/null 2>&1 || true
npm i @prisma/client >/dev/null 2>&1 || true

echo "📝 Ensure .env DATABASE_URL"
if [ ! -f .env ]; then
  echo 'DATABASE_URL="file:./dev.db"' > .env
else
  if ! grep -q '^DATABASE_URL=' .env; then
    echo 'DATABASE_URL="file:./dev.db"' >> .env
  fi
fi

echo "🧱 Write prisma/schema.prisma"
mkdir -p prisma
cat > prisma/schema.prisma <<'TS'
generator client { provider = "prisma-client-js" }

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Overdracht {
  id           String   @id @default(cuid())
  title        String?
  body         String
  createdAt    DateTime @default(now())
  createdBy    String?
  lastEditedAt DateTime?
  lastEditedBy String?
  history      OverdrachtHistory[]
  @@index([createdAt])
}

model OverdrachtHistory {
  id           String   @id @default(cuid())
  overdrachtId String
  ts           DateTime @default(now())
  by           String?
  title        String?
  body         String
  overdracht   Overdracht @relation(fields: [overdrachtId], references: [id], onDelete: Cascade)
  @@index([overdrachtId])
}

model Material {
  id        String   @id @default(cuid())
  name      String
  locatie   String
  status    String
  aantal    Int      @default(1)
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Mutatie {
  id        String   @id @default(cuid())
  group     String
  naam      String
  dienst    String?
  type      String
  notitie   String?
  active    Boolean  @default(true)
  ts        DateTime @default(now())
  by        String?
  updatedAt DateTime @updatedAt
}

model Event {
  id       String   @id @default(cuid())
  ts       DateTime @default(now())
  kind     String
  entity   String
  entityId String?
  by       String?
  data     Json?
  @@index([ts])
  @@index([entity, entityId])
}
TS

echo "🔧 Prisma generate + migrate"
npx prisma generate
npx prisma migrate dev -n "init-or-repair"

echo "🧩 Prisma client singleton"
mkdir -p src/server
cat > src/server/db.ts <<'TS'
import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ log: ['error','warn'] });
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
TS

echo "🛠️ API: materialen"
mkdir -p src/app/api/materialen src/app/api/materialen/[id]
cat > src/app/api/materialen/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  const items = await prisma.material.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { name, locatie, status = "Goed", aantal = 1, note } = await req.json();

  const clean = {
    name: String(name ?? "").trim(),
    locatie: String(locatie ?? "").trim(),
    status: String(status ?? "Goed").trim() || "Goed",
    aantal: Number.isFinite(Number(aantal)) ? Number(aantal) : 1,
    note: note != null ? String(note).trim() : undefined,
  };
  if (!clean.name || !clean.locatie) {
    return NextResponse.json({ error: "Naam en locatie zijn verplicht." }, { status: 400 });
  }
  const created = await prisma.material.create({ data: clean });
  await prisma.event.create({ data: { kind: "create", entity: "material", entityId: created.id, data: clean } });
  return NextResponse.json(created, { status: 201 });
}
TS

cat > src/app/api/materialen/[id]/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { name, locatie, status, aantal, note } = await req.json();

  const data: any = {};
  if (name !== undefined)    data.name    = String(name ?? "").trim();
  if (locatie !== undefined) data.locatie = String(locatie ?? "").trim();
  if (status !== undefined)  data.status  = String(status ?? "").trim() || "Goed";
  if (aantal !== undefined)  data.aantal  = Number.isFinite(Number(aantal)) ? Number(aantal) : 1;
  if (note !== undefined)    data.note    = note != null ? String(note).trim() : null;

  const updated = await prisma.material.update({ where: { id }, data });
  await prisma.event.create({ data: { kind: "edit", entity: "material", entityId: id, data } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.material.delete({ where: { id } });
  await prisma.event.create({ data: { kind: "delete", entity: "material", entityId: id } });
  return NextResponse.json({ ok: true });
}
TS

echo "🛠️ API: mutaties"
mkdir -p src/app/api/mutaties src/app/api/mutaties/[id]
cat > src/app/api/mutaties/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  const items = await prisma.mutatie.findMany({ orderBy: [{ active: "desc" }, { ts: "desc" }] });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { group, naam, dienst, type, notitie, by } = await req.json();
  const clean = {
    group:  String(group ?? "").trim(),
    naam:   String(naam  ?? "").trim(),
    dienst: dienst != null ? String(dienst).trim() : undefined,
    type:   String(type  ?? "").trim(),
    notitie:notitie != null ? String(notitie).trim() : undefined,
    by:     by != null ? String(by).trim() : undefined,
  };
  if (!clean.group || !clean.naam || !clean.type) {
    return NextResponse.json({ error: "group/naam/type vereist" }, { status: 400 });
  }
  const created = await prisma.mutatie.create({ data: clean });
  await prisma.event.create({ data: { kind: "create", entity: "mutatie", entityId: created.id, data: clean } });
  return NextResponse.json(created, { status: 201 });
}
TS

cat > src/app/api/mutaties/[id]/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { group, naam, dienst, type, notitie, active, by } = await req.json();
  const data: any = {};
  if (group   !== undefined) data.group   = String(group ?? "").trim();
  if (naam    !== undefined) data.naam    = String(naam  ?? "").trim();
  if (dienst  !== undefined) data.dienst  = dienst != null ? String(dienst).trim() : null;
  if (type    !== undefined) data.type    = String(type  ?? "").trim();
  if (notitie !== undefined) data.notitie = notitie != null ? String(notitie).trim() : null;
  if (active  !== undefined) data.active  = !!active;
  if (by      !== undefined) data.by      = by != null ? String(by).trim() : null;

  const updated = await prisma.mutatie.update({ where: { id }, data });
  await prisma.event.create({ data: { kind: "edit", entity: "mutatie", entityId: id, data } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.mutatie.delete({ where: { id } });
  await prisma.event.create({ data: { kind: "delete", entity: "mutatie", entityId: id } });
  return NextResponse.json({ ok: true });
}
TS

echo "📚 Client libs"
mkdir -p src/lib
cat > src/lib/materialen.ts <<'TS'
"use client";
export type Materiaal = {
  id: string; name: string; locatie: string; status: string;
  aantal: number; note?: string|null; createdAt: string; updatedAt: string;
};
function ping(){ if(typeof window!=="undefined") window.dispatchEvent(new CustomEvent("materialen:changed")); }

export async function listMaterialen(): Promise<Materiaal[]> {
  const r = await fetch("/api/materialen",{cache:"no-store"});
  if(!r.ok) throw new Error("Load fail");
  return r.json();
}
export async function createMateriaal(d: Partial<Materiaal>) {
  const r = await fetch("/api/materialen",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
  if(!r.ok) throw new Error("Create fail");
  ping(); return r.json();
}
export async function patchMateriaal(id:string,d: Partial<Materiaal>) {
  const r = await fetch(`/api/materialen/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
  if(!r.ok) throw new Error("Patch fail");
  ping(); return r.json();
}
export async function deleteMateriaal(id:string) {
  const r = await fetch(`/api/materialen/${id}`,{method:"DELETE"});
  if(!r.ok) throw new Error("Delete fail");
  ping();
}
export function onMaterialenChange(cb:()=>void){
  const h=()=>cb();
  if(typeof window!=="undefined"){
    window.addEventListener("materialen:changed",h as EventListener);
    return ()=>window.removeEventListener("materialen:changed",h as EventListener);
  }
  return ()=>{};
}
TS

cat > src/lib/mutaties.ts <<'TS'
"use client";
export type Mutatie = {
  id:string; group:string; naam:string; dienst?:string|null;
  type:string; notitie?:string|null; active:boolean; ts:string; by?:string|null; updatedAt:string;
};
function ping(){ if(typeof window!=="undefined") window.dispatchEvent(new CustomEvent("mutaties:changed")); }

export async function listMutaties(): Promise<Mutatie[]> {
  const r = await fetch("/api/mutaties",{cache:"no-store"});
  if(!r.ok) throw new Error("Load fail");
  return r.json();
}
export async function createMutatie(d: Partial<Mutatie>) {
  const r = await fetch("/api/mutaties",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
  if(!r.ok) throw new Error("Create fail");
  ping(); return r.json();
}
export async function patchMutatie(id:string, d: Partial<Mutatie>) {
  const r = await fetch(`/api/mutaties/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
  if(!r.ok) throw new Error("Patch fail");
  ping(); return r.json();
}
export async function deleteMutatie(id:string) {
  const r = await fetch(`/api/mutaties/${id}`,{method:"DELETE"});
  if(!r.ok) throw new Error("Delete fail");
  ping();
}
export function onMutatiesChange(cb:()=>void){
  const h=()=>cb();
  if(typeof window!=="undefined"){
    window.addEventListener("mutaties:changed",h as EventListener);
    return ()=>window.removeEventListener("mutaties:changed",h as EventListener);
  }
  return ()=>{};
}
TS

echo "�� Clean .next and start dev on 3001"
rm -rf .next
PORT=3001 npm run dev -- -p 3001
