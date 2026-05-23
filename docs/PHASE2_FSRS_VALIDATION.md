# Phase 2 FSRS Validation

Date: 2026-05-20

## Scope

Phase 2 replaces the Phase 1 simple memory update with formal `ts-fsrs` scheduling.

Implemented:

```text
ts-fsrs dependency
FSRS card serialization for local persistence
FSRS state migration for older Phase 1 records
Again / Hard / Good / Easy mapped to FSRS ratings
ReviewEvent.scheduler = ts-fsrs
UserMemoryState.fsrs_card
UserMemoryState.stability
UserMemoryState.difficulty
UserMemoryState.retrievability
UserMemoryState.due_at
```

Still deferred:

```text
remote Supabase persistence
custom FSRS parameter editor
historical rescheduling
multi-device sync
full interactive word galaxy
```

## Commands

```text
corepack pnpm add ts-fsrs
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
  "eventScheduler": "ts-fsrs",
  "firstStage": "learning",
  "hasFsrsCard": true,
  "fsrsReps": 1,
  "fsrsState": 1,
  "stability": 2.3065,
  "difficulty": 2.1181,
  "retrievability": 1
}
```

Screenshots:

```text
data/exports/phase2-fsrs-runtime-desktop.png
data/exports/phase2-fsrs-runtime-mobile.png
```

## Decision

Phase 2 is functionally complete for the local self-developed prototype:

```text
review feedback now goes through ts-fsrs
ReviewEvent records scheduler = ts-fsrs
UserMemoryState persists the FSRS card state
today task generation uses due_at from FSRS state
```
