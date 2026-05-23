# Phase 7B Real-Use Hardening With Larger Packages

## Goal

Phase 7B validates that TechLex OS is usable with a larger prepared card package, not only small demo data.

This phase focuses on:

- large package import
- automatic memory-state creation
- FSRS review after large import
- data integrity inspection
- pre-import rollback snapshot
- desktop and mobile usability smoke checks

It does not add card-authoring workflows. TechLex OS remains an automatic learning runtime.

## Implemented

```text
src/integrity.ts
  Runtime data integrity report for cards, Domain Packs, source evidence, examples,
  UserMemoryState, and ReviewEvent references.

src/storage.ts
  Pre-import rollback snapshot stored separately from the main localStorage data.

src/App.tsx
  Settings page now includes Real-use integrity check and pre-import rollback restore.
  Imports automatically save the previous local snapshot before writing the new package.

scripts/generate-large-package.mjs
  Generates a 300-card package across 6 technical-English Domain Packs.

scripts/phase7b-large-package-smoke.mjs
  Browser smoke test that imports 300 cards, reviews one card, verifies persistence,
  verifies rollback snapshot presence, and captures desktop/mobile screenshots.
```

## Commands

```text
corepack pnpm run typecheck
corepack pnpm run generate:large-package
corepack pnpm run build
corepack pnpm run smoke:phase7b
```

## Validation Result

```text
typecheck: passed
generate:large-package: passed, cards=300
build: passed with existing Webpack bundle-size warnings
smoke:phase7b: passed
```

Smoke evidence:

```text
cards: 300
domain_packs: 6
memory_states: 300
review_events: 1
import_reports: 1
rollback_snapshot_exists: true
integrity_panel_text: Real-use integrity checkPASS
mobile_bottom_nav_buttons: 5
```

Generated artifacts:

```text
data/test-fixtures/large-card-package-300.json
data/exports/phase7b-large-package-smoke-report.json
data/exports/phase7b-large-package-desktop.png
data/exports/phase7b-large-package-mobile.png
```

## Gate Decision

Phase 7B passes.

TechLex OS can now ingest a larger prepared technical-English card package, schedule all cards with FSRS-backed UserMemoryState records, complete a real review after import, show a PASS integrity report, and preserve a rollback snapshot before import.

## Remaining Risk

- The 300-card package is a synthetic hardening fixture. Editorial-quality real cards still need to come from the Codex card-production pipeline.
- The runtime still uses browser localStorage. Remote persistence remains deferred.
- Bundle-size warnings remain from the current single-bundle Webpack build.
- Long-term graph performance with thousands of cards still needs a later virtualization pass.

## Next Recommended Phase

```text
Phase 7C: Real Learning Session Drift And Recovery
```

Recommended focus:

- repeated multi-session review drills
- backup restore drill after real review history
- due-queue drift checks over simulated future dates
- weak-item queue stability after multiple Again/Hard ratings
- overload protection for 1000+ card packages
