import prisma from "@/lib/db";

export const toggleExtraSport = async (groupId: string, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.extraSportMoment.findUnique({
        where: {
            groupId_date: {
                groupId,
                date: startOfDay,
            },
        },
    });

    if (existing) {
        await prisma.extraSportMoment.delete({
            where: { id: existing.id },
        });
        return { added: false };
    } else {
        await prisma.extraSportMoment.create({
            data: {
                groupId,
                date: startOfDay,
            },
        });
        return { added: true };
    }
};

export const getExtraSportWeek = async (startDate: Date) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return await prisma.extraSportMoment.findMany({
        where: {
            date: {
                gte: start,
                lt: end,
            },
        },
    });
};

export const getExtraSportStats = async (groupId: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Week stats (last 7 days)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const weekCount = await prisma.extraSportMoment.count({
        where: {
            groupId,
            date: { gte: weekStart },
        },
    });

    // Month stats (last 30 days)
    const monthStart = new Date(today);
    monthStart.setDate(monthStart.getDate() - 30);

    const monthCount = await prisma.extraSportMoment.count({
        where: {
            groupId,
            date: { gte: monthStart },
        },
    });

    // Year stats (this year)
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const yearCount = await prisma.extraSportMoment.count({
        where: {
            groupId,
            date: { gte: yearStart },
        },
    });

    return { weekCount, monthCount, yearCount };
};
