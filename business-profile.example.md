# Bedrijfsprofiel voor plaatsing-classificatie

Dit bestand bepaalt hoe de AI beoordeelt of een YouTube-video/kanaal relevant is
voor jouw advertenties (PMax + video-campagnes), en dus of een plaatsing
voorgesteld wordt om uit te sluiten.

**Setup:** kopieer dit bestand naar `business-profile.md` (in de projectroot) en
beantwoord onderstaande vragen. `business-profile.md` staat in `.gitignore` —
je eigen versie wordt dus nooit gecommit.

```
cp business-profile.example.md business-profile.md
```

---

## 1. Wie ben je?

- Bedrijfsnaam: _______________
- Wat verkoop je / welke dienst lever je? _______________
- In welke plaats(en)/regio ben je actief? _______________

## 2. Wie is je doelgroep?

- Leeftijd: _______________ (bv. 25–80 jaar)
- Regio: _______________ (bv. Noord-Brabant en omgeving, of heel Nederland)
- Kenmerken/interesses: _______________ (bv. koopkrachtig, geïnteresseerd in wonen en kwaliteit)

## 3. Welke YouTube-content past bij je doelgroep? (RELEVANT — houden)

Denk aan onderwerpen, genres of type kanalen die je doelgroep waarschijnlijk kijkt,
ook als het onderwerp niet direct met je product te maken heeft. Bijvoorbeeld:
- _______________ (bv. lifestyle, wonen, interieur, tuin, verbouwen, DIY)
- _______________ (bv. koken, eten, gezin, thuisleven)
- _______________ (bv. Nederlandse entertainment: vloggers, talkshows, documentaires)
- _______________ (bv. sport, gezondheid, buitenleven)
- _______________ (bv. lokale/regionale content)
- _______________ (bv. content gericht op een specifieke leeftijdsgroep, zoals senioren)

## 4. Welke YouTube-content past NIET bij je doelgroep? (NIET RELEVANT — uitsluiten)

Wees hier specifiek — dit voorkomt dat de AI per ongeluk relevante kanalen uitsluit.
- _______________ (bv. kindercontent/kleuterprogramma's)
- _______________ (bv. gaming/esports gericht op jongeren)
- _______________ (bv. prank, clickbait, sensatie, gossip)
- _______________ (bv. buitenlandse content zonder link met je taal/markt)
- _______________ (bv. nichecontent specifiek voor tieners)

---

### Voorbeeld (ingevuld voor een fictieve lokale woonwinkel)

```
Je bent marketingexpert voor [Bedrijfsnaam], een woonwinkel in [Plaats]
(meubels, woonaccessoires, tuinmeubelen, interieuradvies).

De doelgroep bestaat uit: vrouwen en mannen van 25–80 jaar, woonachtig in
[Regio]. Mensen die bewust bezig zijn met wonen, inrichten, verbouwen of
buitenleven — van jonge gezinnen tot gepensioneerden. Koopkrachtig en
geïnteresseerd in kwaliteit en sfeer thuis.

Beoordeel NIET of een kanaal letterlijk over wonen gaat, maar of de
DOELGROEP dit kanaal kijkt.

Markeer als RELEVANT (houden) — breed interpreteren:
- Lifestyle, wonen, interieur, tuin, verbouwen, DIY
- Koken, eten, gezin, thuisleven
- Nederlandse entertainment voor volwassenen: vloggers, talkshows, documentaires
- Sport, gezondheid, buitenleven
- Lokale of regionale content
- Kanalen gericht op ouderen of senioren

Markeer als NIET RELEVANT (uitsluiten) — alleen als het duidelijk niet past:
- Kindercontent / kleuterprogramma's
- Gaming, esports, Let's Play-kanalen gericht op jongeren
- Prank, clickbait, sensatievideo's, gossip/roddel
- Buitenlandse content zonder link met je markt
- Nichekanalen specifiek gericht op tieners of kinderen
```

Schrijf je eigen `business-profile.md` in dezelfde vrije tekststijl — het hoeft
geen strak format te zijn, de AI leest het als instructie.
