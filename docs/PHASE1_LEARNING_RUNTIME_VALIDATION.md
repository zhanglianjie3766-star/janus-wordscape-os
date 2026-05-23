# Phase 1 Learning Runtime Validation

Date: 2026-05-20

## Scope

This validation covers the first self-developed TechLex OS learning runtime.

Implemented:

```text
React / TypeScript / Webpack application
standard JSON card package import
local persistence
today task queue
review screen
ReviewEvent recording
simple Phase 1 memory-state update
card library
basic word galaxy grouping
learning plan settings
learning data export
```

Not implemented yet:

```text
formal ts-fsrs integration
remote Supabase persistence
interactive graph rendering
front-end Card Factory
Anki integration
Obsidian export
multi-user authentication
```

## Commands

```text
corepack pnpm install
corepack pnpm run typecheck
corepack pnpm run build
```

## Results

```text
typecheck: passed
build: passed
dev server: http://127.0.0.1:5173 returned 200
```

## Browser Smoke Test

Automated with Playwright Core and local Chrome.

Flow:

```text
open http://127.0.0.1:5173
clear localStorage
import sample package
start learning
show answer
rate first card as Good
inspect localStorage
```

Observed:

```json
{
  "title": "TechLex OS",
  "cardCount": 3,
  "reviewEventCount": 1,
  "firstState": "learning",
  "currentHeading": "复习"
}
```

Screenshots:

```text
data/exports/phase1-learning-runtime-desktop.png
data/exports/phase1-learning-runtime-mobile.png
```

## Phase 1 Decision

The app is now a usable local prototype for:

```text
standard card package import
daily learning entry
review event recording
memory-state update
basic relationship inspection
```

It is not yet constitution-complete because formal FSRS and full word galaxy are still later phases.
