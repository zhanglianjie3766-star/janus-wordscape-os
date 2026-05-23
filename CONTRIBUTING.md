# Contributing

This project is currently in a local-first alpha release stage.

Before proposing changes, read:

```text
PROJECT_STATE.md
docs/PROJECT_BASELINE_FREEZE_INDEX_v1.0.md
docs/UI_FREEZE_INDEX_v1.0.md
docs/MEMORY_ALGORITHM_FREEZE_v1.0.md
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
```

## Development Checks

Run:

```bash
corepack pnpm install
corepack pnpm run typecheck
corepack pnpm run test:fsrs-golden
corepack pnpm run build
```

Before a release candidate, also run:

```bash
corepack pnpm run smoke:phase11
```

## Boundaries

Do not change FSRS formulas directly.

Do not merge `browser_detail` product-rule writebacks into formal `daily_task`
reviews.

Do not clear real user IndexedDB/localStorage in regression scripts.

Do not add UI features that break the frozen five-tab product baseline without
updating the freeze documents and regression plan.
