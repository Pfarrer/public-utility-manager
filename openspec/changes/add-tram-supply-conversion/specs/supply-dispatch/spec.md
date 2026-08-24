## ADDED Requirements

### Requirement: Tram load moves to AC after conversion
From the conversion due year onward the tram load SHALL count toward AC demand, increased by the converter loss factor (`loadKw / converterLossFactor`); while no operational converter station exists or AC capacity cannot cover the tram load, the tram load SHALL count as unserved and dissatisfaction SHALL be weighted double; before the due year the tram load SHALL remain on the DC side unchanged.

#### Scenario: Tram load on AC side
- **WHEN** the due year has arrived, a converter station is operational and AC capacity suffices
- **THEN** AC demand includes 80 kW divided by the converter loss factor and the tram is served

#### Scenario: No converter station yet
- **WHEN** the due year has arrived but no operational converter station exists
- **THEN** the tram load counts as unserved with double dissatisfaction weight

#### Scenario: AC capacity exhausted
- **WHEN** the due year has arrived, a converter station is operational, but AC capacity cannot cover tram plus converted load
- **THEN** the unserved tram energy counts double toward dissatisfaction

#### Scenario: Before due year unchanged
- **WHEN** the game year is before the due year
- **THEN** the tram load counts toward DC demand exactly as before
