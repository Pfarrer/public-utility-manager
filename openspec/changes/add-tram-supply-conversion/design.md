# Design

## Context

Die Tram ist ein flacher DC-Lastgang (80 kW, Prioritäts-Tarif 0,7×) in `events.ts` (`tramDeal`: offered → active/reoffered, Vertrag 5 Jahre). `history.json` trägt die Deal-Parameter. Change `add-three-phase-power` führt Stromart am Generator, AC-Shares, AC-Tarif und SAVE_VERSION 4 ein. Dieser Change hängt inhaltlich und zeitlich an beiden: Er braucht Drehstrom als etablierte Technologie im Spielverlauf.

Historischer Anker: Trams blieben 600-V-DC-Verbraucher; ab ca. 1900–1910 speisten Unterwerke mit rotierenden Umformern (AC→DC) aus dem Drehstromnetz. Die Oberleitung blieb DC, die Energie kam fortan aus der Ferne.

## Goals / Non-Goals

**Goals:**
- Tram-Umstellung als angekündigtes, unausweichliches Ereignis mit Bau-Vorlauf.
- Umformerwerk als neues Bauwerk (eins pro Region), mit Wirkungsgradverlust.
- Tram-Last wandert auf die AC-Seite; fehlende AC-Versorgung trifft die Tram doppelt.
- Save v5 mit Migration.

**Non-Goals:**
- Kein frei verhandelbares Gesuch (kein Accept/Reject wie beim Tram-Deal; historischer Druck).
- Keine Oberleitungs-/Netztopologie, keine separaten Tram-Leitungen.
- Keine neuen Kundensegmente; die Tram bleibt, was sie ist: eine Vertragssonderlast.

## Decisions

**D1 — Stichjahr datengetrieben, nicht im Code.** `history.json` bekommt einen `tramConversion`-Block (`announceYear`, `dueYear`, `converterLossFactor`). Initial: announce 1896, due 1897 (nach dem Tram-Erstvertrag Jahr 2 ≈ 1891 + 5 Jahre Laufzeit; Niagara-Ära als historische Referenz für „Fernspeisung wird Normalfall"). Balance nur über Daten änderbar, kein Code-Branch pro Jahr.

**D2 — Umformerwerk = Katalog-Bauwerk mit Regions-Limit.** `converter-station` (kind `converter`): wandelt, nicht erzeugt; zählt nicht zur Erzeugungskapazität. Pro Region maximal eins (Validierung wie `loadScenario`-Quer-Checks). Betriebsbereit ab Fertigstellung; Staffing analog Komponenten-Staffing (implizit, read-only).

**D3 — Lastwanderung im Dispatch, nicht in der Tram-Sim.** `tramLoadForRegion()` liefert weiterhin 80 kW; neu trägt sie ein `current: 'ac' | 'dc'`-Attribut (aus `state.clock.year >= dueYear`). Der Dispatch summiert sie auf die jeweilige Stromart-Seite; bei AC zusätzlich `loadKw / converterEfficiency` (Verlust ≈ 10 %, Faktor 0.9). Tram-Blackout (AC-Seite deckt sie nicht): doppelte Unzufriedenheit wie beim bestehenden Contract-Malus.

**D4 — Ein Umformerwerk, eine Tram.** Die Spielregion hat genau eine Tram (Hafenstadt, so der Deal zustande kam). Regions-Limit 1 genügt; mehrere Städte mit Tram wären ein späterer Change, falls das Szenario wächst.

**D5 — Migration v4→v5.** Nur additive Felder: `tramConversion: { phase: 'announced' | 'due' }` (aus Jahr abgeleitet), Umformerwerk-Bestand (default: keins). Keine Umbauten an Bestandsfeldern; Roundtrip bleibt trivial.

## Risks / Trade-offs

- **Verdoppelte Ereignis-Last im Jahresereignis-System** (Kohle-Krise 1894, Tram-Umstellung 1897): überschaubar, beide sind unabhängige Maschinen mit eigener Phase. Zeitliche Nähe ist gewollt: 1894 Kohle-Teuerung, 1897 Umrüstdruck — das Jahrzehnt bleibt fordernd.
- **Tram-Deal lief nur bis 1896:** Läuft der Erstvertrag aus, bevor die Umstellung fällig ist, speist die Tram weiter als Normaltarif-Last (bestehendes Verhalten). Die Umstellung betrifft die Speisung, nicht den Vertrag.
- **Verlustfaktor flat 10 %:** Rotary converters lagen real bei ~85–93 %. 0.9 als runder Datenwert, über `converterLossFactor` tunbar.

## Migration Plan

v4 → v5 additiv (D5). SAVE_VERSION-Guard unverändert; v3/v4-Saves werden weiterhin über die Kette migriert.

## Open Questions

- Balancing von `converter-station` (Kosten/Bauzeit) bei Implementierung klären; Tendenz: teurer als ein Generator, Bauzeit 2–3 Quartale.
- Ob die Tram nach Umstellung weiter zum Prioritäts-Tarif (0,7×) aufschlägt oder ein eigener AC-Tram-Tarif nötig ist: Tendenz unverändert 0,7× auf den jeweiligen Stromart-Tarif.
