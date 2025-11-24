import { prisma } from "../src/lib/prisma";

// Fix corrupted evaluations in SportIndication table
async function fixEvaluations() {
    try {
        console.log("Starting to fix corrupted evaluations...");

        // Get all indications
        const indications = await prisma.$queryRawUnsafe(`
            SELECT id, evaluations FROM SportIndication
        `);

        console.log(`Found ${(indications as any[]).length} indications`);

        // Fix each one
        for (const indication of indications as any[]) {
            try {
                // Try to parse JSON
                if (!indication.evaluations || indication.evaluations === "") {
                    await prisma.$executeRawUnsafe(`
                        UPDATE SportIndication 
                        SET evaluations = '[]'
                        WHERE id = '${indication.id}'
                    `);
                    console.log(`Fixed empty evaluations for ${indication.id}`);
                } else {
                    try {
                        JSON.parse(indication.evaluations);
                    } catch {
                        await prisma.$executeRawUnsafe(`
                            UPDATE SportIndication 
                            SET evaluations = '[]'
                            WHERE id = '${indication.id}'
                        `);
                        console.log(`Fixed invalid JSON for ${indication.id}`);
                    }
                }
            } catch (err) {
                console.log(`Error fixing ${indication.id}:`, err);
            }
        }

        console.log("Done!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixEvaluations();
