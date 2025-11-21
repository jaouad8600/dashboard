import { NextResponse } from "next/server";
import { createReport, getDailyReports } from "@/services/reportService";
import { z } from "zod";
import { ReportType } from "@prisma/client";
import prisma from "@/lib/db";

const createReportSchema = z.object({
    groupId: z.string().optional(),
    content: z.string().min(5),
    type: z.nativeEnum(ReportType),
    isIncident: z.boolean().optional(),
    author: z.string().optional(),
    parsedData: z.string().optional(), // JSON string
    youthCount: z.number().optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get("date");
        const date = dateParam ? new Date(dateParam) : new Date();

        const reports = await getDailyReports(date);
        return NextResponse.json(reports);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}

import { logAudit, AuditAction, AuditEntity } from "@/services/auditService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const headers = request.headers;
        const userId = headers.get("x-user-id") || "unknown-user";
        const validatedData = createReportSchema.parse(body);

        // Extract youthCount to update Group, remove from report data if not in Report model (it's not)
        const {
            groupId,
            content,
            date,
            type,
            parsedData,
            youthCount,
            rawText,
            parsedAt,
            parsedBy,
            confidenceScore
        } = body;

        // Validate required fields
        if (!groupId || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create the report
        const report = await prisma.report.create({
            data: {
                groupId,
                content,
                date: date ? new Date(date) : new Date(),
                type: type || "SESSION",
                parsedData: parsedData ? JSON.stringify(parsedData) : null,
                rawText,
                parsedAt: parsedAt ? new Date(parsedAt) : null,
                parsedBy,
                confidenceScore,
                authorId: userId, // Store author ID
            },
        });

        // Update group youth count if provided
        if (youthCount !== undefined) {
            await prisma.group.update({
                where: { id: groupId },
                data: { youthCount },
            });
        }

        // Audit Log
        await logAudit(
            AuditAction.CREATE,
            AuditEntity.REPORT,
            report.id,
            userId,
            { groupId: groupId, type: type }
        );

        return NextResponse.json(report);
    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
