## 1. Daten & Katalog
- [ ] 1.1 `history.json`: `tramConversion`-Block (announceYear 1896, dueYear 1897, converterLossFactor 0.9)
- [ ] 1.2 `buildings.json`: `converter-station` (kind converter, Regions-Limit 1, Kosten/Bauzeit/Staffing nach design D2 + Balancing)
- [ ] 1.3 `types.ts`: Umformerwerk-Typen, `tramConversion`-Phase (announced/due), Tram-Load `current: 'ac' | 'dc'`
- requires: power-plant, game-events

## 2. Sim-Kern
- [ ] 2.1 `events.ts`: Umstellungsvorwarnung als Nachricht im announceYear (analog Coal-Crisis-Telegraph)
- [ ] 2.2 `dispatch.ts`: Tram-Last ab dueYear auf AC-Seite (inkl. `loadKw / converterLossFactor`); Tram-Blackout → doppelt gewichtete Unzufriedenheit
- [ ] 2.3 Umformerwerk-Betrieb: fertig gebaut = betriebsbereit; implizites Staffing analog Komponenten (read-only)
- requires: supply-dispatch, game-events

## 3. UI
- [ ] 3.1 PlantPanel/Katalog: `converter-station` baubar; ausgegraut mit Hinweis, wenn bereits eins existiert
- [ ] 3.2 Nachrichten/Zeitung: Vorwarnungsartikel rendern (analog Coal-Telegraph)
- [ ] 3.3 GameShell: Statusanzeige der Umstellung (announced/due + Umformerwerk-Status) in der Ereignis-Anzeige
- requires: game-ui

## 4. Persistenz & Migration
- [ ] 4.1 `persistence.ts`: SAVE_VERSION = 5, Migration v4→v5 (additiv: tramConversion-Phase aus Jahr abgeleitet, Umformerwerk-Bestand default keiner)
- [ ] 4.2 Tests: Roundtrip v5, Migration v4→v5, Version-Guard bleibt
- requires: persistence
