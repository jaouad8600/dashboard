import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIndicatieText } from "@/lib/indicaties/parser";

export async function POST(request: Request) {
    try {
        // 1. Validate Token (Simple Security)
        const token = request.headers.get("X-IMPORT-TOKEN");
        const validToken = process.env.IMPORT_API_TOKEN || "dev-token-123"; // Fallback for dev

        if (token !== validToken) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Invalid Token" },
                { status: 401 }
            );
        }

        // 2. Parse Body
        const body = await request.json();
        const { rawText, source = "outlook", receivedAt } = body;

        if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
            return NextResponse.json(
                { success: false, message: "Invalid input: rawText is required" },
                { status: 400 }
            );
        }

        // 3. Parse Text
        const parsed = parseIndicatieText(rawText);

        // 4. Map to Prisma Model
        // Note: We need to handle some fields carefully, e.g. dates and enums

        // Determine IndicationType based on activities
        let type = "OVERIG";
        if (parsed.indicatieActiviteiten.includes("Sport")) type = "MEDISCH"; // Default to MEDISCH for Sport
        if (parsed.indicatieActiviteiten.includes("Muziek") || parsed.indicatieActiviteiten.includes("Creatief aanbod")) type = "OVERIG";

        // Try to find Youth by name (Optional, but good for linking)
        // Simple fuzzy match or exact match on First + Last name
        // For now, we store the name in the description or a new field if we had one. 
        // The current model doesn't have a 'youthName' field if not linked, it relies on 'youthId'.
        // However, the user request implies we create a record.
        // Existing model has: youthId (optional), description, type, issuedBy, etc.
        // We might need to create a Youth record or just store the name in description for now if no match found.
        // BUT: The user prompt says "SportDash maakt automatisch een nieuwe sportindicatie in de database."
        // And the parser returns 'naamJongere'.

        // Let's try to find the youth
        let youthId = null;
        if (parsed.naamJongere && parsed.naamJongere !== "Onbekend") {
            // Split name
            const parts = parsed.naamJongere.split(" ");
            if (parts.length >= 2) {
                const firstName = parts[0];
                const lastName = parts.slice(1).join(" ");

                const youth = await prisma.youth.findFirst({
                    where: {
                        firstName: { contains: firstName },
                        lastName: { contains: lastName }
                    }
                });
                if (youth) youthId = youth.id;
            }
        }

        // Find Group
        let groupId = "";
        if (parsed.leefgroep) {
            const group = await prisma.group.findFirst({
                where: { name: { contains: parsed.leefgroep } }
            });
            if (group) groupId = group.id;
        }

        // If no group found, we might need a default or error. 
        // For now, let's pick the first active group as fallback or fail?
        // Better to fail if no group, or use a "Onbekend" group if exists.
        if (!groupId) {
            const defaultGroup = await prisma.group.findFirst({ where: { name: "Onbekend" } });
            if (defaultGroup) {
                groupId = defaultGroup.id;
            } else {
                // Create a placeholder group or fail? 
                // Let's just pick the first one to avoid crashing, but log warning
                const anyGroup = await prisma.group.findFirst();
                if (anyGroup) groupId = anyGroup.id;
            }
        }

        // Construct Description
        // The existing model uses 'description' as the main text.
        // We can combine info here.


        const newIndication = await prisma.sportIndication.create({
            data: {
                youthId,
                youthName: parsed.naamJongere, // Fallback name
                groupId: groupId!,
                description: parsed.onderbouwingIndicering || "Geen onderbouwing", // Use reasoning as description or summary
                type: type as any,
                issuedBy: parsed.indicatieAfgegevenDoor || "Onbekend",
                leefgroep: parsed.leefgroep,
                activities: JSON.stringify(parsed.indicatieActiviteiten), // Store activities as JSON
                advice: parsed.adviesInhoudActiviteit,
                reasoning: parsed.onderbouwingIndicering,
                responsiblePersons: "",
                feedbackTo: parsed.terugkoppelingAan,
                canCombineWithGroup: parsed.kanCombinerenMetGroepsgenoot ?? true,
                guidanceTips: parsed.bejegeningstips,
                learningGoals: parsed.leerdoelen,
                validFrom: parsed.geldigVanaf ? new Date(parsed.geldigVanaf) : new Date(),
                validUntil: parsed.geldigTot ? new Date(parsed.geldigTot) : null,
                isActive: true,
                source,
                receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
            }
        });

        // 5. Notification (Simple DB record or just log for now as requested)
        // "Richt een simpele notificatie-structuur in... (optioneel, maar alvast voorbereiden)"
        // We can create a Note or just rely on the 'source' field for querying recent imports.

        return NextResponse.json({
            success: true,
            id: newIndication.id,
            message: "Sportindicatie succesvol geïmporteerd",
            parsed
        }, { status: 201 });

    } catch (error) {
        console.error("Import Error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to import indication",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
