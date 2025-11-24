import { NextResponse } from "next/server";
import { getMaterialUsage, logMaterialUsage, getMaterialUsageStats } from "@/services/materialService";
import { z } from "zod";

const logUsageSchema = z.object({
    materialId: z.string(),
    date: z.string().transform((str) => new Date(str)),
    groupId: z.string().optional(),
    reportId: z.string().optional(),
    quantityUsed: z.number().int().min(1),
    notes: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const materialId = searchParams.get("materialId") || undefined;
        const groupId = searchParams.get("groupId") || undefined;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const stats = searchParams.get("stats") === "true";

        if (stats) {
            const dateRange = startDate && endDate
                ? { start: new Date(startDate), end: new Date(endDate) }
                : undefined;
            const statistics = await getMaterialUsageStats(dateRange);
            return NextResponse.json(statistics);
        }

        const usage = await getMaterialUsage({
            materialId,
            groupId,
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
        });

        return NextResponse.json(usage);
    } catch (error) {
        console.error("Error fetching material usage:", error);
        return NextResponse.json({ error: "Failed to fetch material usage" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const headers = request.headers;
        const userId = headers.get("x-user-id") || "unknown-user";

        const validatedData = logUsageSchema.parse(body);

        const usage = await logMaterialUsage({
            ...validatedData,
            createdBy: userId,
        });

        return NextResponse.json(usage, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error logging material usage:", error);
        return NextResponse.json({ error: "Failed to log material usage" }, { status: 500 });
    }
}
