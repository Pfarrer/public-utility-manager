## 1. Scaffold

- [ ] 1.1 Create `app/` with SvelteKit 2 + Svelte 5 + TypeScript skeleton (non-interactive)
- [ ] 1.2 Configure `adapter-static`, disable SSR (`+layout.ts` with `ssr = false`, `prerender = true`)
- [ ] 1.3 Add npm scripts `check`, `test`, `build`, `dev`, `preview`

## 2. Testing & Quality

- [ ] 2.1 Install Vitest; set default environment `node`
- [ ] 2.2 Add one smoke test in `src/lib/game/` (e.g. pure function) that passes
- [ ] 2.3 Verify `npm run check`, `npm test`, `npm run build` all pass locally

## 3. CI

- [ ] 3.1 Add `.github/workflows/ci.yml` (checkout, npm ci, check, test, build; working-directory `app/`)
- [ ] 3.2 Push branch and confirm CI green
