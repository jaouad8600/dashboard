const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const groups = [
  "Gaag", "Vliet", "Zijl", "Lier", "Poel", "Nes", "Rak", "Kust", "Zift", "Bron",
  "Dijk", "Kreek", "Duin", "Lei", "Poel A", "Poel B", "Golf"
];

const colors = ["GROEN", "GEEL", "ORANJE", "ROOD"];

async function main() {
  console.log('Start seeding ...');

  for (let i = 0; i < groups.length; i++) {
    const name = groups[i];
    const color = colors[i % colors.length];

    const group = await prisma.group.upsert({
      where: { name: name },
      update: {},
      create: {
        name: name,
        color: color,
        isActive: true,
        department: "Teylingereind",
      },
    });
    console.log(`Created group with id: ${group.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
