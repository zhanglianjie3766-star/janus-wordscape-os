# Phase 7C Real Learning Session Drift And Recovery

## Goal

Phase 7C validates that TechLex OS remains stable after a larger real-use session:

- import a 1000-card prepared package
- complete multiple consecutive FSRS reviews
- create weak-item states through Again / Hard ratings
- forecast future due queues
- verify backup restore preserves ReviewEvent history and UserMemoryState
- inspect desktop and mobile stats after restore

This phase continues to protect the product boundary: TechLex OS is an automatic learning runtime, not a front-end card factory.

## Implemented

```text
src/sessionDrift.ts
  Builds a SessionDriftReport with future queue forecasts, weak-queue cap state,
  backup recovery readiness, and overload risk.

src/App.tsx
  Stats page now includes a Session drift and recovery panel.

scripts/generate-large-package.mjs
  Can now generate configurable large packages through CARD_COUNT.

scripts/phase7c-session-drift-smoke.mjs
  Imports 1000 cards, completes 12 reviews, writes a backup fixture, clears data,
  restores the backup, and verifies ReviewEvent preservation.
```

## Commands

```text
corepack pnpm run typecheck
corepack pnpm run generate:overload-package
corepack pnpm run build
corepack pnpm run smoke:phase7c
```

## Validation Result

```text
typecheck: passed
generate:overload-package: passed, cards=1000
build: passed with existing Webpack bundle-size warnings
smoke:phase7c: passed
```

Smoke evidence:

```text
cards_after_import: 1000
review_events_before_restore: 12
review_events_after_restore: 12
memory_states_after_restore: 1000
weak_items_after_reviews: 1
drift_panel_text: Session drift and recoveryWATCH
backup_restore_preserved_review_events: true
mobile_bottom_nav_buttons: 5
```

Generated artifacts:

```text
data/test-fixtures/large-card-package-1000.json
data/exports/phase7c-session-drift-smoke-report.json
data/exports/phase7c-backup-after-reviews.json
data/exports/phase7c-session-drift-desktop.png
data/exports/phase7c-session-drift-mobile.png
```

## Gate Decision

Phase 7C passes.

The `WATCH` status is expected: 1000 cards represent a real overload threshold for a local single-bundle browser app, so the system correctly flags medium overload risk while preserving daily queue caps and recovery behavior.

## What Was Proven

```text
1000-card package can be imported.
1000 UserMemoryState records are retained.
12 ReviewEvents survive backup restore.
Weak item state is visible after Again / Hard ratings.
Future queue drift is inspectable over 0 / 1 / 3 / 7 / 14 / 30 days.
Mobile stats view remains usable after restore.
```

## Remaining Risk

- The forecast is a static projection from current state; it does not simulate future daily reviews.
- Long-term performance for 2000+ cards still needs code splitting and graph virtualization.
- The app remains localStorage-first; remote persistence is still deferred.
- Real editorial packages must still come from the Codex card-production pipeline.

## Next Recommended Phase

```text
Phase 7D: Performance Budget And Large Graph Virtualization
```

Recommended focus:

- bundle-size reduction
- lazy-load Galaxy / Browser heavy views
- 2000-card import smoke test
- graph node virtualization or capped rendering
- browser storage capacity warnings
