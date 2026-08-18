# Public Utility Manager

Aufbau- und Managementspiel: Strom- und Wasserversorgung einer Region.

## Vision — grobe Features (keine Specs)

> Kontext-Liste für die Zukunft. Bewusst vage; wird erst bei Bedarf in
> OpenSpec-Changes zu konkreten Specs ausgearbeitet.

- **Realistische Simulation** — nah am echten Stromnetzsystem, kein Arcade-Spiel
- **Setting:** Spieler ist der Verantwortliche, der eine unbenannte Provinz im
  Zeitalter der Elektrifizierung ans Netz bringt — das ist der Rahmen des
  gesamten Spiels
- **Startjahr konfigurierbar / vom Spieler wählbar** — offener Zeitpunkt;
  früheres Startjahr (z. B. 1882) = höhere Schwierigkeitsstufe
- **Tick-basiertes Gameplay: 1 Tick = 1 Quartal** (4 Ticks pro Jahr)
- **Jährlicher Geschäftsbericht + Zeitung** mit realen historischen Ereignissen
  des jeweiligen Jahres — Fokus auf Energie-/Innovationsgeschichte, aber auch
  Ereignisse (z. B. Ausstellungen), die den Energieverbrauch beeinflussen
- **Kraftwerke aus realistischen Komponenten:** z. B. erste Anlage = 2 Dampfmaschinen
  (historisch realistische Leistung), die 6 Generatoren antreiben; jeder Generator
  liefert seinen Anteil — erste Kraftwerke versorgen nur wenige Haushalte
- **Realistische Betriebskosten:** Personal (Mannschaft für Betrieb & Wartung)
  + Brennstoff (Kohle) — Krise macht Kohle teuer → Betrieb wird teurer
- **Nachfrage-Segmente:** Haushalte nach Wohlstand kategorisiert
  (wohlhabend / durchschnittlich / arm), pro Region gezählt — wohlhabende
  Haushalte sind die ersten Stromkunden (Zielgruppe für den Start)
- **Gewerbe & Industrie als frühe Großkunden:** hoher Energiebedarf +
  hohe Zahlkraft — gehören zu den ersten Kundengruppen; Straßenbahn als
  typischer früher Großkunde zahlt direkt in die Stadtentwicklung ein
- **Krisen reagierbar:** Zeitung kündigt Spannungen/Kostensteigerungen an →
  Spieler kann **Strompreise anpassen**, um das Geschäft profitabel zu halten
- **Abrechnungs-Evolution als Tech-Ära (M2-Idee):** Historisch wurde in den
  1880ern nicht nach Verbrauch abgerechnet, sondern **pauschal nach Anzahl
  installierter Lampen/Motoren**; verbrauchsgenaue Zähler machten die
  kWh-Abrechnung erst in den 1890ern zum Standard (Arons Uhrzähler 1884,
  Shallenberger 1888, Thomsons Socket-Meter 1892). Spielbar: Start mit
  **Pauschaltarif pro Lampe** (planbare Einnahmen, einfacher Einstieg),
  Tech-Unlock „Verbrauchszähler" (~1892–1895) schaltet die kWh-Abrechnung
  frei — danach echte Tarif-Mechanik (Margen, Preiselastizität) und der
  interessante Konflikt: Pauschale = sichere Planung vs. kWh = Margenlogik.
  M1 bleibt bewusst bei der kWh-Abstraktion (Spielbalance-Grundlage).
- Zeitliche Progression durch Technologie-Epochen (von ersten Kraftwerken bis
  zum modernen Netz)
- **Provinz = mehrere nebeneinanderliegende Regionen** (rechteckig), jede mit
  einzigartigen Eigenschaften, Anforderungen und Möglichkeiten — z. B.
  Küstenregion, Bergregion, Hochland, Landwirtschaftsregion
- **Region statt Ort:** Regionen enthalten Städte und Dörfer, aber der Spieler
  interagiert auf Regionsebene, steuert nicht einzelne Orte direkt
- Stromnetz zuerst; **Wassersystem später** (Provinz-Manager-Perspektive)
- Städte wachsen organisch — abhängig von den Entscheidungen des Spielers
- **Wachstums-Schleife:** günstiger, verfügbarer Strom beschleunigt
  Regions-/Stadtentwicklung → schnelleres Wachstum erzeugt mehr Gewerbe,
  Industrie und wohlhabende Haushalte → mehr Nachfrage
- **Industrie-Angebote (Deal-Mechanik):** Unternehmen kündigen
  Elektrifizierungsvorhaben an und fragen Dauerleistung an (z. B. 100 kW für
  einen Stahlschmelzofen) zu einem gebotenen Preis (typischerweise unter
  Marktpreis). Spieler akzeptiert oder lehnt ab:
  - **Ablehnen** = Risiko: Energie woanders verkaufen müssen, Region wächst
    langsamer; das Unternehmen existiert trotzdem weiter
  - **Akzeptieren** = günstiger Dauerbezug, aber Verpflichtung zur Lieferung
  - **Erneutes Angebot:** nach Ablehnung kann das Unternehmen (nicht garantiert)
    mit höherem Preis nachfragen
- **Kein Eingriff in Regionsgesetze:** Spieler gestaltet nur über Stromangebote
  (z. B. „bestehende Mine möchte expandieren & elektrifizieren"), nicht über
  Genehmigungen/Konzessionen — abgelehnte Unternehmen kaufen ggf. weiter Strom
  zum normalen Marktpreis
- Industrien siedeln sich an (in Abhängigkeit von Spielerentscheidungen)
- **Grafik bewusst simpel (zunächst):** grobe Übersicht von Provinz/Regionen
  mit Größen-Indikation der Städte — keine exakten Straßen/Häuser, nur
  schneller erster Eindruck
- **UI primär Diagramme & Zahlen** (Management-Oberfläche) — hält den
  Entwicklungsaufwand anfangs gering und erlaubt schnelles Ausprobieren der
  Gameplay-Mechaniken
- **Lastprofile als Summe von Sinuskurven (Fourier-Ansatz):** Haushalte teilen
  eine Grund-Verbrauchskurve (z. B. Einfamilienhaushalt mit Peak morgens und
  abends); jeder Haushalt bekommt leichte Amplituden- und Phasenverschiebung
  (eigener Tagesrhythmus — steht früher auf, höherer Verbrauch, …).
  Gesamtverbrauch eines Ortes = Summe über alle Haushalte → organisch, nirgends
  identisch. Industrie: eigene Profile (hoher Grundverbrauch, gigantische Peaks
  zu Arbeitszeiten, Mittagspause weniger). Profile wandeln sich über die Jahre.
- **Erwartungshaltung & Unzufriedenheit wandeln sich über die Jahre:** In der
  Frühzeit (z. B. 1882, Feuer im Kraftwerk → Ausfall) erzeugt eine Störung nur
  geringe Unzufriedenheit — Strom ist neuer Luxus. Mit wachsender Abhängigkeit
  (elektrifizierte Straßenbahn, Industrie, Haushalte) steigt die
  Erwartungshaltung: je länger ein Ausfall andauert, desto größer die
  Unzufriedenheit. Moderne Zeiten: Erwartung = ständige Verfügbarkeit
- **Technologie-Evolution über Jahrzehnte:** Anfangs nur Gleichstrom, keine
  Übertragungsnetze; dann Wechselstrom, Übertragungsnetze, effizientere
  Generatoren, Turbinen, neue Kraftwerkstypen, Automatisierung. Innovationen
  werden über die **Zeitung angekündigt** und stehen danach zum Einbau zur
  Verfügung
- **Pilotprojekt-Preis-Logik (Lernkurve):** Erstausstattung mit neuer
  Technologie (z. B. neue Turbinen-Art) ist teuer — Pilotprojekt fürs eigene
  Unternehmen; nach dem ersten Bau lässt sich dieselbe Technologie in anderen
  Kraftwerken günstiger nachrüsten
- **Schematische Karte, zwei Ansichten:**
  - **Ansicht 1 — Regionen-Übersicht:** Regionen/Städte stilisiert als Kreise
    (Diagramm-Stil); Klick/Hover liefert Details: Wohlstand,
    Energieversorgungs-Abdeckung, Industrie, Nachfrage
  - **Ansicht 2 — Netz-Karte (später im Spiel):** sobald Netze verbunden sind
    und Energie zwischen Regionen fließt — stilisierte Karte mit Leitungen,
    Energieflüssen und Leitungs-Auslastung; Planungs-Werkzeug für neue
    Leitungen (wo und wie bauen)

## Leitprinzip: Realismus-Grad

Keine exakte Simulation — aber so nah an der Realität wie im sinnvollen Rahmen:
**Realismus nur soweit, wie er für den Spieler sinnvolle Entscheidungen erzeugt.**
Wo Realismus nur Komplexität schafft, ohne Spielentscheidungen zu erzeugen,
wird vereinfacht.

## Tech-Stack (entschieden)

**SvelteKit + Svelte 5 + Vite + Vitest** — bewusster Versuch eines neuen Stacks
(für dieses Projekt; bewährte React/TanStack-Muster bleiben als Referenz).

- SvelteKit 2 (file-based routing, `adapter-static` für SPA-artiges Deploy,
  SSR für das Spiel deaktiviert)
- Svelte 5 mit Runes (`$state`, `$derived`, `$effect`) statt klassischer Stores
- Sim-Kern bleibt **framework-freies TypeScript-Modul** (deterministisch,
  seeded RNG, IDs im GameState, headless testbar) — unchanged vom bewährten
  Muster
- Datengetrieben: JSON + valibot (Gebäude, Lastprofile, historische Ereignisse)
- Charts & schematische Karten: custom SVG (kein Chart-Lib-Zwang)
- Tests: Vitest (`node` für Sim-Kern, `happy-dom`/`jsdom` + Testing Library
  für UI); `svelte-check` für Typprüfung

## Offene Fragen (später beantworten)

- [ ] Netzberechnung: vereinfachtes Transportmodell (Kapazität pro Leitung)
      vs. echte Lastflussberechnung? → Entscheidung anhand: erzeugt der
      Mehraufwand Spieler-Entscheidungen (z. B. N-1-Reserve, Frequenz)?
- [x] Historische Inselnetze: entschieden — Start mit Inselnetzen, Wechselstrom
      als Epoche-Schwelle zum Verbundnetz (Details siehe unten, offene Frage).
- [ ] Regelenergie/Frequenzhaltung als explizite Spielmechanik — ja/nein/ab
      welcher Epoche?
- [ ] Wassersystem zeitlich einordnen: historisch wäre Wasser/Gas VOR Strom
      gekommen — bleiben wir bei „Strom zuerst, Wasser später"?
- [x] Zeitskala (teilweise): 1 Tick = 1 Quartal, 4 Ticks/Jahr — entschieden.
      Offen bleibt nur: Bis wann läuft ein Spiel (1990? heute? endlos?)
- [ ] Deal-Verhandlungen: Granularität — pro einzelner Anlage (Stahlschmelzofen)
      oder pro Betrieb/Industriezweig? Empfehlung Letzteres (sonst Click-Overload).
- [ ] Wachstums-Schleife kalibrieren: Wie stark koppeln Strompreis/Verfügbarkeit
      an Wachstum? (Positiv-Feedback kann in „alles explodiert" oder „nichts
      passiert" kippen — braucht Playtests)
- [x] Karten-Typ (entschieden): schematische Karte, zwei Ansichten —
      (1) Regionen-Übersicht mit Kreis-Diagramm-Stil + Hover/Klick-Details,
      (2) Netz-Karte mit Leitungen/Auslastung, sobald Verbund existiert.
      Keine geografische Tile-Karte.
- [ ] Lastprofile: pro Haushalt simulieren oder Gruppen-Koeffizienten
      (Kategorie × Region × Streuung) aggregieren? Summenkurve identisch,
      Aufwand massiv geringer — Empfehlung: Gruppen.
- [ ] Inselnetze & Übertragung (historisch entschieden): Start mit lokalen
      Inselnetzen (Gleichstrom); Wechselstrom/Übertragungsnetze als große
      Epoche-Schwelle → Verbundnetze → Netz-Karte (Ansicht 2). Details
      (Jahr, Kosten, DC→AC-Umstellung bestehender Netze) offen.
- [ ] Nachfrage-Statistik: Granularität pro Region oder pro Ort? (Spieler
      interagiert auf Regionsebene — reicht die Statistik auch regional oder
      will man Orte einzeln sehen?)
- [ ] Kohle-Beschaffung: nur Spotpreis (einfach) oder zusätzlich Langzeit-Verträge
      (planbar, teurerer Basispreis, krisenfest) als Spielmechanik?
- [ ] Strompreis & Nachfrage: Wirkt der Tarif auf die Nachfrage
      (Preiselastizität — teurer Strom bremst Elektrifizierung/Wachstum) oder
      nur auf die Rentabilität?
- [x] Startjahr: konfigurierbar / Spieler wählt; früher (1882) = schwerer.
      (Entschieden: offen & konfigurierbar, kein fixes Datum)
