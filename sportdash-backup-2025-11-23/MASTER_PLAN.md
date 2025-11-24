# Master Plan: SportManagement & Rapportagesysteem (Teylingereind)

Dit document dient als de blauwdruk voor de verdere ontwikkeling van het SportDash-systeem. Het is opgesteld om een developer in staat te stellen het systeem van de huidige 20% naar 100% te brengen.

---

## 1. Architectuurplan

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Taal**: TypeScript
- **Styling**: TailwindCSS
- **Database ORM**: Prisma
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Validatie**: Zod

### Structuur
We hanteren een strikte scheiding van verantwoordelijkheden binnen de Next.js App Router structuur:

```
src/
├── app/                    # App Router pages & API routes
│   ├── (dashboard)/        # Beveiligde applicatie routes (layout met sidebar)
│   │   ├── groepen/        # Groepsoverzicht & detail
│   │   ├── rapportage/     # Dagrapportages
│   │   └── ...
│   └── api/                # Backend endpoints
├── components/             # Reusable UI components
│   ├── ui/                 # Primitives (buttons, inputs - shadcn/ui style)
│   └── domain/             # Domein-specifieke componenten (GroupCard, ReportForm)
├── lib/                    # Core utilities
│   ├── db.ts               # Prisma client singleton
│   └── utils.ts            # Helper functies
├── services/               # Business logic layer (ontkoppeld van API/UI)
│   ├── groupService.ts
│   ├── reportService.ts
│   └── kpiService.ts
└── types/                  # TypeScript definities & Zod schemas
```

---

## 2. Database-ontwerp

We breiden het huidige schema uit om alle functionaliteiten te ondersteunen. We stappen over op Engelse benamingen voor consistentie in de code, maar mappen deze naar Nederlandse UI-termen.

### ERD Schema (Prisma)

```prisma
// Core Models

model Group {
  id          String   @id @default(uuid())
  name        String   @unique
  color       String   @default("gray") // GroupColor enum
  department  String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  reports     Report[]
  sessions    SportSession[]
}

model SportSession {
  id          String   @id @default(uuid())
  date        DateTime @default(now())
  groupId     String
  group       Group    @relation(fields: [groupId], references: [id])
  
  activity    String   // Bijv. "Voetbal", "Fitness"
  duration    Int      // Minuten
  intensity   String?  // Laag, Midden, Hoog
  
  notes       String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Report {
  id          String     @id @default(uuid())
  date        DateTime   @default(now())
  
  // Koppeling optioneel: kan aan groep, sessie of algemeen zijn
  groupId     String?
  group       Group?     @relation(fields: [groupId], references: [id])
  
  type        ReportType @default(SESSION)
  content     String
  author      String?    // Naam van begeleider
  
  isIncident  Boolean    @default(false)
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model DailySummary {
  id          String   @id @default(uuid())
  date        DateTime @unique // Eén samenvatting per dag
  content     String   // Gegenereerde HTML/Markdown van alle rapportages
  generatedAt DateTime @default(now())
  sentTo      String?  // Email adressen waarnaar verzonden
}

model AuditLog {
  id          String   @id @default(uuid())
  action      String   // CREATE, UPDATE, DELETE
  entity      String   // Group, Report, etc.
  entityId    String
  userId      String?
  details     String?  // JSON string met wijzigingen
  timestamp   DateTime @default(now())
}

// Enums

enum ReportType {
  WARMING_UP
  SESSION
  BEHAVIOR
  INCIDENT
  GENERAL
}
```

---

## 3. Logische Backend-structuur

We gebruiken een **Service Layer Pattern**. API routes roepen services aan, geen directe DB calls. Dit maakt testen en hergebruik (bijv. in Server Actions) makkelijker.

### Voorbeeld: `services/reportService.ts`
- `createReport(data)`: Valideert input, schrijft naar DB, logt audit.
- `getDailyReports(date)`: Haalt alle rapporten op voor een specifieke dag.
- `generateDailySummary(date)`:
    1. Haalt alle rapporten op.
    2. Formatteert deze in een leesbaar sjabloon.
    3. Slaat op in `DailySummary`.

---

## 4. API-endpoints met Validatie

Alle endpoints bevinden zich in `src/app/api`. Validatie gebeurt met **Zod**.

### Groepen
- `GET /api/groups`: Lijst van actieve groepen.
- `POST /api/groups`: Nieuwe groep (Body: `{ name: string, color: string }`).
- `PATCH /api/groups/[id]`: Update groep.

### Rapportages & Sessies
- `POST /api/reports`:
    - Body: `{ groupId?: string, content: string, type: ReportType, isIncident: boolean }`
    - Validatie: Content min. 10 karakters.
- `GET /api/reports?date=2023-11-20`: Haal alle rapporten van een dag op.

### Automatisering
- `POST /api/cron/daily-summary`:
    - Triggered om 18:00.
    - Genereert de samenvatting.
    - Beveiligd met een CRON_SECRET header.

---

## 5. Frontend-flow en Schermindeling

### Layout (`(dashboard)/layout.tsx`)
- **Sidebar**: Navigatie (Dashboard, Groepen, Rapportages, Instellingen).
- **Header**: Huidige datum, Ingelogde gebruiker.

### Schermen
1.  **Dashboard (`/`)**:
    - Snelkoppelingen naar "Nieuwe Rapportage".
    - KPI widgets (Aantal incidenten vandaag, Meest actieve groep).
    - Tijdlijn van recente activiteiten.

2.  **Groepen Overzicht (`/groepen`)**:
    - Grid van kaarten per groep.
    - Kleurcodering (GroupColor).
    - Status indicatoren (heeft vandaag gesport?).

3.  **Groep Detail (`/groepen/[id]`)**:
    - Tabbladen: Overzicht, Geschiedenis, Statistieken.
    - **Actieknop**: "+ Sportmoment toevoegen" / "+ Notitie".

4.  **Dagrapportage (`/rapportage`)**:
    - Kalender selector.
    - Weergave van de gegenereerde `DailySummary`.
    - Knop "Handmatig genereren" (voor updates na 18:00).

---

## 6. Dagrapport-automatisering

### Het Proces (18:00)
1.  **Trigger**: Een Vercel Cron Job of externe scheduler roept `/api/cron/daily-summary` aan.
2.  **Data Collection**:
    - Query `Report` tabel voor `createdAt` tussen 00:00 en 18:00.
    - Group by `Group`.
3.  **Formatting**:
    - Genereer een gestructureerde tekst/HTML:
      ```text
      DAGRAPPORTAGE - 20 Nov 2025
      
      GROEP A (Rood)
      - [Sessie] Voetbal (45 min): Goede inzet.
      - [Gedrag] Jantje was onrustig.
      
      GROEP B (Blauw)
      - Geen activiteiten.
      
      INCIDENTEN
      - Geen incidenten.
      ```
4.  **Opslag**: Save in `DailySummary`.
5.  **Distributie** (Optioneel): Email via SendGrid/Resend naar ingestelde adressen.

---

## 7. KPI-overzichten en Datamodellen

KPI's worden berekend in `kpiService.ts` en getoond op het dashboard.

### Definities
1.  **Meest getrainde groep**: `Count(SportSession)` per `groupId` (laatste 30 dagen).
2.  **Minst getrainde groep**: Idem, ascending sort.
3.  **Frequentie per groep**: Gemiddeld aantal sessies per week.
4.  **Aantal afzeggingen**: `Report` met type `CANCELLATION` (toe te voegen aan enum) of specifieke tag.
5.  **Incidenten**: `Count(Report)` waar `isIncident = true`.

---

## 8. Toekomstmodules

1.  **Authenticatie Module**:
    - Implementatie van NextAuth.js.
    - Rollen: Admin (kan alles), Begeleider (alleen invoer), Lezer (alleen rapportage).
2.  **Externe Integraties**:
    - Koppeling met EPD (Elektronisch Patiënten Dossier) indien toegestaan.
3.  **Geavanceerde Planning**:
    - Rooster module voor sportzalen.

---

## 9. Best Practices & Security

- **Validatie**: Altijd Zod gebruiken voor API input validatie. Nooit vertrouwen op de client.
- **Audit Trail**: Elke mutatie (POST/PATCH/DELETE) moet een record in `AuditLog` schrijven.
- **Error Handling**: Gebruik een centrale `ErrorHandler` in API routes om consistente 400/500 responses te geven.
- **Types**: Geen `any` in TypeScript. Gebruik gegenereerde Prisma types.
