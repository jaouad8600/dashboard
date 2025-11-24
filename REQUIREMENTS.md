# SportDash – Teylingereind

SportDash is een intern sport- en rapportage­managementsysteem voor Forensisch Centrum Teylingereind.

Het systeem ondersteunt sport- en activiteitenbegeleiders, groepsleiding, teamleiders en management bij:

-   **Plannen en uitvoeren** van sportmomenten.
-   **Registreren** van indicaties, sportmutaties, notities en herstelgesprekken.
-   **Analyseren** van rapportages (tekst + cijfers).
-   **Beheer** van sportmaterialen.
-   **Monitoren** van groepsdynamiek via kleuren (groen, geel, oranje, rood).

**Doel:** Minder losse Word-bestanden en e-mails, meer overzicht en data in één centraal dashboard.

---

## Hoofdstructuur van de app

### 1. Dashboard (Home)

-   **Dagoverzicht van:**
    -   Groepen die sporten.
    -   Openstaande sportmutaties en indicaties.
    -   Kleurstatus per groep (groen/geel/oranje/rood).
    -   Openstaande herstelgesprekken.
    -   Recente rapportages.
-   **Snelle navigatie naar:**
    -   Groepen
    -   Planning
    -   Rapportages / Analyse
    -   Materialen

### 2. Groepen

**Doel:** Per leefgroep direct zien hoe het gaat en wat nodig is.

Per groep worden o.a. vastgelegd:
-   Naam en status van de groep.
-   Kleur (groen / geel / oranje / rood, zie kleurensysteem).
-   Gekoppelde jongeren.
-   Sportmutaties.
-   Sportindicaties.
-   Notities.
-   Herstelgesprekken.

#### Extra functies op de Groepen-pagina
Naast **Indicatie**, **Sportmutatie** en **Notitie**:
-   **Flag: “Herstelgesprek moet plaatsvinden” (rood)**
    -   Zichtbaar per groep.
    -   Komt terug in overzichten / dashboard.
    -   Bedoeld om herstelgesprekken niet te vergeten.

### 3. Jongeren

Per jongere:
-   Basisgegevens (voornaam, achternaam, koppeling aan groep).
-   Sportmutaties (tijdelijke beperkingen).
-   Sportindicaties (medisch / gedragsmatig).
-   Koppeling met rapportages en notities.
-   Link met kleur van de groep waarin de jongere zit.

### 4. Planning / Kalender

-   Dag-, week- en maandweergave (FullCalendar-achtig).
-   Voor elke sportactiviteit:
    -   Datum en tijd.
    -   Groep.
    -   Begeleidende medewerker(s).
    -   Locatie.
    -   Bijzonderheden (mutaties, indicaties, kleur van de groep).
-   **Doel:** Snel zien wie wanneer sport en waar overlap / problemen zitten.

### 5. Sportmutaties & Indicaties

#### Sportmutaties
-   Tijdelijke beperkingen of verboden rond sport.
-   Bijvoorbeeld: “mag niet meedoen aan voetbal t/m datum X”.
-   **Koppeling:**
    -   Aan jongere(n).
    -   Aan groep.
    -   Zichtbaar op Groepen-pagina en in de Planning.

#### Sportindicaties
-   Structurele of medische aandachtspunten.
-   Bijvoorbeeld: astma, knieblessure, traumatriggers.
-   **Koppeling:**
    -   Aan jongere.
    -   Aan groep.
    -   Zichtbaar bij planning en rapportages.

### 6. Notities & Herstelgesprekken

-   Korte notities per groep of per jongere:
    -   Incidenten.
    -   Sfeer op de groep.
    -   Afspraken / nazorgpunten.
-   **Extra veld / status:**
    -   **Herstelgesprek moet plaatsvinden (rood)**
        -   Koppeling aan groep / jongere.
        -   Komt terug op dashboard en in rapportage-overzichten.
        -   Sluit aan bij rode kleur (veel sturing, weinig ondersteuning).

### 7. Rapportages & Analytics

**Doel:** Inzicht krijgen in sportdeelname, sfeer en incidenten over langere tijd.

Per sportmoment / dagrapportage:
-   Datum, groep, tijd.
-   Aantal aanwezige jongeren.
-   Deelname aan sport.
-   Sfeer en gedrag.
-   Interventies en afspraken.
-   Link naar indicaties, mutaties en herstelgesprekken.

**Analyse-mogelijkheden (doelbeeld):**
-   Hoeveel er gesport is per groep, week, maand.
-   Welke groep het minst sport of het vaakst afzegt.
-   Verband tussen kleur (groen/rood), mutaties, indicaties en incidenten.
-   Lijst van openstaande herstelgesprekken.

### 8. Materialenbeheer

Module voor het beheer van sportmaterialen.

Voor elk materiaal:
-   Naam.
-   Categorie: `FITNESS`, `BALLEN`, `MATTEN`, `ELASTIEKEN`, `OVERIG`.
-   Omschrijving.
-   Totaal aantal / aantal bruikbaar.
-   Locatie.
-   Conditie: `GOED`, `LICHT_BESCHADIGD`, `KAPOT`, `TE_VERVANGEN`.
-   Aanmaak- en wijzigingsdatum.

**Doel:**
-   Inzicht in welke materialen inzetbaar zijn.
-   Tijdig vervangen / repareren.
-   Verantwoording richting organisatie.

---

## Nieuwe module: Rapportage-verzamelapp (privacy & analyse)

Deze module is een **gesloten omgeving** in SportDash waarin medewerkers van verschillende groepen hun rapportages kunnen plakken.

### Doel
-   Rapportages centraliseren en samenvoegen.
-   Automatisch privacy toepassen (namen opschonen).
-   Data klaarzetten voor analyse (tekst + koppeling aan groepen, kleuren, indicaties, mutaties, herstelgesprekken).

### Workflow

1.  **Invoer door medewerkers**
    -   Medewerker schrijft rapportage in eigen format (Word, mail, etc.).
    -   Volledige tekst wordt geplakt in de Rapportage-verzamelapp.

2.  **Gesloten inrichting**
    -   Toegang alleen voor medewerkers van Teylingereind.
    -   Rapportages worden intern gebruikt voor analyse en overleg, niet extern gedeeld.

3.  **Automatische privacyfilter**
    -   Systeem scant de tekst op namen.
    -   **Alle achternamen worden automatisch verwijderd of vervangen.**
    -   In de eerste fase worden **voornamen wél behouden** zodat intern duidelijk blijft wie bedoeld wordt.
    -   Later kan een extra anonieme stand toegevoegd worden (bijv. voornamen ook vervangen door codes).

4.  **Samenvoegen & koppeling**
    -   Rapportages van verschillende groepen en medewerkers worden:
        -   Per dag, week of periode samengevoegd.
        -   Gekoppeld aan:
            -   Groep.
            -   Kleur (groen/geel/oranje/rood).
            -   Sportmutaties.
            -   Indicaties.
            -   Herstelgesprekken.
    -   Deze data voedt:
        -   Dashboards.
        -   Managementoverzichten.
        -   Evaluaties met teamleiders en gedragswetenschappers.

---

## Kleurensysteem & leiderschapsstijl

De kleur van een groep geeft aan **welke houding en leiderschapsstijl** nodig is.

| Kleur | Sturing | Ondersteuning | Leiderschapsstijl | Betekenis |
| :--- | :--- | :--- | :--- | :--- |
| **Groen** | Weinig sturing | Weinig ondersteuning | **Delegeren** | Groep is stabiel en zelfstandig. Jongeren kunnen veel zelf. |
| **Geel** | Weinig sturing | Veel ondersteuning | **Steunen** | Groep kan veel zelf, maar heeft behoefte aan meedenken en bevestiging. |
| **Oranje** | Veel sturing | Veel ondersteuning | **Begeleiden** | Groep heeft duidelijke kaders én coaching nodig. Samen oefenen, voordoen. |
| **Rood** | Veel sturing | Weinig ondersteuning | **Leiden** | Onrustige of onveilige situatie. Strakke aansturing, duidelijke grenzen, vaak herstelgesprekken. |

Deze kleuren komen terug:
-   Op de Groepen-pagina.
-   Op het Dashboard.
-   In de Planning.
-   In rapportage-overzichten (bijv. aantal rode dagen per groep).

---

## Technische Stack (huidig ontwerp)

-   **Frontend:** Next.js 15 (App Router), React, TypeScript
-   **Styling:** Tailwind CSS
-   **Backend:** Next.js API Routes
-   **Validatie:** Zod
-   **Database:** Prisma ORM
    -   SQLite in development
    -   PostgreSQL of andere SQL in productie
-   **Kalender:** FullCalendar (of vergelijkbare component)

## Domeinmodellen (vereenvoudigd)

-   `Group`: id, name, color, status, youths[], reports[], mutations[], indications[], notes[]
-   `Youth`: id, firstName, lastName, groupId, mutations[], indications[]
-   `Report`: id, date, groupId, rawText, cleanedText, metadata
-   `SportMutation`: id, youthId/groupId, reason, startDate, endDate
-   `SportIndication`: id, youthId/groupId, type, description
-   `Note`: id, groupId/youthId, text, needsRestorativeTalk (boolean)
-   `Material`: id, name, category, description, quantityTotal, quantityUsable, location, conditionStatus, createdAt, updatedAt
