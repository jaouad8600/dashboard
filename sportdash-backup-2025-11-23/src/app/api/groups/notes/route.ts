import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
        return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    try {
        const notes = await prisma.note.findMany({
            where: {
                groupId,
                archived: false, // By default only show active notes
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(notes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { content, groupId, authorId } = body;

        const note = await prisma.note.create({
            data: {
                content,
                groupId,
                authorId,
            },
        });

        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, content, archived } = body;

        const note = await prisma.note.update({
            where: { id },
            data: {
                content,
                archived,
            },
        });

        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    try {
        await prisma.note.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }
}
