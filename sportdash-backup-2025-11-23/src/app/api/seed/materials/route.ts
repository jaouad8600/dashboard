import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MATERIALS = [
    // --- Kortverblijf - Sporthal ---
    { name: "Banken", quantity: 4, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Doelen", quantity: 2, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Basket", quantity: 4, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Tafeltennis tafel", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Tafeltennis rackets", quantity: 4, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Net houders", quantity: 4, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Volleybalnet", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Badmintonnet", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Trampoline", quantity: 2, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Bok", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Springplank", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Kasten", quantity: 2, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Dikke mat", quantity: 2, category: "MATTEN", location: "Kortverblijf - Sporthal" },
    { name: "Touw", quantity: 3, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Blauwe matten", quantity: 6, category: "MATTEN", location: "Kortverblijf - Sporthal" },
    { name: "Grijze matten", quantity: 7, category: "MATTEN", location: "Kortverblijf - Sporthal" },
    { name: "Slip matten", quantity: 0, category: "MATTEN", location: "Kortverblijf - Sporthal" },
    { name: "Extra trampoline cover", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Zwaaistok", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },
    { name: "Ringstok", quantity: 1, category: "OVERIG", location: "Kortverblijf - Sporthal" },

    // --- Langverblijf - Fitness ---
    { name: "Dumbbels (2 tm 40 kg)", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" }, // Set count as 1 for the set
    { name: "Dumbbel rack", quantity: 2, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Bicep curl bankje", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Bicep curl stang", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Airbike", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Cable station", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Seated leg press", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Leg extension", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Pectoral fly", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Bench press", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Fitness Bankje", quantity: 2, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Cross box", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Schijven 1,25 kg", quantity: 2, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Schijven 2,5 kg", quantity: 4, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Schijven 5 kg", quantity: 4, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Schijven 10 kg", quantity: 4, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Schijven 15 kg", quantity: 2, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Schijven 20 kg", quantity: 2, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Schijven 25 kg", quantity: 2, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Stang 20 kg", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Stang 15 kg", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Lunch rek", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Fitness matten", quantity: 3, category: "MATTEN", location: "Langverblijf - Fitness" },
    { name: "Cable station atributen rug", quantity: 4, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Cable station atributen tricep", quantity: 4, category: "FITNESS", location: "Langverblijf - Fitness" }, // 2 stangen + 2 touwen
    { name: "Cable station atributen bicep", quantity: 4, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Deadlift gordel", quantity: 2, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Pullup gordel", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Stanghouder", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Lower back bench", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Arm blaster", quantity: 1, category: "FITNESS", location: "Langverblijf - Fitness" },
    { name: "Elastieken", quantity: 2, category: "ELASTIEKEN", location: "Langverblijf - Fitness" },
];

export async function GET() {
    try {
        for (const item of MATERIALS) {
            // Use findFirst to check existence by name and location
            const existing = await prisma.material.findFirst({
                where: { name: item.name, location: item.location }
            });

            if (!existing) {
                await prisma.material.create({
                    data: {
                        name: item.name,
                        quantityTotal: item.quantity,
                        quantityUsable: item.quantity,
                        category: item.category as any,
                        location: item.location,
                        conditionStatus: "GOED"
                    }
                });
            } else {
                // Optional: Update quantity if needed
                await prisma.material.update({
                    where: { id: existing.id },
                    data: {
                        quantityTotal: item.quantity,
                        // Don't reset usable quantity if it was changed, unless we want to force sync
                    }
                });
            }
        }
        return NextResponse.json({ success: true, message: "Materials seeded with Langverblijf items" });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: "Failed to seed materials" }, { status: 500 });
    }
}
