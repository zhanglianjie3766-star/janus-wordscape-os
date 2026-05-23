# Phase 9 IndexedDB Migration And Recovery Hardening Validation

## Goal

Phase 9 hardens the IndexedDB persistence layer introduced in Phase 8.

The goal is not to add new learning features. The goal is to make the existing automatic learning runtime safer under real-use failure cases:

```text
large package import
daily review
backup export
corrupted IndexedDB current record
failed import
legacy localStorage migration
browser reload
mobile settings access
```

## Constitution Anchor Fix

`docs/TECHLEX_OS_CONSTITUTION_v1.1.md` no longer stores a fast-changing current-phase anchor.

Current phase state now belongs to:

```text
PROJECT_STATE.md
ROADMAP.md
docs/MAINLINE_INTERFACE_PROTOCOL.md
```

Rule:

```text
If the constitution conflicts with PROJECT_STATE.md about current phase, PROJECT_STATE.md wins.
If PROJECT_STATE.md conflicts with the constitution about final goal, boundary, or drift rules, the constitution wins.
```

## Implemented

```text
IndexedDB last_good snapshot record
automatic recovery from invalid IndexedDB current record
remigration from legacy localStorage if IndexedDB current is invalid
explicit indexeddb_recovered and indexeddb_corrupt load states
localStorage metadata-shadow safety check
backup reminder when storage budget reaches RISK
failed import guard for packages with zero valid cards
backup export drill in the smoke test
legacy localStorage migration regression in the smoke test
```

## Validation Commands

```text
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm run smoke:phase9
```

## Validation Result

```text
typecheck: passed
build: passed with existing Webpack bundle-size warnings
smoke:phase9: passed
```

Webpack still reports the known main bundle warning:

```text
bundle is about 283 KiB and exceeds Webpack's default 244 KiB recommendation.
```

This is not a Phase 9 blocker because the current gate is persistence recovery safety.

## Smoke Evidence

Report:

```text
data/exports/phase9-indexeddb-recovery-smoke-report.json
```

Screenshots:

```text
data/exports/phase9-indexeddb-recovery-desktop.png
data/exports/phase9-indexeddb-recovery-mobile.png
```

Key evidence from the report:

```text
exported_backup_cards: 3000
exported_backup_review_events: 1
last_good_cards_before_corruption: 3000
current_cards_before_corruption: 3000
recovered_cards_after_corruption: 3000
recovered_review_events_after_corruption: 1
failed_import_preserved_cards: 3000
failed_import_preserved_review_events: 1
legacy_migrated_cards: 3
legacy_migrated_review_events: 0
recovery_panel_text: Persistence prototype gateIndexedDB recovered
migration_panel_text: Persistence prototype gatemigrated from localStorage
mobile_bottom_nav_buttons: 5
```

## Gate Decision

```text
Phase 9 passed.
```

TechLex OS can now survive:

```text
corrupted IndexedDB current record
failed import with no valid cards
browser reload after recovery
legacy localStorage migration into IndexedDB
backup export after a 3000-card learning session
```

## Remaining Risk

```text
IndexedDB is still local to one browser profile.
Clearing site data still removes learning data unless a backup has been exported.
Remote multi-device persistence is not implemented.
The main bundle still exceeds Webpack's default performance budget.
```

## Next Phase Candidate

```text
Phase 10 - Remote Sync Decision And Persistence Adapter Boundary
```

Recommended next focus:

```text
decide whether to remain local-first with IndexedDB
or introduce a remote sync adapter without rewriting the learning runtime
```
