# Model Hero Full-Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the four Model sub-page heroes (`ModelHero`, `MethodsHero`, `DiscoveryTreeHero`, `EngineeringHero`) span the full viewport width, matching the full-bleed banner already used on every other page, while every other piece of Model-page content keeps its current width.

**Architecture:** Set `fullWidth: true` on the four Model routes in `src/pages.ts` so `App.tsx` stops auto-wrapping the whole page (hero included) in `.page-container`. Inside each of the four page components, manually wrap everything *except* the hero call in a `<div className="page-container">`, so the nav pills / TOC / sections keep exactly the width they have today. `.page-container` is an existing, already-styled class (`src/containers/App/App.css:61`) — no new CSS is introduced.

**Tech Stack:** React 19 + TypeScript, Vite, React Router, no test runner configured (`package.json` has no `test` script) — verification is `tsc`/`vite build` (via `yarn build`) plus `yarn lint`, and manual visual checks via the Vite dev server through a headless-Chromium (Playwright) screenshot.

## Global Constraints

- Do not modify `LICENSE` or the `Footer` component's license notice / GitLab link (per `CLAUDE.md`).
- Do not touch `.gitlab-ci.yml`.
- No new dependencies — Playwright is already installed in the scratchpad from the earlier verification pass in this session; reuse it or install fresh with `npm install playwright` if unavailable.
- Only the four Model routes and their four page components change. No other route, no other component, no CSS file changes.
- Design doc of record: `docs/superpowers/specs/2026-07-23-model-hero-full-width-design.md`.

---

### Task 1: Add `fullWidth: true` to the four Model routes

**Files:**
- Modify: `src/pages.ts:159-189` (the four Model entries inside the `"Dry Lab"` folder's `folder` array)

**Interfaces:**
- Consumes: nothing new — `fullWidth` is an existing optional field on the `Page` class (`src/pages.ts:42-52`), already read by `src/containers/App/App.tsx:54` (`fullWidth ? <Component /> : <div className="page-container"><Component /></div>`).
- Produces: with `fullWidth: true`, `App.tsx` renders `<Component />` for these four routes with no wrapping `<div className="page-container">`. Tasks 2-5 depend on this — each page component must supply its own `.page-container` wrapper around body content, or that content will render edge-to-edge unstyled.

- [ ] **Step 1: Edit the four route entries**

In `src/pages.ts`, add `fullWidth: true` immediately after each `hideHeader: true` line for the four Model entries, so they read:

```ts
      {
        name: "Model",
        title: "Model",
        path: "/model",
        component: Model,
        lead: "Explain your model's assumptions, data, parameters, and results in a way that anyone could understand.",
        hideHeader: true,
        fullWidth: true,
      },
      {
        name: "Model · Methods",
        title: "Model — Methods",
        path: "/model-methods",
        component: ModelMethods,
        lead: "The computational methods behind the model: pocket detection, docking, molecular dynamics, sequence search and the enzyme-design pipeline.",
        hideHeader: true,
        fullWidth: true,
      },
      {
        name: "Model · Discovery",
        title: "Model — Discovery",
        path: "/model-discovery",
        component: ModelDiscovery,
        lead: "Enzyme-discovery results: mapping the pocket, docking the substrate and the molecular-dynamics walk-through.",
        hideHeader: true,
        fullWidth: true,
      },
      {
        name: "Model · Engineering",
        title: "Model — Engineering",
        path: "/model-engineering",
        component: ModelEngineering,
        lead: "Enzyme-engineering results: designed variants and how they were evaluated.",
        hideHeader: true,
        fullWidth: true,
      },
```

- [ ] **Step 2: Type-check**

Run: `yarn build`
Expected: Succeeds (this is a plain data change; TypeScript has no reason to fail, but Tasks 2-5 must land before the site *looks* right — at this point in isolation the Model pages' body content will render edge-to-edge until Task 2-5 add the wrapper back).

- [ ] **Step 3: Commit**

```bash
git add src/pages.ts
git commit -m "$(cat <<'EOF'
Mark Model routes as full-width

Lets the Model sub-pages' custom heroes render outside .page-container
so their background can span the full viewport, matching the shared
page-header banner used on every other page.
EOF
)"
```

---

### Task 2: Wrap `model.tsx` body content in `.page-container`

**Files:**
- Modify: `src/contents/dry-lab/model.tsx:710-800` (the `Model()` component's `return` block)

**Interfaces:**
- Consumes: `fullWidth: true` from Task 1 (route `/model`).
- Produces: `Model()` renders `<ModelHero />` full-bleed, followed by a `<div className="page-container">` containing `ModelNav`, `TOC`, and all existing sections — matching the DOM structure this page had before Task 1 (just with `ModelHero` moved outside the wrapper).

- [ ] **Step 1: Edit the return block**

In `src/contents/dry-lab/model.tsx`, change (starting at line 710):

```tsx
  return (
    <>
      <ModelHero />

      <ModelNav active="overview" />

      <TOC />

      <div className="page-start row mt-4">
        <div className="col-lg-12">
```

to:

```tsx
  return (
    <>
      <ModelHero />

      <div className="page-container">
        <ModelNav active="overview" />

        <TOC />

        <div className="page-start row mt-4">
          <div className="col-lg-12">
```

Then, at the end of the same return block (around line 795-800), change:

```tsx
          {/* Bottom prev/next navigation (Overview → Methods) */}
          <ModelPager active="overview" />
        </div>
      </div>
    </>
  );
```

to (note the added closing `</div>` for `.page-container`, and re-indentation of the existing two closing `</div>` tags):

```tsx
            {/* Bottom prev/next navigation (Overview → Methods) */}
            <ModelPager active="overview" />
          </div>
        </div>
      </div>
    </>
  );
```

Every line between these two edited regions (the `<section id="overview">` through `<section id="exploration">` content) needs its indentation increased by two spaces, since it's now nested one level deeper inside `.page-container`. Use your editor's re-indent/format-on-save, or run `yarn format` after the edit (Prettier is configured — `package.json:"format": "prettier --write \"**/*.{ts,tsx,md,json,css}\""`), rather than manually re-indenting every line.

- [ ] **Step 2: Reformat and type-check**

Run: `yarn format && yarn build`
Expected: Prettier reformats the file cleanly (JSX structure, not just whitespace, must be valid — if `yarn build` fails with a JSX/TSX syntax error, the wrapping `<div>`/`</div>` pair is mismatched; recheck Step 1). Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/contents/dry-lab/model.tsx
git commit -m "$(cat <<'EOF'
Move Model hub body content into .page-container

ModelHero now renders full-bleed above the container; everything else
(nav pills, TOC, sections) keeps its current width via an explicit
.page-container wrapper, since the route no longer gets one for free.
EOF
)"
```

---

### Task 3: Wrap `model_methods.tsx` body content in `.page-container`

**Files:**
- Modify: `src/contents/dry-lab/model_methods.tsx:1017-1120` (the page component's `return` block)

**Interfaces:**
- Consumes: `fullWidth: true` from Task 1 (route `/model-methods`).
- Produces: same shape as Task 2 — `MethodsHero` full-bleed, everything else inside `.page-container`.

- [ ] **Step 1: Edit the return block**

Change (starting at line 1017):

```tsx
  return (
    <>
      <MethodsHero />

      <ModelNav active="methods" />

      <TOC />

      <div className="page-start row mt-4">
        <div className="col-lg-12">
```

to:

```tsx
  return (
    <>
      <MethodsHero />

      <div className="page-container">
        <ModelNav active="methods" />

        <TOC />

        <div className="page-start row mt-4">
          <div className="col-lg-12">
```

And at the end of the block (around line 1115-1120), change:

```tsx
          {/* Bottom prev/next navigation (Overview ← Methods → Discovery) */}
          <ModelPager active="methods" />
        </div>
      </div>
    </>
  );
```

to:

```tsx
            {/* Bottom prev/next navigation (Overview ← Methods → Discovery) */}
            <ModelPager active="methods" />
          </div>
        </div>
      </div>
    </>
  );
```

As in Task 2, everything in between shifts one level deeper — run `yarn format` rather than re-indenting by hand.

- [ ] **Step 2: Reformat and type-check**

Run: `yarn format && yarn build`
Expected: Succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/contents/dry-lab/model_methods.tsx
git commit -m "$(cat <<'EOF'
Move Model Methods body content into .page-container

Same treatment as the Model hub: MethodsHero renders full-bleed, the
rest of the page keeps its current width via an explicit wrapper.
EOF
)"
```

---

### Task 4: Wrap `model_discovery.tsx` body content in `.page-container`

**Files:**
- Modify: `src/contents/dry-lab/model_discovery.tsx:773-858` (the page component's `return` block)

**Interfaces:**
- Consumes: `fullWidth: true` from Task 1 (route `/model-discovery`).
- Produces: same shape as Task 2 — `DiscoveryTreeHero` full-bleed, everything else inside `.page-container`.

- [ ] **Step 1: Edit the return block**

Change (starting at line 773):

```tsx
  return (
    <>
      <DiscoveryTreeHero />

      <ModelNav active="discovery" />

      <TOC />

      <div className="page-start row mt-4">
        <div className="col-lg-12">
```

to:

```tsx
  return (
    <>
      <DiscoveryTreeHero />

      <div className="page-container">
        <ModelNav active="discovery" />

        <TOC />

        <div className="page-start row mt-4">
          <div className="col-lg-12">
```

And at the end of the block (around line 853-858), change:

```tsx
          {/* Bottom prev/next navigation (Methods ← Discovery → Engineering) */}
          <ModelPager active="discovery" />
        </div>
      </div>
    </>
  );
```

to:

```tsx
            {/* Bottom prev/next navigation (Methods ← Discovery → Engineering) */}
            <ModelPager active="discovery" />
          </div>
        </div>
      </div>
    </>
  );
```

Run `yarn format` to re-indent the content in between rather than doing it by hand.

- [ ] **Step 2: Reformat and type-check**

Run: `yarn format && yarn build`
Expected: Succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/contents/dry-lab/model_discovery.tsx
git commit -m "$(cat <<'EOF'
Move Model Discovery body content into .page-container

Same treatment as the Model hub: DiscoveryTreeHero renders full-bleed,
the rest of the page keeps its current width via an explicit wrapper.
EOF
)"
```

---

### Task 5: Wrap `model_engineering.tsx` body content in `.page-container`

**Files:**
- Modify: `src/contents/dry-lab/model_engineering.tsx:743-816` (the page component's `return` block)

**Interfaces:**
- Consumes: `fullWidth: true` from Task 1 (route `/model-engineering`).
- Produces: same shape as Task 2 — `EngineeringHero` full-bleed, everything else inside `.page-container`.

- [ ] **Step 1: Edit the return block**

Change (starting at line 743):

```tsx
  return (
    <>
      <EngineeringHero />

      <ModelNav active="engineering" />

      <TOC />

      <div className="page-start row mt-4">
        <div className="col-lg-12">
```

to:

```tsx
  return (
    <>
      <EngineeringHero />

      <div className="page-container">
        <ModelNav active="engineering" />

        <TOC />

        <div className="page-start row mt-4">
          <div className="col-lg-12">
```

And at the end of the block (around line 811-816), change:

```tsx
          {/* Bottom prev/next navigation (Discovery ← Engineering) */}
          <ModelPager active="engineering" />
        </div>
      </div>
    </>
  );
```

to:

```tsx
            {/* Bottom prev/next navigation (Discovery ← Engineering) */}
            <ModelPager active="engineering" />
          </div>
        </div>
      </div>
    </>
  );
```

Run `yarn format` to re-indent the content in between rather than doing it by hand.

- [ ] **Step 2: Reformat and type-check**

Run: `yarn format && yarn build`
Expected: Succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/contents/dry-lab/model_engineering.tsx
git commit -m "$(cat <<'EOF'
Move Model Engineering body content into .page-container

Same treatment as the Model hub: EngineeringHero renders full-bleed,
the rest of the page keeps its current width via an explicit wrapper.
EOF
)"
```

---

### Task 6: Visual verification across all four Model pages

**Files:**
- None (verification only — no code changes in this task).

**Interfaces:**
- Consumes: the running dev server (`yarn dev`, serves at `http://localhost:5173/dtu-denmark/`) and all four page changes from Tasks 1-5.
- Produces: confirmation that (a) each hero spans the full viewport width, (b) each page's nav pills / TOC / body sections are unchanged in width from before this plan, (c) no console errors, (d) `yarn lint` is clean.

- [ ] **Step 1: Start the dev server**

Run: `lsof -ti:5173 -sTCP:LISTEN | xargs -r kill` (free the port if a stale server is running), then `(yarn dev > /tmp/vite.log 2>&1 &)`, then poll: `timeout 30 bash -c 'until curl -sf http://localhost:5173/dtu-denmark/ >/dev/null; do sleep 1; done'`
Expected: curl succeeds within a few seconds; `/tmp/vite.log` shows `VITE ... ready`.

- [ ] **Step 2: Screenshot all four pages and measure hero width**

If Playwright isn't already installed from earlier in this session, install it in the scratchpad directory: `npm install playwright && npx playwright install chromium`.

Run this script (adjust the scratchpad path to the current session's):

```js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const routes = [
    ['model', '.mhero'],
    ['model-methods', '.mxh'],
    ['model-discovery', '.dtree'],
    ['model-engineering', '.ehero'],
  ];
  for (const [route, heroSelector] of routes) {
    await p.goto(`http://localhost:5173/dtu-denmark/${route}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    const heroRect = await p.evaluate(sel => document.querySelector(sel).getBoundingClientRect(), heroSelector);
    const navRect = await p.evaluate(() => document.querySelector('.mh-nav, .mp-wrap, .dtree, .me-grid')?.getBoundingClientRect() ?? null);
    const containerRect = await p.evaluate(() => document.querySelector('.page-container')?.getBoundingClientRect() ?? null);
    console.log(route, 'hero width:', heroRect.width, 'page-container width:', containerRect?.width);
    await p.screenshot({ path: `/tmp/${route}-fullwidth.png` });
  }
  await b.close();
})();
```

Expected output: for every route, `hero width` is `1280` (the full viewport — heroes have no `.page-container` ancestor anymore) and `page-container width` is noticeably smaller (≈`1280 * 0.85 * 0.80` ≈ 870, i.e. the same width the page-container produced before this plan — compare against a `git stash`'d before/after if in doubt).

- [ ] **Step 3: Look at the screenshots**

Read each of `/tmp/model-fullwidth.png`, `/tmp/model-methods-fullwidth.png`, `/tmp/model-discovery-fullwidth.png`, `/tmp/model-engineering-fullwidth.png`. Confirm: hero background/content now extends to both screen edges; nav pill bar, TOC, and section content below still sit in the same centered, padded column as before (compare against `/tmp/model.png`, `/tmp/model_methods.png`, `/tmp/model_discovery3.png`, `/tmp/model_engineering.png` from the earlier session pass, if still present).

- [ ] **Step 4: Check for console errors**

```js
// append to the script above, inside the loop, right after p.goto:
p.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR', route, msg.text()); });
```

Expected: no `CONSOLE ERROR` lines.

- [ ] **Step 5: Lint**

Run: `yarn lint`
Expected: no errors (`--max-warnings 0` is configured, so warnings fail too).

- [ ] **Step 6: Stop the dev server**

Run: `lsof -ti:5173 -sTCP:LISTEN | xargs -r kill`

- [ ] **Step 7: No commit for this task** — it's verification only. If any check fails, return to the relevant Task 1-5 and fix before proceeding.

---

## Self-Review Notes

- **Spec coverage:** Design doc's three changes — `pages.ts` routing (Task 1), the four page-component wrappers (Tasks 2-5), and "no CSS changes required" (verified — no task touches any `.css` file) — are all covered. The design doc's accepted visual consequence (hero text no longer lines up with body text below it) is exactly what Task 6 confirms rather than treats as a bug.
- **Placeholder scan:** No TBDs; every step names exact files, exact before/after code, and exact commands.
- **Type consistency:** All four page components use the identical wrapper pattern (`<Hero /> <div className="page-container"> ...existing content... </div>`), so there's nothing to reconcile across tasks — they don't share types or signatures, just a structural convention.
