# Anki Interaction Model And TechLex OS UI Spec

Version: v0.1  
Date: 2026-05-20  
Scope: UI and interaction design baseline for TechLex OS Phase 7  
Status: design baseline, not implementation

## 1. Design Goal

This document translates Anki's mature learning interaction model into TechLex OS.

TechLex OS should learn from Anki's proven review loop, but it must not become a clone of Anki or a card-authoring backend. The product target remains:

```text
bulk-import prepared technical-English card packages
-> set learning plan and memory rules
-> start daily learning
-> run FSRS reviews
-> record ReviewEvent
-> update UserMemoryState
-> inspect relations through Word Galaxy
```

## 2. Source Basis

Primary sources reviewed:

- Anki Manual, Studying: https://docs.ankiweb.net/studying.html
- Anki Manual, Deck Options: https://docs.ankiweb.net/deck-options
- Anki Manual, Browsing: https://docs.ankiweb.net/browsing.html
- Anki Manual, Searching: https://docs.ankiweb.net/searching.html
- Anki Manual, Statistics: https://docs.ankiweb.net/stats.html
- Anki Manual, Syncing: https://docs.ankiweb.net/syncing.html
- Anki Manual, Backups: https://docs.ankiweb.net/backups

## 3. Anki Interaction Model

### 3.1 Decks Screen

Anki starts from a deck list. The deck list is not a decorative home page. It is a learning operations screen.

Core interaction:

```text
Deck list
-> show New / Learning / Due counts
-> click a deck
-> enter deck overview
```

Reusable principle for TechLex OS:

```text
Home must be count-first and action-first.
```

The user should immediately see what needs to be learned today.

### 3.2 Deck Overview

Anki shows a selected deck overview before review. This page tells the user the workload and gives one primary action: study now.

Core interaction:

```text
selected deck
-> New / Learning / To Review counts
-> Study Now
-> reviewer
```

Reusable principle for TechLex OS:

```text
Before learning starts, show workload, queue composition, and one primary Start button.
```

### 3.3 Reviewer

Anki's reviewer is a two-step recall interface:

```text
show question
-> user recalls mentally
-> show answer
-> user rates recall
-> scheduler calculates next interval
-> next card
```

Answer buttons:

```text
Again / Hard / Good / Easy
```

Reusable principle for TechLex OS:

```text
The review screen must be focused, sparse, and keyboard-friendly.
```

TechLex OS should keep the same cognitive rhythm, while adapting the answer content to technical-English learning.

### 3.4 Browser

Anki's Browse screen is the dense management surface. It combines:

```text
sidebar filters
search box
card/note table
editing/details area
```

Reusable principle for TechLex OS:

```text
Dense filtering and inspection belong in Browser/Library, not in the daily learning page.
```

The daily learning flow should not become a data-management surface.

### 3.5 Search

Anki search supports simple text, field-limited search, tag/deck/status search, negative search, and grouping.

Reusable principle for TechLex OS:

```text
Search should evolve from simple search to structured query without forcing beginners to learn syntax.
```

TechLex OS should support both:

```text
simple search: extension
structured search: pack:ai-programming status:reinforce source:cursor scene:IDE
```

### 3.6 Statistics

Anki separates statistics from card content. Stats help users evaluate workload and learning habits.

Reusable principle for TechLex OS:

```text
Stats should explain the learning system, not the vocabulary content.
```

TechLex OS statistics should focus on:

```text
today completed
again rate
retention trend
weak item trend
future due forecast
Domain Pack progress
source/scene coverage
```

### 3.7 Deck Options

Anki options are scheduling controls. Users can set daily limits and retention-related behavior without manually scheduling each card.

Reusable principle for TechLex OS:

```text
Settings should control learning rules, not require daily manual planning.
```

### 3.8 Sync And Backups

Anki makes data safety visible through sync and backups. The user should trust that review history and scheduling state are not easily lost.

Reusable principle for TechLex OS:

```text
Backup and future sync must be visible, conservative, and recoverable.
```

## 4. TechLex OS Product Translation

### 4.1 Deck Is Not Exactly Domain Pack

Decision:

```text
Domain Pack is semantic content grouping.
Study Deck is runtime learning grouping.
```

For the current local version, a Domain Pack can behave like a deck because it is the simplest usable model.

Future model:

```text
Study Deck = Domain Pack + learning plan + filters + queue rule
```

Examples:

```text
AI Programming English
Web3 Developer English
AI Programming F1 Core
Cursor + Claude Code Daily Set
Weak Items Across All Packs
```

### 4.2 Main Navigation

Recommended desktop navigation:

```text
Today
Decks
Review
Browser
Galaxy
Stats
Settings
```

Recommended mobile navigation:

```text
Today
Review
Browser
Galaxy
More
```

The mobile `More` sheet contains:

```text
Decks
Stats
Settings
Backup / Restore
Import
```

Reason:

```text
Mobile bottom navigation should keep the daily loop fast.
```

### 4.3 Today Page

The Today page should merge Anki's Decks screen and Deck Overview, adapted for TechLex OS.

Primary purpose:

```text
Tell the user what to learn now.
```

Top section:

```text
Today due count
New count
Learning count
Review count
Weak count
Overdue count
Estimated time
Primary button: Start Learning
```

Deck-like list:

```text
Study Deck / Domain Pack row:
  name
  new
  learning
  review
  weak
  overdue
  progress
  gear/options
```

Rules:

- Do not put card editing on this page.
- Do not put large import reports above the learning action.
- Import status can be a compact card, not the main focus.
- If there are overdue reviews, show a warning and suggest pausing new cards.

### 4.4 Deck Overview Page

When the user taps a Study Deck / Domain Pack:

```text
Deck name
Today workload
New / Learning / Review / Weak / Overdue split
Learning plan summary
Start This Deck
Options
Stats for this deck
Browse cards in this deck
```

This page replaces "which pack should I study?" uncertainty with a clear entry point.

### 4.5 Review Page

The Review page should follow Anki's two-stage rhythm.

#### Question State

Show:

```text
progress: 3 / 24
deck/pack name
stage: new / learning / reviewing / reinforce / downgrade
headword
question prompt
scene chips
frequency chip
optional source/task hint
```

Question prompt:

```text
这个词在真实技术场景中是什么意思？
```

The source/task hint should be collapsible so it does not destroy recall.

Primary action:

```text
Show Answer
```

Keyboard:

```text
Space / Enter = Show Answer
S = back to deck overview
```

#### Answer State

Show in this order:

```text
Chinese technical meaning
English definition
Example 1 EN
Example 1 ZH
Example 2 EN
Example 2 ZH
source name + source URL
usage tasks
synonyms / confusing words / word family
```

Then show rating buttons:

```text
Again / Hard / Good / Easy
```

TechLex labels:

```text
Again = 忘记
Hard = 困难
Good = 良好
Easy = 简单
```

Each button should display the next interval when available:

```text
忘记 10m
困难 1d
良好 3d
简单 6d
```

Keyboard:

```text
1 = Again
2 = Hard
3 = Good
4 = Easy
```

More menu:

```text
Open in Browser
View Source
View Galaxy Node
Mark for Codex Fix
Suspend Today
```

Do not make manual card editing the main action.

### 4.6 Browser Page

Rename current `Library` concept to `Browser`.

Purpose:

```text
search, inspect, filter, and diagnose imported cards.
```

Desktop layout:

```text
left sidebar:
  Study Deck / Domain Pack
  Scene
  Source
  Frequency
  Mastery state
  Due state
  Flags / fix needed

top:
  search bar
  saved filters

center:
  card table

right:
  selected card detail
```

Mobile layout:

```text
search
filter chips
card list
tap card -> detail sheet
```

Minimum filters:

```text
Domain Pack
scene
source
frequency
mastery stage
due status
relation type
```

Structured search examples:

```text
pack:ai-programming
status:reinforce
source:cursor
scene:IDE
freq:F1
due:overdue
word:extension
```

Browser details should show:

```text
WordContent
UserMemoryState
latest ReviewEvent summary
source evidence
relations
open in Galaxy
mark for Codex fix
```

### 4.7 Galaxy Page

The Word Galaxy is not an Anki feature, but it should inherit Anki Browser discipline:

```text
filterable
inspectable
evidence-backed
not decorative
```

Required graph dimensions:

```text
card
Domain Pack
scene
source
synonym
confusing word
word family
mastery state
due state
```

Interaction:

```text
click node -> detail panel
click edge -> relation evidence
filter by relation type
filter by mastery state
open card in Browser
start review for due related cards
```

Color rules:

```text
new = gray
learning = blue
reviewing = teal
reinforce = amber
downgrade = red
release = green
overdue = strong red outline
```

### 4.8 Stats Page

TechLex OS should add a dedicated Stats view or a Today subview.

Stats should answer:

```text
Did I study today?
How much is due tomorrow?
Am I pressing Again too often?
Which Domain Pack is weak?
Which scenes/sources produce more mistakes?
Are new cards causing review overload?
```

Minimum panels:

```text
Today summary
7-day review history
Future due forecast
Answer button distribution
Retention estimate
Weak item trend
Domain Pack progress
Source/scene weakness
```

Stats must not become a vanity dashboard. It should drive decisions:

```text
pause new cards
lower daily new limit
increase weak item cap
focus one Domain Pack
send weak card package back to Codex
```

### 4.9 Settings Page

Settings should act like Anki Deck Options plus TechLex backup/sync controls.

Group settings as:

```text
Learning Plan
Memory Rules
Deck / Pack Rules
Backup And Restore
Import / Export
Advanced
```

Learning Plan:

```text
daily new limit
daily review limit
daily weak limit
target retention
pause new cards
prioritize overdue
review weak items
```

Memory Rules:

```text
FSRS enabled
desired retention
short-term learning behavior
maximum interval
reschedule warning
```

Backup And Restore:

```text
last backup time
export backup
restore backup
backup schema version
app version
future remote sync status
```

Danger Zone:

```text
clear local data
reset learning history
restore old backup
```

Every dangerous action must require confirmation.

### 4.10 Import Page Or Import Panel

Import must exist, but it should not dominate the daily learning page.

Recommended placement:

```text
desktop: Today compact panel + Settings import/export section
mobile: More -> Import
```

Import result should show:

```text
imported cards
duplicates skipped
errors
warnings
Domain Packs added
cards ready for learning
```

After import, the primary action should be:

```text
Start Learning
```

not:

```text
Edit cards
```

## 5. UI State Model

TechLex OS should visibly distinguish:

```text
content state
memory state
daily queue state
data safety state
```

Content state:

```text
imported
invalid
duplicate
fix_needed
archived
```

Memory state:

```text
new
learning
reviewing
reinforce
downgrade
release
```

Daily queue state:

```text
due
overdue
weak
new_today
blocked_by_limit
paused_new
completed_today
```

Data safety state:

```text
local_only
backup_available
backup_outdated
restore_ready
future_remote_sync_pending
```

## 6. Layout Rules

### 6.1 One Primary Action Per Page

Examples:

```text
Today: Start Learning
Deck Overview: Start This Deck
Review Question: Show Answer
Review Answer: Again / Hard / Good / Easy
Browser: Search
Galaxy: Inspect Relationship
Settings: Save Learning Rules
```

### 6.2 Daily Learning Must Be Faster Than Management

The fastest path should be:

```text
open app
-> see due count
-> tap Start Learning
-> review cards
-> finish summary
```

No import, edit, graph, or settings action should interrupt that path.

### 6.3 Dense Controls Belong In Browser Or Settings

Do not move advanced filters into Today or Review.

### 6.4 Technical Context Is Answer-Side First

Before answer reveal, source/task hints should be subtle. After answer reveal, source, usage task, Chinese translation, and relation evidence should be prominent.

This preserves memory recall while still supporting "learn while using, use while learning".

### 6.5 Mobile First Interaction

Mobile review buttons must be thumb-friendly:

```text
two-column on small screens
four-column on larger screens
fixed bottom answer bar after answer reveal
```

Mobile Browser should use:

```text
filter chips
bottom sheet detail
sticky search
```

Mobile Galaxy should prefer:

```text
filter drawer
tap node
detail bottom sheet
```

## 7. Screen Blueprint

### 7.1 Today

```text
Header:
  TechLex OS
  backup/sync status
  settings shortcut

Hero:
  Today workload
  estimated time
  Start Learning

Queue split:
  Weak
  Due
  New
  Overdue

Study Decks:
  AI Programming English
  Web3 Developer English
  Programming Language Runtime
  ...

Recent activity:
  latest review event
  latest import report
```

### 7.2 Deck Overview

```text
Deck name
new / learning / review / weak / overdue
progress
Study Now
Options
Stats
Browse this deck
```

### 7.3 Review

```text
Top:
  progress
  deck
  stage

Question:
  headword
  prompt
  scene/frequency chips
  Show Answer

Answer:
  Chinese meaning
  English definition
  examples with Chinese translation
  source and usage task
  relations

Rating:
  Again / Hard / Good / Easy
  next intervals
```

### 7.4 Browser

```text
Search + saved filters
Filter sidebar / drawer
Card list/table
Selected card detail
Memory state panel
Source panel
Relation panel
```

### 7.5 Galaxy

```text
Graph
Relation filters
Mastery filters
Selected node detail
Related card list
Start review for related due cards
```

### 7.6 Stats

```text
Today
Forecast
Review history
Retention
Answer buttons
Weak points
Domain Pack progress
Scene/source weakness
```

### 7.7 Settings

```text
Learning Plan
Memory Rules
Deck Rules
Import / Export
Backup / Restore
Advanced
Danger Zone
```

## 8. Phase 7 Implementation Plan

### Phase 7A: Navigation And Information Architecture

Goal:

```text
Refactor navigation around Anki-like daily learning flow.
```

Tasks:

- Rename `Library` to `Browser`.
- Add `Stats` route or Stats subview.
- Add deck/pack overview card pattern to Today.
- Keep mobile bottom nav focused on daily learning.

Acceptance:

```text
User can open app and understand today's workload within 5 seconds.
Start Learning remains the most prominent action.
```

### Phase 7B: Reviewer Interaction Upgrade

Goal:

```text
Make review flow closer to Anki's two-stage reviewer while preserving TechLex content.
```

Tasks:

- Add keyboard shortcuts.
- Add next-interval labels on rating buttons.
- Add fixed bottom rating bar on mobile after answer reveal.
- Add More menu for non-primary actions.
- Add finish summary.

Acceptance:

```text
User can complete a review session without touching any management UI.
ReviewEvent and UserMemoryState remain correct.
```

### Phase 7C: Browser Upgrade

Goal:

```text
Turn card library into inspectable Browser.
```

Tasks:

- Add sidebar/drawer filters.
- Add selected-card detail panel.
- Add source, scene, mastery, due-state filters.
- Add structured search parser v0.1.

Acceptance:

```text
User can find cards by word, pack, scene, source, frequency, and memory state.
```

### Phase 7D: Stats Page

Goal:

```text
Provide learning operations feedback.
```

Tasks:

- Today summary.
- Future due forecast.
- Answer button distribution.
- Weak item trend.
- Domain Pack progress.

Acceptance:

```text
Stats can justify changes to learning plan.
```

### Phase 7E: Backup And Sync Readiness

Goal:

```text
Make data safety visible.
```

Tasks:

- Show last backup/export time.
- Add backup freshness warning.
- Add restore drill instructions.
- Add future remote persistence status placeholder.

Acceptance:

```text
User knows whether local learning data is safe before continuing.
```

## 9. Non-Goals

Do not implement these as part of the Anki-inspired UI pass:

```text
front-end Card Factory as a primary workflow
manual daily scheduling
Obsidian as hard dependency
Anki as hard dependency
AI auto-card generation inside the client core
remote Supabase persistence
multi-user commercial admin
```

These can exist later as adapters or advanced modules, but they must not distort the automatic learning runtime.

## 10. Final UI Design Decision

TechLex OS should become:

```text
Anki-like learning loop
+ FSRS runtime
+ technical-English source evidence
+ Chinese-readable answer cards
+ Domain Pack learning plan
+ Word Galaxy relationship inspection
+ portable backup/import/export
```

The UI should not ask the user to "manage a vocabulary database" every day. It should ask:

```text
Do you want to start today's learning?
```

Everything else is support infrastructure.
