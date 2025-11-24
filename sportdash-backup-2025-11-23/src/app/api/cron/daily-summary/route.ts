import { NextResponse } from "next/server";
import { generateDailySummary } from "@/services/reportService";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow local dev without secret or if secret is not set
            if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const summary = await generateDailySummary(new Date());
        return NextResponse.json({ success: true, summary });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
    }
}
