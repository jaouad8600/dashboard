import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const groups = await prisma.group.findMany();

    if (groups.length === 0) {
        console.log("No groups found. Please seed groups first.");
        return;
    }

    const youths = [
        { firstName: "Jan", lastName: "Jansen", groupName: "Groep A" },
        { firstName: "Piet", lastName: "Pietersen", groupName: "Groep A" },
        { firstName: "Klaas", lastName: "Klaassen", groupName: "Groep B" },
        { firstName: "Mohammed", lastName: "Ali", groupName: "Groep B" },
        { firstName: "Sophie", lastName: "De Vries", groupName: "Groep C" },
        { firstName: "Emma", lastName: "Bakker", groupName: "Groep C" },
    ];

    for (const y of youths) {
        // Find group (fuzzy match or just pick one if not found)
        const group = groups.find(g => g.name.includes(y.groupName.split(" ")[1])) || groups[0];

        await prisma.youth.create({
            data: {
                firstName: y.firstName,
                lastName: y.lastName,
                groupId: group.id,
            },
        });
    }

    console.log("Seeded youths.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
