# Model Hero Full-Width Design

Make the four Model sub-page heroes (`.mhero`, `.mxh`, `.dtree`, `.ehero`) span the full viewport width, matching how the shared `Header`/`.page-header` banner already behaves on every other page in the site.

## Context

Every non-Model page gets the shared `Header` component (`src/components/Header.tsx`), which renders as a sibling *above* `.page-container` in `src/containers/App/App.tsx` — so its dark-blue banner already spans edge-to-edge, with only the title/lead text capped by Bootstrap's `.container`.

The four Model pages (`/model`, `/model-methods`, `/model-discovery`, `/model-engineering`) opt out of that shared banner (`hideHeader: true` in `src/pages.ts`) and render their own custom hero components instead (`ModelHero`, `MethodsHero`, `DiscoveryTreeHero`, `EngineeringHero`). Because these pages don't set `fullWidth: true`, `App.tsx` still wraps the entire page — hero included — in `.page-container` (`max-width: 85%` + `padding: 0 10%`, ≈16% of viewport width lost to margins on each side). This makes the heroes look boxed-in with dead space on both sides, inconsistent with the rest of the site.

**Goal:** bring the Model heroes in line with the rest of the site (full-bleed banner), without changing the width of anything else on those pages.

## Design

### Routing (`src/pages.ts`)

Add `fullWidth: true` to the four Model page entries (`/model`, `/model-methods`, `/model-discovery`, `/model-engineering`), alongside their existing `hideHeader: true`. This stops `App.tsx` from wrapping the whole page component in `.page-container`.

### Page components

In each of the four page components (`model.tsx`, `model_methods.tsx`, `model_discovery.tsx`, `model_engineering.tsx`), wrap everything **except** the hero call in a `<div className="page-container">`, reproducing today's body width exactly:

```tsx
return (
  <>
    <ModelHero />
    <div className="page-container">
      <ModelNav active="overview" />
      <TOC />
      {/* ...all existing sections unchanged... */}
    </div>
  </>
);
```

The hero itself renders outside that wrapper, so it's free to use the full viewport width.

### Visual consequence (accepted)

The hero's own padding (`clamp(1.5rem, 5vw, 3.5rem)` or similar, already defined per-hero in each `.css` file) is much smaller than `.page-container`'s ~16%-of-viewport inset. So once the hero is full-width, its eyebrow/title/text will start further left than the nav pills/TOC/body content beneath it. This is accepted as fine — the hero reads as a wider, visually distinct band above a narrower body column, which is a common and acceptable pattern. No changes are needed to hero-internal padding/max-width beyond what already exists.

### Scope

This applies only to the four Model sub-pages' custom heroes. No other page's layout, and no other part of the Model pages' body content, changes.

## Files touched

- `src/pages.ts` — add `fullWidth: true` to the four Model routes
- `src/contents/dry-lab/model.tsx`
- `src/contents/dry-lab/model_methods.tsx`
- `src/contents/dry-lab/model_discovery.tsx`
- `src/contents/dry-lab/model_engineering.tsx`

No CSS changes are required — the heroes already define their own responsive padding independent of `.page-container`.
