# Phase 10E Graph Renderer Replacement Validation

## Goal

Upgrade the word galaxy from a hand-written SVG/React force approximation to an Obsidian-style interactive graph renderer that supports smooth force-directed dragging.

The goal is not decorative animation. The graph must help inspect how a word connects to scenes, sources, tags, synonyms, confusing words, word families, backlinks, and mastery state.

## Implementation

- Renderer changed from SVG graph primitives to Canvas.
- Physics changed from custom per-frame React state updates to `d3-force`.
- Dragging now heats the force simulation, pins the dragged node under the pointer while dragging, then releases it with velocity so the graph settles with inertia and damping.
- Direct links use force springs, so neighbor nodes move through the simulation rather than through hard-coded coordinate jumps.
- Global graph defaults to a low-noise grayscale style.
- Selected node is red; direct links are red; first-hop neighbors stay visible; unrelated nodes fade.

## Validation

Commands:

```text
corepack pnpm run typecheck
corepack pnpm run build
$env:TECHLEX_URL='http://127.0.0.1:5174'; corepack pnpm run smoke:phase10
```

Results:

```text
typecheck: passed
build: passed
phase10 smoke: passed
browser verification: passed
console errors: 0
```

Browser evidence:

```text
Canvas renderer is present.
Selecting/dragging a hub highlights the node in red.
Direct neighbor edges turn red.
Background graph fades but remains spatially visible.
The selected neighborhood forms a radial local view.
No console errors were observed after drag testing.
```

## Remaining Tuning Surface

The current implementation is materially closer to Obsidian than the prior SVG version, but exact Obsidian parity is still a tuning task because Obsidian uses a private renderer. Continue tuning only against real-use feedback:

```text
node density
charge strength
link distance
velocity decay
alpha decay
label visibility
local-neighborhood contrast
```
