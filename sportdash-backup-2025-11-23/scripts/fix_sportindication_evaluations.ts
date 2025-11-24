import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function isValidJson(value: any): Promise<boolean> {
    if (value === null || value === undefined) return true;
    try {
        // If it's already an object, consider it valid
        if (typeof value === 'object') return true;
        // Otherwise try to parse as JSON string
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}

async function fixEvaluations() {
    console.log('Fetching all SportIndication records...');
    const indications = await prisma.sportIndication.findMany({
        select: { id: true, evaluations: true },
    });

    const updates: { id: string; evaluations: any }[] = [];

    for (const ind of indications) {
        const valid = await isValidJson(ind.evaluations);
        if (!valid) {
            console.log(`Invalid evaluations for id ${ind.id}:`, ind.evaluations);
            updates.push({ id: ind.id, evaluations: [] }); // reset to empty array
        }
    }

    if (updates.length === 0) {
        console.log('No invalid evaluations found.');
        return;
    }

    console.log(`Updating ${updates.length} records...`);
    for (const upd of updates) {
        await prisma.sportIndication.update({
            where: { id: upd.id },
            data: { evaluations: upd.evaluations as any },
        });
        console.log(`Updated id ${upd.id}`);
    }

    console.log('Fix completed.');
}

fixEvaluations()
    .catch((e) => {
        console.error('Error during fix:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
