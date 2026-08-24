## ADDED Requirements

### Requirement: Tram load moves to AC after accepted conversion
Once a converter station is operational in the tram region (conversion phase `converted`), the tram load SHALL count toward AC demand, increased by the converter loss factor (`loadKw / converterLossFactor`); while the AC side cannot cover the converted tram load, the unserved tram energy SHALL count double toward dissatisfaction; before conversion (phases `none`, `offered`, `accepted`, or `rejected`) the tram load SHALL remain on the DC side unchanged.

#### Scenario: Tram load on AC side
- **WHEN** the conversion phase is `converted` and AC capacity suffices
- **THEN** AC demand includes 80 kW divided by the converter loss factor and the tram is served from the AC side

#### Scenario: No converter station yet
- **WHEN** the conversion phase is `accepted` but no operational converter station exists
- **THEN** the tram load still counts toward DC demand (the depot plant keeps running until the converter station takes over)

#### Scenario: AC capacity exhausted
- **WHEN** the conversion phase is `converted` but AC capacity cannot cover the tram load
- **THEN** the unserved tram energy counts double toward dissatisfaction

#### Scenario: Rejected conversion unchanged
- **WHEN** the conversion phase is `rejected`
- **THEN** the tram load counts toward DC demand exactly as before, for the rest of the campaign
