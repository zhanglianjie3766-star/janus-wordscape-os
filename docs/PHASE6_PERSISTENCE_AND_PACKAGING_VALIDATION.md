# Phase 6 Persistence And Packaging Validation

Date: 2026-05-20

## Scope

Phase 6 turns the local runtime into a safer release candidate.

Implemented:

```text
app version constants
backup schema version constants
versioned backup export
legacy backup normalization
PWA manifest
PWA icon
service worker
service worker registration
Webpack static asset copy
dist static server script
release package script
release package manifest
future remote persistence migration document
```

Still deferred:

```text
cloud sync
user accounts
automatic remote backup
conflict resolution
native app packaging
signed installer
full offline mutation queue
```

## Commands

```text
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm run package
```

## Results

```text
typecheck: passed
build: passed
package: passed
packaged browser smoke test: passed
```

## Expected Release Output

```text
releases/techlex-os-v0.1.0/
  dist/index.html
  dist/manifest.webmanifest
  dist/service-worker.js
  dist/icons/icon.svg
  release-manifest.json
  START_HERE.md
```

## Browser Smoke Test

Flow:

```text
serve dist on http://127.0.0.1:4173
open the packaged app
confirm manifest is available
confirm service worker is registered
clear localStorage
import sample package
save learning plan settings
export a versioned backup from localStorage
clear localStorage
restore the versioned backup through Settings
confirm card count and learning plan are preserved
confirm mobile viewport renders bottom navigation
```

Observed:

```json
{
  "manifestName": "TechLex OS",
  "swRegistered": true,
  "backupSchemaVersion": 2,
  "appVersion": "0.1.0",
  "restoredCards": 4,
  "bottomNavButtons": 5
}
```

Screenshots:

```text
data/exports/phase6-packaged-desktop.png
data/exports/phase6-packaged-mobile.png
```

Smoke backup fixture:

```text
data/exports/phase6-versioned-backup-smoke.json
```

Server log:

```text
data/exports/phase6-dist-server.log
```

## Decision

Phase 6 is complete when:

```text
the production build succeeds
the release package is repeatable
PWA assets are present in dist
versioned backup export and restore are proven
future remote persistence has a documented adapter path
```

Phase 6 meets these criteria for the local self-developed prototype.
