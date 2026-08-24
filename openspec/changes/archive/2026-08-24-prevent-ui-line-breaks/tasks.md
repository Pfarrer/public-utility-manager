# Tasks: prevent-ui-line-breaks

## 1. Formatting helper
- [x] 1.1 Create `app/src/lib/ui/format.ts` with `money(value)` returning `value.toLocaleString('de-DE') + '\u00A0$'`
- [x] 1.2 Unit tests for `money` (grouping, negative values, non-breaking space present)

## 2. Top bar and modals
- [x] 2.1 `GameShell.svelte`: cash span uses `money()`; tariff value binds to `$/kWh` with non-breaking space; tariff note uses non-breaking space before `$/kWh`
- [x] 2.2 `GameShell.svelte` styles: `button` and `.badge` get `white-space: nowrap`
- [x] 2.3 `ReportModal.svelte`: amount cells use `money()`

## 3. Panels
- [x] 3.1 `PlantPanel.svelte`: kW figures and worker count use non-breaking spaces between value and unit
- [x] 3.2 `RegionDetail.svelte`: percentage and kW figures use non-breaking spaces

## 4. Verification
- [x] 4.1 Update UI tests that assert rendered amounts (non-breaking space); add a test asserting the cash testid contains `\u00A0$`
- [x] 4.2 `vitest run`, `svelte-check`, `openspec validate prevent-ui-line-breaks --strict`
- [x] 4.3 Visual check in the browser at narrow width: no wrap between amount and `$`, buttons stay single-line
