# Design

## Context

Der Sim-Kern führt Elektrifizierungs-Anteile pro Siedlung und Wohlstandsschicht (`growth.shares[settlementId][segment]`). Seit change `add-power-origin-transparency` zeigt die UI Stromart-Badges und ein Kunden-Mix-Panel. Die Historie-Daten enthalten bereits eine 1891er Meldung („Wunder von Lauffen"). SAVE_VERSION ist 3.

## Goals / Non-Goals

**Goals:**
- Drehstrom als datiertes historisches Ereignis (Zeitungsartikel 1891, Verfügbarkeit ab 1992-Spieljahr).
- Drehstrom-Generatoren parallel zu DC baubar; Stromart ist Eigenschaft des Generators.
- Eigener Drehstrom-Tarif; AC-Adoption als eigener, langsamer Prozess, der von null startet.
- Save-Migration v3 → v4.
- Anzeige (Badges, Kunden-Mix) zeigt die Stromart-Gliederung.

**Non-Dispatch-Goals:**
- Keine Umformerwerke, keine DC→AC-Migration bestehender Kunden (möglicher Folgewechsel).
- Kein dritter Tarif; Drehstrom = AC (einphasig vs. Drehstrom nicht weiter aufgeteilt — „Drehstrom" ist der historische Terminus für das gesamte AC-System dieser Ära).
- Keine Übertragungsverluste/Netz-Topologie.

## Decisions

**D1 — Stromart am Generator, nicht am Werk.** `buildings.json` bekommt am Generator `currentType: 'dc' | 'ac'`; der Alternator (`alternator-1892`) ist der erste AC-Generator. Dampfmaschinen bleiben neutral. Damit sind parallele Werke mit gemischten Generatoren möglich und historisch korrekt (die Antriebsmaschine trennt nicht zwischen DC/AC, der Generator tut es). `plant.currentType` (Anzeige) wird abgeleitet: Werk mit ≥ 1 AC-Generator zeigt ~, sonst ⎓.

**D2 — Verfügbarkeit per Jahres-Gate, nicht per Forschung.** Der Alternator erscheint im Katalog, sobald `state.clock.year >= 1892`. Das Zeitungs-Jahr 1891 („Wunder von Lauffen") ist der Kanon-Anker: Der Spieler liest 1891 vom Durchbruch, bauen kann er ab 1892. Kein Tech-Tree, kein Forschungspunkt — passt zur M1-Ereignisstruktur (Zeitungs-Historie + coal-factor-Änderung 1894).

**D2a — Zeiger-Badge „ab 1892 verfügbar" im Katalog.** Vor 1892 rendert der Baukatalog den Alternator ausgegraut mit Hinweis „ab 1892 verfügbar" (nicht hidden), damit der Spieler weiß, was kommt. (Parallele zum gesperrten Region-Button: `aria-disabled` + Guard.)

**D3 — Ein Regions-Tarif-Paar, nicht pro Werk.** `economy.tariff` wird zu `{ dc: number; ac: number }` (beide $/kWh, gleiche Clamp-Bounds wie heute). Der Spieler setzt beide über je einen Slider. Begründung: Ein Versorger, eine Provinz, zwei Stromarten — werkweise Tarife wären Mikromanagement ohne historische Grundlage (Gemeindekonzessionen setzten Stadtnetze-Tarife, nicht werkweise).

**D3a — getrennte Kapazitäts-Pools, ein Dispatch.** AC- und DC-Kapazität werden je Werk getrennt ausgewiesen (Anzeige + PlantPanel), aber der Dispatch bleibt **ein** Regions-Dispatch: Gesamtkapazität bedient Gesamtnachfrage. Begründung: Historisch betrieben Werke beide Netze parallel im selben Versorgungsgebiet; die Trennung liegt in Erzeugung/Abnahme, nicht im Netz selbst. Das hält den Sim-Kern klein und verhindert DC-AC-Buchhaltungsarbitrage.

**D4 — AC-Adoption: gleiche Physik, neue Zähler.** `growth.shares` wird zu `shares[settlementId][segment]` → `{ dc: number; ac: number }` mit `dc + ac ≤ 1`. Regeln:
- DC-Adoption: wie heute (blackout, tariff.dc ≤ wtp).
- AC-Adoption: wie heute, aber Kapazitäts- und Tarif-Bedingung an AC gemessen; startet bei 0.
- Migration DC→AC: bewusst **nicht** in diesem Change (kein Umformerwerk) — aber strukturell vorbereitet, weil Shares je Stromart geführt werden.
- Tram/Industrie können später AC-only-Segmente werden (Folgewechsel).

**D5 — SAVE_VERSION 4 mit Migration.** v3-Saves: alle Komponenten → `dc`, `tariff` (number) → `{ dc: tariff, ac: tariff }` (AC-Tarif startet gleich hoch), shares → `{ dc: oldShare, ac: 0 }`. Migration deterministisch, kein Datenverlust.

**D6 — Erweiterte 1891er Meldung.** Die bestehende 1891-Zeile in `history.json` wird erweitert (Lauffen→Frankfurt, 176 km, ~75 % Wirkungsgrad, Miller/Dolivo-Dobrowolsky): Der Artikel verkündet den Durchbruch; ab 1892 ist der Alternator baubar. Es bleibt **eine** Meldung (keine neue ID), damit der Zeitungs-Flow („Year with entry") unverändert bleibt.

## Risks / Trade-offs

- **Ein Dispatch, zwei Stromarten** könnte physisch unhistorisch wirken (DC und AC im selben Netz?). Real war es: getrennte Leitungsnetze derselben Werke im selben Gebiet. Die Abstraktion „ein Regions-Dispatch" wurde schon mit `region-grid-lighting` etabliert (Region = ein Netz); D3a führt sie konsequent fort — auf Erzeugungs-/Abnahmeseite getrennt, auf Netzseite vereint.
- **Zwei Tarif-Slider** + Kunden-Mix-Gliederung erhöhen die UI-Last. Gemildert durch das Kunden-Mix-Panel (eine Quelle der Wahrheit für beide Stromarten).
- **AC startet bei 0** — erste AC-Quartale wirken „tot" (keine AC-Kunden, aber Wartungskosten). Historisch korrekt und gewollt: Der Umrüst-Schmerz ist der Punkt. UI-Hinweis im Kunden-Mix-Panel („Drehstrom: noch keine Kunden — Tarif senken oder warten").

## Migration Plan

v3 → v4 wie D5. `SAVE_VERSION`-Guard (spec: persistence „Version guard") gilt weiter: v3-Saves werden beim Laden migriert, nicht abgelehnt — der Guard-Text bleibt für zukünftige Versionen. Implementierung: `persistence.ts` `migrateSave(raw)` vor Validate.

## Open Questions

- **Preis-Sensibilität AC vs. DC:** Wählen Kunden bei gleichem Tarif DC (Bestandsvorteil) oder AC (bessere Spannungslage)? Vorschlag zur Implementierung: AC-Adoption nur, wenn AC-Tarif < DC-Tarif **oder** DC-Kapazität erschöpft — sonst bleibt alles beim Alten. Zu klären bei Implementierung.
- **Alternator-Balancing:** Kosten/Kapazität/Bauzeit analog Dynamo 50 kW oder stärker/teurer? Tendenz: stärker + teurer (Drehstrom skaliert). Zu klären bei Implementierung.
- **Industrie/Tram als AC-voraussetzende Segmente:** Folgewechsel, hier nur strukturell vorbereitet.
