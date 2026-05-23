# Phase 10B Main Bundle Slimming Validation

## Goal

Reduce the initial JavaScript bundle without removing the learning runtime features.

This phase is a performance hardening step after the Obsidian-grade Word Galaxy implementation.

## Implemented

```text
Browser view moved to src/views/BrowserView.tsx and lazy-loaded.
Review view moved to src/views/ReviewView.tsx and lazy-loaded.
Settings view moved to src/views/SettingsView.tsx and lazy-loaded.
Word Galaxy view moved to src/views/GalaxyView.tsx and lazy-loaded.
Word Galaxy graph runtime remains dynamically imported from src/wordGalaxy.ts.
Settings-only integrity and storage-budget calculations moved out of the initial App path.
```

## Validation Commands

```text
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm run smoke:phase7b
corepack pnpm run smoke:phase10
```

## Validation Result

```text
typecheck: passed
build: passed
smoke:phase7b: passed
smoke:phase10: passed
```

## Bundle Result

Before this slimming pass:

```text
main bundle: about 287 KiB
Webpack warning: present
```

After this slimming pass:

```text
main bundle: about 239 KiB
Webpack warning: gone
```

Async chunks now carry lower-frequency views and graph runtime instead of forcing them into the first page load.

## Functional Regression Check

Phase 7B large-package learning-runtime smoke test passes after the lazy-loading changes:

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

Phase 10 Obsidian-grade graph smoke test still passes after the lazy-loading changes:

```text
imported_cards: 4
svg_circle_count: 63
svg_line_count: 94
local_svg_circle_count: 33
local_svg_line_count: 27
has_tag_panel: true
has_backlink_panel: true
has_wikilink_panel: true
markdown_has_real_backlink: true
```

## Boundary

No learning behavior was removed.

The following remain intact:

```text
FSRS review
ReviewEvent recording
UserMemoryState update
IndexedDB persistence
backup and restore
Obsidian-grade Word Galaxy
```
