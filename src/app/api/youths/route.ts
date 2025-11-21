import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get("groupId");

        const youths = await prisma.youth.findMany({
            where: {
                ...(groupId && { groupId }),
            },
            include: {
                group: true,
            },
            orderBy: { firstName: "asc" },
        });

        return NextResponse.json(youths);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch youths" }, { status: 500 });
    }
}
