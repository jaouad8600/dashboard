import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const updateYouthSchema = z.object({
    id: z.string(),
    needsRestorativeTalk: z.boolean().optional(),
});

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = updateYouthSchema.parse(body);

        const youth = await prisma.youth.update({
            where: { id },
            data,
        });

        return NextResponse.json(youth);
    } catch (error) {
        console.error("Error updating youth:", error);
        return NextResponse.json(
            { error: "Failed to update youth" },
            { status: 500 }
        );
    }
}
