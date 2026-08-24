# Design

## Context

Der Sim-Kern trennt Anzeige und Simulation strikt. Die Transparenz-Anforderung des Users — woher kommt der Strom, welche Stromart, welcher Kunde nimmt was ab — betrifft ausschließlich die Anzeige-Ebene: Alle Daten existieren bereits im `GameState` (`construction.plants`, `growth.shares[settlementId][segment]`, `growth.households`, `dispatch`-Ergebnis). Nach change `region-grid-lighting` zeichnet die Stadtansicht bereits Verteilungspfade (nearest running plant anchor → lit settlement centroid). Was fehlt, ist die verbale/numerische Ebene.

## Goals / Non-Goals

**Goals:**
- Der Spieler sieht pro Siedlung, aus welchem Werk der Strom kommt (oder Eigenversorgung).
- Der Spieler sieht an jedem Werk die erzeugte Stromart (⎓/~).
- Der Spieler sieht pro Siedlung und Wohlstandsschicht den Abnahme-Anteil in Prozent.
- Anzeige iststabil über Save/Load (SAVE_VERSION 3, keine Migration).

**Non-Goals:**
- Einführung von Stromarten als Mechanik (DC/AC-Split der Kapazität, separate Tarife) — change `add-three-phase-power`.
- Standortwahl/Leitungsbau — separater späterer Change.
- Umformerwerke/Kundenmigration als Mechanik.

## Decisions

**D1 — Herkunftszeile statt zweiter Linien-Layer.** Die Verteilungslinien zeigen die Topologie bereits räumlich. Für die verbale Ebene genügt eine Zeile pro Siedlung in der Stadtansicht (unter dem Siedlungsnamen): „⎁ Strom aus: Hafenstadt-Werk" bzw. „Eigenversorgung". Sie nutzt denselben nearest-running-plant-Anker wie die Linien (eine Wahrheit, zwei Repräsentationen).

**D2 — Stromart-Badge am Werk, historisch korrekt.** Bis AC existiert, sind alle Generatoren Gleichstrom („Dynamo"). Das Badge zeigt ⎓; der Wechselstrom-Fall (~) wird mit change `add-three-phase-power` aktiv, ohne dass diese Komponente hier schon AC-Logik enthält — sie rendert `plant.currentType` (default `dc`), das der Kern mit change 2 erweitert.

**D3 — Kunden-Mix-Panel als eigene Komponente.** `CustomerMixPanel.svelte` rendert pro Siedlung: Durchschnitt (haushaltsgewichtet) + je Schicht reich/mittel/arm in Prozent. Datenquelle `growth.shares` + `growth.households`. Komponente ist reine Funktion des GameStates — placement in der rechten Spalte unter dem Tarif-Panel (analog RegionDetail).

**D4 — Prozentausgabe aus echten Shares, nicht gerundet geraten.** `Math.round(share * 100)` je Schicht; Durchschnitt haushaltsgewichtet aus `settlementHouseholds`. Anzeige im deutschen Zahlenformat (Komma) via `toLocaleString('de-DE')`.

## Risks / Trade-offs

- **Zwei Stellen zeigen Stromart** (Badge Stadtansicht + PlantPanel): Akzeptiert — unterschiedliche Kontexte (Karte vs. Management), gleiche Datenquelle `plant.currentType`, kein Drift-Risiko, weil beide vom selben abgeleiteten Wert rendern.
- **Herkunftszeile ohne echte Topologie:** Solange die Region ein Netz ist, ist „nächstes laufendes Werk" eine Anzeige-Vereinbarung, keine physikalische Topologie. Mit echtem Leitungsbau wird die Zeile dann topologiebasiert. Bis dahin ist sie ehrlich („Strom aus: Werk X" = das Werk, dessen Linie gezeichnet wird).

## Migration Plan

Keine. Reiner Anzeige-Change; kein Save-Format, kein Datenmodell, kein Balancing berührt. Nach Implementierung von change `add-three-phase-power` erweitert dessen Implementierung das Kunden-Mix-Panel um die Stromart-Gliederung (dort eigener Delta-Requirement).

## Open Questions

- Keine offenen Fragen in diesem Scope. (Stromart-Mechanik, Drehstrom-Preis, Kundenwahl = change `add-three-phase-power`.)
