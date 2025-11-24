export interface AIAnalysisResult {
    meta: {
        date: string;
        groupName: string;
        youthCount: number;
        overallMood: string;
    };
    incidents: Array<{
        time: string;
        youths: string[];
        description: string;
        measure: string;
    }>;
    measures: Array<{
        youth: string;
        type: string;
        reason: string;
        validity: string;
    }>;
    movements: {
        departures: Array<{
            youth: string;
            reason: string;
            timeOrDate: string;
        }>;
        arrivals: Array<{
            youth: string;
            note: string;
        }>;
    };
    sportNotes: Array<{
        youth: string;
        note: string;
    }>;
    appointments: Array<{
        time: string;
        youth: string;
        type: string;
        sportImpact: string;
    }>;
    summary: string;
}

export async function analyzeReport(text: string, date: string, groupName: string): Promise<AIAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock analysis logic based on keywords in text
    const hasIncident = text.toLowerCase().includes('incident') || text.toLowerCase().includes('ruzie') || text.toLowerCase().includes('vechten');
    const mood = text.toLowerCase().includes('gezellig') || text.toLowerCase().includes('goed') ? 'Positief' :
        text.toLowerCase().includes('onrustig') ? 'Onrustig' : 'Neutraal';

    return {
        meta: {
            date,
            groupName,
            youthCount: 8, // Mock count
            overallMood: mood,
        },
        incidents: hasIncident ? [{
            time: "Tijdens sport",
            youths: ["Jongere A", "Jongere B"],
            description: "Er ontstond een woordenwisseling die escaleerde.",
            measure: "Einde Dag (ED)"
        }] : [],
        measures: hasIncident ? [{
            youth: "Jongere A",
            type: "ED",
            reason: "Betrokken bij incident",
            validity: "Vandaag"
        }] : [],
        movements: {
            departures: [],
            arrivals: []
        },
        sportNotes: text.toLowerCase().includes('blessure') ? [{
            youth: "Jongere C",
            note: "Last van enkel"
        }] : [],
        appointments: [{
            time: "14:00",
            youth: "Jongere D",
            type: "Trajectberaad",
            sportImpact: "Afwezig"
        }],
        summary: `
# Algemeen
Datum: ${date}
Groep: ${groupName}
Sfeer: ${mood}

# Incidenten
${hasIncident ? '- Tijdens sport: Jongere A en B ruzie. Maatregel: ED.' : '- Geen bijzonderheden.'}

# Maatregelen
${hasIncident ? '- Jongere A: ED (Vandaag)' : '- Geen nieuwe maatregelen.'}

# Belangrijke punten voor sport
${text.toLowerCase().includes('blessure') ? '- Jongere C: Last van enkel.' : '- Geen medische bijzonderheden.'}

# Afspraken
- 14:00: Jongere D (Trajectberaad) - Afwezig
    `.trim()
    };
}
