# Extra Sportmomenten Prioriteitsmodule

## Overzicht

Deze module automatiseert het eerlijk verdelen van extra sportmomenten tussen groepen op basis van het aantal sportmomenten dat zij al hebben gehad.

## Functionaliteit

### 1. Automatische Prioriteitsberekening

Het systeem berekent voor elke groep een **score** op basis van:

```
Score = (Reguliere sportmomenten) + (Extra sportmomenten)
```

**Hoe lager de score, hoe hoger de prioriteit.**

### 2. Real-time Updates

De belvolgorde wordt automatisch herberekend zodra:
- Een groep een extra sportmoment heeft gehad
- Een regulier sportmoment is geregistreerd
- Een moment is gemist (optioneel)

### 3. Transparante Uitleg

Voor elke groep wordt duidelijk getoond:
- Aantal reguliere sportmomenten
- Aantal extra sportmomenten
- Totale score
- Prioriteitspositie in de belvolgorde
- Uitleg waarom ze op die positie staan

## Technische Implementatie

### Database Model

Het systeem gebruikt het bestaande `ExtraSportMoment` model:

```prisma
model ExtraSportMoment {
  id        String   @id @default(uuid())
  date      DateTime
  groupId   String
  group     Group    @relation(fields: [groupId], references: [id])
  createdAt DateTime @default(now())
  status    String   @default("PENDING") // PENDING, COMPLETED, REFUSED
}
```

### Service Layer

**Bestand:** `src/services/sportPriorityService.ts`

Belangrijkste functies:
- `calculateGroupPriorities()` - Berekent prioriteiten voor alle groepen
- `registerExtraSportMoment()` - Registreert een extra sportmoment
- `getTopPriorityGroups()` - Haalt top N groepen op met hoogste prioriteit

### API Endpoints

**Bestand:** `src/app/api/sport-priority/route.ts`

#### GET `/api/sport-priority`

Haal de belvolgorde op voor extra sportmomenten.

**Query Parameters:**
- `startDate` (optioneel) - Begindatum voor berekening
- `endDate` (optioneel) - Einddatum voor berekening

**Response:**
```json
[
  {
    "groupId": "uuid",
    "groupName": "Groep A",
    "groupColor": "BLAUW",
    "regularMoments": 12,
    "extraMoments": 2,
    "missedMoments": 0,
    "totalScore": 14,
    "priority": 1,
    "explanation": "12 reguliere momenten, 2 extra momenten"
  }
]
```

#### POST `/api/sport-priority`

Registreer een extra sportmoment voor een groep.

**Request Body:**
```json
{
  "groupId": "uuid",
  "date": "2025-11-23" // optioneel, default: vandaag
}
```

### Frontend Component

**Bestand:** `src/app/(dashboard)/extra-sportmomenten/page.tsx`

Features:
- 🏆 **Premium UI** met gradient designs en animaties
- 📊 **Statistieken** - Totaal groepen, hoogste prioriteit, totaal extra momenten
- 📋 **Belvolgorde** - Gesorteerde lijst met prioriteitsbadges
- ℹ️ **Uitlegpaneel** - Interactief paneel met systeemuitleg
- ✅ **Registratie** - Directe registratie van extra sportmomenten
- 🔄 **Real-time** - Automatische herberekening na registratie

## Gebruik

### Stap 1: Bekijk de Belvolgorde

Navigeer naar **Extra Sport** in het menu. Je ziet een gesorteerde lijst van alle groepen.

### Stap 2: Bel Groepen in Volgorde

Begin bovenaan de lijst en bel groepen om te vragen of ze een extra sportmoment willen.

### Stap 3: Registreer het Moment

Als een groep "ja" zegt, klik op de **Registreer** knop naast die groep.

### Stap 4: Automatische Update

Het systeem herberekent automatisch de prioriteiten en toont de nieuwe volgorde.

## Prioriteitsbadges

- 🥇 **#1** - Gouden badge (hoogste prioriteit)
- 🥈 **#2** - Zilveren badge
- 🥉 **#3** - Bronzen badge
- 📊 **#4+** - Blauwe badge

## Toekomstige Uitbreidingen

- [ ] Gemiste momenten tracking
- [ ] Historische data export
- [ ] Notificaties voor groepen met hoogste prioriteit
- [ ] Automatische SMS/Email naar groepen
- [ ] Weigering tracking (als groep "nee" zegt)
- [ ] Datumbereik filters in UI
- [ ] Groep-specifieke notities

## Technische Details

### Dependencies

- Next.js 15.5.4
- Prisma ORM
- Framer Motion (animaties)
- Lucide React (iconen)
- TypeScript

### Performance

- Queries zijn geoptimaliseerd met Prisma includes
- Real-time updates zonder page refresh
- Responsive design voor mobile en desktop

## Support

Voor vragen of problemen, neem contact op met het ontwikkelteam.
