/**
 * Privacy Filter Utility
 * 
 * Removes last names from text to protect privacy.
 */

export function anonymizeName(fullName: string): string {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];

    const firstName = parts[0];
    const lastPart = parts[parts.length - 1];

    // Return "Jan J."
    return `${firstName} ${lastPart.charAt(0)}.`;
}

export function anonymizeText(text: string): string {
    if (!text) return "";

    let cleaned = text;

    // Handle "Jan van Dijk" -> "Jan v."
    // Matches: Name + (prepositions) + Surname
    const prepRegex = /\b([A-Z][a-z]+)\s+((?:van|de|der|den|het|'t)\s+)+([A-Z][a-z]+)\b/gi;
    cleaned = cleaned.replace(prepRegex, (match, p1, p2, p3) => {
        return `${p1} ${p3.charAt(0)}.`;
    });

    // Handle "Jan Jansen" -> "Jan J."
    // Matches: Name + Surname (both capitalized)
    const nameRegex = /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g;
    cleaned = cleaned.replace(nameRegex, (match, p1, p2) => {
        // Avoid replacing sentence starts if possible, but difficult without context.
        // We assume standard report format.
        return `${p1} ${p2.charAt(0)}.`;
    });

    return cleaned;
}
