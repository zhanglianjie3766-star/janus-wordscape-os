# GitHub Release Plan

Target release:

```text
v0.1.0-alpha
```

Repository role:

```text
source, documentation, GitHub Actions, GitHub Pages, release assets
```

## Release Gates

Before creating a GitHub Release:

```bash
corepack pnpm install
corepack pnpm run typecheck
corepack pnpm run test:fsrs-golden
corepack pnpm run smoke:phase11
corepack pnpm run build
corepack pnpm run package
```

## GitHub Pages

GitHub Pages deploys the `dist/` build on pushes to `main`.

The deployed app is an installable PWA.

## GitHub Release Assets

Attach:

```text
janus-wordscape-os-v0.1.0-alpha-dist.zip
data/card-production/janus-personal-ai-english-sample-120.package.json
data/card-production/janus-personal-ai-english-2000-blueprint.md
schemas/standard-word-card-package.schema.json
docs/QUICK_START.md
```

## Real-User Trial

For the first alpha, find 3-5 trial users and ask each to verify:

```text
open the app
install PWA
import the sample card package
learn from a scene subpage
click a word row and see it enter Today
complete one formal review
open Stats
open Graph
export a backup
restore the backup in another browser/profile if possible
```

Record issues before `v0.1.1-alpha`.
