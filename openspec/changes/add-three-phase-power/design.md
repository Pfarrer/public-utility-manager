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

## Resolved Decisions (User, 2026-08-24)

**D7 — DC-Acceptance-Toggle „Keine neuen Gleichstromverträge".** Historisch blieb DC parallel kaufbar (München DC bis 1948, NYC bis 2007) — der Auslauf ist im Spiel Spielerentscheidung, nicht Automatik. Neuer Zustand `dcAcceptingNew` (default `true`, Teil von SAVE v4). Effekt bei `false`: (a) DC-Adoption wächst nicht mehr (keine Neukunden); (b) Bestands-DC-Kunden wandern pro Quartal mit fester Rate ab (Balance-Parameter `dcPhaseOutPerQuarter`, initial 2–3 Prozentpunkte), **aber nur** wenn AC-Kapazität verfügbar UND AC-Tarif < DC-Tarif — Modell: bei Geräteverschleiß/Neuanschaffung geht der Kunde dann an AC. Ohne Toggle: keine Abwanderung ( historische DC-Enklaven liefen Jahrzehnte weiter).

**D8 — Alternator-Balancing: initial identisch zum Dynamo.** `alternator-1892` startet mit 50 kW, gleichen Kosten und gleicher Bauzeit wie `generator-50kw` — technologieneutraler Einstieg, der Umrüst-Schmerz entsteht durch Kapazitätsaufbau und Kundenakquise, nicht durch Preisdiskriminierung. Größere Generatorklassen kommen später als reine Datenerweiterung (`buildings.json` ist data-driven; historisch skalierte Drehstrom bis 1900 rasch auf mehrere hundert kW) — kein Spec-Change nötig.

**D9 — Tram bleibt DC-Verbraucherin; die Speisung wechselt (Folge-Change).** Historisch: Trams fuhren von Anfang an 600 V DC und tun es bis heute; ab ca. 1900–1910 speisten Unterwerke mit rotierenden Umformern aus dem Drehstrom-Fernnetz (IEEE/nycsubway-Quellen). Für das Spiel als Folge-Change `tram-supply-conversion` skizziert: Ab historischem Stichjahr stellt die Tram-Gesellschaft eine Anfrage (Zeitungs-/Nachrichtensystem) an den Spieler — „ab Jahr X versorgt ihr uns über ein Umformerwerk aus eurem Drehstromnetz". Ab X zählt die Tram-Last auf der AC-Seite (mit Umformer-Wirkungsgradverlust), solange Umformerwerk + AC-Kapazität stehen; sonst Blackout-Risiko fürs Tram-Segment. Der Spieler wird ein Jahr vorher gewarnt (analog Crisis-Ankündigung) und muss AC + Umformer rechtzeitig bauen. Dieser Change baut auf den AC-Shares und dem Umformer-losen Kern hier auf.

## Open Questions

- Keine offenen Fragen mehr in diesem Scope. (Tram-Umstellung: Folge-Change `tram-supply-conversion`, siehe D9; Industrie als AC-Segment dort mit bewerten.)
