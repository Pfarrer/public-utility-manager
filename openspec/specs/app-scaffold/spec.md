# app-scaffold Specification

## Purpose
Provides the verified technical foundation (app skeleton, tooling, CI) that all following gameplay changes build upon.

## Requirements

### Requirement: App builds and type-checks
The application SHALL build without errors and pass type-checking via `npm run check` and `npm run build`.

#### Scenario: CI green
- **WHEN** CI runs `npm run check`, `npm run test` and `npm run build` on a clean checkout
- **THEN** all three commands exit with code 0

### Requirement: Dev server serves start page
The dev server SHALL serve a start page at the root route that renders without runtime errors.

#### Scenario: Start page renders
- **WHEN** a browser opens the root route of the dev server
- **THEN** the page renders and shows the game title "Public Utility Manager"

### Requirement: Test runner executes with node default
Vitest SHALL run all `*.test.ts` files with `node` as the default test environment so framework-free core logic stays DOM-less.

#### Scenario: Sample core test runs
- **WHEN** `npm test` runs in `app/`
- **THEN** Vitest discovers and executes at least one passing test in the default `node` environment
