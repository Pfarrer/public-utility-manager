# Why

Die Tram ist seit change `add-game-events` ein DC-Kunde mit flacher 80-kW-Last und Prioritäts-Tarif (0,7×). Historisch blieb die Straßenbahn zwar Gleichstrom-Verbraucherin (600 V DC an der Oberleitung, bis heute), aber ihre **Speisung** wechselte: Ab den 1900ern bezogen Tram-Gesellschaften ihren Strom nicht mehr aus den stadtnahen DC-Kraftwerken, sondern über **Unterwerke mit rotierenden Umformern** aus dem Drehstrom-Fernnetz (verifiziert: IEEE Power & Energy Magazine, nycsubway.org). Für den Spieler entsteht daraus ein Umrüst-Szenario mit Vorlauf: Die Tram kündigt die Umstellung an, der Spieler muss Drehstrom-Kapazität und ein Umformerwerk rechtzeitig bauen.

Dieser Change setzt die Skizze D9 aus `add-three-phase-power` design.md um. Voraussetzung: AC-Shares, Alternator und AC-Tarif existieren (change `add-three-phase-power`).

# What Changes

- **Umstellungsgesuch der Tram:** Nach Abschluss von `add-three-phase-power` (ab Spieljahr, in dem Drehstrom verfügbar ist) fordert die Tram-Gesellschaft zu einem historischen Stichjahr (Daten: `history.json` `tramConversion`) die Umstellung ihrer Speisung auf Drehstrom mit Umformerwerk. Das Gesuch kommt ein Jahr vorher als Nachricht/Zeitungsartikel (analog Coal-Crisis-Telegraph).
- **Umformerwerk als Bauwerk:** Neuer Katalog-Eintrag `converter-station` (kind converter) mit Kosten, Bauzeit, Staffing; pro Region genau ein Umformerwerk nötig. Es wandelt Drehstrom in 600 V DC für die Tram-Oberleitung (Wirkungsgradverlust bei der Tram-Last).
- **Tram-Last wandert auf die AC-Seite:** Ab dem Stichjahr zählt die Tram-Last (zuzüglich Umformer-Verlust) zur AC-Nachfrage. Solange kein Umformerwerk fertig und keine AC-Kapazität vorhanden ist, gilt die Tram-Last als nicht bedient → Tram-Blackout mit doppeltem Unzufriedenheits-Malus (Fortführung „Contract obligation binds supply").
- **Kein Ablehnen der Umstellung:** Sie kommt als historischer Druck (wie die Kohle-Krise), mit Vorwarnung ein Jahr vorher. Der Spieler kann nur rechtzeitig bauen.
- **Save-Format:** SAVE_VERSION → 5 mit Migration (Bestand: Tram-Last bleibt DC, kein Umformerwerk vorhanden, `tramConversion.phase = 'announced' | 'due'` je nach Jahr).

# Impact

- `specs/game-events/spec.md` — ADDED „Tram conversion demand arrives with the three-phase era" + MODIFIED „Tram offer is decidable" (Kontext: späteres Umstellungsgesuch) 
- `specs/power-plant/spec.md` — ADDED „Converter station is buildable" (Katalog, Region-Limit 1)
- `specs/supply-dispatch/spec.md` — ADDED „Tram load moves to AC after conversion" (inkl. Umformer-Verlust, Blackout-Folgen)
- `specs/persistence/spec.md` — MODIFIED „Version guard" (SAVE_VERSION 5, Migration v4→v5)
- Implementierung: `events.ts` (Phase + Vorwarnung), `buildings.json` (`converter-station`), `dispatch.ts` (Tram-Last AC-seitig), `persistence.ts` (v5 + Migration)
