# Placeholder Hero Motifs Design

Add a clearly-labeled placeholder visual motif to the Overview and Engineering Model-page heroes, which currently look empty next to Methods' and Discovery's real animated graphics.

## Context

Of the four Model hero banners:
- **Methods** (`MethodsHero`, `.mxh-*`) has a real animated SVG motif: 7 nodes / 8 branching-merging edges, solid orange strokes, an animated "flow" line traveling the edges, masked to the right side of the banner.
- **Discovery** (`DiscoveryTreeHero`, `.dtree-*`) has a real, richly animated radial phylogenetic tree.
- **Overview** (`ModelHero`, `.mhero-*`) only has a `<canvas>` particle network spanning the whole banner — sparse, faint dots and lines, reads as empty next to Methods/Discovery.
- **Engineering** (`EngineeringHero`, `.ehero-*`) has no visual motif at all — just text.

Per the design decisions already made, Overview's particle canvas is being replaced (not kept alongside), and the new motif style is a "generic branching-pipeline SVG" — visually similar in *shape* to Methods' real motif, but clearly marked as a placeholder so it's never mistaken for real content (consistent with `.claude/RESPONSIBLE_AI_USE.md`'s "never fabricate" guidance — this is decoration standing in for a future real graphic, not itself a claim about anything).

## Design

### Shared shape (each page keeps its own local copy — no new shared component, matching how Methods/Discovery/Overview each already define their own local motif)

Both new motifs reuse Methods' `HERO_NODES`/`HERO_EDGES` layout verbatim (7 nodes at the same coordinates, 8 edges, `viewBox="0 0 690 260"`), so all three hero graphics read as one visual family.

### Placeholder styling (distinguishes from Methods' real motif)

- Edges: dashed (`stroke-dasharray`), muted color — no animated "flow" line (that specific cue reads as "real pipeline data" on Methods; the placeholder omits it).
- Nodes: hollow circles, dashed stroke, muted fill, slow gentle opacity pulse (`@keyframes` unique per page, e.g. `mhero-ph-pulse` / `ehero-ph-pulse` — CSS is bundled into one global file, so keyframe names must stay unique across files, matching the codebase's existing per-component-prefixed convention).
- A small "PLACEHOLDER GRAPHIC" tag (pill, uppercase, letter-spaced — same visual language as the site's existing placeholder tags, e.g. `.me-card-tag`) anchored near the bottom of the graphic's masked area.
- Masked to the right side of the banner via the same CSS `mask-image` technique Methods uses, and hidden below a 900px viewport (same breakpoint as `.mxh-canvas`), so it never collides with the hero text.

### Overview (`model.tsx` / `model.css`)

- Delete `ModelHero`'s canvas ref, its full particle-network `useEffect` (build/draw/step/frame/resize-listener/cleanup), and the `<canvas ref={canvasRef} className="mhero-canvas" />` element.
- Add an inline `<svg>` motif (new local `HERO_NODES`/`HERO_EDGES` constants, copied from Methods) rendered via `.mhero-ph-*` classes, plus the `.mhero-ph-tag` "PLACEHOLDER GRAPHIC" badge.
- `.mhero-grid` (the faint background grid texture) is untouched — it's unrelated to the empty-graphic complaint.
- Remove the now-unused `.mhero-canvas` CSS rule from `model.css`.

### Engineering (`model_engineering.tsx` / `model_engineering.css`)

- Add the same motif to `EngineeringHero`, via `.ehero-ph-*` classes and an `.ehero-ph-tag` badge.
- `.ehero` gains `overflow: hidden; isolation: isolate;` (Methods/Overview already have this) so the motif clips to the hero's rounded corners.

### Out of scope

- Discovery and Methods heroes are unchanged — they already have real content.
- No new shared/reusable component is introduced; each page keeps a local copy of the motif, matching how every other hero on this site is already structured (self-contained, own CSS namespace).

## Files touched

- `src/contents/dry-lab/model.tsx`
- `src/contents/dry-lab/model.css`
- `src/contents/dry-lab/model_engineering.tsx`
- `src/contents/dry-lab/model_engineering.css`
