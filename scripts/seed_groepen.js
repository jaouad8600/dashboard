const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function ensureGroup(naam, kleur = "gray") {
  const existing = await prisma.groep.findFirst({ where: { naam } });
  if (existing) {
    if (existing.kleur !== kleur) {
      await prisma.groep.update({
        where: { id: existing.id },
        data: { kleur },
      });
    }
    return existing;
  }
  return prisma.groep.create({ data: { naam, kleur } });
}

async function addNote(groepId, tekst, auteur = null) {
  return prisma.notitie.create({ data: { tekst, auteur, groepId } });
}

async function main() {
  // Maak voorbeeldgroepen
  const eb = await ensureGroup("Team Eb", "rood"); // ja, Nederlandse kleur zodat je “Rode groepen” kaart het pakt
  const vloed = await ensureGroup("Team Vloed", "red"); // ook “red” voor zekerheid
  const jeugd = await ensureGroup("Jeugd A", "gray");
  const plus = await ensureGroup("Plusgroep", "yellow");

  // Voeg wat notities toe als er nog niets is
  const countEb = await prisma.notitie.count({ where: { groepId: eb.id } });
  if (countEb === 0) {
    await addNote(eb.id, "Let op: cardio-inloop om 10:00", "Planner");
    await addNote(eb.id, "Nieuwe intake morgen 09:30", "Joey");
  }

  const countV = await prisma.notitie.count({ where: { groepId: vloed.id } });
  if (countV === 0) {
    await addNote(
      vloed.id,
      "Gymzaal Vloed tijdelijk dicht i.v.m. schoonmaak",
      "Begeleider",
    );
  }

  console.log("✅ Groepen en notities gezaaid.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
