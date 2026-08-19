## MODIFIED Requirements

### Requirement: Province map shows four regions
The province map SHALL be a compact region selector: four region entries, the playable region highlighted, locked regions visually greyed with an unlock hint; it SHALL NOT render settlement circles (settlements are the city view's concern); selecting a region SHALL open the city view for it as the primary surface.

#### Scenario: Locked region hint
- **WHEN** the map renders and a locked region is hovered
- **THEN** a hint indicates it unlocks later (M1: not playable)
