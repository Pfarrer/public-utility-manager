## MODIFIED Requirements

### Requirement: Annual newspaper with historical headlines
The system SHALL assemble a newspaper only for a game year that has content: at least one curated historical headline for that year or at least one game message from the closed year. Such a newspaper SHALL contain the curated headline (when present) plus the game messages from the closed year. For a year with neither a curated headline nor game messages the system SHALL NOT create a newspaper. The curated headline for 1891 SHALL announce the three-phase breakthrough with its real references (Lauffen→Frankfurt, 176 km, Oskar von Miller, Dolivo-Dobrowolsky).

#### Scenario: Year with entry
- **WHEN** the year 1891 closes and history data has an 1891 entry
- **THEN** the newspaper for 1891 lists that headline

#### Scenario: Year without content
- **WHEN** a year closes that has neither a curated headline nor any game message
- **THEN** no newspaper is created for that year

#### Scenario: Messages only
- **WHEN** a year closes without a curated headline but with two game messages
- **THEN** the newspaper for that year contains those messages and no headline

#### Scenario: Lauffen headline announces three-phase power
- **WHEN** the newspaper for 1891 is assembled
- **THEN** its headline names the Lauffen→Frankfurt transmission and marks 1892 as the year three-phase generators become orderable
