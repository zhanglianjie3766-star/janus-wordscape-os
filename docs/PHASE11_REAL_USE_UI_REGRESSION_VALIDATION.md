# Phase 11 Real Use Acceptance And Current UI Regression Validation

Date: 2026-05-22

## Scope

Phase 11 validates the current five-tab product flow after the UI refactor:

- `今日`
- `单词本`
- `统计`
- `图谱`
- `设置`

This phase is a real-use acceptance and regression-script update pass. It does not change the import format, IndexedDB schema, FSRS scheduling rules, or remote persistence boundary.

## Non-Destructive Boundary

The regression script uses an isolated Chromium browser context.

It does not clear or mutate the current in-app browser tab's IndexedDB or localStorage. The script imports its own fixture only inside the isolated context.

Fixture:

```text
data/test-fixtures/scene-classification-demo-450.json
```

Script:

```text
scripts/phase11-real-use-ui-regression-smoke.mjs
```

Package command:

```text
corepack pnpm run smoke:phase11
```

## Real-Use Flow Covered

The Phase 11 smoke test covers the current UI and data-linking contract:

- Open the app on `http://127.0.0.1:5173`.
- Verify the five mobile bottom navigation entries.
- Verify `设置` opens with all accordion sections collapsed by default.
- Import the 450-card scene classification fixture through the public settings import flow.
- Enter `单词本`.
- Verify `全部 (450)` and a real second-level scene such as `IDE界面`.
- Enter a second-level scene subpage through the scene percentage/arrow area.
- Click a word row in the list and verify it is treated as an unfamiliar word.
- Verify that unfamiliar-word click writes `review_mode=browser_detail`, `rating=again`, and moves the card back into an active learning state.
- Run inline scene learning from the same scene subpage.
- Verify inline rating writes `review_mode=daily_task`, `rating=good`.
- Verify bottom `今日` remains a global due-review entry and does not mix in newly learned cards before they are due.
- Verify `统计` renders the current minimal dashboard set.
- Verify `图谱` renders the Canvas graph.
- Verify graph settings keep the macro-to-micro order: `词频 -> 记忆状态 -> 场景范围 -> 关系焦点`.
- Verify graph settings inner accordions are exclusive: opening one section collapses the previous section.
- Verify console errors remain zero.

## Validation Commands

```powershell
corepack pnpm run typecheck
corepack pnpm run smoke:phase11
corepack pnpm run build
```

## Validation Result

```text
typecheck: passed
smoke:phase11: passed
build: passed
console_error_count: 0
```

Webpack production build still emits the known default performance warning for the main entry bundle:

```text
bundle.*.js: 260 KiB
recommended limit: 244 KiB
```

This is not a functional failure. It should be handled by route-level splitting or another bundle-budget pass before a release-quality packaging milestone that requires warning-free output.

## Smoke Evidence

```json
{
  "app_url": "http://127.0.0.1:5173",
  "isolated_browser_context": true,
  "current_browser_storage_touched": false,
  "imported_cards": 450,
  "memory_states": 450,
  "review_events": 2,
  "browser_detail_again_events": 1,
  "daily_task_good_events": 1,
  "settings_default_collapsed": true,
  "global_review_empty_after_new_learning": true,
  "graph_filter_order_macro_to_micro": true,
  "graph_accordion_exclusive": true,
  "mobile_bottom_nav_buttons": 5,
  "console_error_count": 0
}
```

Report:

```text
data/exports/phase11-real-use-ui-regression-smoke-report.json
```

Screenshots:

```text
data/exports/phase11-real-use-ui-regression-mobile.png
data/exports/phase11-real-use-ui-regression-graph.png
```

## Acceptance

Phase 11 passes for the current frontend runtime:

- The five bottom pages are reachable.
- The notebook scene flow supports real cards and the current scene subpage design.
- List-row click is connected to the memory system as a browser-detail unfamiliar-word writeback.
- Inline scene learning writes normal daily-task review events.
- The global review tab remains limited to due-review cards.
- The graph settings model reflects the current value-led diagnostic design.
- The settings page default collapsed state is protected by regression coverage.

## Deferred

These items remain outside this Phase 11 pass:

- remote sync
- multi-device conflict handling
- backend adapter implementation
- production package signing
- warning-free bundle budget
- real user package quality beyond the 450-card fixture
