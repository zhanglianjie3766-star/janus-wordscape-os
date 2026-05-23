# Persistence And Packaging

This document defines the persistence and packaging baseline.

## Current Persistence Mode

TechLex OS currently runs as a local static web app.

```text
runtime: browser
primary storage: IndexedDB
bootstrap/shadow storage: localStorage
backup format: versioned JSON
remote sync: not enabled
```

This is intentional for the current self-developed prototype:

```text
the learning runtime can be used without a server
all data remains under the user's browser profile
backup and restore are explicit user actions
future cloud persistence can be added behind an adapter boundary
```

Phase 8 changed the local persistence baseline:

```text
small datasets: localStorage may keep a compact full shadow copy
large datasets: IndexedDB stores the full AppData payload
large datasets: localStorage keeps only a small metadata bootstrap record
legacy full localStorage data: migrated into IndexedDB on startup
```

Current local database:

```text
IndexedDB database: techlex-os-db
Object store: app_data
Current app data key: current
Rollback snapshot key: last_import_rollback
```

## Versioned Backup Format

Every exported backup includes:

```text
backup_format: techlex-os-app-data
backup_schema_version: current backup schema number
app_version: current app version
exported_at: export timestamp
updated_at: app data timestamp
```

Current values:

```text
app_version: 0.1.0
backup_schema_version: 2
```

Restore behavior:

```text
older backups without backup_format are treated as legacy local AppData
missing learning-plan fields are filled from current defaults
Domain Packs are merged with the built-in registry
unknown extra fields are ignored by the runtime
```

## Release Package

Create a release package:

```text
corepack pnpm run package
```

The script creates:

```text
releases/techlex-os-v0.1.0/
  dist/
  docs/
  schemas/
  examples/
  README.md
  ROADMAP.md
  PROJECT_STATE.md
  START_HERE.md
  release-manifest.json
```

Run the built app locally:

```text
corepack pnpm run serve:dist
```

Then open:

```text
http://127.0.0.1:4173
```

## PWA Baseline

Phase 6 adds:

```text
manifest.webmanifest
SVG app icon
service-worker.js
service worker registration
static asset packaging
```

The PWA baseline is intentionally minimal. It is not yet a full offline-first product with migration prompts, install analytics, or cloud sync.

## Future Remote Persistence Path

Remote persistence should be added as an adapter, not by rewriting the learning runtime.

Recommended future boundary:

```text
PersistenceAdapter
  -> loadAppData(user_id)
  -> saveAppData(user_id, data)
  -> createBackup(user_id)
  -> restoreBackup(user_id, backup)
  -> listBackups(user_id)
```

Candidate remote tables:

```text
users
app_data_snapshots
word_cards
review_events
user_memory_states
learning_plans
import_reports
backup_jobs
```

Future remote migration order:

```text
1. keep IndexedDB as the local source of truth
2. export a versioned backup
3. import backup into remote storage
4. compare card count, ReviewEvent count, and UserMemoryState count
5. run a remote restore drill
6. switch reads to remote only after parity is proven
```

Do not add remote persistence before:

```text
backup restore is reliable
release packaging is repeatable
app data schema is versioned
phase smoke tests are passing
```
