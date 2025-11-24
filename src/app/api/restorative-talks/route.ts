import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/restorative-talks - Fetch talks (optionally by groupId, status, archived)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get("groupId");
        const status = searchParams.get("status");
        const includeArchived = searchParams.get("includeArchived") === "true";

        const where: any = {};

        if (groupId) {
            where.groupId = groupId;
        }

        if (status) {
            where.status = status;
        }

        if (!includeArchived) {
            where.archived = false;
        }

        const talks = await prisma.restorativeTalk.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(talks);
    } catch (error) {
        console.error("Error fetching restorative talks:", error);
        return NextResponse.json(
            { error: "Failed to fetch restorative talks" },
            { status: 500 }
        );
    }
}

// POST /api/restorative-talks - Create new talk
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { groupId, youthName, reason, createdBy } = body;

        if (!groupId || !youthName || !youthName.trim()) {
            return NextResponse.json(
                { error: "groupId and youthName are required" },
                { status: 400 }
            );
        }

        const talk = await prisma.restorativeTalk.create({
            data: {
                groupId,
                youthName: youthName.trim(),
                reason: reason || "",
                createdBy: createdBy || "system",
                status: "PENDING",
            },
        });

        return NextResponse.json(talk, { status: 201 });
    } catch (error) {
        console.error("Error creating restorative talk:", error);
        return NextResponse.json(
            { error: "Failed to create restorative talk" },
            { status: 500 }
        );
    }
}

// PUT /api/restorative-talks - Update talk status
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status, failureReason, archived } = body;

        if (!id) {
            return NextResponse.json(
                { error: "id is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};

        if (status) {
            updateData.status = status;

            if (status === "COMPLETED") {
                updateData.completedAt = new Date();
            }

            if (status === "FAILED" && failureReason) {
                updateData.failureReason = failureReason;
            }
        }

        if (archived !== undefined) {
            updateData.archived = archived;
            if (archived) {
                updateData.archivedAt = new Date();
            }
        }

        const talk = await prisma.restorativeTalk.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(talk);
    } catch (error) {
        console.error("Error updating restorative talk:", error);
        return NextResponse.json(
            { error: "Failed to update restorative talk" },
            { status: 500 }
        );
    }
}

// DELETE /api/restorative-talks - Delete talk
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "id is required" },
                { status: 400 }
            );
        }

        await prisma.restorativeTalk.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting restorative talk:", error);
        return NextResponse.json(
            { error: "Failed to delete restorative talk" },
            { status: 500 }
        );
    }
}
