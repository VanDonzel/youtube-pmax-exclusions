# Wekelijkse run instellen via Windows Task Scheduler

Vereist: credentials zijn ingevuld in `.env` (zie `.env.example`), `business-profile.md`
is aangemaakt (zie `business-profile.example.md`), en `npm install` is al gedaan.

## Stappen

1. Open **Taakplanner** (Task Scheduler) via Start-menu.
2. Klik rechts op "Taakplannerbibliotheek" → **Basistaak maken...**
3. Naam: bijv. `YouTube PMax Uitsluitingen`
4. Trigger: **Wekelijks**, kies een dag, tijd bv. 06:00.
5. Actie: **Een programma starten**
   - Programma/script: `<pad-naar-deze-map>\run.bat`
   - Beginnen in (optioneel): `<pad-naar-deze-map>`
6. Voltooien.
7. Eigenschappen van de taak openen (na aanmaken) en op tabblad **Algemeen**:
   - "Uitvoeren ongeacht of gebruiker is aangemeld" aanvinken, zodat de taak ook draait als je niet bent ingelogd.
8. Tabblad **Instellingen**: "Taak indien mogelijk zo snel mogelijk opnieuw uitvoeren na een gemiste planning" aanvinken (voor het geval de pc uit stond).

## Resultaat controleren

- Logbestand per run: `logs\run-<datum>.log`
- Rapport: `output\rapport.md`
- Uitsluitingen: `output\uitsluitingen.csv`

## Handmatig draaien (los van het schema)

Dubbelklik `run.bat`, of in een terminal:

```
cd "<pad-naar-deze-map>"
run.bat
```

Dit kan altijd, ook met een actief schema — de cache (`cache.json`) zorgt dat al beoordeelde plaatsingen niet opnieuw worden geclassificeerd.

## Schema later aanpassen

Wijzig alleen de trigger in de taak-eigenschappen (bv. naar dagelijks) — het script en `run.bat` hoeven niet aangepast te worden. Pas eventueel ook `LOOKBACK_DAYS` in `.env` aan als je vaker draait (bv. naar 7 dagen bij dagelijkse runs) om minder overlap/herhaling te krijgen.
