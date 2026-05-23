# TechLex OS Roadmap

This roadmap follows the constitution target: TechLex OS is an automatic learning runtime, not a card-authoring backend.

## Phase 0 - Baseline Freeze

Goal:

```text
Create the self-developed project baseline without business implementation.
```

Deliverables:

```text
project structure
data model
standard card package format
JSON schema
example package
PROJECT_STATE
implementation roadmap
```

Exit criteria:

```text
The next developer can understand what to build first and what not to build.
```

## Phase 1 - Minimal Learning Runtime

Goal:

```text
Import prepared card packages and let the user complete a first learning session.
```

Build:

```text
card package import
import validation
card library
today task list
basic review screen
ReviewEvent recording
simple UserMemoryState update
basic learning statistics
```

Do not build:

```text
front-end card factory
AI word extraction
complex graph
commercial multi-user operations
```

Exit criteria:

```text
The user can import 20-50 cards, start learning, finish a review round, and see memory state changes.
```

## Phase 2 - FSRS Scheduler

Goal:

```text
Replace simple scheduling with formal FSRS review scheduling.
```

Status:

```text
Implemented in the local self-developed prototype.
```

Build:

```text
FSRS card state
Again / Hard / Good / Easy ratings
next_review_at
stability
difficulty
retrievability
due and overdue task generation
review history
```

Exit criteria:

```text
The system automatically schedules the next review after each real review event.
```

## Phase 3 - Domain Packs And Bulk Import

Goal:

```text
Support multiple technical-English domain packs and larger imports.
```

Status:

```text
Implemented in the local self-developed prototype.
```

Build:

```text
DomainPack registry
AI Programming English pack
Web3 Developer English pack
Programming Language and Runtime pack
AI Platform and Model Tools pack
Developer Cloud and Collaboration pack
Product Design and Creative Tools pack
bulk JSON import
bulk CSV import
duplicate handling
import error report
```

Exit criteria:

```text
Codex-produced card packages can be imported reliably by domain pack.
```

## Phase 4 - Word Galaxy

Goal:

```text
Turn vocabulary relationships into an inspectable learning graph.
```

Status:

```text
Implemented in the local self-developed prototype.
```

Build:

```text
word nodes
scene nodes
source nodes
synonym edges
confusing-word edges
word-family edges
domain-pack filters
mastery-state coloring
click-to-card details
```

Exit criteria:

```text
The user can inspect why words are related and prioritize learning based on relationships and memory state.
```

## Phase 5 - Learning Operations

Goal:

```text
Make the system stable enough for daily use.
```

Status:

```text
Implemented in the local self-developed prototype.
```

Build:

```text
learning plan editor
daily limits
review caps
weak-item reinforcement
pause new cards
data export
backup and restore
mobile daily-use polish
target retention control for FSRS scheduling
```

Exit criteria:

```text
The user can control daily learning volume, prioritize weak cards, pause new cards, and recover from a local backup without manual data repair.
```

## Phase 6 - Persistence And Packaging

Goal:

```text
Prepare the local runtime for safer real use and eventual distribution.
```

Build:

```text
packaged release build
PWA install support
backup versioning
restore migration checks
optional remote persistence design
deployment checklist
```

Status:

```text
Implemented in the local self-developed prototype.
```

Exit criteria:

```text
The user can run a stable packaged version, install the PWA-capable app shell, export and restore versioned backups, and has a clear migration path from local-only storage to remote persistence if needed.
```

## Phase 7 - Real-Use Hardening

Goal:

```text
Harden the runtime with repeated real learning sessions and larger imported packages.
```

Build:

```text
two-week real-use checklist
large-package performance smoke tests
backup restore drills
data integrity dashboard
import rollback strategy
optional remote-persistence prototype gate
```

Status:

```text
Phase 7A Anki-style UI interaction upgrade: implemented.
Phase 7B larger-package hardening: implemented and validated with a 300-card package.
Phase 7C real learning session drift and recovery: implemented and validated with a 1000-card package plus 12 ReviewEvents.
Phase 7D performance budget and large graph virtualization: implemented and validated with a 2000-card package.
Phase 8 remote persistence prototype gate: implemented and validated with a 3000-card package stored in IndexedDB.
Phase 9 IndexedDB migration and recovery hardening: implemented and validated with corruption recovery, failed-import protection, backup export, and legacy localStorage migration.
Phase 10 Obsidian-grade Word Galaxy: implemented and validated with tags, wikilinks, backlinks, local graph, hub inspection, and Markdown export.
Phase 10B main-bundle slimming: implemented by lazy-loading Browser, Review, Settings, and Word Galaxy views; main bundle reduced from about 287 KiB to about 239 KiB.
Next: Phase 11 Remote Sync Decision And Persistence Adapter Boundary.
```

Exit criteria:

```text
The user can rely on TechLex OS for real daily learning without manual data repair.
```

Phase 7D focus:

```text
bundle-size reduction
lazy loading for heavy views
2000-card import smoke test
graph rendering cap or virtualization
browser storage capacity warnings
```

Phase 7D result:

```text
Word Galaxy runtime is lazy-loaded.
Graph rendering is capped at 100 / 250 / 500 cards.
2000-card import smoke test passed.
Browser storage warning reached WATCH at about 3.85 MB.
Historical note: main bundle exceeded Webpack's default 244 KiB performance recommendation at this point. This was resolved later in Phase 10B.
```

## Phase 8 - Remote Persistence Prototype Gate

Goal:

```text
Decide the next persistence layer before growing beyond localStorage's practical browser budget.
```

Build:

```text
persistence decision record
IndexedDB versus remote Supabase comparison
data migration plan from localStorage
one small prototype path for backup-safe persistence
failure and rollback checks
```

Status:

```text
Implemented in the local self-developed prototype.
Decision: IndexedDB primary, localStorage bootstrap/shadow, remote persistence deferred.
```

Do not build:

```text
commercial multi-user operations
public marketplace
payment system
team administration
```

Exit criteria:

```text
The project has a verified persistence path for packages larger than 2000 cards without losing ReviewEvent or UserMemoryState history.
```

Validation:

```text
3000-card import persisted to IndexedDB.
3000 UserMemoryState records persisted to IndexedDB.
1 ReviewEvent persisted after a real review.
localStorage remained a 232-byte metadata shadow after review.
```

## Phase 9 - IndexedDB Migration And Recovery Hardening

Goal:

```text
Make the new IndexedDB persistence layer safer for real daily use.
```

Build:

```text
migration status prompts
backup reminder when storage budget is RISK
explicit IndexedDB export drill
rollback recovery drill after failed import
corrupted IndexedDB record recovery path
localStorage legacy migration regression test
```

Exit criteria:

```text
The user can survive failed imports, corrupted local persistence, browser reloads, and migration from old localStorage data without losing ReviewEvent or UserMemoryState history.
```

Status:

```text
Implemented in the local self-developed prototype.
```

Validation:

```text
3000-card backup export passed.
corrupted IndexedDB current record recovered from last_good snapshot.
failed import with zero valid cards preserved the existing 3000 cards and 1 ReviewEvent.
legacy localStorage data migrated back into IndexedDB.
```

## Phase 10 - Obsidian-Grade Word Galaxy

Goal:

```text
Fully align the learning graph with Obsidian-style knowledge graph, multi-tags, and bidirectional links.
```

Build:

```text
WordCard tags / links / aliases
JSON / CSV / TSV import support for tags, links, and aliases
automatic [[wikilink]] parsing from notes, examples, and usage tasks
automatic #tag parsing from notes, examples, and usage tasks
system tags from Domain Pack, scene, source, source priority, frequency, part of speech, and memory stage
tag nodes and has_tag edges
wikilink nodes and links_to edges
alias-based backlink resolution
outgoing link and backlink index
global graph and local 1-hop / 2-hop graph modes
Hub Path inspection
selected-card tags, outgoing links, and backlinks panels
Obsidian-style Markdown export
```

Do not build:

```text
general-purpose Markdown editor
filesystem vault synchronization
Obsidian plugin ecosystem
canvas
unlinked mention suggestions
block transclusion
full Obsidian UI clone
```

Exit criteria:

```text
Imported technical-English cards can be inspected through Obsidian-grade tags, wikilinks, backlinks, hub paths, local graph traversal, and Markdown export.
```

Status:

```text
Implemented in the local self-developed prototype.
```

Validation:

```text
typecheck passed.
build passed with no Webpack performance warnings after lazy-loading heavy views.
phase10 smoke test passed.
Fixture: data/test-fixtures/obsidian-grade-word-galaxy-package.json.
Report: data/exports/phase10-obsidian-word-galaxy-smoke-report.json.
Screenshots: data/exports/phase10-obsidian-word-galaxy-desktop.png and data/exports/phase10-obsidian-word-galaxy-mobile.png.
Main bundle: about 239 KiB.
```

## Phase 11 - Remote Sync Decision And Persistence Adapter Boundary

Goal:

```text
Decide whether TechLex OS should stay local-first with IndexedDB or introduce remote sync, without rewriting the learning runtime around a specific backend.
```

Build:

```text
PersistenceAdapter interface
local IndexedDB adapter boundary
remote sync decision record
sync conflict model
backup-before-sync rule
offline-first expectations
failure and rollback checks
```

Do not build:

```text
commercial multi-user operations
public marketplace
payment system
team administration
```

Exit criteria:

```text
The runtime has a clear persistence boundary, and future Supabase or other remote storage can be added without changing card import, FSRS review, ReviewEvent, UserMemoryState, or Word Galaxy core behavior.
```

## Later

Defer until the learning runtime is stable:

```text
front-end Card Factory
AI-assisted card generation
public marketplace
payment system
team administration
native mobile app
```
