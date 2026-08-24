## ADDED Requirements

### Requirement: Power origin is visible per settlement
The city view SHALL show, for every settlement, a compact origin line naming the plant that feeds it (format „Strom aus: {plant name}") whenever the settlement is lit from the regional grid; a settlement whose own locally assigned plant is running SHALL show „Eigenversorgung" instead; settlements without any illumination SHALL show no origin line.

#### Scenario: Fed village names the plant
- **WHEN** the village is lit and its distribution line originates at the Hafenstadt plant
- **THEN** the village's origin line reads „Strom aus: {Hafenstadt plant name}"

#### Scenario: Own plant means Eigenversorgung
- **WHEN** a settlement's locally assigned plant is running and feeds it
- **THEN** „Eigenversorgung" SHALL be shown instead of a plant name

#### Scenario: Dark settlement has no origin
- **WHEN** a settlement has no illumination
- **THEN** no origin line is rendered for it

## MODIFIED Requirements

### Requirement: Plants render as animated icons
Operational plants SHALL render as animated icons at their deterministic anchor inside the settlement polygon; plants under construction SHALL render a distinct scaffolding state. Every rendered plant icon SHALL carry a current-type badge: ⎓ for direct current, ~ for alternating current.

#### Scenario: Plant appears on completion
- **WHEN** a plant's first component completes construction
- **THEN** its icon appears animated at the anchor position inside the polygon

#### Scenario: Construction state visible
- **WHEN** a plant has only components under construction
- **THEN** it renders in scaffolding state rather than the animated operational icon

#### Scenario: DC badge shown
- **WHEN** a plant running on direct-current generators is rendered
- **THEN** its icon carries a ⎓ badge

#### Scenario: AC badge shown
- **WHEN** a plant running on alternating-current generators is rendered
- **THEN** its icon carries a ~ badge
