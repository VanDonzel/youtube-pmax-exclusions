# YouTube / PMax Exclusion Tool

Haalt YouTube-plaatsingen op uit Google Ads (Performance Max + video-campagnes),
laat een AI beoordelen of elke plaatsing relevant is voor jouw bedrijf, en
genereert een uitsluitingslijst (CSV) die je in Google Ads kunt importeren.

Waarom: PMax en video-campagnes tonen advertenties op YouTube-video's/kanalen die
soms totaal niet bij je doelgroep passen (bijv. kindercontent, gaming voor
tieners). Dit script vindt die plaatsingen automatisch en stelt uitsluiting voor,
in plaats van dat je dit handmatig moet uitzoeken.

## Hoe het werkt

1. Haalt plaatsingen op via de Google Ads API (`performance_max_placement_view` + `detail_placement_view`)
2. Filtert op een impressie-drempel, zodat alleen relevante volumes worden beoordeeld
3. Verrijkt YouTube-video's/kanalen met titel/beschrijving via de YouTube Data API
4. Laat een LLM (OpenAI `gpt-4o-mini`) beoordelen of de plaatsing bij jouw bedrijf/doelgroep past — op basis van `business-profile.md`, zie hieronder
5. Cachet eerder beoordeelde plaatsingen (`cache.json`) zodat je niet dubbel betaalt/beoordeelt bij herhaalde runs
6. Schrijft `output/uitsluitingen.csv`, `output/houden.csv` en `output/rapport.md`

## Vereisten

- Node.js 18+
- Een Google Ads **manager-account** met API-toegang (developer token, OAuth client)
- Een YouTube Data API v3-sleutel (Google Cloud Console)
- Een OpenAI API-sleutel

## Installatie

```bash
npm install
cp .env.example .env
```

Vul `.env` in met je eigen credentials:

| Variabele | Omschrijving |
|---|---|
| `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET` | OAuth-clientgegevens uit Google Cloud Console |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Developer token van je Google Ads manager-account |
| `GOOGLE_ADS_CUSTOMER_ID` | Het klant-account waarvoor je plaatsingen ophaalt |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Het manager-account waarmee je inlogt |
| `GOOGLE_ADS_REFRESH_TOKEN` | Zie hieronder — genereer je via `get-refresh-token.js` |
| `YOUTUBE_API_KEY` | YouTube Data API v3-sleutel |
| `OPENAI_API_KEY` | OpenAI API-sleutel |
| `LOOKBACK_DAYS` | Optioneel, standaard 30 |
| `IMPRESSION_THRESHOLD` | Optioneel, standaard 50 |

### Refresh token ophalen

```bash
node scripts/get-refresh-token.js
```

Dit opent een browservenster om in te loggen met het account dat toegang heeft
tot je Google Ads manager-account. Kopieer de refresh token die in de terminal
verschijnt naar `GOOGLE_ADS_REFRESH_TOKEN` in `.env`.

### Bedrijfsprofiel instellen

```bash
cp business-profile.example.md business-profile.md
```

Vul in `business-profile.md` je eigen bedrijf, doelgroep en scope in: welke
YouTube-content relevant is om te houden, en welke uitgesloten moet worden.
Zie `business-profile.example.md` voor de invulvragen en een uitgewerkt
voorbeeld. Dit bestand staat in `.gitignore` — je eigen versie wordt dus nooit
gecommit.

## Gebruik

```bash
npm start
```

Resultaat in `output/`:
- `uitsluitingen.csv` — voorgestelde uitsluitingen (ruwe kolommen)
- `houden.csv` — plaatsingen die als relevant zijn beoordeeld
- `rapport.md` — samenvatting met top-redenen voor uitsluiting

### Optioneel: kant-en-klare Google Ads import-CSV

```bash
node scripts/gen-exclusion-csv.mjs
```

Zet `uitsluitingen.csv` om naar het format dat Google Ads Editor/bulk-upload verwacht (`output/google-ads-uitsluitingen.csv`).

### Optioneel: Excel-tabblad per score

```bash
node scripts/split-sheet.js
```

Genereert `output/uitsluitingen-tabbladen.xlsx` met een tabblad per score-groep.

## Automatisch draaien (Windows Task Scheduler)

Zie [TASK-SCHEDULER.md](TASK-SCHEDULER.md) voor een wekelijkse/geplande run via `run.bat`.

## Projectstructuur

```
index.js                    Hoofdscript: ophalen → filteren → classificeren → rapport
src/googleAds.js             Google Ads API-queries (PMax + video-plaatsingen)
src/youtubeData.js           YouTube Data API-verrijking (titel/beschrijving)
src/classify.js              LLM-classificatie o.b.v. business-profile.md
src/cache.js                 Cache zodat plaatsingen niet dubbel beoordeeld worden
src/report.js                Schrijft CSV's en rapport.md
scripts/get-refresh-token.js OAuth-flow om GOOGLE_ADS_REFRESH_TOKEN te genereren
scripts/gen-exclusion-csv.mjs Converteert naar Google Ads import-format
scripts/split-sheet.js       Genereert Excel-workbook met tabbladen per score
business-profile.example.md  Sjabloon: beschrijf hier je eigen bedrijf/doelgroep
```

## Licentie

Geen licentie toegevoegd — gebruik op eigen risico.
