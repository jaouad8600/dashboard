import { logger } from "@/lib/logger";

export interface IncidentData {
    youthName: string;
    type: string;
    description: string;
    measure: string;
    youthHeard: boolean;
}

export interface ParsedReport {
    group: string;
    presentYouth: number;
    mood: string;
    sessionSummary: string;
    interventions: string[];
    incidents: IncidentData[];
    injuries: string[];
    planForTomorrow: string;
    rawText: string;
    parsedAt: string;
    parsedBy: string;
    confidenceScore: number;
}

export const parseReportText = async (text: string, groupName: string): Promise<ParsedReport> => {
    logger.info("Parsing report text", { groupName, textLength: text.length });

    // Mocking advanced LLM parsing with heuristics for now
    // In a real scenario, this would call an LLM API with the text and schema

    const presentYouthMatch = text.match(/(?:aanwezig|totaal|jongeren):\s*(\d+)/i);
    const presentYouth = presentYouthMatch ? parseInt(presentYouthMatch[1]) : 0;

    const moodMatch = text.match(/sfeer:\s*([^.]+)/i);
    const mood = moodMatch ? moodMatch[1].trim() : "Neutraal";

    const incidentMatch = text.match(/incident:\s*([^.]+)/i);
    const hasIncident = incidentMatch && !incidentMatch[1].toLowerCase().includes("geen");

    const incidents: IncidentData[] = [];
    if (hasIncident) {
        incidents.push({
            youthName: "Onbekend", // Zou uit tekst gehaald moeten worden
            type: "Overig",
            description: incidentMatch ? incidentMatch[1].trim() : "Incident vermeld",
            measure: "Nader te bepalen",
            youthHeard: false
        });
    }

    // Extract interventions (simple keyword search)
    const interventions: string[] = [];
    if (text.toLowerCase().includes("waarschuwing")) interventions.push("Waarschuwing");
    if (text.toLowerCase().includes("uitstuur")) interventions.push("Uitstuur");
    if (text.toLowerCase().includes("gesprek")) interventions.push("Gesprek");

    // Calculate a mock confidence score based on how much we found
    let confidenceScore = 0.5;
    if (presentYouth > 0) confidenceScore += 0.2;
    if (mood !== "Neutraal") confidenceScore += 0.2;
    if (text.length > 50) confidenceScore += 0.1;

    const parsed: ParsedReport = {
        group: groupName,
        presentYouth,
        mood,
        sessionSummary: text.substring(0, 100) + "...", // Simple summary
        interventions,
        incidents,
        injuries: [],
        planForTomorrow: "Regulier programma",
        rawText: text,
        parsedAt: new Date().toISOString(),
        parsedBy: "SportDash-Heuristic-V2",
        confidenceScore: Math.min(confidenceScore, 1.0),
    };

    logger.info("Report parsed successfully", { confidenceScore: parsed.confidenceScore });
    return parsed;
};
