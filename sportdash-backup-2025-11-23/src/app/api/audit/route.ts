import { NextResponse } from "next/server";
import { getAuditLogs } from "@/services/auditService";

export async function GET() {
    try {
        // In a real app, verify admin role here
        const logs = await getAuditLogs();
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}
