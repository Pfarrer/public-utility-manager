## ADDED Requirements

### Requirement: No line breaks inside value-unit pairs and control labels
The UI SHALL render monetary amounts, tariffs and numeric value+unit pairs with a non-breaking space between value and unit (e.g. between amount and `$`, between tariff and `$/kWh`, between figure and `kW`), and top-bar buttons and badges SHALL NOT wrap their label text. The top bar MAY still wrap between its items.

#### Scenario: Cash display in the top bar
- **WHEN** the top bar renders the cash amount at any viewport width
- **THEN** the amount and the `$` symbol appear on one line (joined by a non-breaking space)

#### Scenario: Tariff value
- **WHEN** the tariff panel shows the current tariff
- **THEN** value and `$/kWh` are joined by a non-breaking space

#### Scenario: Button and badge labels
- **WHEN** top-bar buttons or badges render at a width that would otherwise wrap them
- **THEN** their labels render on a single line (`white-space: nowrap`)

#### Scenario: Report amounts
- **WHEN** the annual report modal lists transaction amounts
- **THEN** each amount and its `$` sign are joined by a non-breaking space

#### Scenario: Panel figures
- **WHEN** plant or region panels show figures with units (kW, workers, percent)
- **THEN** value and unit are joined by a non-breaking space
