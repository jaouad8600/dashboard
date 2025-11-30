
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch all active groups
        const groups = await prisma.group.findMany({
            where: { isActive: true },
            include: {
                extraSportMoments: {
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
                        },
                        status: 'COMPLETED',
                    },
                },
            },
        });

        // Calculate priority
        // Logic: Fewer moments = Higher priority
        // We can also add logic for "refused" moments if needed, but keeping it simple for now.
        const priorityList = groups.map((group) => {
            const momentCount = group.extraSportMoments.length;
            // Score: 0 moments = 0 score (Red/High Priority), 10+ moments = 100 score (Green/Low Priority)
            const score = Math.min(100, momentCount * 10);

            return {
                id: group.id,
                name: group.name,
                score,
                momentCount,
            };
        });

        // Sort by score ascending (lowest score = highest priority)
        priorityList.sort((a, b) => a.score - b.score);

        return NextResponse.json(priorityList);
    } catch (error) {
        console.error('Error calculating extra sport priority:', error);
        return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
    }
}
