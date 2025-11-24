import { NextResponse } from "next/server";
import { parseReportText } from "@/services/parserService";

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const parsedData = parseReportText(text);
        return NextResponse.json(parsedData);
    } catch (error) {
        return NextResponse.json({ error: "Failed to parse text" }, { status: 500 });
    }
}
