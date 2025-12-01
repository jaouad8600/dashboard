import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const indicationId = searchParams.get('indicationId');
    const restorativeTalkId = searchParams.get('restorativeTalkId');

    try {
        const evaluations = await prisma.evaluation.findMany({
            where: indicationId
                ? { indicationId }
                : restorativeTalkId
                    ? { restorativeTalkId }
                    : {},
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(evaluations);
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { indicationId, restorativeTalkId, summary, author } = body;

        if (!indicationId && !restorativeTalkId) {
            return NextResponse.json(
                { error: 'Either indicationId or restorativeTalkId is required' },
                { status: 400 }
            );
        }

        const evaluation = await prisma.evaluation.create({
            data: {
                indicationId: indicationId || undefined,
                restorativeTalkId: restorativeTalkId || undefined,
                summary,
                author,
            },
        });

        return NextResponse.json(evaluation);
    } catch (error) {
        console.error('Error creating evaluation:', error);
        return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 });
    }
}
