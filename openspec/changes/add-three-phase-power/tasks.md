## 1. Daten & Katalog
- [ ] 1.1 `buildings.json`: Drehstrom-Generator `alternator-1892` (kind generator, currentType ac) mit Kosten/Kapazität/Bauzeit/Staffing nach design.md D1/Balancing-Entscheidung
- [ ] 1.2 `history.json`: 1891er Meldung erweitern (Lauffen→Frankfurt, 2×176 km-Leitung, Miller, Dolivo-Dobrowolsky, ~75 % Wirkungsgrad)
- [ ] 1.3 `types.ts`: `CurrentType = 'dc' | 'ac'`, Generator-Schema `currentType`, `tariff: { dc: number; ac: number }`, shares-Struktur `{ dc, ac }` je Segment
- requires: power-plant, economy

## 2. Sim-Kern
- [ ] 2.1 `plant.ts`: Stromart je Generator-Komponente; `plantCurrentType(plant)` abgeleitet (≥1 AC-Generator → ac)
- [ ] 2.2 `dispatch.ts`: getrennte Ausweisung AC/DC-Kapazität (Anzeige/Abnahme-Bedingung), ein Regions-Dispatch bleibt
- [ ] 2.3 `growth.ts`: getrennte DC/AC-Adoption — AC wächst nur bei verfügbarer AC-Kapazität UND ac-Tarif ≤ wtp; startet bei 0; dc+ac ≤ 1
- [ ] 2.4 `economy.ts`: `setTariffCurrent(state, type, value)`; Revenue-Berechnung bedient beide Stromarten (anteilig aus Shares)
- requires: supply-dispatch, regional-growth, economy

## 3. UI
- [ ] 3.1 PlantPanel: Alternator mit Jahr-Gate (vor 1892 `aria-disabled` + „ab 1892 verfügbar"-Hinweis), Stromart-Badge ⎓/~ am Werks-Eintrag
- [ ] 3.2 GameShell: zweiter Tarif-Slider (Drehstrom), nur sichtbar ab 1892
- [ ] 3.3 CustomerMixPanel: Gliederung nach Stromart (⎓/~) je Segment; AC=0-Hinweis „Drehstrom: noch keine Kunden — Tarif senken oder warten"
- requires: game-ui

## 4. Persistenz & Migration
- [ ] 4.1 `persistence.ts`: SAVE_VERSION = 4, `migrateSave` v3→v4 (Komponenten → dc, tariff → {dc,ac}, shares → {dc: old, ac: 0})
- [ ] 4.2 Tests: Roundtrip v4, Migration v3→v4 deterministisch, Version-Guard bleibt
- requires: persistence

## 5. Verifikation
- [ ] 5.1 Suite grün, svelte-check 0/0, build sauber
- [ ] 5.2 Browser-Kampagne: 1891-Zeitung liest sich, ab 1892 Alternator baubar, AC-Adoption wächst nach Tarifsenkung
- requires: app-scaffold
