import { NextResponse } from "next/server";
import { updateGroup } from "@/services/groupService";
import { z } from "zod";

const updateGroupSchema = z.object({
    name: z.string().min(2).optional(),
    color: z.string().optional(),
    department: z.string().optional(),
    isActive: z.boolean().optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = updateGroupSchema.parse(body);
        const updatedGroup = await updateGroup(params.id, validatedData);
        return NextResponse.json(updatedGroup);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
    }
}
