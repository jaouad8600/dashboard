import { NextResponse } from "next/server";
import { calculateGroupPriorities, registerExtraSportMoment } from "@/services/sportPriorityService";

/**
 * GET /api/sport-priority
 * Haal de belvolgorde op voor extra sportmomenten
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        const startDate = startDateParam ? new Date(startDateParam) : undefined;
        const endDate = endDateParam ? new Date(endDateParam) : undefined;

        const priorities = await calculateGroupPriorities(startDate, endDate);

        return NextResponse.json(priorities);
    } catch (error) {
        console.error("Error calculating sport priorities:", error);
        return NextResponse.json(
            { error: "Failed to calculate priorities" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sport-priority
 * Registreer een extra sportmoment voor een groep
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { groupId, date } = body;

        if (!groupId) {
            return NextResponse.json(
                { error: "groupId is required" },
                { status: 400 }
            );
        }

        const moment = await registerExtraSportMoment(
            groupId,
            date ? new Date(date) : new Date()
        );

        return NextResponse.json(moment, { status: 201 });
    } catch (error) {
        console.error("Error registering extra sport moment:", error);
        return NextResponse.json(
            { error: "Failed to register extra sport moment" },
            { status: 500 }
        );
    }
}
