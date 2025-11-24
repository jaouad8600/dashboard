export interface ScheduleEvent {
    id: string;
    day: string; // Maandag, Dinsdag, etc.
    startTime: string;
    endTime: string;
    activity: string;
    location: "Langverblijf - Vloed" | "Eb (oudbouw)";
    type: "WEEKDAY" | "WEEKEND";
}

const SCHEDULES: ScheduleEvent[] = [
    // --- Langverblijf - Vloed ---
    // Maandag
    { id: "lv-ma-1", day: "Maandag", startTime: "17:45", endTime: "18:30", activity: "Kade", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    { id: "lv-ma-2", day: "Maandag", startTime: "18:45", endTime: "19:30", activity: "Kreek", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    { id: "lv-ma-3", day: "Maandag", startTime: "19:45", endTime: "20:30", activity: "Lei", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    // Dinsdag
    { id: "lv-di-1", day: "Dinsdag", startTime: "17:45", endTime: "18:30", activity: "Dijk", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    { id: "lv-di-2", day: "Dinsdag", startTime: "18:45", endTime: "19:30", activity: "Voetbal*", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    { id: "lv-di-3", day: "Dinsdag", startTime: "19:45", endTime: "20:30", activity: "Voetbal*", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    // Woensdag
    { id: "lv-wo-1", day: "Woensdag", startTime: "17:45", endTime: "18:30", activity: "Duin", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    { id: "lv-wo-2", day: "Woensdag", startTime: "18:45", endTime: "19:30", activity: "Rak", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    { id: "lv-wo-3", day: "Woensdag", startTime: "19:45", endTime: "20:30", activity: "Zift", location: "Langverblijf - Vloed", type: "WEEKDAY" },
    // Vrijdag
    { id: "lv-vr-1", day: "Vrijdag", startTime: "16:00", endTime: "16:45", activity: "Dijk", location: "Langverblijf - Vloed", type: "WEEKDAY" },

    // --- Eb (oudbouw) ---
    // Maandag
    { id: "eb-ma-1", day: "Maandag", startTime: "16:00", endTime: "16:45", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-ma-2", day: "Maandag", startTime: "17:00", endTime: "17:30", activity: "Rust halfuur", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-ma-3", day: "Maandag", startTime: "17:30", endTime: "18:15", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-ma-4", day: "Maandag", startTime: "18:15", endTime: "18:45", activity: "Pauze", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-ma-5", day: "Maandag", startTime: "18:45", endTime: "19:30", activity: "Zijl", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-ma-6", day: "Maandag", startTime: "19:45", endTime: "20:30", activity: "Lier", location: "Eb (oudbouw)", type: "WEEKDAY" },
    // Dinsdag
    { id: "eb-di-1", day: "Dinsdag", startTime: "16:00", endTime: "16:45", activity: "Poel - A Sport en/of act", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-di-2", day: "Dinsdag", startTime: "17:00", endTime: "17:30", activity: "Rust halfuur", location: "Eb (oudbouw)", type: "WEEKDAY" },
    // Woensdag
    { id: "eb-wo-1", day: "Woensdag", startTime: "16:00", endTime: "16:45", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-wo-2", day: "Woensdag", startTime: "17:00", endTime: "17:30", activity: "Rust halfuur", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-wo-3", day: "Woensdag", startTime: "17:30", endTime: "18:15", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-wo-4", day: "Woensdag", startTime: "18:45", endTime: "19:30", activity: "Vliet", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-wo-5", day: "Woensdag", startTime: "19:45", endTime: "20:30", activity: "Gaag", location: "Eb (oudbouw)", type: "WEEKDAY" },
    // Donderdag
    { id: "eb-do-1", day: "Donderdag", startTime: "16:00", endTime: "16:45", activity: "Poel - B Sport en/of act", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-do-2", day: "Donderdag", startTime: "17:00", endTime: "17:30", activity: "Rust halfuur", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-do-3", day: "Donderdag", startTime: "17:30", endTime: "18:15", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-do-4", day: "Donderdag", startTime: "18:45", endTime: "19:30", activity: "Golf", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-do-5", day: "Donderdag", startTime: "19:45", endTime: "20:30", activity: "Nes", location: "Eb (oudbouw)", type: "WEEKDAY" },
    // Vrijdag
    { id: "eb-vr-1", day: "Vrijdag", startTime: "16:00", endTime: "16:45", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-vr-2", day: "Vrijdag", startTime: "17:00", endTime: "17:30", activity: "Rust halfuur", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-vr-3", day: "Vrijdag", startTime: "17:30", endTime: "18:15", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKDAY" },
    { id: "eb-vr-4", day: "Vrijdag", startTime: "19:45", endTime: "20:30", activity: "Kust", location: "Eb (oudbouw)", type: "WEEKDAY" },
    // Zaterdag
    { id: "eb-za-1", day: "Zaterdag", startTime: "10:30", endTime: "11:15", activity: "Zijl", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-za-2", day: "Zaterdag", startTime: "11:30", endTime: "12:15", activity: "Gaag", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-za-3", day: "Zaterdag", startTime: "12:30", endTime: "13:15", activity: "Lier", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-za-4", day: "Zaterdag", startTime: "13:45", endTime: "14:15", activity: "Rust halfuur", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-za-5", day: "Zaterdag", startTime: "14:15", endTime: "15:00", activity: "Vliet", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-za-6", day: "Zaterdag", startTime: "15:15", endTime: "16:00", activity: "Poel - A sport", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-za-7", day: "Zaterdag", startTime: "16:00", endTime: "17:30", activity: "Individueel sport/beperkingen", location: "Eb (oudbouw)", type: "WEEKEND" },
    // Zondag
    { id: "eb-zo-1", day: "Zondag", startTime: "10:30", endTime: "11:15", activity: "Nes", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-zo-2", day: "Zondag", startTime: "11:30", endTime: "12:15", activity: "Golf", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-zo-3", day: "Zondag", startTime: "12:30", endTime: "13:15", activity: "Kust", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-zo-4", day: "Zondag", startTime: "13:45", endTime: "14:15", activity: "Rust halfuur", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-zo-5", day: "Zondag", startTime: "14:15", endTime: "15:00", activity: "Poel - B Sport", location: "Eb (oudbouw)", type: "WEEKEND" },
    { id: "eb-zo-6", day: "Zondag", startTime: "16:00", endTime: "17:30", activity: "Extra sport/individueel sport", location: "Eb (oudbouw)", type: "WEEKEND" },
];

export function getDailySchedule(date: Date): ScheduleEvent[] {
    const dayName = date.toLocaleDateString("nl-NL", { weekday: "long" });
    // Capitalize first letter
    const day = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    return SCHEDULES.filter(s => s.day === day);
}

export function getAllSchedules(): ScheduleEvent[] {
    return SCHEDULES;
}
