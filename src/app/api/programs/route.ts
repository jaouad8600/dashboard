import { NextResponse } from "next/server";
import { getPrograms, createProgram, deleteProgram } from "@/services/programService";
import { z } from "zod";

const createProgramSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    type: z.enum(["TRAINING", "NUTRITION"]),
    content: z.string(),
});

export async function GET() {
    try {
        const programs = await getPrograms();
        return NextResponse.json(programs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = createProgramSchema.parse(body);

        const program = await createProgram(validatedData);
        return NextResponse.json(program, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        await deleteProgram(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
    }
}
