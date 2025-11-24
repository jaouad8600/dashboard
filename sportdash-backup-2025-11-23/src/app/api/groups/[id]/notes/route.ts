import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/groups/[id]/notes - Get all notes for a group
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";

        const where: any = { groupId: id };
        if (!includeArchived) {
            where.archived = false;
        }

        const notes = await prisma.note.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        return NextResponse.json(
            { error: "Failed to fetch notes" },
            { status: 500 }
        );
    }
}

// POST /api/groups/[id]/notes - Create a new note
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { content, authorId } = body;

        if (!content || content.trim() === "") {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        const note = await prisma.note.create({
            data: {
                content: content.trim(),
                groupId: id,
                authorId: authorId || "system",
                archived: false,
            },
        });

        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        console.error("Error creating note:", error);
        return NextResponse.json(
            { error: "Failed to create note" },
            { status: 500 }
        );
    }
}
