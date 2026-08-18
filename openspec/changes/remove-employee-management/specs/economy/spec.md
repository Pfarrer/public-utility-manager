# Delta Spec: economy

## REMOVED Requirements

### Requirement: Wages from staffed crew
Reason: With employee management removed there is no staffed crew to pay; the wage bill was bookkeeping overhead unrelated to the grid simulation.
Migration: No wages transaction is booked and the annual report no longer lists a wages position; the `wagePerCrewQuarter` balance value is dropped from economy data. Saves from versions with wage data are rejected via the SAVE_VERSION bump to 3.
