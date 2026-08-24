# Why

Der Spieler sieht seit dem Regions-Netz (change `region-grid-lighting`), *dass* jede Siedlung einer Region versorgt wird — aber nicht, **woher** der Strom konkret kommt und **welche Stromart** seine Werke erzeugen. Beim historischen Umrüsten von Gleichstrom auf (Dreh-)Wechselstrom — dem Kern des Spiels — muss der Spieler jederzeit erkennen: Welches Werk speist welche Siedlung? Erzeugt dieses Werk Gleich- oder Wechselstrom? Und welche Kundengruppen beziehen aktuell wie viel Strom, in Prozent ausgedrückt?

Ohne diese Transparenz bleibt die geplante Stromart-Migration (change `add-three-phase-power`) ein black box: Der Spieler müsste blind AC-Kapazität bauen, ohne zu sehen, was seine Kunden eigentlich abnehmen.

# What Changes

- **Stromherkunft an jeder Siedlung:** Die Stadtansicht zeigt pro Siedlung eine kompakte Herkunftszeile (z. B. „Strom aus: Hafenstadt-Werk"), wenn die Siedlung aus dem Regions-Netz gespeist wird; Siedlungen mit eigenem Werk zeigen „Eigenversorgung". Die Verteilungslinien der Stadtansicht bleiben der räumliche Beleg.
- **Stromart-Badge am Kraftwerk:** Das Kraftwerk-Icon der Stadtansicht und der Eintrag im Kraftwerk-Panel tragen ein Stromart-Kennzeichen (⎓ für Gleichstrom, ~ für Wechselstrom). Bis change `add-three-phase-power` implementiert ist, zeigen alle Werke ⎓ Gleichstrom.
- **Kunden-Mix pro Siedlung:** Ein neues Kunden-Panel zeigt pro Siedlung und Wohlstandsschicht den Elektrifizierungs-Anteil in Prozent („Ø 42 % — reich 71 % / mittel 40 % / arm 11 %"), abgeleitet aus den existing `GrowthState.shares`. Nach change `add-three-phase-power` gliedert dieses Panel zusätzlich nach Stromart auf.
- **Keine Sim-Kern-Änderung:** Alle Angaben sind reine Renderzeit-Ableitung aus `GameState` (plants, shares, households, dispatch). Keine neue Mechanik, kein Save-Format-Bump (SAVE_VERSION bleibt 3).

# Impact

- `specs/city-view/spec.md` — ADDED requirement „Power origin is visible per settlement" + MODIFIED „Plants render as animated icons" (Stromart-Badge)
- `specs/game-ui/spec.md` — ADDED requirement „Customer mix panel" (pro Siedlung Prozent je Schicht)
- Implementierung: `app/src/lib/components/CityView.svelte`, neue Komponente `CustomerMixPanel.svelte`, `PlantPanel.svelte` (Badge)
- Keine Änderungen an Sim-Kern, Daten, Save-Format
