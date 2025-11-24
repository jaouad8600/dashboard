import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { MaterialCategory, ConditionStatus } from "@prisma/client";

const materialSchema = z.object({
    name: z.string().min(2),
    category: z.nativeEnum(MaterialCategory),
    description: z.string().nullable().optional(),
    quantityTotal: z.number().min(0),
    quantityUsable: z.number().min(0),
    location: z.string().min(2),
    conditionStatus: z.nativeEnum(ConditionStatus),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const query = searchParams.get("query");

        const where: any = {};

        if (category && category !== "ALL") {
            where.category = category;
        }

        if (query) {
            where.OR = [
                { name: { contains: query } },
                { location: { contains: query } },
            ];
        }

        const materials = await prisma.material.findMany({
            where,
            orderBy: { name: "asc" },
        });

        return NextResponse.json(materials);
    } catch (error) {
        console.error("Error fetching materials:", error);
        return NextResponse.json(
            { error: "Failed to fetch materials" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = materialSchema.parse(body);

        const material = await prisma.material.create({
            data: validatedData,
        });

        return NextResponse.json(material);
    } catch (error) {
        console.error("Error creating material:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as z.ZodError).errors }, { status: 400 });
        }
        return NextResponse.json(
            { error: "Failed to create material" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const validatedData = materialSchema.partial().parse(data);

        const material = await prisma.material.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json(material);
    } catch (error) {
        console.error("Error updating material:", error);
        return NextResponse.json(
            { error: "Failed to update material" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.material.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting material:", error);
        return NextResponse.json(
            { error: "Failed to delete material" },
            { status: 500 }
        );
    }
}
