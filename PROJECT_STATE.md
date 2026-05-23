# 雅努斯词境 OS Project State

This file is the compression-safe status anchor for the self-developed 雅努斯词境 OS project and its current 技术英语词汇网络 scenario application. TechLex OS is retained as the historical development codename for the technical-English vocabulary network.

## Project

```text
product: 雅努斯词境 OS
current scenario application: 雅努斯词境 OS · 技术英语词汇网络
historical development codename: TechLex OS
positioning: personal context-based English vocabulary automatic learning runtime
workspace: current repo root (Windows path contains Chinese characters)
constitution: docs/TECHLEX_OS_CONSTITUTION_v1.2.md
mainline protocol: docs/MAINLINE_INTERFACE_PROTOCOL.md
last updated: 2026-05-23
```

## Ultimate Goal

```text
The user can create or choose personal scene packs, bulk-import prepared English vocabulary card packages, set a learning plan and memory rules, then the system automatically generates daily learning tasks, runs FSRS reviews, records ReviewEvent feedback, updates UserMemoryState, and shows vocabulary relationships through a graph.
```

雅努斯词境 OS must be an automatic learning runtime. 雅努斯词境 OS · 技术英语词汇网络 is the current technical-English vocabulary network scenario application. TechLex OS is a historical development codename and must not be confused with the generic product core. The system must not drift into a card-authoring backend as the main product shape.

## Boundary

```text
Codex workspace:
source research, candidate generation, card drafting, Chinese explanations, examples, source evidence, quality review, structured card package export.

雅努斯词境 OS client:
standard card package import, user-defined scene packs, learning plan, daily task generation, FSRS review, ReviewEvent recording, UserMemoryState update, graph, export, import error handling.
```

## Current Mainline

```text
mainline: self-developed 雅努斯词境 OS / 技术英语词汇网络 scenario application
current phase: Self-Developed Phase 11 real-use acceptance and current UI regression completed
phase goal: validate the current five-bottom-tab UI, notebook scene subpage flow, FSRS/writeback data links, graph/settings regressions, and non-destructive smoke-test boundary
next phase: decide Remote Sync Decision And Persistence Adapter Boundary, unless more real-use UI/data-link friction is found first
```

## Completed Deliverables

```text
README.md
ROADMAP.md
docs/PROJECT_STRUCTURE.md
docs/DATA_MODEL.md
docs/IMPORT_FORMAT.md
docs/REAL_WORD_CARD_PRODUCTION_STANDARD.md
docs/PHASE1_LEARNING_RUNTIME_VALIDATION.md
docs/PHASE2_FSRS_VALIDATION.md
docs/PHASE3_BULK_IMPORT_VALIDATION.md
docs/PHASE4_WORD_GALAXY_VALIDATION.md
docs/PHASE5_LEARNING_OPERATIONS_VALIDATION.md
docs/PHASE6_PERSISTENCE_AND_PACKAGING_VALIDATION.md
docs/PERSISTENCE_AND_PACKAGING.md
docs/TECHLEX_OS_CONSTITUTION_v1.2.md
docs/GRAPH_EXPERIENCE_CONSTITUTION.md
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
docs/OBSIDIAN_GRAPH_REFERENCE_SPEC.md
docs/adr/ADR-graph-renderer.md
docs/GRAPH_REGRESSION_CHECKLIST.md
docs/ANKI_INTERACTION_MODEL_AND_TECHLEX_UI_SPEC.md
docs/PHASE7B_REAL_USE_HARDENING_VALIDATION.md
docs/PHASE7C_REAL_SESSION_DRIFT_RECOVERY_VALIDATION.md
docs/PHASE7D_PERFORMANCE_BUDGET_AND_GRAPH_VIRTUALIZATION_VALIDATION.md
docs/PHASE8_REMOTE_PERSISTENCE_PROTOTYPE_GATE_VALIDATION.md
docs/PHASE9_INDEXEDDB_MIGRATION_AND_RECOVERY_VALIDATION.md
docs/PHASE10_OBSIDIAN_GRADE_WORD_GALAXY_VALIDATION.md
docs/PHASE11_REAL_USE_UI_REGRESSION_VALIDATION.md
docs/NAMING_CONVENTION_FREEZE_v1.0.md
docs/PROJECT_BASELINE_FREEZE_INDEX_v1.0.md
docs/WORD_CARD_PRODUCTION_FREEZE_v1.0.md
docs/MEMORY_ALGORITHM_FREEZE_v1.0.md
docs/UI_FREEZE_INDEX_v1.0.md
docs/GALAXY_INTERACTION_FREEZE_v1.0.md
docs/TODAY_PAGE_INTERACTION_FREEZE_v1.0.md
docs/NOTEBOOK_INTERACTION_FREEZE_v1.0.md
docs/STATS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/SETTINGS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/DESIGN_TOKENS_FREEZE_v1.0.md
docs/COMPONENTS_FREEZE_v1.0.md
docs/DATA_FLOW_FREEZE_v1.0.md
docs/UI_REGRESSION_SCRIPT_FREEZE_v1.0.md
docs/VERSION_ROADMAP_v0.1_to_v1.0.md
data/exports/obsidian-reference-svid-083829/contact_sheet.jpg
data/exports/obsidian-reference-svid-083829/contact_sheet_full.jpg
data/exports/phase10f-vocabulary-notebook-smoke-report.json
data/exports/phase10f-vocabulary-notebook-browser.png
data/exports/phase11-real-use-ui-regression-smoke-report.json
data/exports/phase11-real-use-ui-regression-mobile.png
data/exports/phase11-real-use-ui-regression-graph.png
data/card-production/janus-personal-ai-english-2000-blueprint.md
data/card-production/janus-personal-ai-english-sample-120.package.json
schemas/standard-word-card-package.schema.json
examples/standard-word-card-package.example.json
examples/standard-word-card-package.example.csv
src/ local React learning runtime
```

## Phase 1 Status

Implemented:

```text
React / TypeScript / Webpack local app
standard JSON card package import
localStorage persistence
today task queue
review screen
ReviewEvent recording
basic card library
basic word galaxy grouping
learning plan settings
learning data export
```

Validation:

```text
corepack pnpm install: passed
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
http://127.0.0.1:5173: returned 200
browser smoke test: imported 3 sample cards, completed 1 review, ReviewEvent=1
screenshots: data/exports/phase1-learning-runtime-desktop.png, data/exports/phase1-learning-runtime-mobile.png
```

## Phase 2 Status

Implemented:

```text
ts-fsrs 5.4.0 integration
FSRS card serialization for local persistence
legacy Phase 1 memory-state migration path
Again / Hard / Good / Easy mapped to FSRS ratings
ReviewEvent.scheduler = ts-fsrs
UserMemoryState.fsrs_card
UserMemoryState.stability
UserMemoryState.difficulty
UserMemoryState.retrievability
UserMemoryState.due_at generated by FSRS
today task queue reads FSRS due_at
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
browser smoke test: imported 3 cards, reviewed 1 card with Good, ReviewEvent.scheduler=ts-fsrs, fsrs_card exists, reps=1, state=1
screenshots: data/exports/phase2-fsrs-runtime-desktop.png, data/exports/phase2-fsrs-runtime-mobile.png
```

## Deferred

```text
remote Supabase persistence
multi-device sync
custom FSRS parameter editor
historical rescheduling
force-directed graph physics
graph export
front-end Card Factory
Anki integration
Obsidian export
multi-user commercial operations
```

## Phase 10D Status

```text
source reference: D:\用户数据迁移_20260514\下载\SVID_20260521_083829_1.mp4
reference frames: data/exports/obsidian-reference-svid-083829/
renderer: src/components/InteractiveGalaxyGraph.tsx

Implemented:
- Obsidian-like low-noise grayscale idle rendering
- lower default node and edge opacity to reduce visual clutter
- active red focus only during pointer interaction instead of persistent color lock
- emphasized direct neighbor nodes and red relationship edges while dragging/selecting
- node click opens an in-graph floating summary and updates the right-side detail panel
- hub/tag/source nodes show related word chips immediately
- larger invisible hit target for global-zoom node selection
- spring-target drag force: pointer acts as a target, graph nodes move through velocity, damping, link force, and release inertia
- global pointerup/pointercancel/blur fallback so the graph restores grayscale after release
- fit-view changed from tight local crop to softer global graph bounds

Validation:
- video frames extracted and reviewed from the user-provided Obsidian recording
- corepack pnpm run typecheck: passed
- corepack pnpm run build: passed, only the known 245 KiB Webpack performance warning remains
- TECHLEX_URL=http://127.0.0.1:5174 corepack pnpm run smoke:phase10: passed
- in-app browser verification: graph page loads, canvas renderer present, click/drag updates node detail, release restores grayscale focus state
```

## Phase 10F Vocabulary Notebook UX Refinement Status

Implemented:

```text
sidebar/mobile navigation copy is now Review after clarification
independent Browse Words navigation entry removed after clarification; Word List is now a notebook-internal action
global navigation copy changed from Learning Memory to Review
vocabulary notebook default scope changed to All
All button added before Domain Pack filters
All scope defaults to aggregated second-level scene folders, not a flat word list
All scene folders aggregate cards across all Domain Packs by scene_tags
empty notebook state now uses UI-only scene demo data: 45 scene folders and 135 generated demo cards
UI-only demo cards render in memory only and are not saved to IndexedDB/localStorage
demo card writeback controls show a non-persistent demo warning instead of creating ReviewEvent records
importing real cards automatically hides the UI-only demo data
Domain Pack chips remain visible while All is selected
the special "Browse by Domain Pack" button was removed from All scope
the top-level flat Word List action is hidden in All scope
each second-level scene folder still exposes its own Word List action
notebook internal Word List mode supports imported cards by Domain Pack or scene folder
demo-mode learning buttons now show "Import To Learn" semantics instead of a gray Start Learning button
top-level Start Learning actions are hidden for both All and Domain Pack scopes; learning entry is only exposed from second-level scene folders
second-level scene folder right-arrow action now enters the learning page, while the Word List button remains the only scene list entry
second-level scene folder right-arrow now opens the scene subpage with Unlearned selected instead of jumping directly into the reviewer
second-level scene folder Word List now opens the same scene subpage with All selected
scene subpage top mode cards were removed; the page now keeps only four status filters: All, Unlearned, Learning, and Due Review
scene subpage word rows use a lightweight dictionary-style list with pronunciation icon, headword, Chinese summary, expandable details, and insertion-order-desc sorting as the current created-time proxy
scene subpage Learning Mode now starts an inline card-learning session inside the current scene subpage, limited to the current scene and current status filter
scene subpage browsing is now the default list behavior; expanded word details retain browser-detail default Forget writeback without changing import format, IndexedDB schema, or FSRS rules
scene subpage scope metadata now sits directly under the four status filters, and the separate black Start Learning heading was removed so the red Start Learning button is the only learning action label
scene subpage header now centers the current scene title as a larger, darker, semi-bold H1 while preserving the left breadcrumb back control and right card count
scene subpage header polish removed the visible gray breadcrumb text beside the back arrow, vertically aligned the right card count with the back arrow, and indented the scope line to align with the selected status chip text
scene subpage right header card-count text was replaced by a Settings-icon + Word Card Scope button; the scope panel supports range kinds All, Level 1, All Level 2, and Level 2, and stacks a frequency filter on top of the selected scene range
scene subpage title, status counts, scope line, learning queue, and word list now recompute from the selected word-card scope and frequency filter, so choosing All changes the centered title to All and choosing a Level 1 scene changes it to that scene name
scene subpage header was simplified after UX review: repeated notebook stage counters and Domain Pack chips are hidden on the scene subpage, while the centered title now reflects the active word-card scope
scene subpage header back action now mirrors the right settings action as a 40px light circular icon button, keeping the title visually centered and the two side controls balanced
folder-mode notebook sections no longer repeat the All/Domain Pack heading, card count, or top-level Word List action above the second-level scene folder list
bottom Review navigation now opens the memory-card entry directly instead of the old Today overview dashboard
Review memory queue now uses only notebook Word List cards in review-stage states: reviewing, due, overdue
ReviewView now exposes top second-level scene filter chips over that review-stage queue
ReviewView scene filter row is hidden when there is no real scene filter to apply
ReviewView header now uses a notebook-style three-counter stats card: Today Due Review, Today Reviewed, and Today Remaining; reviewed counts come only from daily_task ReviewEvent records and exclude browser_detail writebacks
ReviewView remains the global bottom-nav review entry and only uses review-stage cards: reviewing, due, overdue
Stats page redesigned around minimum necessary memory decisions: Today Execution, Memory Health, Stage Distribution, and Weak Scene Top 3
Stats page removed default ReviewEvent count, rating-button totals, queue-drift diagnostic table, and full Domain Pack progress list from the primary UI
Stats page metrics use daily_task ReviewEvent records for learning-review behavior and keep browser_detail writebacks out of today/recent review performance counts
Stats page top standalone title/intro removed; each metrics area is now one integrated dashboard panel with internal dividers instead of split metric cards
Stats page dashboard section titles are centered; explanatory copy moved behind right-side question-mark popovers for a cleaner default UI
Stats page primary dashboards now use one-row four-metric layouts for Today Execution, Memory Health, and Stage Distribution
Stats page Stage Distribution reduced to four user-facing phases: Unlearned, Learning, Due Review, Mastered; weak items remain monitored in Memory Health as Difficult Cards instead of duplicating as a fifth stage
Stats page question-mark help icons now sit next to section titles, and per-metric icons were removed to reduce visual noise and preserve text space
Stats page help popovers now include the dashboard purpose plus per-metric calculation method and meaning, while keeping the default dashboard view text-minimal
Stats page help popovers are mutually exclusive: opening one section's question-mark help automatically closes the previously open popover, and clicking the same help button toggles it off
Stats page Stage Distribution no longer has a unique horizontal progress bar; the first three dashboards now share the same title/help/four-metric-grid visual structure
Stats page primary dashboard metric rows are now borderless four-column stat clusters inside each integrated panel, using centered alignment and whitespace instead of inner cell boxes or vertical dividers
Stats page dashboard typography softened: metric values now use medium-weight slate text with a smaller reading size, section titles use slate text, and metric labels use muted defaults plus stable semantic colors only when needed
Stats page question-mark help popovers are now mobile-safe and scrollable: the popover allows pointer interaction, uses a fixed viewport position on mobile, avoids the bottom navigation area, and keeps desktop behavior anchored near the title
Stats page help popover copy is now shortened to core decision hints, and each popover has an internal close button so the user can dismiss it even when the popover covers the question-mark icon
Stats page help popovers now visually point to their owning question-mark icon: Today Execution and Memory Health open below the icon, while Stage Distribution and Weak Scene Top 3 open above the icon, each with a directional arrow
Stats page mobile help popovers are shifted 50px left from the question-mark center to avoid right-edge clipping, while the arrow is offset back to the icon so the ownership cue remains clear
Stats page help popovers now include a left-aligned identity header with the dashboard title and core description, led by a vertical rail spanning the two-line title block so the popover ownership is clear
Word Galaxy page was simplified to a graph-first mobile UI: the visible page keeps only the relationship graph, title, and a settings entry, while filters, relation controls, appearance controls, force controls, render cap, and reset actions are folded into the settings panel
Word Galaxy settings panel now has three accordion sections: Filter supports primary scene/domain pack, secondary scene tag, frequency tier, search, relation type, and render cap; Appearance supports arrows, mastery colors, text opacity, node size, edge width, and play animation; Force supports center force, node repulsion, linked-node attraction, and link length
Word Galaxy filter behavior now includes first-class scene_tag and frequency_tier filters in buildWordGalaxy, so the graph settings panel changes the rendered graph instead of only changing visible UI labels
Word Galaxy settings were re-centered around the minimum necessary memory value: the primary panel is now Core Diagnosis with relation focus, memory status, scene, frequency, and search; old Appearance and Force sections were removed from the main setting model and reduced to a secondary Display Tuning section
Word Galaxy relation focus replaces manual relation-type toggling with five learning-purpose presets: Memory Diagnosis, Scene Retrieval, Confusion Repair, Source Verification, and Semantic Extension
Word Galaxy memory filtering now supports user-facing buckets instead of only exact internal stages: Unlearned=new, Learning=learning/reinforce/downgrade, Due Review=reviewing/due/overdue, Mastered=release
Word Galaxy Core Diagnosis controls now use a single-open inner accordion: Relation Focus, Memory Status, Scene Range, and Frequency collapse each other so only the active selection area stays expanded
Word Galaxy Core Diagnosis inner accordion now supports zero-open state: clicking the currently expanded group collapses it back, so no child selection area is forced to stay open
Word Galaxy Core Diagnosis control order now follows macro-to-micro narrowing: Frequency, Memory Status, Scene Range, then Relation Focus as the final diagnostic lens
Word Galaxy scene category display now uses Chinese labels for default Domain Packs and scene_tags in both the settings scene selector and rendered graph relation nodes, while keeping the stored ids/tags unchanged
Word Galaxy top-right graph controls now separate concerns: the gear icon opens only Relationship Diagnosis, while a standalone pen-tip edit icon below it opens only Display Tuning
Word Galaxy settings panel was compacted after UX review: duplicated inner titles such as Core Diagnosis/Display Tuning were removed, selected values moved onto the same row as field names, and vertical spacing was tightened
Word Galaxy Display Tuning entry icon changed from the sharper pen-tip glyph to a softer pencil-line glyph while preserving the same standalone entry and settings behavior
Settings page was redesigned as a minimal five-card accordion: Learning Rules, Cards And Backup, Data Health, Profile And App, and Advanced Operations. The old always-visible import/diagnostic stack is no longer the public settings layout; import, export, restore, rollback, learning-plan, health, profile, and clear-local-data controls are grouped by long-term rule and data-safety intent.
Settings page accordion now defaults to a fully collapsed state on entry, including mobile, so no settings section consumes vertical space until the user explicitly opens it.
frequency tier labels now use compact Chinese-readable UI copy while preserving the underlying F1-F4 data codes: all=全部, F1高, F2中高, F3中, F4低
word-card scope entry is now icon-only in the scene subpage header, and the scope panel puts multi-select frequency filters above a ladder-style scene picker with primary scenes on the left and secondary scenes on the right
word-card scope scene picker now treats scene scope as a single cascading selection: the left primary scene controls the right secondary list, and the right side uses one unified All option instead of separate primary-all and secondary-all choices
word-card scope scene picker display labels are length-clamped for layout stability: primary scene labels cap at 5 characters and secondary scene labels cap at 7 characters, with full labels retained in button titles when truncation is needed
word-card scope panel is now mobile-width safe: on narrow screens it uses fixed viewport side insets, a scrollable max height, compressed ladder columns, and truncated buttons so the panel and controls stay within the viewport
word-card scope frequency controls now mirror the scene picker layout: frequency All uses the same left-column visual width as the primary scene selection, and F1-F4 render as equal-width two-column rows matching the secondary scene buttons
primary UI brand color is aligned to the Word Galaxy interaction red #d11b3d: theme token, PWA theme color, app icon, default avatar accent, navigation active states, primary buttons, selected chips, scene folder icons, progress bars, and graph settings controls now share the same red accent
decorative green/teal emphasis was reduced after the red-theme pass: review empty-state icon, reviewing-stage pills, stats dashboard good/normal labels, scene-folder due-review labels, and legacy overview review badges now use the primary red or neutral slate while rating-button semantics remain color-coded
development preview production-build flag now reads through globalThis.__TECHLEX_IS_PRODUCTION__ so stale or missing dev constants cannot throw before service-worker cleanup
vocabulary notebook top statistics card exposes one gray shortcut button: Learning Settings text with a right arrow
vocabulary notebook learning settings moved from the bottom-right floating action button into the top statistics card
vocabulary notebook top status area simplified to only the three memory-stage counters: Unlearned, Learning, and Due Review
visible app shell branding changed to 雅努斯词境 OS, with a replaceable default user avatar and nickname 张连接 in the left/profile area
browser page title and PWA manifest branding changed to 雅努斯词境 OS for mobile browser chrome display
product display brand renamed from 我的词境 OS to 雅努斯词境 OS across APP_DISPLAY_NAME, browser title, meta description, and PWA manifest
mobile app header removed because bottom navigation is the only mobile global navigation; top avatar and dropdown are no longer rendered on mobile
mobile scene-folder memory status row now uses stable max-content columns and no-wrap tabular numbers so three-digit counts do not split into uneven lines
scene-folder progress and right-arrow learning entry is pinned to the card's top-right title line so it no longer competes with the status row
scene-folder status metrics are compact inline content instead of full-width justified columns, keeping them visually below the title and away from the progress-arrow area
scene-folder list outer white container was removed in folder mode; second-level scene cards now sit directly on the page background while keeping their own card surfaces
scene-folder cards were further simplified: the progress bar, Start Learning button, Word List button, and expandable preview word list were removed; the top-right percent-plus-arrow chip is the only scene subpage entry
notebook action copy changed from Start Review to Start Learning where appropriate
notebook floating settings action renamed to Vocabulary Notebook Learning Settings
Settings page title and save action renamed to Vocabulary Notebook Learning Settings
BrowserView is retained as hidden code but no longer exposed as a public navigation page
notebook expanded card details added explicit default Forget writeback action
ReviewEvent.review_mode now supports browser_detail
browser_detail writeback records rating=again, updates UserMemoryState through FSRS, and does not masquerade as daily_task
word-card list row clicks now apply the one-vote-veto rule: any real word-card click writes a browser_detail ReviewEvent with rating=again, lets FSRS move the card to downgrade, and returns it to the Learning bucket regardless of scope or status filter
duplicate relation/link React keys in Browser details were fixed
development preview disables service worker registration and clears old browser caches to avoid stale localhost bundles
development preview guards the production-build flag so service-worker cleanup does not throw when a dev server misses compile-time replacement
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed with Webpack performance warnings: main bundle 269 KiB exceeds the 244 KiB default recommendation
manual Playwright smoke at http://127.0.0.1:5173: passed
smoke evidence: all_button_visible=true, notebook_has_all_scope=true, independent_browser_nav_visible=false, latest_review_rating=again, latest_review_mode=browser_detail, memory_stage_after=downgrade, console_error_count=0
targeted All-scope regression check: all_defaults_to_scene_folders=true, domain_pack_chips_visible=true, special_pack_browse_removed=true, top_flat_word_list_hidden=true, folder_word_list_buttons_visible=true, folder_count=7, console_error_count=0
dev preview cache fix verified at http://localhost:5173 after restarting webpack-dev-server: nav copy updated, All notebook folder view visible, special domain-browse button absent, top flat Word List action absent
duplicate Browse Words entry regression check in isolated browser context: independent_nav_removed_desktop=true, independent_nav_removed_mobile=true, all_defaults_to_scene_folders=true, top_flat_browse_hidden_in_all=true, folder_browse_buttons_visible=true, write_forget_review_recorded=true, latest_browser_detail_stage=downgrade, console_error_count=0
UI-first demo regression check in isolated browser context: nav_label_desktop_review=true, nav_label_mobile_review=true, empty_demo_folder_count=45, empty_demo_cards=135, scene_browse_list_has_3_cards=true, demo_write_did_not_persist_review=true, real_import_demo_hidden=true, real_import_subtitle_has_300=true, console_error_count=0
word-list copy regression check in isolated empty context: notebook_internal_word_list_visible=true, browse_words_copy_visible=false, demo_learning_button_copy=Import After Data, empty_demo_folder_count=45, console_error_count=0
scene-only learning entry regression check at http://localhost:5173: all_scope_top_start_hidden=true, domain_scope_top_start_hidden=true, scene_start_buttons_visible=true, scene_word_list_buttons_visible=true, folder_count_all=45, folder_count_domain=7, console_error_count=0
scene-arrow learning regression check at http://localhost:5175: arrow_start_button_count=45, first_arrow_label=IDE界面 开始学习, arrow_click_enters_learning_page=true, still_in_folder_list_after_arrow_click=false
scene-subpage regression check at http://localhost:5175 after dev-server restart: arrow_enters_scene_page=true, word_list_enters_same_scene_page=true, top_mode_cards_removed=true, status_filters_visible=All_Unlearned_Learning_DueReview, dictionary_rows_visible=true, insertion_order_desc_verified_by_first_row=toolbar, inline_start_button_visible=true, no_new_console_errors_after_restart=true
scene-subpage header cleanup check at http://localhost:5175: breadcrumb=AI编程/IDE界面, old_back_text_removed=true, top_stage_counter_removed=true, domain_pack_chips_removed=true, mode_switches_still_visible=true, status_filters_still_visible=true
review-entry regression check at http://localhost:5175: bottom_review_opens_memory_entry=true, old_today_dashboard_hidden=true, review_queue_source=reviewing_due_overdue_only, scene_filter_visible=true, empty_review_stage_state_visible=true, new_console_error_count=0
review-header minimal empty-state check at http://localhost:5175: has_summary=true, old_duplicate_summary_hidden=true, all_zero_chip_hidden=true, filter_button_count=0, new_console_error_count=0
review-header stats card check at http://localhost:5175: has_stats_section=true, labels=TodayDueReview_TodayReviewed_TodayRemaining, values=0_0_0, old_text_summary_hidden=true, all_zero_chip_hidden=true, new_console_error_count=0
scene-inline-learning regression check at http://localhost:5175: scene_subpage_default=Unlearned_filter, mode_cards_removed=true, start_new_words_stays_in_scene_subpage=true, inline_card_visible=true, inline_card_first_word=toolbar, show_answer_reveals_rating_buttons=true, bottom_review_remains_global_due_only=true
scene-folder-card-minimal check at http://localhost:5175: progress_bar_removed=true, start_learning_button_removed=true, word_list_button_removed=true, preview_expand_removed=true, percent_arrow_entry_visible=true, percent_arrow_enters_scene_subpage=true
scene-subpage-action-label check at http://localhost:5175: scope_line_under_status_filters=true, duplicate_black_start_learning_heading_removed=true, red_start_learning_button_visible=true
scene-subpage-centered-title check at http://localhost:5175: centered_h1_visible=true, centered_h1_text=IDE界面, breadcrumb_back_preserved=true, card_count_preserved=true
scene-subpage-header-polish check at http://localhost:5175: visible_breadcrumb_text_removed=true, back_button_accessible_label=返回场景列表, card_count_right_aligned_with_back_arrow=true, scope_line_indented_to_status_label=true
scene-subpage-card-scope check at http://localhost:5175: right_card_count_removed=true, word_card_scope_button_visible=true, scope_panel_opens=true, range_options=All_Level1_AllLevel2_Level2, selecting_all_updates_title_to_All=true, frequency_filter_F3_updates_counts_and_scope_line=true, selecting_level1_updates_title_to_AIProgramming=true
scene-subpage-header-symmetry check at http://localhost:5175: back_button=40x40, settings_button=40x40, same_background=true, centered_h1_text=IDE界面, console_error_count=0
frequency-tier Chinese label check at http://localhost:5175: scope_panel_frequency_labels=All_F1High_F2MidHigh_F3Mid_F4Low, selecting_F3_updates_scope_line_to_F3Mid=true, frequency_buttons_use_five_column_single_row_layout=true
word-card-scope redesign check at http://localhost:5175: icon_only_scope_entry=true, visible_scope_text_removed=true, frequency_section_before_scene_section=true, frequency_multi_select_scope_line=F1High_F2MidHigh, ladder_scene_picker_has_primary_left_secondary_right=true, console_error_count=0
word-card-scope cascade single-select check at http://localhost:5175: old_primary_all_secondary_all_labels_removed=true, right_side_uses_unified_all=true, primary_Web3_cascades_secondary_list=true, selecting_Defi_updates_title_and_scope=true, console_error_count=0
word-card-scope scene-label-length check at http://localhost:5175: primary_labels_over_5=0, secondary_labels_over_7=0, console_error_count=0
word-card-scope mobile-width check at http://localhost:5175 with 390px viewport: panel_within_viewport=true, panel_left=0, panel_right=375, overflowing_buttons=0, console_error_count=0
word-card-scope frequency-alignment check at http://localhost:5175: frequency_all_width_matches_primary_scene=true, F1_F4_equal_width=true, F1_F4_two_rows=true, frequency_option_width_matches_secondary_scene=true, console_error_count=0
word-card-click one-vote-veto check at http://localhost:5175: clicked_word=toolbar, before_counts=Unlearned10_Learning0, after_counts=Unlearned9_Learning1, latest_review_rating=again, latest_review_mode=browser_detail, visible_stage_after=downgrade, console_error_count=0
stats-page minimal-memory-design check at http://localhost:5175: sections=TodayExecution_MemoryHealth_StageDistribution_WeakSceneTop3, metric_labels_visible=true, old_review_buttons_removed=true, old_drift_table_removed=true, old_domain_progress_removed=true, review_event_pill_removed=true, new_console_error_count=0
stats-page integrated-panel check at http://localhost:5175: header_title_removed=true, header_intro_removed=true, today_panel_metrics=4, health_panel_metrics=4, split_metric_card_count=0, new_console_error_count=0
stats-page section-help-popover check at http://localhost:5175: centered_section_titles=true, help_button_count=4, default_copy_hidden=true, click_question_opens_popover=true, new_console_error_count=0
stats-page four-column-dashboard check at http://localhost:5175: today_metrics=4, health_metrics=4, stage_metrics=4, stage_weak_label_removed=true, difficult_cards_metric_retained=true, new_console_error_count=0
stats-page compact-help-and-no-metric-icons check at http://localhost:5175: help_gap=8px, help_button_count=4, metric_icon_count=0, new_console_error_count=0
stats-page detailed-help-popover check at http://localhost:5175: help_button_count=4, today_help_has_four_items=true, stage_help_has_four_items=true, explains_calculation_and_meaning=true, new_console_error_count=0
stats-page single-help-popover check at http://localhost:5175: after_first_expanded=TodayExecution, after_second_expanded=MemoryHealth_only, second_closes_first=true, same_button_toggles_off=true, new_console_error_count=0
stats-page unified-dashboard-style check at http://localhost:5175: today_health_stage_each_use_one_four_metric_grid=true, stage_progress_bar_removed=true, shared_panel_class=true, new_console_error_count=0
stats-page borderless-four-column-stat-cluster check at http://localhost:5175: today_health_stage_each_have_four_metrics=true, inner_metric_grid_border_removed=true, inner_metric_grid_rounding_removed=true, vertical_cell_dividers_removed=true, metric_clusters_centered=true, metric_icon_count=0, stage_progress_bar_removed=true, new_console_error_count=0
stats-page softer-dashboard-typography check at http://localhost:5175: all_sections_visible=true, metric_values_use_text_2xl_font_medium_text_slate_700=true, metric_values_avoid_text_ink_and_font_semibold=true, default_labels_muted=true, semantic_label_colors_stable=true, new_console_error_count=0
stats-page weak-scene-help-popover check at http://localhost:5175: popover_position_fixed_on_mobile=true, pointer_events_auto=true, overflow_y_auto=true, z_index=50, bottom_avoids_bottom_nav=true, content_includes_last_help_item=true, new_console_error_count=0
stats-page concise-help-and-close-button check at http://localhost:5175: close_button_visible=true, close_button_dismisses_popover=true, old_long_stat_method_phrases_removed=true, help_text_length_reduced=true, app_new_console_error_count=0
stats-page directional-help-popovers check at http://localhost:5175: today_help_below_question=true, health_help_below_question=true, stage_help_above_question=true, weak_scene_help_above_question=true, directional_arrows_visible=true, close_buttons_visible=true, app_new_console_error_count=0
stats-page mobile-help-popover-left-shift check at http://localhost:5175: all_four_popovers_shift_left_50px=true, popover_right_edges_within_viewport=true, popover_left_edges_within_viewport=true, arrows_still_point_to_question_icons=true, close_buttons_visible=true, app_new_console_error_count=0
stats-page popover-identity-header check at http://localhost:5175: all_four_popovers_show_dashboard_title=true, title_and_description_left_aligned=true, vertical_rail_visible=true, vertical_rail_spans_title_description_block=true, close_buttons_visible=true, app_new_console_error_count=0
word-galaxy settings-panel UI check at http://localhost:5175: graph_only_page_when_panel_closed=true, old_filter_bar_hidden=true, old_relation_chips_hidden=true, old_detail_aside_hidden=true, old_color_legend_hidden=true, settings_button_visible=true, filter_section_has_primary_scene_secondary_scene_frequency_search_relation_type_render_cap=true, appearance_section_has_arrows_mastery_colors_text_opacity_node_size_edge_width_play_animation=true, force_section_has_center_charge_link_strength_link_length=true, app_new_console_error_count=0
graph-red primary theme check at http://localhost:5175 in isolated browser context: notebook_brand_button_bgs=rgba(209,27,61,0.1)/rgb(209,27,61), folder_icon_color=rgb(209,27,61), graph_brand_color=rgb(209,27,61), canvas_count=1, console_error_count=0
folder-mode header cleanup check at http://localhost:5173: all_repeated_heading_visible=false, domain_repeated_heading_visible=false, top_word_list_button_visible=false, scene_word_list_buttons_visible=true, folder_count_all=45, folder_count_ai_platform=8, console_error_count=0
top shortcut regression check at http://localhost:5175: settings_button_count=1, stats_button_count=0, fixed_button_count=0, settings_svg_count=1, settings_click_opens_settings=true
minimal top status regression check at http://localhost:5175: only_stage_counters_visible=true, date_removed=true, current_scope_removed=true, card_count_summary_removed=true, learning_settings_shortcut_removed=true
app shell profile regression check at http://localhost:5175: visible_app_name=雅努斯词境 OS, visible_user_nickname=张连接, visible_avatar_loaded=true, old_visible_top_brand_absent=true
mobile browser title regression check at http://localhost:5175: document_title=雅努斯词境 OS, browser_title=雅努斯词境 OS, old_title_absent=true
brand rename check at http://localhost:5175: document_title=雅努斯词境 OS, dist_index_title=雅努斯词境 OS, dist_manifest_name=雅努斯词境 OS, console_error_count=0
mobile header removal regression check at http://localhost:5175: visible_header_count=0, visible_top_select_count=0, visible_top_avatar_count=0, bottom_nav_buttons=5, main_top=0
mobile scene-folder status layout regression check at http://localhost:5175: status_rows=45, first_five_single_line=true, row_height=20px, child_white_space=nowrap, new_console_error_count=0
scene-folder progress-arrow alignment check at http://localhost:5175: title_arrow_center_delta=2px, arrow_is_above_status=true, status_children_nowrap=true, new_console_error_count=0
scene-folder compact status width check at http://localhost:5175: status_width=152px, gap_to_arrow=223px, status_does_not_reach_arrow=true, child_nowrap=true, new_console_error_count=0
scene-folder outer-container removal check at http://localhost:5175 in isolated browser context: folder_card_count=45, outer_section_background=transparent, outer_section_border=0px, outer_section_padding=0px, first_card_background=white, console_error_count=0
red-theme green-noise reduction check at http://localhost:5175 in isolated browser context: review_empty_check_color=rgb(209,27,61), stats_good_labels_use_brand=true, notebook_due_review_labels_use_brand=true, visible_text_teal_count=0, console_error_count=0
word-galaxy minimal-core-settings check at http://localhost:5175: has_core_diagnosis=true, has_relation_focus=true, has_memory_status=true, relation_presets=MemoryDiagnosis_SceneRetrieval_ConfusionRepair_SourceVerification_SemanticExtension, has_display_tuning=true, old_appearance_section_removed=true, old_force_section_removed=true, canvas_exists=true, console_error_count=0
word-galaxy core-diagnosis inner-accordion check at http://localhost:5175: memory_open_closes_relation=true, scene_open_closes_memory=true, frequency_open_closes_scene=true, one_selection_area_expanded_at_a_time=true, console_error_count=0
word-galaxy core-diagnosis zero-open accordion check at http://localhost:5175: initial_child_groups_collapsed=true, scene_group_opens_on_click=true, scene_group_collapses_on_second_click=true, no_child_group_forced_open=true, console_error_count=0
word-galaxy core-diagnosis order check at http://localhost:5175: group_order=Frequency_MemoryStatus_SceneRange_RelationFocus, top_positions_increase=true, console_error_count=0
word-galaxy Chinese scene-label check at http://localhost:5175: primary_scene_options=AI编程_Web3_语言运行时_AI平台_云与协作_设计创作, dependencies_label_replaced_by=依赖管理, default_English_pack_option_count=0, console_error_count=0
word-galaxy display-tuning-entry check at http://localhost:5175: pen_tip_entry_below_gear=true, pen_entry_opens_display_tuning_only=true, gear_entry_opens_relationship_diagnosis_only=true, console_error_count=0
word-galaxy compact-settings-panel check at http://localhost:5175: duplicate_core_diagnosis_title_removed=true, field_values_same_row=true, group_card_height=44px, display_tuning_inner_title_removed=true, console_error_count=0
word-galaxy display-tuning soft-pencil-icon check at http://localhost:5175: display_button_visible=true, icon_class=lucide-pencil-line, display_panel_visible=true, console_error_count=0
settings-page five-card accordion check at http://localhost:5175: visible_cards=LearningRules_CardsAndBackup_DataHealth_ProfileAndApp_AdvancedOperations, import_panel_integrated_into_backup=true, learning_collapses_when_backup_opens=true, old_top_import_panel_absent=true, console_error_count=0
settings-page default-collapsed mobile check at http://localhost:5175: all_five_cards_visible=true, all_default_collapsed=true, learning_inputs_hidden=true, backup_controls_hidden=true, console_error_count=0
report: data/exports/phase10f-vocabulary-notebook-smoke-report.json
screenshot: data/exports/phase10f-vocabulary-notebook-browser.png
```

Known debt:

```text
The current main bundle is about 270 KiB and triggers Webpack's default performance warning.
This does not block the Phase 10F notebook UX change, but should be handled by further route-level splitting before a packaged release-quality milestone that requires a warning-free build.
```

## Phase 3 Status

```text
six default technical-English Domain Packs
JSON package import with partial card-level validation
CSV / TSV import
duplicate card_id skip policy
import error and warning reports
import report persistence
Domain Pack and frequency filters in the card library
Domain Pack grouping in the word galaxy
FSRS review remains functional after bulk import
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
browser smoke test: imported JSON sample, re-imported duplicate JSON sample, imported CSV sample, cards=6, domain_packs=6, import_reports=3, duplicate skip=4, ReviewEvent.scheduler=ts-fsrs
screenshots: data/exports/phase3-bulk-import-desktop.png, data/exports/phase3-bulk-import-mobile.png
```

## Phase 4 Status

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
relationship-type toggles
click-to-inspect node details
related-card evidence panel
desktop and mobile responsive layout
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
browser smoke test: imported JSON and CSV samples, completed one FSRS review, opened Word Galaxy, graph nodes=59, graph edges=55, detail panel visible
screenshots: data/exports/phase4-word-galaxy-desktop.png, data/exports/phase4-word-galaxy-mobile.png
```

## Phase 5 Status

```text
learning plan editor with daily new-card limit
daily review cap
daily weak-item cap
target retention control wired into FSRS scheduling
pause-new-cards control
weak-item reinforcement queue
queue ordering: weak items -> due reviews -> new cards
backup export
backup restore through JSON upload
backup normalization for older app data
mobile bottom navigation
desktop and mobile dashboard operations summary
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
browser smoke test: imported sample package, completed one FSRS review with Again, weakCount=1, pauseNewCards=true, dailyWeakLimit=2, targetRetention=0.92, restore succeeded, mobile bottom nav buttons=5
screenshots: data/exports/phase5-learning-operations-desktop.png, data/exports/phase5-learning-operations-mobile.png
backup fixture: data/exports/phase5-backup-smoke.json
```

## Phase 6 Status

```text
app version constants
backup schema version constants
versioned backup export
legacy backup normalization
PWA manifest
PWA icon
service worker
service worker registration
Webpack static asset emission
dist static server script
release package script
release package manifest
future remote persistence migration document
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
corepack pnpm run package: passed
packaged browser smoke test: manifestName=TechLex OS, swRegistered=true, backupSchemaVersion=2, appVersion=0.1.0, restoredCards=4, bottomNavButtons=5
release package: releases/techlex-os-v0.1.0
screenshots: data/exports/phase6-packaged-desktop.png, data/exports/phase6-packaged-mobile.png
backup fixture: data/exports/phase6-versioned-backup-smoke.json
```

## Phase 7D Performance Budget And Large Graph Virtualization Status

Implemented:

```text
Word Galaxy render cap with 100 / 250 / 500 options
Word Galaxy matching-card truncation indicator
rendered cards versus total matching cards summary
dynamic import for Word Galaxy runtime tools
browser storage budget report
Settings page Browser storage budget panel
compact localStorage persistence
metadata-only package history after import
compact pre-import rollback snapshot
2000-card stress package fixture
repeatable browser smoke test for 2000-card import, graph render cap, storage warning, and mobile navigation
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run generate:stress-package: passed, cards=2000
corepack pnpm run build: passed with Webpack main-bundle budget warnings
corepack pnpm run smoke:phase7d: passed
smoke evidence: cards=2000, memory_states=2000, local_storage_mb=3.85, storage_budget_text=Browser storage budgetWATCH, graph_render_cap_respected=true, mobile_bottom_nav_buttons=5
fixture: data/test-fixtures/large-card-package-2000.json
report: data/exports/phase7d-performance-graph-smoke-report.json
screenshots: data/exports/phase7d-performance-graph-desktop.png, data/exports/phase7d-performance-graph-mobile.png
```

Known performance debt:

```text
Historical note: at Phase 7D, production build emitted an async Word Galaxy chunk, but the main bundle still exceeded Webpack's default 244 KiB recommendation. This was resolved later in Phase 10B.
Further route-level splitting is deferred until stricter first-load performance targets are required.
```

## Phase 8 Remote Persistence Prototype Gate Status

Decision:

```text
IndexedDB is now the primary local persistence layer.
localStorage is retained as a small bootstrap/shadow layer and legacy migration source.
Remote persistence remains deferred behind a future PersistenceAdapter boundary.
```

Implemented:

```text
IndexedDB database: techlex-os-db
Object store: app_data
current AppData record
last-import rollback record
legacy full localStorage migration into IndexedDB
small-dataset localStorage shadow
large-dataset localStorage metadata shadow
Settings page Persistence prototype gate panel
3000-card persistence package fixture
browser smoke test for IndexedDB import, review persistence, reload recovery, and localStorage metadata-shadow verification
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run generate:persistence-package: passed, cards=3000
corepack pnpm run build: passed with Webpack main-bundle budget warnings
corepack pnpm run smoke:phase8: passed
smoke evidence: indexeddb_cards=3000, indexeddb_memory_states=3000, indexeddb_review_events=1, localstorage_shadow_after_review_bytes=232, localstorage_is_metadata_shadow=true, persistence_panel_text=Persistence prototype gateIndexedDB primary, storage_budget_text=Browser storage budgetRISK, mobile_bottom_nav_buttons=5
fixture: data/test-fixtures/large-card-package-3000.json
report: data/exports/phase8-persistence-gate-smoke-report.json
screenshots: data/exports/phase8-persistence-gate-desktop.png, data/exports/phase8-persistence-gate-mobile.png
```

Known persistence boundary:

```text
IndexedDB is still browser-profile local storage.
Clearing site data still removes learning data unless the user has exported a backup.
Remote multi-device sync is not implemented.
```

## Phase 9 IndexedDB Migration And Recovery Hardening Status

Implemented:

```text
last_good IndexedDB recovery snapshot
automatic recovery from invalid IndexedDB current record
indexeddb_recovered and indexeddb_corrupt persistence states
legacy localStorage remigration when IndexedDB current is invalid
failed import guard for zero-valid-card packages
backup reminder when browser storage reaches RISK
explicit backup export drill in smoke test
legacy localStorage migration regression in smoke test
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed with Webpack main-bundle budget warnings
corepack pnpm run smoke:phase9: passed
smoke evidence: exported_backup_cards=3000, exported_backup_review_events=1, last_good_cards_before_corruption=3000, recovered_cards_after_corruption=3000, recovered_review_events_after_corruption=1, failed_import_preserved_cards=3000, failed_import_preserved_review_events=1, legacy_migrated_cards=3
report: data/exports/phase9-indexeddb-recovery-smoke-report.json
screenshots: data/exports/phase9-indexeddb-recovery-desktop.png, data/exports/phase9-indexeddb-recovery-mobile.png
```

Known boundary:

```text
IndexedDB remains browser-profile local storage.
Remote multi-device sync is not implemented.
Main bundle has been reduced to about 239 KiB and is now below Webpack's default 244 KiB performance recommendation.
```

## Phase 10 Obsidian-Grade Word Galaxy Status

Implemented:

```text
WordCard.tags
WordCard.links
WordCard.aliases
JSON / CSV / TSV import support for tags, links, and aliases
standard schema support for tags, links, and aliases
tag nodes
wikilink nodes
has_tag edges
links_to edges
[[wikilink]] parsing from notes, examples, and usage_tasks
#tag parsing from notes, examples, and usage_tasks
system tags from pack, scene, source, source priority, frequency, part of speech, and memory stage
alias resolution for incoming wikilinks
real backlinks
outgoing link index
Hub Path panel
global graph
local 1-hop and 2-hop graph
Obsidian Markdown export/copy
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed after lazy-loading Browser, Review, Settings, and Word Galaxy views
corepack pnpm run smoke:phase10: passed
smoke evidence: imported_cards=4, svg_circle_count=63, svg_line_count=94, local_svg_circle_count=33, local_svg_line_count=27, has_tag_panel=true, has_backlink_panel=true, has_wikilink_panel=true, markdown_has_real_backlink=true
fixture: data/test-fixtures/obsidian-grade-word-galaxy-package.json
report: data/exports/phase10-obsidian-word-galaxy-smoke-report.json
screenshots: data/exports/phase10-obsidian-word-galaxy-desktop.png, data/exports/phase10-obsidian-word-galaxy-mobile.png
```

Boundary:

```text
Implemented scope is Obsidian-grade graph, tags, and bidirectional-link behavior for imported technical-English cards.
This is not a full general-purpose Obsidian clone: no markdown editor, filesystem vault sync, plugin ecosystem, canvas, unlinked mentions, or block transclusion.
Main bundle is now about 239 KiB after page-level lazy loading and graph splitting.
```

## Phase 10B Main Bundle Slimming Status

Implemented:

```text
Word Galaxy page split into a lazy-loaded view chunk
Browser page split into a lazy-loaded view chunk
Settings page split into a lazy-loaded view chunk
Review page split into a lazy-loaded view chunk
Word Galaxy runtime remains loaded only when the graph view is opened
settings-only integrity and storage-budget calculations moved out of the initial App path
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed with no Webpack performance warnings
main bundle before slimming: about 287 KiB
main bundle after slimming: about 239 KiB
corepack pnpm run smoke:phase7b: passed after lazy-loading changes
corepack pnpm run smoke:phase10: passed after lazy-loading changes
```

## Phase 10C FSRS Memory Rules v1 Status

Implemented:

```text
FSRS remains the core scheduler through ts-fsrs
LearningPlan now includes maximum_interval_days
LearningPlan now includes relearning_interval_minutes
LearningPlan now includes leech_lapse_threshold
LearningPlan now includes review_sort_order
Again rating uses the configured relearning interval
FSRS due dates are capped by maximum review interval
weak-item queue includes cards that reach the configured lapse threshold
review queue can sort by low retrievability or due date
Settings page exposes a focused FSRS memory-rules panel
Review screen interval previews use the configured memory rules
Review due labels are localized in Chinese
Phase 7C smoke test was hardened to click visible review buttons instead of racing lazy-loaded keyboard events
Phase 7C smoke test was updated for the localized session-drift panel title
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed with no Webpack performance warnings
corepack pnpm run smoke:phase7c: passed
corepack pnpm run smoke:phase10: passed
browser verification at http://127.0.0.1:5174 confirmed the Settings page shows FSRS 记忆规则, 最大复习间隔（天）, 遗忘后重学间隔（分钟）, 记忆难点阈值（Again 次数）, 复习排序, and 可回忆率低的优先
browser console errors: none
```

## Next Phase

```text
Self-Developed Phase 11: Remote Sync Decision And Persistence Adapter Boundary.

Goal:
decide whether TechLex OS stays local-first with IndexedDB or introduces a remote sync adapter, while keeping the learning runtime independent from any specific backend.
```

## Phase 7 UI Design Baseline

```text
Anki interaction model reviewed and translated into TechLex OS UI principles.
Design baseline document: docs/ANKI_INTERACTION_MODEL_AND_TECHLEX_UI_SPEC.md

Core decision:
TechLex OS should inherit Anki's proven deck overview -> focused reviewer -> answer rating -> scheduling feedback loop, while adding technical-English source evidence, Chinese explanations, usage tasks, Domain Pack context, and Word Galaxy relationship inspection.

Next implementation target:
Phase 7A - Navigation And Information Architecture.
```

## Phase 7A UI Upgrade Status

Implemented:

```text
Anki-style Today learning operations page
Study Deck / Domain Pack overview page
Review screen with two-stage recall rhythm
keyboard shortcuts for Show Answer and Again/Hard/Good/Easy
FSRS next-interval preview labels on answer buttons
Library renamed and upgraded to Browser
Browser filters for Domain Pack, frequency, mastery state, source, and keyword search
Browser selected-card detail panel with source, examples, memory state, and relation tags
Stats page with today count, due forecast, historical retention proxy, answer buttons, mastery state, and Domain Pack progress
mobile bottom navigation remains five primary learning actions
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
browser smoke test: imported 4 sample cards, reviewed 1 card with keyboard shortcuts, ReviewEvent=1, visible mobile bottom nav buttons=5
screenshots: data/exports/phase7-anki-ui-desktop.png, data/exports/phase7-anki-ui-mobile.png
```

## Phase 7B Real-Use Hardening Status

Implemented:

```text
runtime integrity report for larger imports
card/content/source/example/UserMemoryState/ReviewEvent consistency checks
pre-import rollback snapshot in localStorage
Settings page Real-use integrity check panel
Restore pre-import snapshot action
300-card large-package fixture across 6 Domain Packs
repeatable browser smoke test for large-package import, review, integrity, rollback, and mobile/desktop screenshots
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run generate:large-package: passed, cards=300
corepack pnpm run build: passed with existing Webpack bundle-size warnings
corepack pnpm run smoke:phase7b: passed
smoke evidence: cards=300, domain_packs=6, memory_states=300, review_events=1, import_reports=1, rollback_snapshot_exists=true, integrity_panel_text=Real-use integrity checkPASS, mobile_bottom_nav_buttons=5
fixture: data/test-fixtures/large-card-package-300.json
report: data/exports/phase7b-large-package-smoke-report.json
screenshots: data/exports/phase7b-large-package-desktop.png, data/exports/phase7b-large-package-mobile.png
```

## Phase 7C Real Learning Session Drift And Recovery Status

Implemented:

```text
SessionDriftReport for future queue forecasts
Stats page Session drift and recovery panel
weak-item queue cap visibility
backup recovery readiness indicator
large-package overload risk classification
configurable large-package generator through CARD_COUNT
1000-card package fixture
browser smoke test for 12 consecutive reviews and backup restore with ReviewEvent preservation
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run generate:overload-package: passed, cards=1000
corepack pnpm run build: passed with existing Webpack bundle-size warnings
corepack pnpm run smoke:phase7c: passed
smoke evidence: cards_after_import=1000, review_events_before_restore=12, review_events_after_restore=12, memory_states_after_restore=1000, weak_items_after_reviews=1, drift_panel_text=Session drift and recoveryWATCH, backup_restore_preserved_review_events=true, mobile_bottom_nav_buttons=5
fixture: data/test-fixtures/large-card-package-1000.json
backup fixture: data/exports/phase7c-backup-after-reviews.json
report: data/exports/phase7c-session-drift-smoke-report.json
screenshots: data/exports/phase7c-session-drift-desktop.png, data/exports/phase7c-session-drift-mobile.png
```

## Phase 10D Obsidian-style Interactive Graph Renderer Status

Implemented:

```text
Obsidian-style SVG graph renderer
interaction-driven force-directed physics without adding a heavy graph dependency
wheel zoom and canvas panning
node dragging that pulls connected neighbors through link and repulsion forces
click-to-select node detail linkage
hover/click neighbor highlighting and dimming
degree-aware node sizing for high-connectivity hubs
label discipline to reduce clutter on large graphs
graph controls: relayout, fit view, optional mastery colors
node degree metadata in wordGalaxy data model
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run build: passed
corepack pnpm run smoke:phase10: passed
browser verification on http://127.0.0.1:5174/: passed
browser evidence: dynamic controls visible, relayout visible, fit view visible, operation hint visible, Hub Path detail visible, console errors=0
```

Refinement:

```text
Default graph style changed to Obsidian-like grayscale
mastery colors are now an optional toggle instead of the default visual layer
node radius reduced
edge saturation reduced
labels are hidden by default and shown on hover/selection
organic deterministic seeding reduces the previous colorful ring appearance
removed the pause/start animation control because the intended motion is drag-coupled force feedback, not decorative playback
dragging a node now keeps it pinned under the pointer while connected and nearby nodes continue moving physically
drag movement now uses continuous velocity-based force coupling instead of hard neighbor position jumps, so linked nodes move more smoothly during drag
drag events now inject velocity into first-hop, second-hop, and nearby nodes immediately before the RAF force loop, avoiding the previous stiff single-node-only movement during fast drags
Obsidian reference alignment tightened: grayscale contrast is lower, background fade is stronger, active edges are red but lighter, node sizes are smaller, and drag force is limited to direct/second-hop neighborhoods instead of pulling the whole graph
Graph motion alignment upgraded: drag no longer relies on a single hard force step; it now uses a continuous RAF force loop, local first-hop/second-hop elastic displacement, a release impulse, and damped local rebound so dragged nodes pull their neighborhood closer to the Obsidian reference behavior without restarting the whole graph layout
Graph physics refinement: dragging now uses a spring target instead of hard-pinning the dragged node, mouse and pointer input share the same drag target path, hard neighbor coordinate jumps were removed, direct links apply stronger spring forces, and release motion cools through damped velocity rather than a delayed pulse
Global idle graph cleanup: unselected graph state now uses smaller nodes, lower default node opacity, higher hub prominence thresholds, thinner and lighter idle edges, and a white canvas so the default view is closer to Obsidian's low-noise global graph before any node is selected
Phase 10E Graph Renderer Replacement: replaced the hand-written SVG/React per-frame graph renderer with a Canvas renderer driven by d3-force so node dragging is handled by a real force simulation with link springs, inertia, damping, and post-release settling
Phase 10E visual rule: keep the global graph grayscale and low-noise by default; selected nodes become red, direct neighbor links become red, first-hop neighbors stay dark, and unrelated background nodes fade while preserving the global spatial structure
Phase 10E validation update: phase10 smoke now verifies the Canvas graph renderer, Obsidian panels, markdown export, mobile navigation, and console-error count instead of counting legacy SVG graph primitives
Phase 10E viewport refinement: the graph now defaults to fit-to-view after initial d3-force settling, uses a much lower minimum zoom for large graphs, refits after layout reset and non-user resize, and preserves user pan/zoom once the user manually changes the viewport
Phase 10E viewport size refinement: default fit now targets the main node cloud rather than the most extreme outliers, reduces fit padding, and applies a modest zoom boost so the global graph opens larger while still preserving overall spatial structure
Phase 10E Obsidian interaction refinement: graph visual highlight is now temporary and interaction-scoped; clicking a node still updates the detail panel, but red node/edge highlighting is cleared on pointer release so the graph returns to grayscale like Obsidian's global graph
Phase 10E node detail refinement: clicking a graph node now opens an in-graph floating summary; card nodes show the word directly, while hub/tag/source/scene nodes show their related word cards immediately, with larger invisible hit targets for easier selection in global zoom
Phase 10F stability audit: bottom `复习` and statistics `今日待复习` now only include review-stage cards whose `due_at` has actually arrived, so future reviewing cards no longer enter the global review queue early
Phase 10F stability audit: App now refreshes the review queue on a lightweight 60-second clock so FSRS due cards surface without requiring a manual reload or unrelated data change
Phase 10F validation update: `corepack pnpm run typecheck` passed, `corepack pnpm run build` passed with the existing main-bundle size warning, and in-app browser click-through for `复习 / 单词本 / 统计 / 图谱 / 设置` showed console errors=0
Phase 10F cleanup: removed the retired in-App `ImportPanel`, `TodayView`, `IssueList`, `StatCard`, their unused helper functions, and their stale imports from `src/App.tsx`; import controls now live in `SettingsView` and bottom `复习` renders through `ReviewView`
Phase 10F cleanup validation: `corepack pnpm run typecheck` passed, `corepack pnpm run build` passed, main bundle dropped from about 265 KiB to about 260 KiB, and non-destructive in-app browser click-through for all five bottom pages showed console errors=0
Phase 11 naming refinement: the global due-review bottom navigation entry was renamed from `复习` to `今日`, while the page continues to show Today Due Review / Today Reviewed / Today Remaining and remains limited to due-review cards
```

## Phase 11 Real-Use Acceptance And Current UI Regression Status

Implemented:

```text
added `scripts/phase11-real-use-ui-regression-smoke.mjs`
added `corepack pnpm run smoke:phase11`
added `docs/PHASE11_REAL_USE_UI_REGRESSION_VALIDATION.md`
Phase 11 smoke uses an isolated Chromium browser context and does not clear the current in-app browser IndexedDB/localStorage
Phase 11 smoke imports `data/test-fixtures/scene-classification-demo-450.json` only inside the isolated context
Phase 11 smoke covers the five bottom pages: Review, Vocabulary Notebook, Stats, Word Galaxy, and Settings
Phase 11 smoke verifies Settings defaults to all accordion sections collapsed
Phase 11 smoke verifies Vocabulary Notebook real-card scene flow from All -> IDE界面 scene subpage
Phase 11 smoke verifies word-row click acts as unfamiliar-word writeback with `review_mode=browser_detail` and `rating=again`
Phase 11 smoke verifies inline scene learning writes `review_mode=daily_task` with a normal FSRS rating
Phase 11 smoke verifies bottom Review stays global due-review only and does not mix in newly learned cards before due
Phase 11 daily review cap refinement: bottom Today now defines Today Due Review as min(due review-stage cards, daily_review_limit); Today Remaining subtracts due-review cards already completed today, and the Today Due Review stat includes an inline cap note
Phase 11 smoke verifies Stats dashboards render after the UI simplification
Phase 11 smoke verifies Word Galaxy Canvas rendering plus macro-to-micro settings order and exclusive accordion behavior
Phase 11 FSRS auditability hardening locks `ts-fsrs` to exact version 5.4.0, records scheduler_version, preserves fsrs_raw_state_after separately from product-adapted state_after, and keeps browser_detail+again as a product queue rule rather than a formal daily_task review
Third-party algorithm dependency and copyright compliance rules were classified as a constitutional candidate plus independent governance document, with detailed rules in `docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md`
Real word-card package production standard was upgraded to `docs/REAL_WORD_CARD_PRODUCTION_STANDARD.md` v1.2, using graph value to define a complete field system: front-side recognition (`headword`, `phonetic`, click-to-play audio, `part_of_speech`), scene, source, frequency, confusion, word family, tags, links, aliases, notes, quality gates, and package-level production rules
Word-card import schema was upgraded to accept the latest production-standard optional fields: `phonetic`, `audio_url`, `audio_asset_id`, `audio_accent`, `frequency_reason`, `source_context`, and `card_status`. These fields belong to WordCard content or production quality control and must not be mixed into UserMemoryState or FSRS state.
Personal AI English card production artifacts were generated: `data/card-production/janus-personal-ai-english-2000-blueprint.md` defines the 2000-card target distribution, and `data/card-production/janus-personal-ai-english-sample-120.package.json` provides a current-schema-compatible 120-card acceptance sample across six default Domain Packs
```

Validation:

```text
corepack pnpm run typecheck: passed
corepack pnpm run test:fsrs-golden: passed
corepack pnpm run smoke:phase11: passed
corepack pnpm run build: passed
smoke evidence: imported_cards=450, memory_states=450, review_events=2, browser_detail_again_events=1, daily_task_good_events=1, browser_detail_scheduler_version=5.4.0, browser_detail_raw_stage=learning, browser_detail_adapted_stage=due, settings_default_collapsed=true, global_review_empty_after_new_learning=true, graph_filter_order_macro_to_micro=true, graph_accordion_exclusive=true, mobile_bottom_nav_buttons=5, console_error_count=0
report: data/exports/phase11-real-use-ui-regression-smoke-report.json
screenshots: data/exports/phase11-real-use-ui-regression-mobile.png, data/exports/phase11-real-use-ui-regression-graph.png
```

Known remaining warning:

```text
Production build still emits the default Webpack performance warning: main bundle is about 260 KiB versus the 244 KiB recommendation. This is not a functional blocker for Phase 11, but remains a bundle-budget task before release-quality packaging if warning-free builds become required.
```

## Compression-Safe Read Order

New windows or compressed contexts should read:

```text
docs/TECHLEX_OS_CONSTITUTION_v1.2.md
PROJECT_STATE.md
docs/MAINLINE_INTERFACE_PROTOCOL.md
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
docs/GRAPH_EXPERIENCE_CONSTITUTION.md
docs/OBSIDIAN_GRAPH_REFERENCE_SPEC.md
docs/adr/ADR-graph-renderer.md
docs/GRAPH_REGRESSION_CHECKLIST.md
README.md
ROADMAP.md
docs/DATA_MODEL.md
docs/IMPORT_FORMAT.md
docs/REAL_WORD_CARD_PRODUCTION_STANDARD.md
docs/PHASE1_LEARNING_RUNTIME_VALIDATION.md
docs/PHASE2_FSRS_VALIDATION.md
docs/PHASE3_BULK_IMPORT_VALIDATION.md
docs/PHASE4_WORD_GALAXY_VALIDATION.md
docs/PHASE5_LEARNING_OPERATIONS_VALIDATION.md
docs/PHASE6_PERSISTENCE_AND_PACKAGING_VALIDATION.md
docs/PERSISTENCE_AND_PACKAGING.md
docs/ANKI_INTERACTION_MODEL_AND_TECHLEX_UI_SPEC.md
docs/PHASE7B_REAL_USE_HARDENING_VALIDATION.md
docs/PHASE7C_REAL_SESSION_DRIFT_RECOVERY_VALIDATION.md
docs/PHASE7D_PERFORMANCE_BUDGET_AND_GRAPH_VIRTUALIZATION_VALIDATION.md
docs/PHASE8_REMOTE_PERSISTENCE_PROTOTYPE_GATE_VALIDATION.md
docs/PHASE9_INDEXEDDB_MIGRATION_AND_RECOVERY_VALIDATION.md
docs/PHASE10_OBSIDIAN_GRADE_WORD_GALAXY_VALIDATION.md
docs/PHASE10B_MAIN_BUNDLE_SLIMMING_VALIDATION.md
docs/PHASE10E_GRAPH_RENDERER_REPLACEMENT_VALIDATION.md
docs/PHASE11_REAL_USE_UI_REGRESSION_VALIDATION.md
```

## Final Acceptance Sentence

```text
Can I create or choose my own scene packs, bulk-import prepared English vocabulary cards for those scenes, set only the learning plan and memory rules, and then have the system automatically push daily learning tasks, run FSRS reviews, record feedback, update mastery state, and show vocabulary relationships through the graph?
```

If yes, 雅努斯词境 OS is on target. If no, the project is not complete. 雅努斯词境 OS · 技术英语词汇网络 is the current technical-English vocabulary-network scenario application, and TechLex OS is only its historical development codename.

## Continuation Anchor

```text
雅努斯词境 OS constitution target: personal context-based automatic vocabulary learning runtime, not card-authoring backend.
Current scenario application: self-developed 雅努斯词境 OS · 技术英语词汇网络.
Current phase: Self-Developed Phase 11 real-use acceptance and current UI regression completed.
Next phase: decide Remote Sync Decision And Persistence Adapter Boundary unless more real-use UI/data-link friction is found.
External Meoo prototype is reference only, not the self-developed execution baseline.
```
