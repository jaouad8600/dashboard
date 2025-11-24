# Sportindicaties - Uitgebreide Functionaliteiten

## ✅ Nieuwe Functies Toegevoegd

### 1. **📝 Bewerken**
- Bewerk de beschrijving, type en geldigheid van een indicatie
- Klik op het **potlood icoon** (Edit) bij een indicatie
- Wijzigingen worden direct opgeslagen

### 2. **⏸️ Pauzeren**
- Pauzeer een indicatie tijdelijk (bijv. bij blessure)
- Klik op het **pauze icoon** (Pause)
- Verplicht een reden op te geven voor het pauzeren
- Gepauzeerde indicaties worden gemarkeerd met een geel label
- Hervat met het **play icoon** (Play)

### 3. **📊 Tussentijdse Evaluatie**
- Voeg evaluatie notities toe aan een lopende indicatie
- Klik op het **chat icoon** (MessageSquare)
- Documenteer voortgang, observaties en aanbevelingen
- Evaluaties worden opgeslagen als tijdlijn

### 4. **🗄️ Archiveren**
- Archiveer afgeronde indicaties
- Klik op het **archief icoon** (Archive)
- Gearchiveerde indicaties verdwijnen uit de hoofdlijst
- Toon gearchiveerde items via de filter optie

### 5. **❌ Beëindigen**
- Beëindig een indicatie definitief
- Klik op het **X icoon**
- Status wordt aangepast naar inactief
- Einddatum wordt automatisch ingesteld

## 🎨 Verbeterde UI

### Acties per Indicatie
Elke indicatie heeft nu 5 actieknoppen:
1. **Blauw** - Bewerken (Edit2)
2. **Groen** - Evaluatie (MessageSquare)
3. **Oranje** - Pauzeren (Pause) / Groen - Hervatten (Play)
4. **Grijs** - Archiveren (Archive)
5. **Rood** - Beëindigen (X)

### Status Indicators
- **Geel label "Gepauzeerd"** - Indicatie is tijdelijk gepauzeerd
- **Groene eval badge** - Aantal evaluaties
- **Datum weergave** - Geldigheidsperiode altijd zichtbaar

## 🔧 Technische Details

### Database Schema Updates
Nieuwe velden toegevoegd aan `SportIndication`:
```prisma
isPaused    Boolean   @default(false)
pausedAt    DateTime?
pauseReason String?
archived    Boolean   @default(false)
archivedAt  DateTime?
evaluations Json?     @default("[]")
```

### API Endpoints
- `POST /api/medical/indications/evaluations` - Nieuwe evaluatie toevoegen
- `PUT /api/medical/indications` - Update pause/archive/edit status

## 📋 Gebruik

### Evaluatie Toevoegen
1. Klik op groen chat icoon bij een indicatie
2. Vul evaluatie notities in
3. Klik "Opslaan"
4. Evaluatie verschijnt in de tijdlijn

### Indicatie Pauzeren
1. Klik op oranje pauze icoon
2. Vul reden voor pauzeren in
3. Klik "Pauzeren"
4. Indicatie wordt gemarkeerd met geel label
5. Hervat later met play icoon

### Indicatie Bewerken
1. Klik op blauw potlood icoon
2. Modal opent met huidige gegevens
3. Pas beschrijving, type of einddatum aan
4. Klik "Opslaan"

## 🚀 Volgende Stappen

Om deze functionaliteiten te activeren:

1. **Database migratie uitvoeren:**
   ```bash
   npx prisma migrate dev --name add_indication_management
   ```

2. **Prisma client regenereren:**
   ```bash
   npx prisma generate
   ```

3. **Development server herstarten:**
   ```bash
   npm run dev
   ```

## 💡 Tips

- Gebruik **evaluaties** voor tussentijdse voortgangsrapportage
- **Pauzeer** indicaties bij tijdelijke onderbreking (bijv. vakantie, blessure)
- **Archiveer** afgeronde indicaties om de lijst overzichtelijk te houden
- **Beëindig** alleen als de indicatie volledig is afgerond

Alle acties worden gelogd met tijdstempel voor volledige traceerbaarheid!
