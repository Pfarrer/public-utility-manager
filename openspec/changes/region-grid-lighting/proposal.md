# Why

Die Stadtansicht lügt: Nach aktuellem Sim-Kern wächst die Elektrifizierung in **jeder** Siedlung einer Region — `GrowthState.shares` existiert pro Siedlung, und die Regions-Kapazität bedient den aggregierten Regions-Bedarf. Die Stadtansicht zeigt Licht jedoch nur um den Anker des eigenen (per Hash zugewiesenen) Kraftwerks. Ergebnis: Das Fischerdorf bleibt visuell dunkel, obwohl der Kern es längst als versorgt und wachsend modelliert. Das Spiel vermittelt „ich kann immer nur eine Stadt versorgen" — ein Artefakt der Darstellung, kein Sim-Resultat.

## Killer Argument

Der Spieler verliert den wichtigsten Realismus-Anker des Spiels: dass Elektrifizierung vom Kraftwerk *ausstrahlt* — über Leitungen, in jeden Ort der Region. Der heutige Glow-Code (`glowR > 0 && s.plants.length > 0` + Kreis um `s.plants[0]`) macht Licht an die Präsenz eines Kraftwerks im Polygon gebunden. Das widerspricht dem Kern (Regions-Dispatch) und der eigenen Spec-Formulierung „when no plant is operational" (heißt: solange *irgendein* Kraftwerk der Region läuft, ist versorgt).

# What Changes

- **Regions-Verbundnetz (Anzeige):** Eine Region = ein Netz. Solange in der Region ein Kraftwerk betriebsbereit ist, sind alle ihre Siedlungen ans Netz angeschlossen — versorgbar und beleuchtet.
- **Licht folgt der Wahrheit des Kerns:** Der beleuchtete Flächenanteil je Siedlung entspricht ihrem echten haushaltsgewichteten Elektrifizierungs-Anteil (`shares`), unabhängig davon, wo das Kraftwerk steht. Kein Kraftwerk läuft → alle Polygone grau.
- **Verteilungslinien:** Vom Kraftwerks-Anker zum Zentrum jeder angeschlossenen Siedlung läuft eine animierte Verteilungslinie (dash-offset) — der Strom *fließt* sichtbar vom Werk ins Dorf. Sie ist der visuelle Träger des Verbundnetzes und zeigt dir, woher das Licht kommt.
- **Kraftwerks-Platzierung unverändert:** Deterministische Hash-Anker, kein Slot-System, keine Sim-Kern-Änderung, SAVE_VERSION bleibt 3.
# Impact

- `specs/city-view/spec.md` — MODIFIED: „Illumination reflects electrification" (Netz-Zustand statt Werks-Präsenz als Bedingung), „Flow lines from plants to settlement" (Verteilungslinien zu allen angeschlossenen Siedlungen)
- Implementierung: `app/src/lib/components/CityView.svelte`
- Keine Änderungen an Sim-Kern, Daten, Save-Format
