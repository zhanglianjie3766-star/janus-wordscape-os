# Phase 4 Word Galaxy Validation

Date: 2026-05-20

## Scope

Phase 4 upgrades the previous relationship grouping into an inspectable word galaxy.

Implemented:

```text
graph data extraction from imported WordCard records
card nodes
Domain Pack nodes
scene nodes
source nodes
synonym nodes
confusing-word nodes
word-family nodes
typed relationship edges
mastery-state coloring for card nodes
Domain Pack filter
mastery-state filter
text search
relationship-type toggles
click-to-inspect node detail panel
related-card evidence panel
source link inspection for source nodes
desktop and mobile responsive layout
```

Still deferred:

```text
force-directed physics layout
drag-and-drop nodes
graph persistence
large graph virtualization
graph export
remote sync
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
import CSV sample package
complete one FSRS review
open Word Galaxy
click a graph node
inspect relationship evidence
```

Observed:

```json
{
  "cardCount": 6,
  "domainPackCount": 6,
  "reviewEventCount": 1,
  "eventScheduler": "ts-fsrs",
  "svgCircleCount": 59,
  "svgLineCount": 55,
  "detailVisible": true,
  "colorLegendVisible": true
}
```

Screenshots:

```text
data/exports/phase4-word-galaxy-desktop.png
data/exports/phase4-word-galaxy-mobile.png
```

## Decision

Phase 4 is functionally complete for the local self-developed prototype:

```text
the client now turns imported cards into an inspectable relationship graph
word relationships remain tied to source-backed cards
card node color reflects UserMemoryState
FSRS learning still works after graph inspection
```

## Next Candidate Phase

```text
Phase 5: Learning Operations.

Goal:
make daily use stable through stronger plan controls, review caps, weak-item reinforcement queues, backup/restore, and PWA/mobile polish.
```
