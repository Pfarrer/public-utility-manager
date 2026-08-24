## 1. Anzeige: Herkunft & Stromart
- [ ] 1.1 CityView: Herkunftszeile pro Siedlung — „Strom aus: {Werk}" bei Zuführung, „Eigenversorgung" bei eigenem laufenden Werk (gleicher nearest-running-plant-Anker wie die Verteilungslinien)
- [ ] 1.2 CityView: Stromart-Badge (⎓/~) am Kraftwerk-Icon, gerendert aus `plant.currentType` (bis change add-three-phase-power konstant `dc`)
- [ ] 1.3 PlantPanel: Stromart-Badge im Werks-Eintrag ergänzen
- [ ] 1.4 Tests: Herkunftszeile Zuführung vs. Eigenversorgung; Badge rendert ⎓
- requires: city-view, game-ui

## 2. Kunden-Mix-Panel
- [ ] 2.1 `CustomerMixPanel.svelte`: pro Siedlung Durchschnitt (haushaltsgewichtet) + reich/mittel/arm in Prozent, deutsche Zahlenformatierung
- [ ] 2.2 GameShell: Panel in rechter Spalte unter Tarif platzieren
- [ ] 2.3 Tests: Prozentwerte aus echten Shares; haushaltsgewichteter Durchschnitt; Rundung
- requires: game-ui

## 3. Verifikation
- [ ] 3.1 Suite grün (vitest), svelte-check 0/0, build sauber
- [ ] 3.2 Browser-Spotcheck: Herkunftszeile + Badge + Kunden-Mix mit laufendem Werk
- requires: app-scaffold
