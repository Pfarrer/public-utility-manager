## 1. Core Persistence

- [x] 1.1 Implement persistence.ts (save/load/clear/has, SAVE_VERSION, injectable storage, no-op fallback)
- [x] 1.2 Unit tests: roundtrip deep-equal, version mismatch error, corrupt JSON, in-memory storage

## 2. Integration

- [x] 2.1 Autosave hook after Q4 tick completes
- [x] 2.2 UI: save/clear buttons + resume-on-load if save exists
- [x] 2.3 happy-dom test: resume loads state into UI
