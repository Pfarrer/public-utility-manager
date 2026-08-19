## ADDED Requirements

### Requirement: Single-region city view as primary surface
The UI SHALL provide a city view of the selected (playable) region as the primary playing surface: each settlement rendered as its active-stage polygon on a paper-toned canvas with sepia linework; un-electrified area SHALL be neutral grey.

#### Scenario: Settlements render as polygons
- **WHEN** the city view renders for the coast region with settlements Hafenstadt and Fischerdorf
- **THEN** each settlement appears as its active-stage polygon with a name label

### Requirement: Illumination reflects electrification
The illuminated (warm yellow) area fraction within a settlement polygon SHALL equal the settlement's household-weighted electrification share; illumination SHALL be painted around running plants and clipped to the settlement polygon; when no plant is operational the polygon SHALL be entirely grey.

#### Scenario: Light spreads with adoption
- **WHEN** a settlement's household-weighted share rises from 0.05 to 0.40
- **THEN** the illuminated fraction of its polygon rises accordingly

#### Scenario: No running plant, no light
- **WHEN** a settlement's region has no operational plant component
- **THEN** its polygon renders fully grey

### Requirement: Plants render as animated icons
Operational plants SHALL render as animated icons at their deterministic anchor inside the settlement polygon; plants under construction SHALL render a distinct scaffolding state.

#### Scenario: Plant appears on completion
- **WHEN** a plant's first component completes construction
- **THEN** its icon appears animated at the anchor position inside the polygon

#### Scenario: Construction state visible
- **WHEN** a plant has only components under construction
- **THEN** it renders in scaffolding state rather than the animated operational icon

### Requirement: Under-supply flickers
When the current quarter's dispatch for the region reports a blackout, the city view illumination SHALL dim and flicker; otherwise illumination SHALL be steady.

#### Scenario: Blackout quarter
- **WHEN** the region's dispatch for the rendered quarter has `blackout: true`
- **THEN** the illumination layer carries a flicker effect

### Requirement: Flow lines from plants to settlement
Animated flow lines SHALL run from each running plant to its settlement centroid, indicating energy direction; lines SHALL be hidden when the plant is not operational.

#### Scenario: Flow visible only when running
- **WHEN** a plant is operational and the region is served
- **THEN** an animated dashed line runs from the plant icon to the settlement centroid

### Requirement: Settlement polygons grow with households
When yearly growth advances a settlement past a geometry stage threshold, the city view SHALL render the next stage's polygon; the change SHALL be visually acknowledged (brief highlight); advancing a stage SHALL NOT unlock or change any build options, capacity or slots.

#### Scenario: Stage-up after growth year
- **WHEN** yearly growth carries Hafenstadt from 5,400 to 6,050 households and stage 2 starts at 6,000
- **THEN** the city view renders stage 2's polygon with a highlight

#### Scenario: Stage-up changes nothing in the sim
- **WHEN** a settlement advances a geometry stage
- **THEN** plant building options, capacity and slots are unchanged from before the stage-up
