import { PrismaClient } from "@prisma/client";
import fs from "fs"; import path from "path";
const prisma = new PrismaClient();
const now = new Date(); const ts = now.toISOString().replace(/[:.]/g,"-");
const file = path.join("backups", `backup-${ts}.json`);
const dump = {
  meta: { createdAt: now.toISOString() },
  overdrachten: await prisma.overdracht.findMany({ include:{ history:true }, orderBy:{ createdAt:"desc" } }),
  materialen:   await prisma.material.findMany({ orderBy:{ createdAt:"desc" } }),
  mutaties:     await prisma.mutatie.findMany({ orderBy:[{active:"desc"},{ ts:"desc"}] }),
  events:       await prisma.event.findMany({ orderBy:{ ts:"desc" }, take: 2000 }),
};
fs.writeFileSync(file, JSON.stringify(dump,null,2));
console.log("✅ Backup geschreven:", file);
process.exit(0);
