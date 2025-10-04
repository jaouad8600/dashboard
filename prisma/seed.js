const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GROEPEN = [
  "Eb","Poel","Lier","Zijl","Nes","Vliet","Gaag",
  "Vloed","Kust","Golf","Zift","Lei","Kade","Kreek","Duin","Rak","Bron",
];

async function main() {
  for (const naam of GROEPEN) {
    await prisma.groep.upsert({
      where: { naam },
      update: {},
      create: { naam, kleur: "GREEN" },
    });
  }
  console.log("✅ Groepen ge-seed");
}

main().finally(()=>prisma.$disconnect());
