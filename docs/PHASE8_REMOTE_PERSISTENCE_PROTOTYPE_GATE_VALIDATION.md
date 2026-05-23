# Phase 8 Remote Persistence Prototype Gate Validation

## Goal

Phase 8 decides the next persistence path after Phase 7D showed that 2000 cards already push local browser storage into a WATCH state.

The goal is not to build a commercial cloud backend. The goal is to protect the automatic learning runtime from localStorage capacity limits while preserving the core loop:

```text
bulk import
-> daily learning queue
-> FSRS review
-> ReviewEvent
-> UserMemoryState
-> backup / recovery
```

## Decision

```text
Primary next persistence layer: IndexedDB
Remote persistence: deferred
```

Reason:

```text
The current product is still a single-user learning runtime.
The immediate blocker is localStorage capacity, not multi-device sync.
IndexedDB removes the practical localStorage payload limit with the smallest architecture change.
Remote persistence remains behind a future PersistenceAdapter boundary.
```

## Implemented

```text
IndexedDB database: techlex-os-db
Object store: app_data
Current app data key: current
Pre-import rollback key: last_import_rollback

localStorage behavior:
- small datasets can still keep a full compact shadow copy
- larger datasets keep only a small metadata shadow
- legacy full localStorage data is migrated into IndexedDB on startup

Settings UI:
- Persistence prototype gate panel
- shows IndexedDB primary, migration status, and remote-sync deferral

Smoke test:
- 3000-card import
- IndexedDB persistence verification
- ReviewEvent persistence after one review
- reload recovery from IndexedDB
- localStorage metadata-shadow verification
- mobile Settings screenshot
```

## Validation Commands

```text
corepack pnpm run typecheck
corepack pnpm run generate:persistence-package
corepack pnpm run build
corepack pnpm run smoke:phase8
```

## Validation Result

```text
typecheck: passed
generate:persistence-package: passed, cards=3000
build: passed with Webpack main-bundle budget warnings
smoke:phase8: passed
```

## Smoke Evidence

```text
fixture: data/test-fixtures/large-card-package-3000.json
report: data/exports/phase8-persistence-gate-smoke-report.json
desktop screenshot: data/exports/phase8-persistence-gate-desktop.png
mobile screenshot: data/exports/phase8-persistence-gate-mobile.png
```

Extracted smoke result:

```json
{
  "indexeddb_cards": 3000,
  "indexeddb_memory_states": 3000,
  "indexeddb_review_events": 1,
  "localstorage_shadow_before_review_bytes": 232,
  "localstorage_shadow_after_review_bytes": 232,
  "localstorage_is_metadata_shadow": true,
  "persistence_panel_text": "Persistence prototype gateIndexedDB primary",
  "storage_budget_text": "Browser storage budgetRISK",
  "mobile_bottom_nav_buttons": 5
}
```

## Interpretation

The RISK storage-budget status is expected at 3000 cards.

It now means:

```text
The learning dataset is large and should be treated carefully.
The main data payload is no longer forced into localStorage.
Before much larger packages, the project should either harden IndexedDB migrations or add remote sync behind a PersistenceAdapter.
```

## Gate Decision

```text
Phase 8: passed.
```

TechLex OS can now store a 3000-card learning dataset in IndexedDB, keep localStorage as a small bootstrap/shadow layer, preserve ReviewEvent history after a real review, and reload from IndexedDB.

## Remaining Risks

```text
IndexedDB is still browser-profile local storage.
Clearing site data will still remove learning data unless the user exports a backup.
Remote multi-device sync is not implemented.
The main bundle still exceeds Webpack's default 244 KiB recommendation.
```

## Next Recommended Phase

```text
Phase 9 IndexedDB Migration And Recovery Hardening
```

Reason:

```text
The first IndexedDB prototype works.
Before adding remote accounts or sync, the app should harden migration prompts, backup reminders, rollback behavior, and corruption recovery around the new persistence layer.
```
