# Phase 7D Performance Budget And Large Graph Virtualization Validation

## Goal

Phase 7D hardens TechLex OS for larger real-use datasets.

The target is not to add new learning features. The target is to keep the automatic learning runtime usable when the user imports a much larger prepared technical-English package.

## Implemented

```text
Word Galaxy runtime cap:
- Word Galaxy now accepts max_cards.
- Default rendered card cap is 250.
- UI exposes render caps: 100 / 250 / 500.
- Graph summary shows rendered cards versus total matching cards.
- Truncation warning appears when matching cards exceed rendered cards.

Heavy graph code path:
- Word Galaxy runtime functions are loaded through dynamic import from the Galaxy page.
- The main app no longer imports graph builder functions eagerly.

Browser storage budget:
- Added storage budget report.
- Settings shows estimated browser storage size, card count, ReviewEvent count, and memory-state count.
- Status levels: PASS / WATCH / RISK.

Large local storage pressure:
- Imported package history now stores package metadata only.
- Cards remain in the canonical cards collection.
- localStorage writes use compact JSON instead of pretty JSON.
- Last-import rollback snapshots also use compact JSON.

Stress fixture and smoke test:
- Added 2000-card stress package generation.
- Added Phase 7D browser smoke test.
```

## Validation Commands

```text
corepack pnpm run typecheck
corepack pnpm run generate:stress-package
corepack pnpm run build
corepack pnpm run smoke:phase7d
```

## Validation Result

```text
typecheck: passed
generate:stress-package: passed, cards=2000
build: passed with two Webpack performance warnings
smoke:phase7d: passed
```

## Smoke Evidence

```text
report: data/exports/phase7d-performance-graph-smoke-report.json
fixture: data/test-fixtures/large-card-package-2000.json
desktop screenshot: data/exports/phase7d-performance-graph-desktop.png
mobile screenshot: data/exports/phase7d-performance-graph-mobile.png
```

Extracted smoke result:

```json
{
  "cards": 2000,
  "memory_states": 2000,
  "local_storage_mb": 3.85,
  "storage_budget_text": "Browser storage budgetWATCH",
  "galaxy_text": "Nodes 776 · Edges 2000 · Rendered cards 250/2000",
  "svg_circle_count": 776,
  "svg_line_count": 2000,
  "graph_render_cap_respected": true,
  "mobile_bottom_nav_buttons": 5
}
```

## Bundle Budget

Production build produced an async graph chunk:

```text
async graph chunk: about 4.17 KiB
main bundle: about 276 KiB
```

Webpack still reports the main bundle above the default 244 KiB recommendation.

Phase 7D therefore passes the large-graph and local-storage gate, but leaves one known performance debt:

```text
Further split the main bundle if the project needs strict first-load budgets.
```

## Gate Decision

```text
Phase 7D: passed.
```

TechLex OS can now import a 2000-card prepared package, preserve 2000 UserMemoryState records, warn when browser storage approaches a practical localStorage budget, and keep Word Galaxy bounded by a render cap.

## Remaining Risks

```text
localStorage at 3.85 MB is already WATCH for 2000 cards.
Remote persistence or IndexedDB should be considered before much larger real-use packages.

Word Galaxy is capped, not fully virtualized with viewport-level graph paging.
This is acceptable for Phase 7D because the graph no longer attempts to render all matching cards.

Main bundle remains above Webpack's default recommended budget.
The app is usable, but strict performance targets need more route-level code splitting.
```

## Next Recommended Phase

```text
Phase 8 Remote Persistence Prototype Gate
```

Reason:

```text
The local automatic learning runtime has passed 2000-card pressure with a WATCH storage warning.
The next architectural gate should decide whether to move learning data from localStorage to IndexedDB or remote persistence before growing beyond 2000 cards.
```
