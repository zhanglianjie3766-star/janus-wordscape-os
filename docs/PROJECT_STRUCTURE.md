# Project Structure

This structure is for the self-developed TechLex OS runtime.

```text
.
|-- README.md
|-- PROJECT_STATE.md
|-- ROADMAP.md
|-- index.html
|-- package.json
|-- webpack.config.js
|-- public/
|   |-- manifest.webmanifest
|   |-- service-worker.js
|   `-- icons/
|       `-- icon.svg
|-- src/
|   |-- App.tsx
|   |-- index.tsx
|   |-- styles.css
|   |-- types.ts
|   |-- version.ts
|   |-- storage.ts
|   |-- scheduler.ts
|   |-- fsrsEngine.ts
|   |-- importer.ts
|   |-- domainPacks.ts
|   |-- samplePackage.ts
|   `-- wordGalaxy.ts
|-- scripts/
|   |-- create-release-package.mjs
|   `-- serve-dist.mjs
|-- docs/
|   |-- TECHLEX_OS_CONSTITUTION_v1.1.md
|   |-- MAINLINE_INTERFACE_PROTOCOL.md
|   |-- PROJECT_STRUCTURE.md
|   |-- DATA_MODEL.md
|   |-- IMPORT_FORMAT.md
|   |-- PERSISTENCE_AND_PACKAGING.md
|   `-- PHASE*_VALIDATION.md
|-- schemas/
|   `-- standard-word-card-package.schema.json
|-- examples/
|   |-- standard-word-card-package.example.json
|   `-- standard-word-card-package.example.csv
|-- data/
|   `-- exports/
|-- releases/
|   `-- techlex-os-v0.1.0/
`-- tests/
    `-- README.md
```

## Directory Roles

`public/`

PWA assets copied into the production build: manifest, service worker, and icon.

`src/`

Runtime implementation for import, learning plan, FSRS review, memory state, word galaxy, backup restore, and UI.

`scripts/`

Local packaging and static serving helpers.

`docs/`

Constitution, protocols, data model, import format, persistence notes, and phase validation records.

`schemas/`

Machine-checkable schema for the standard card package import contract.

`examples/`

Small example packages for import and smoke tests.

`data/exports/`

Local validation artifacts: screenshots, smoke-test backups, and logs.

`releases/`

Generated release packages. The current release package is created by:

```text
corepack pnpm run package
```

## Current Rule

The project is now a local automatic learning runtime. It should keep prioritizing:

```text
bulk import
learning plan
FSRS review
ReviewEvent
UserMemoryState
word galaxy
backup and restore
packaged local release
```

It should not drift into a front-end card-authoring backend as the primary product shape.
