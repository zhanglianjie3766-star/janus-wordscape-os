# Phase 3 Domain Packs And Bulk Import Validation

Date: 2026-05-20

## Scope

Phase 3 strengthens the learning runtime import path. It does not add a front-end Card Factory, Anki integration, Obsidian export, or AI card generation.

Implemented:

```text
six default technical-English Domain Packs
JSON package import with partial card-level validation
CSV package import
TSV package import
duplicate card_id skip policy
import error and warning reports
import report persistence
Domain Pack filtering in the card library
frequency-tier filtering in the card library
Domain Pack grouping in the word galaxy
correct Chinese UI text restored in the main runtime
```

Default Domain Packs:

```text
ai-programming-english
web3-developer-english
programming-language-runtime-english
ai-platform-model-tools-english
developer-cloud-collaboration-english
product-design-creative-tools-english
```

## Commands

```text
corepack pnpm run typecheck
corepack pnpm run build
```

## Results

```text
typecheck: passed
build: passed
browser smoke test: passed
```

## Browser Smoke Test

Flow:

```text
open http://127.0.0.1:5173
clear localStorage
import sample JSON package
import same sample JSON package again to verify duplicate skip
import examples/standard-word-card-package.example.csv
start learning
show answer
rate first card as Good
inspect localStorage
```

Observed:

```json
{
  "title": "TechLex OS",
  "cardCount": 6,
  "domainPackCount": 6,
  "packageCount": 3,
  "importReportCount": 3,
  "reportSummaries": [
    { "format": "csv", "imported": 2, "skipped": 0, "errors": 0, "warnings": 0 },
    { "format": "json", "imported": 0, "skipped": 4, "errors": 0, "warnings": 4 },
    { "format": "json", "imported": 4, "skipped": 0, "errors": 0, "warnings": 0 }
  ],
  "reviewEventCount": 1,
  "eventScheduler": "ts-fsrs",
  "hasFsrsCard": true,
  "fsrsReps": 1
}
```

Screenshots:

```text
data/exports/phase3-bulk-import-desktop.png
data/exports/phase3-bulk-import-mobile.png
```

## Decision

Phase 3 is functionally complete for the local self-developed prototype:

```text
prepared card packages can be imported in JSON and CSV form
Domain Packs exist as stable runtime filters
duplicates are skipped instead of corrupting memory state
invalid rows can be reported without turning the client into a card-authoring backend
FSRS review still works after bulk import
```

## Next Candidate Phase

```text
Phase 4: Word Galaxy.

Goal:
turn pack, scene, source, synonym, confusing-word, and word-family relationships into an inspectable learning graph with mastery-state coloring.
```
