import { NextResponse } from "next/server";
import { getDocuments, createDocument, deleteDocument } from "@/services/documentService";
import { z } from "zod";

const createDocumentSchema = z.object({
    title: z.string().min(3),
    category: z.string().optional(),
    url: z.string().url(),
});

export async function GET() {
    try {
        const documents = await getDocuments();
        return NextResponse.json(documents);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = createDocumentSchema.parse(body);

        const document = await createDocument(validatedData);
        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        await deleteDocument(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }
}
