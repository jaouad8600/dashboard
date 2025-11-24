
import { NextResponse } from "next/server";
import { createIndication, updateIndication, getActiveIndications } from "@/services/medicalService";
import { z } from "zod";
import { IndicationType } from "@prisma/client";
import prisma from "@/lib/db";

const createIndicationSchema = z.object({
    youthName: z.string(),
    groupId: z.string(),
    description: z.string(),
    type: z.nativeEnum(IndicationType),
    validFrom: z.string(), // ISO date string
    validUntil: z.string().optional(), // ISO date string

    // New medical service fields
    leefgroep: z.string().optional(),
    responsiblePersons: z.string().optional(),
    issuedBy: z.string().optional(),
    feedbackTo: z.string().optional(),
    canCombineWithGroup: z.boolean().optional(),
    guidanceTips: z.string().optional(),
    learningGoals: z.string().optional(),
});

const updateIndicationSchema = z.object({
    id: z.string(),
    validUntil: z.string().optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
    type: z.nativeEnum(IndicationType).optional(),

    // Pause fields
    isPaused: z.boolean().optional(),
    pausedAt: z.string().optional(),
    pauseReason: z.string().optional(),

    // Archive fields  
    archived: z.boolean().optional(),
    archivedAt: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get("groupId") || undefined;
        const dateStr = searchParams.get("date");
        const date = dateStr ? new Date(dateStr) : undefined;

        const indications = await getActiveIndications(groupId, date);
        return NextResponse.json(indications);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch indications" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const headers = request.headers;
        const userId = headers.get("x-user-id") || "unknown";

        const validatedData = createIndicationSchema.parse(body);

        // Parse youth name (format: "FirstName LastName")
        const nameParts = validatedData.youthName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Find or create youth
        let youth = await prisma.youth.findFirst({
            where: {
                firstName: { equals: firstName },
                lastName: { equals: lastName },
                groupId: validatedData.groupId,
            },
        });

        if (!youth) {
            youth = await prisma.youth.create({
                data: {
                    firstName,
                    lastName,
                    groupId: validatedData.groupId,
                },
            });
        }

        const indication = await createIndication({
            youthId: youth.id,
            groupId: validatedData.groupId,
            description: validatedData.description,
            type: validatedData.type,
            validFrom: new Date(validatedData.validFrom),
            validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : undefined,
            createdBy: userId,

            // New medical service fields
            leefgroep: validatedData.leefgroep,
            responsiblePersons: validatedData.responsiblePersons,
            issuedBy: validatedData.issuedBy || "Medische Dienst",
            feedbackTo: validatedData.feedbackTo,
            canCombineWithGroup: validatedData.canCombineWithGroup ?? true,
            guidanceTips: validatedData.guidanceTips,
            learningGoals: validatedData.learningGoals,
        });

        return NextResponse.json(indication, { status: 201 });
    } catch (error) {
        console.error("Create indication error:", error);
        return NextResponse.json({ error: "Failed to create indication", details: String(error) }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = updateIndicationSchema.parse(body);

        const updateData: any = {};
        if (data.validUntil) updateData.validUntil = new Date(data.validUntil);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const indication = await updateIndication(id, updateData);
        return NextResponse.json(indication);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update indication" }, { status: 500 });
    }
}
