import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetEvaluations() {
    console.log('Resetting all SportIndication.evaluations to an empty array []');
    // Direct raw SQL update – works for SQLite and PostgreSQL alike
    await prisma.$executeRaw`UPDATE "SportIndication" SET "evaluations" = '[]'`;
    console.log('Reset complete.');
}

resetEvaluations()
    .catch((e) => {
        console.error('Error during reset:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
