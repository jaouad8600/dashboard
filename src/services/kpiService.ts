import prisma from "@/lib/db";

export const getDashboardKPIs = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Incidents today
    const incidentCount = await prisma.report.count({
        where: {
            isIncident: true,
            date: {
                gte: today,
                lt: tomorrow,
            },
        },
    });

    // 2. Active groups count
    const activeGroupsCount = await prisma.group.count({
        where: { isActive: true },
    });

    // 3. Most active group (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await prisma.report.groupBy({
        by: ['groupId'],
        _count: {
            id: true,
        },
        where: {
            type: 'SESSION',
            date: {
                gte: thirtyDaysAgo,
            },
        },
        orderBy: {
            _count: {
                id: 'desc',
            },
        },
        take: 1,
    });

    let mostActiveGroupName = "N/A";
    if (sessions.length > 0) {
        const group = await prisma.group.findUnique({
            where: { id: sessions[0].groupId },
        });
        if (group) {
            mostActiveGroupName = group.name;
        }
    }

    return {
        incidentCount,
        activeGroupsCount,
        mostActiveGroupName,
    };
};
