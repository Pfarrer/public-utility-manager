## ADDED Requirements

### Requirement: Customer mix panel
The UI SHALL provide a customer mix panel showing, for each settlement of the selected region, the household-weighted average electrification share and the per-wealth-segment shares (wealthy/average/poor) in percent, derived from `GrowthState.shares` and `GrowthState.households`.

#### Scenario: Percent per segment
- **WHEN** a settlement's wealthy segment share is 0.71
- **THEN** the panel shows „71 %" for that segment

#### Scenario: Household-weighted average
- **WHEN** wealthy share is 0.71 with 800 households, average share 0.40 with 300, poor share 0.11 with 100
- **THEN** the panel shows a household-weighted average of 58 %
  (0.71·800 + 0.40·300 + 0.11·100 = 699 of 1,200 households)

#### Scenario: Panel updates after tick
- **WHEN** a quarter tick completes while the panel is open
- **THEN** the shown percentages reflect the new shares
