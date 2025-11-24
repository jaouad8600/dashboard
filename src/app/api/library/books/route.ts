import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const books = await prisma.book.findMany({
            orderBy: { title: "asc" },
            include: {
                loans: {
                    where: { status: "ACTIVE" }
                }
            }
        });
        return NextResponse.json(books);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const book = await prisma.book.create({
            data: {
                title: body.title,
                author: body.author,
                isbn: body.isbn,
                totalCopies: body.totalCopies,
                available: body.totalCopies, // Initially all available
                location: body.location
            }
        });
        return NextResponse.json(book);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
    }
}
