# Design

## Context

Sim-Kern und Anzeige sind absichtlich getrennt: Der Kern aggregiert Nachfrage und Kapazität **pro Region** (`runDemand`/`runDispatch`), die Elektrifizierung läuft **pro Siedlung** (`GrowthState.shares[settlementId][segment]`). Die M2a-Stadtansicht rendert diese Wahrheit nur unvollständig: Licht existiert ausschließlich um den Anker eines laufenden, per Hash der Siedlung zugewiesenen Kraftwerks. Siedlungen ohne eigenes Kraftwerk bleiben damit visuell ewig dunkel.

## Goals / Non-Goals

**Goals:**
- Anzeige-Konsistenz: Licht = echter Elektrifizierungs-Anteil der Siedlung, gespeist aus dem Regions-Verbund.
- Sichtbares Verbundnetz: animierte Verteilungslinien vom laufenden Kraftwerk zu jeder versorgten Siedlung.
- Null Sim-Kern-Änderung, null Save-Änderung, null neue Spielmechanik.

**Non-Goals:**
- Leitungsbau als Spieler-Hebel (Kosten, Bauzeit, Topologie) — bewusst ausgeklammert; ein eigener späterer Change, wenn du Leitungen als Wirtschaftsgut willst.
- Netz-Kapazitätsgrenzen oder Übertragungsverluste — es gibt weiterhin genau einen Regions-Dispatch.
- Überregionale Verbünde.

## Decisions

**D1 — Netz-Zustand statt Werks-Präsenz.** Bedingung für Licht ist künftig: In der Region läuft mindestens ein betriebsbereites Kraftwerk (`plantAvailableCapacity > 0`, aggregiert über alle Kraftwerke der Region). Das ist exakt die Bedingung, unter der der Kern überhaupt bedient — die Anzeige hört auf, strenger zu sein als die Simulation.

**D2 — Licht um das Siedlungszentrum, nicht um den Werksanker.** Der Glow-Kreis sitzt künftig am Siedlungs-Zentroid (Radius weiter √share·maxR, aufs Polygon geclippt). Begründung: Das Licht repräsentiert *haushaltsgewichtete Elektrifizierung*, und Haushalte wohnen im Ort, nicht im Kraftwerk. Das Kraftwerk-Icon bleibt an seinem Anker — Werk und Erleuchtung sind zwei Layer.

**D3 — Verteilungslinien als Netz-Visualisierung.** Für jede Siedlung mit Lichtanteil > 0 läuft eine `flow`-Linie vom nächsten laufenden Kraftwerks-Anker zum Siedlungs-Zentroid (Animation per dash-offset wie bisher). Mehrere Werke: pro Siedlung das geometrisch nächstgelegene — deterministisch, ohne neue Daten. Siedlungen ohne adoptierte Haushalte (share ≈ 0) bekommen keine Linie: Kein Strom fließt, nichts zu zeichnen.

**D4 — Keine neuen Daten, keine Migration.** Alle Informationen existieren im `GameState` (shares, households, plants, dispatch). `SAVE_VERSION` bleibt 3, alte Saves rendern sofort korrekt.

## Risks / Trade-offs

- **„Warum leuchtet das Dorf ohne Leitung?"** — Gegenfrage: Warum wächst sein Elektrifizierungs-Anteil ohne Leitung? Beides folgt derselben Abstraktion (Region = Netz). Wer echte Leitungen will, braucht den späteren Change; die Verteilungslinien machen die heutige Abstraktion wenigstens sichtbar.
- **Nächstes-Werk-Auswahl bei mehreren Werken** kann bei hash-platzierten Ankern geometrisch unintuitiv wirken. Akzeptiert: Es ist Darstellung, nicht Topologie; bei echtem Leitungsbau wird dies ohnehin vom Spieler bestimmt.

## Migration Plan

Keine. Reiner Anzeige-Change; kein Save-Format, kein Datenmodell, kein Balancing berührt.

## Open Questions

- Keine. (Leitungsbau als Hebel bleibt als möglicher FolgeweChange notiert.)
