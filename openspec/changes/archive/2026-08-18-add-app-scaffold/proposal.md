## Why

No application exists yet. Feature changes need a verified SvelteKit base (build, type-check, tests, CI) so every later change can be implemented and tested against a stable foundation.

## What Changes

- Scaffold a SvelteKit 2 + Svelte 5 app in `app/` (TypeScript, strict)
- Add Vitest with `node` as default test environment
- Add `svelte-check` and npm scripts (`dev`, `build`, `preview`, `test`, `check`)
- Configure `adapter-static` with SSR disabled (pure client-side game)
- Add GitHub Actions CI running check, test and build
- Add `.gitignore` entries (`*.tsbuildinfo`, node_modules, build output)

## Capabilities

### New Capabilities
- `app-scaffold`: verified app base — build, type-check, tests and CI pass and the start page renders

## Impact

- New `app/` directory (entire application)
- New `.github/workflows/ci.yml`
- Repo-root tooling only; no gameplay code yet
