import { NextResponse } from "next/server";
import { parseMutationText } from "@/services/medicalParser";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-api-key-here") {
            return NextResponse.json(
                {
                    error: "Gemini API Key niet geconfigureerd",
                    details: "Voeg je GEMINI_API_KEY toe aan het .env bestand. Verkrijg een gratis key op https://makersuite.google.com/app/apikey"
                },
                { status: 503 }
            );
        }

        const parsed = await parseMutationText(text);
        return NextResponse.json(parsed);
    } catch (error) {
        console.error("Parse mutation error:", error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            {
                error: "Failed to parse mutation text",
                details: errorMessage
            },
            { status: 500 }
        );
    }
}
