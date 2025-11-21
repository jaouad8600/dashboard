import { NextResponse } from "next/server";
import {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
} from "@/services/materialService";
import { z } from "zod";
import { MaterialCategory, ConditionStatus } from "@prisma/client";

const createMaterialSchema = z.object({
    name: z.string().min(2),
    category: z.nativeEnum(MaterialCategory),
    description: z.string().optional(),
    quantityTotal: z.number().int().min(0),
    quantityUsable: z.number().int().min(0),
    location: z.string().min(1),
    conditionStatus: z.nativeEnum(ConditionStatus).optional(),
});

const updateMaterialSchema = z.object({
    id: z.string(),
    name: z.string().min(2).optional(),
    category: z.nativeEnum(MaterialCategory).optional(),
    description: z.string().nullable().optional(),
    quantityTotal: z.number().int().min(0).optional(),
    quantityUsable: z.number().int().min(0).optional(),
    location: z.string().min(1).optional(),
    conditionStatus: z.nativeEnum(ConditionStatus).optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") as MaterialCategory | null;
        const conditionStatus = searchParams.get("conditionStatus") as ConditionStatus | null;
        const location = searchParams.get("location");

        const materials = await getMaterials({
            ...(category && { category }),
            ...(conditionStatus && { conditionStatus }),
            ...(location && { location }),
        });

        return NextResponse.json(materials);
    } catch (error) {
        console.error("Error fetching materials:", error);
        return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = createMaterialSchema.parse(body);

        const material = await createMaterial(validatedData);
        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error creating material:", error);
        return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = updateMaterialSchema.parse(body);

        const material = await updateMaterial(id, data);
        return NextResponse.json(material);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error updating material:", error);
        return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Material ID required" }, { status: 400 });
        }

        await deleteMaterial(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting material:", error);
        return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
    }
}
