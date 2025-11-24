import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date"); // YYYY-MM-DD

        const where: any = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.startTime = {
                gte: start,
                lte: end
            };
        } else {
            // Default: upcoming
            where.startTime = {
                gte: new Date()
            };
        }

        const reservations = await prisma.reservation.findMany({
            where,
            orderBy: { startTime: "asc" }
        });

        return NextResponse.json(reservations);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { resourceId, userName, date, startTime, endTime, title } = body;

        // Construct Date objects
        // date is YYYY-MM-DD, startTime is HH:MM
        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(`${date}T${endTime}:00`);

        // Check overlap
        const overlap = await prisma.reservation.findFirst({
            where: {
                resourceId,
                OR: [
                    {
                        startTime: { lt: end },
                        endTime: { gt: start }
                    }
                ]
            }
        });

        if (overlap) {
            return NextResponse.json({ error: "Tijdslot niet beschikbaar" }, { status: 409 });
        }

        const reservation = await prisma.reservation.create({
            data: {
                resourceId,
                resourceName: resourceId, // Simple mapping for now
                userId: "system", // Placeholder
                userName,
                startTime: start,
                endTime: end,
                title
            }
        });

        return NextResponse.json(reservation);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.reservation.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 });
    }
}
