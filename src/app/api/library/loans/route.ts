import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const loans = await prisma.loan.findMany({
            include: { book: true },
            orderBy: { loanDate: "desc" }
        });
        return NextResponse.json(loans);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookId, youthName, loanedBy } = body;

        // Check availability
        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book || book.available < 1) {
            return NextResponse.json({ error: "Book not available" }, { status: 400 });
        }

        // Create loan
        const loan = await prisma.loan.create({
            data: {
                bookId,
                youthName,
                loanedBy: loanedBy || "System",
                loanDate: new Date(),
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks default
                status: "ACTIVE"
            }
        });

        // Update book availability
        await prisma.book.update({
            where: { id: bookId },
            data: { available: { decrement: 1 } }
        });

        return NextResponse.json(loan);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        const loan = await prisma.loan.findUnique({ where: { id } });
        if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

        if (status === "RETURNED" && loan.status !== "RETURNED") {
            // Return book
            await prisma.$transaction([
                prisma.loan.update({
                    where: { id },
                    data: { status: "RETURNED", returnDate: new Date() }
                }),
                prisma.book.update({
                    where: { id: loan.bookId },
                    data: { available: { increment: 1 } }
                })
            ]);
        } else {
            await prisma.loan.update({
                where: { id },
                data: { status }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update loan" }, { status: 500 });
    }
}
