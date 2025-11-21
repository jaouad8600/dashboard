
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
});

const updateIndicationSchema = z.object({
    id: z.string(),
    validUntil: z.string().optional(),
    isActive: z.boolean().optional(),
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
