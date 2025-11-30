# Example HTTP Request for Power Automate

Use this configuration in your Power Automate "HTTP" action.

**Method**: `POST`
**URI**: `https://your-domain.com/api/sportindicaties/import-email`
**Headers**:
```
Content-Type: application/json
X-IMPORT-TOKEN: <YOUR_SECRET_TOKEN>
```

**Body**:
```json
{
  "rawText": "Aanmelding geïndiceerde activiteiten\nNaam jongere: Pablo de Jeger\nLeefgroep: Nes \nIndicatie voor*\n* zet een X achter welke activiteit van toepassing is\nSport (Orlando, Sebastiaan, Tim)  X\nMuziek (Ben)\nCreatief aanbod (Laura)\n\nAdvies/suggestie betreft inhoud activiteit: -\nIndicatie afgegeven van – tot: 14-11-2025\nIndicatie afgegeven door: 16-12-2025\nTerugkoppelen voortgang aan: GW\nKan gecombineerd worden met groepsgenoot met indicatie? Ja\nOnderbouwing indicering: Op de leefgroep wordt Pablo gezien als een impulsieve jongen, die sterk gebaat is bij duidelijkheid en structuur...\nBejegeningstips in het licht van de diagnostiek: - Sluit aan bij Pablo en luister naar hem. ...\nLeerdoelen: ( indien van toepassing) N.v.t.",
  "source": "outlook",
  "receivedAt": "@{utcNow()}"
}
```

## Curl Example
```bash
curl -X POST https://localhost:3000/api/sportindicaties/import-email \
  -H "Content-Type: application/json" \
  -H "X-IMPORT-TOKEN: development-token" \
  -d '{
    "rawText": "Aanmelding geïndiceerde activiteiten\nNaam jongere: Test Jongere\nLeefgroep: Test Groep\n...",
    "source": "outlook",
    "receivedAt": "2025-11-30T12:00:00Z"
  }'
```
