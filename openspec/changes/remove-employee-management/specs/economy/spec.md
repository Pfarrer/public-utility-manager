# Delta Spec: economy

## MODIFIED Requirements

### Requirement: Wages from staffed crew
Wage cost per quarter SHALL equal the total derived staff (Σ staffing of operational components across all plants) multiplied by the quarterly wage per crew member; the player SHALL NOT set crew levels.

#### Scenario: Payroll
- **WHEN** operational components across all plants require 18 crew at 250 €/quarter
- **THEN** the wages transaction is 4,500 €

#### Scenario: Wages follow the fleet
- **WHEN** a generator completes and becomes operational
- **THEN** the derived staff grows and the next quarter books higher wages
