import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const author = searchParams.get('author');
        const groupId = searchParams.get('groupId');

        const whereClause: any = {};

        if (dateParam) {
            const date = new Date(dateParam);
            whereClause.date = {
                gte: startOfWeek(date, { weekStartsOn: 1 }),
                lte: endOfWeek(date, { weekStartsOn: 1 }),
            };
        }

        if (author) {
            whereClause.author = {
                contains: author,
            };
        }

        if (groupId) {
            whereClause.groupId = groupId;
        }

        const notes = await prisma.weekNote.findMany({
            where: whereClause,
            include: {
                group: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching week notes:', error);
        return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { content, date, author, groupId } = body;

        if (!content || !author) {
            return NextResponse.json({ error: 'Inhoud en auteur zijn verplicht' }, { status: 400 });
        }

        const note = await prisma.weekNote.create({
            data: {
                content,
                date: date ? new Date(date) : new Date(),
                author,
                groupId: groupId || null,
            },
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('Error creating week note:', error);
        return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
    }
}
