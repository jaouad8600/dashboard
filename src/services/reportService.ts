import prisma from "@/lib/db";
import { ReportType, Prisma } from "@prisma/client";

export const createReport = async (data: Prisma.ReportCreateInput) => {
    // Basic validation could go here, but Zod in API route is better
    return await prisma.report.create({
        data,
    });
};

export const getDailyReports = async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.report.findMany({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            group: true,
        },
        orderBy: {
            date: "asc",
        },
    });
};

export const generateDailySummary = async (date: Date) => {
    const reports = await getDailyReports(date);

    // Group reports by group name
    const reportsByGroup: Record<string, typeof reports> = {};
    const incidents: typeof reports = [];

    reports.forEach(report => {
        if (report.isIncident) {
            incidents.push(report);
        }

        const groupName = report.group?.name || "Algemeen";
        if (!reportsByGroup[groupName]) {
            reportsByGroup[groupName] = [];
        }
        reportsByGroup[groupName].push(report);
    });

    // Generate Markdown/Text content
    let summary = `DAGRAPPORTAGE - ${date.toLocaleDateString('nl-NL')}\n\n`;

    for (const [groupName, groupReports] of Object.entries(reportsByGroup)) {
        summary += `### ${groupName}\n`;
        if (groupReports.length === 0) {
            summary += `- Geen activiteiten.\n`;
        } else {
            groupReports.forEach(r => {
                const time = new Date(r.date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
                summary += `- [${time}] [${r.type}] ${r.content} (${r.author || 'Onbekend'})\n`;
            });
        }
        summary += `\n`;
    }

    if (incidents.length > 0) {
        summary += `### INCIDENTEN\n`;
        incidents.forEach(i => {
            const time = new Date(i.date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
            summary += `- [${time}] ${i.group?.name || 'Algemeen'}: ${i.content}\n`;
        });
    } else {
        summary += `### INCIDENTEN\n- Geen incidenten gemeld.\n`;
    }

    // Save or update DailySummary
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Check if summary exists for this day
    const existing = await prisma.dailySummary.findFirst({
        where: {
            date: startOfDay // Ideally this should be a unique constraint on date only (without time), but for now assuming date stored is start of day or we query by range
        }
    });

    // For simplicity in this MVP, let's assume we upsert based on a unique date if we enforced it, 
    // but since date is DateTime, we might need to be careful. 
    // The schema says `date DateTime @unique`, so we should normalize to midnight.

    return await prisma.dailySummary.upsert({
        where: {
            date: startOfDay,
        },
        update: {
            content: summary,
            generatedAt: new Date(),
        },
        create: {
            date: startOfDay,
            content: summary,
        },
    });
};
