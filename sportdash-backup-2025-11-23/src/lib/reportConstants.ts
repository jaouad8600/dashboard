// JJI Sport Rapportage Constants

export const WARMING_UP_SUGGESTIONS = [
    "n.v.t.",
    "Rennen en rekken",
    "Inlopen met bal",
    "Tikspel",
    "Rondo",
    "Lijnenloop",
    "4vs4 voetbal",
    "Stretching",
];

export const ACTIVITY_SUGGESTIONS = [
    "Fitness",
    "Voetbal 3vs3",
    "Voetbal 4vs4",
    "Voetbal 5vs5",
    "Basketbal",
    "Volleybal",
    "Badminton",
    "Tafeltennis",
    "Parcours",
    "Hardlopen",
    "Zwemmen",
    "Zaalvoetbal",
];

export const NOTE_TAGS = [
    "Sfeer was goed",
    "Actieve deelname",
    "Rustige groep",
    "Kort incident",
    "Goed getraind",
    "Weigeraar(s)",
    "Eerder gestopt",
    "Iedereen deed mee",
    "Extra motivatie nodig",
    "Veel energie",
];

// Generate formatted report text for export/email
export function generateReportText(report: {
    group: { name: string };
    date: Date | string;
    youthCount: number;
    leaderCount: number;
    warmingUp?: string | null;
    activity?: string | null;
    cleanedText?: string | null;
    parsedData?: string | null;
}): string {
    const formattedDate = typeof report.date === 'string'
        ? report.date
        : report.date.toLocaleDateString('nl-NL');

    let text = `Sportrapportage ${formattedDate}\n\n`;

    text += `Groep: ${report.group.name} (${report.youthCount} jongeren, ${report.leaderCount} GL)\n`;
    text += `• Warming-up: ${report.warmingUp || 'n.v.t.'}\n`;
    text += `• Sportmoment: ${report.activity || '-'}\n`;
    text += `• Bijzonderheden: ${report.cleanedText || 'Geen'}\n`;

    if (report.parsedData) {
        try {
            const parsed = JSON.parse(report.parsedData);
            if (parsed.summary) {
                text += `\n--- AI Analyse ---\n${parsed.summary}\n`;
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    return text;
}
