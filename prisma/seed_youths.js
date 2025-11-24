const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding youths...');

    const groups = await prisma.group.findMany();

    if (groups.length === 0) {
        console.log('No groups found. Please seed groups first.');
        return;
    }

    const firstNames = ["Jan", "Piet", "Klaas", "Mohammed", "Ali", "Sophie", "Emma", "Lucas", "Milan", "Sem", "Daan", "Levi", "Luuk", "Noud", "Mees"];
    const lastNames = ["Jansen", "De Vries", "Bakker", "Visser", "Smit", "Meijer", "De Boer", "Mulder", "De Jong", "Bos", "Vos", "Peters", "Hendriks", "Van Dijk", "Kok"];

    for (const group of groups) {
        // Add 3-5 youths per group
        const count = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

            await prisma.youth.create({
                data: {
                    firstName,
                    lastName,
                    groupId: group.id,
                }
            });
        }
        console.log(`Added ${count} youths to group ${group.name}`);
    }

    console.log('Seeding youths finished.');
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
