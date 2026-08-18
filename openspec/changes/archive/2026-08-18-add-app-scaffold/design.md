## Context

Tech stack decision (README): SvelteKit + Svelte 5 + Vite + Vitest. The simulation core must stay framework-free TypeScript; the UI lives in Svelte components. Repo root currently contains only OpenSpec planning artifacts.

## Goals / Non-Goals

**Goals:**
- Reproducible toolchain: one `npm install` + three green commands (check/test/build)
- Directory contract that later changes rely on (`app/src/lib/game/` for core, `app/src/routes/` for UI)
- CI as safety net from day one

**Non-Goals:**
- Any gameplay logic, game state, or UI beyond a static start page
- Deployment/hosting setup
- Lint/format config beyond what the scaffold ships

## Decisions

- **`adapter-static` + `ssr = false`**: the game is a pure client-side SPA; no server runtime wanted.
- **Vitest `node` default**: core is DOM-free; UI tests opt into `happy-dom` per-file (`// @vitest-environment happy-dom`) because Vitest 4 removed `environmentMatchGlobs`.
- **Core/UI split**: `src/lib/game/` must never import from `$lib/...` UI or DOM APIs — keeps the core headless-testable.

## Risks / Trade-offs

- SvelteKit scaffolding via `npx sv create` may pull interactive prompts — fall back to manual minimal skeleton if non-interactive flags fail.
- Version drift between Svelte 5 / Vite / Vitest majors — pin exact versions in `package.json`.
