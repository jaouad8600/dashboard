import { NextResponse } from "next/server";
import { toggleExtraSport, getExtraSportWeek, getExtraSportStats } from "@/services/extraSportService";
import { z } from "zod";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get("weekStart");
    const groupIdParam = searchParams.get("groupId");

    if (groupIdParam) {
        // Fetch stats for a specific group
        const stats = await getExtraSportStats(groupIdParam);
        return NextResponse.json(stats);
    }

    if (weekStartParam) {
        // Fetch moments for a week
        const date = new Date(weekStartParam);
        if (isNaN(date.getTime())) {
            return NextResponse.json({ error: "Invalid date" }, { status: 400 });
        }
        const moments = await getExtraSportWeek(date);
        return NextResponse.json(moments);
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const schema = z.object({
            groupId: z.string(),
            date: z.string(), // ISO date string
        });

        const { groupId, date } = schema.parse(body);
        const result = await toggleExtraSport(groupId, new Date(date));

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to toggle" }, { status: 500 });
    }
}
