# economy Specification

## Purpose
Monetary loop: tariff revenue against fuel, wage and construction costs, with an itemized annual report and a bankruptcy end condition.

## Requirements

### Requirement: Revenue from served energy
Quarterly revenue SHALL equal served kWh multiplied by the current tariff ($/kWh), booked as a revenue transaction.

#### Scenario: Simple quarter
- **WHEN** 12,000 kWh are served at 0.30 $/kWh
- **THEN** a revenue transaction of 3,600 $ is booked

### Requirement: Fuel proportional to generation
Fuel cost SHALL equal generated kWh × fuel price ($/kWh); during a coal crisis the fuel price SHALL be multiplied by the active crisis factor.

#### Scenario: Crisis quarter
- **WHEN** 12,000 kWh are generated at 0.08 $/kWh fuel price with an active crisis factor 1.5
- **THEN** the fuel transaction is 1,440 $

### Requirement: Wages from staffed crew
Wage cost per quarter SHALL equal the total derived staff (Σ staffing of operational components across all plants) multiplied by the quarterly wage per crew member; the player SHALL NOT set crew levels.

#### Scenario: Payroll
- **WHEN** operational components across all plants require 18 crew at 250 $/quarter
- **THEN** the wages transaction is 4,500 $

#### Scenario: Wages follow the fleet
- **WHEN** a generator completes and becomes operational
- **THEN** the derived staff grows and the next quarter books higher wages

### Requirement: Itemized annual report
After Q4 the system SHALL produce a report per year listing revenue and each cost kind with totals and the net result.

#### Scenario: Year closing
- **WHEN** a game year with 4 settled quarters ends
- **THEN** the annual report sums all transactions by kind and shows the net profit/loss

### Requirement: Bankruptcy after persistent losses
Cash below 0 for 4 consecutive quarters SHALL trigger game over; a single positive quarter resets the counter.

#### Scenario: Four red quarters
- **WHEN** cash is negative in quarters 1–4
- **THEN** the game-over flag is set after quarter 4 settles
