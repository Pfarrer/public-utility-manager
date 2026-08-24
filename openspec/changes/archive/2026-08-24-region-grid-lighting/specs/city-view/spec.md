## MODIFIED Requirements

### Requirement: Illumination reflects electrification
The illuminated (warm yellow) area fraction within a settlement polygon SHALL equal the settlement's household-weighted electrification share; illumination SHALL be enabled whenever the region's grid is live (at least one operational plant component in the region) and painted centred on the settlement, clipped to the settlement polygon; when the region's grid is not live the polygon SHALL be entirely grey.

#### Scenario: Light spreads with adoption
- **WHEN** a settlement's household-weighted share rises from 0.05 to 0.40
- **THEN** the illuminated fraction of its polygon rises accordingly

#### Scenario: No running plant, no light
- **WHEN** a settlement's region has no operational plant component
- **THEN** its polygon renders fully grey

#### Scenario: Village lights from the regional grid
- **WHEN** the region's grid is live and the settlement has no local plant anchor
- **THEN** its polygon still renders illumination proportional to its electrification share

## ADDED Requirements

### Requirement: Distribution lines visualise the regional grid
The city view SHALL draw an animated distribution line from a running plant to every settlement whose illumination is visible (share > 0); with multiple running plants the nearest running plant anchor SHALL be used; settlements without illumination SHALL have no line.

#### Scenario: Village receives a distribution line
- **WHEN** the city's plant runs and the village's electrification share is above zero
- **THEN** an animated line runs from the plant anchor to the village centroid

#### Scenario: No share, no line
- **WHEN** a settlement's electrification share is zero while the grid is live
- **THEN** no distribution line is drawn to it
