# Why

Historisch war der Drehstrom-Durchbruch kein schleichender Trend, sondern ein datiertes Ereignis: die internationale Elektrotechnische Ausstellung Frankfurt 1891, wo Lauffen→Frankfurt 176 km Drehstrom bei ~75 % Wirkungsgrad übertrug (Oskar von Miller, Dolivo-Dobrowolsky/AEG + Oerlikon). Das Spiel startet 1890 — der Spieler erleidet den Durchbruch also **im Spielverlauf**. Bis dato erzeugen alle Werke Gleichstrom (Edisons Inselnetz-Ära). Der Wechsel zu Drehstrom soll spürbar werden: nicht als Schalter, sondern als parallel aufgebaute, neue Erzeugungskapazität, die ihre eigenen Kunden gewinnen muss.

Gleichzeitig sichert change `add-power-origin-transparency` die Anzeige-Basis: Herkunftszeilen, Stromart-Badges und das Kunden-Mix-Panel existieren bereits — dieser Change füllt sie mit Mechanik.

# What Changes

- **Zeitungsartikel kündigt den Durchbruch an:** Die Historie-Daten erhalten (bereits vorhanden: „Wunder von Lauffen" 1891) eine erweiterte Meldung, die den Drehstrom-Durchbruch mit realen Bezügen verkündet. Der Artikel erscheint automatisch beim Jahreswechsel 1891→1892 im Spiel.
- **Drehstrom-Generatoren werden baubar:** Nach dem Erscheinen des Artikels (ab 1892) bietet der Baukatalog einen Drehstrom-Generator (Alternator) an. Vorher ist er ausgegraut/nicht verfügbar. Dampfmaschinen bleiben Stromart-neutral (treiben beide Generatortypen).
- **Stromart wird Spielersteuerung:** Jedes Werk kann parallel DC- und AC-Generatoren enthalten. `plant.currentType` existiert bereits als Anzeige-Feld; dieser Change macht die Stromart zur Eigenschaft des **Generators** (`componentId` entscheidet), nicht des Werks.
- **Drehstrom hat eigenen Tarif:** Der Spieler legt neben dem DC-Tarif einen eigenen Drehstrom-Tarif fest ($/kWh, gleiche Clamp-Bounds). Kunden „entscheiden": AC-Adoption wächst nur, wenn AC-Kapazität verfügbar UND AC-Tarif ≤ Zahlungsbereitschaft des Segments.
- **Kunden bleiben an ihrer Stromart:** Bestehende DC-Shares wandern nicht automatisch. AC-Shares wachsen von 0 an (eigene Adoption je Segment). Schwarzsichtbar im Kunden-Mix-Panel (Gliederung nach Stromart) und an den ⎓/~-Badges der Werke.
- **Save-Format:** SAVE_VERSION → 4 mit Migration (Bestand: alle Generatoren DC, alle Shares DC zugeordnet).

# Impact

- `specs/game-events/spec.md` — MODIFIED „Annual newspaper with historical headlines" (1891er Lauffen-Meldung verkündet Drehstrom-Durchbruch)
- `specs/power-plant/spec.md` — MODIFIED „Capacity derives from components" + „Expansion actions" (Drehstrom-Generator, Stromart am Generator)
- `specs/regional-growth/spec.md` — MODIFIED „Adoption grows with reliable affordable supply" (AC-Adoption als eigener Prozess)
- `specs/economy/spec.md` — MODIFIED „Revenue from served energy" (separater AC-Tarif)
- `specs/game-ui/spec.md` — MODIFIED „Player controls work" (Drehstrom-Tarif-Slider) + „Customer mix panel" (Gliederung nach Stromart)
- `specs/persistence/spec.md` — MODIFIED „Version guard" + „Roundtrip fidelity" (SAVE_VERSION 4, Migration)
- Implementierung: `events.ts`/`history.json`, `buildings.json` (Alternator), `plant.ts` (Stromart je Komponente), `growth.ts` (getrennte DC/AC-Adoption), `economy.ts` (AC-Tarif), UI-Komponenten
