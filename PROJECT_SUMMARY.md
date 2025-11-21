# Projectsamenvatting: Sportmanagement- en Rapportagesysteem Teylingereind

## 1. Doel
De ontwikkeling van een volledig digitaal sport- en rapportagesysteem voor Forensisch Centrum Teylingereind. Het systeem faciliteert begeleiders in het registreren van sportmomenten en notities, en zorgt voor een geautomatiseerde, dagelijkse bundeling van alle rapportages in één overzichtelijk document voor de verantwoordelijke.

## 2. Functionaliteiten

### Kernfunctionaliteiten
*   **Registratie:** Eenvoudig invoeren van sportmomenten en activiteiten.
*   **Rapportage:** Ondersteuning voor invoer door meerdere begeleiders.
*   **Automatisering:** Dagelijkse automatische bundeling van alle rapportages tot één overzicht (deadline 18:00 uur).
*   **KPI Dashboards:** Inzicht in statistieken zoals:
    *   Trainingsfrequentie (meest/minst actieve deelnemers).
    *   Aantal afzeggingen.
    *   Deelnamefrequentie.
*   **Projectrapportages:** Specifieke modules voor projecten zoals ADO Den Haag.

### Systeemeisen
*   **Uniciteit:** Elke rapportage is uniek identificeerbaar en vindbaar.
*   **Professionaliteit:** Consistente en professionele opmaak van alle overzichten.
*   **Flexibiliteit:** Functionaliteiten zijn modulair aan of uit te zetten.
*   **UI Design:** Minimalistische interface zonder exportknoppen, tenzij expliciet noodzakelijk.

## 3. Technische Architectuur

### Tech Stack
Het systeem is gebouwd als een moderne webapplicatie met de volgende technologieën:
*   **Framework:** Next.js (React framework)
*   **Taal:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database & ORM:** Prisma

### Datamodel (Huidige implementatie)
*   **Group:** Beheer van groepen.
*   **GroupColor:** Enum voor kleurcodering.
*   **Note:** Opslag van notities en rapportages.
*   **GroupChange:** Audit logs voor wijzigingen in groepen.

### API Structuur
*   `/api/groups`: Endpoints (GET, POST, PATCH) met Zod-validatie voor groepsbeheer.
*   `/api/notes`: Endpoint voor het verwerken van notities.

### Alternatieve verkenningen
Eerder onderzochte richtingen (nu secundair of afgevallen):
*   WordPress (Custom Post Types, ACF).
*   No-code oplossingen zoals Coda en Notion.

## 4. Huidige Status
Het project bevindt zich in de ontwikkelfase (ca. 20% gerealiseerd, 80% conceptueel uitgewerkt).

*   **Setup:** Lokale ontwikkelomgeving is operationeel en gekoppeld aan GitHub.
*   **Backend:** Prisma schema is opgezet en basis API-endpoints zijn functioneel.
*   **Frontend:** Basisinterface voor groepen (inclusief kleurcodering en notities) en een opzet voor KPI-overzichten is aanwezig.

## 5. Toekomstvisie
Het systeem is ontworpen met oog op uitbreiding. Geplande modules omvatten:
*   **Roosterbeheer:** Planning van sportmomenten en personeel.
*   **Materialenbeheer:** Inventarisatie en uitleen van sportmaterialen.
*   **Voedingsprogramma's:** Integratie van voedingsschema's en monitoring.
