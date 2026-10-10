# Project Section Components Design

Two reusable components for the Project section of the DTU Denmark iGEM 2026 wiki.

## Context

The Project section sits between the emotional/visual homepage and the dense Dry/Wet Lab sections. It should feel scientific but engaging — sober layout with 1-2 moments of interactivity. The homepage already handles the emotional hook with a visual timeline; these components support the "scientific hook" role of the project pages.

**Pages served:** Description, Engineering, Results, Contribution.

**Stack:** React + Bootstrap (no component library or animation library).

**Colour palette** (from `src/containers/App/App.css`):

- Dark: `#343a40`
- Light blue: `#b0e6ff`
- Hero blue: `#2092fb`
- Bright blue: `#374D82`
- Orange accent: `#f0ad4e`
- White: `#ffffff`

---

## Component 1: RevealCard

**Purpose:** Clickable card that poses a question on the front and flips to reveal the answer (with a placeholder SVG graph) on the back. Primary use: Description page — engaging the reader with "did you know" style facts about wind turbine blade waste.

**File:** `src/components/RevealCard.tsx`

### Props

| Prop               | Type      | Required            | Description                              |
| ------------------ | --------- | ------------------- | ---------------------------------------- |
| `question`         | `string`  | yes                 | Text shown on the front face             |
| `answer`           | `string`  | yes                 | Text shown on the back face              |
| `graphPlaceholder` | `boolean` | no (default `true`) | Show a placeholder SVG chart on the back |

### Visual Design

- **Front face:** Dark background (`#343a40`), white text, centered. Question text in `Outfit` font.
- **Back face:** Dark background (`#343a40`), white text at top, placeholder SVG bar/line chart below.
- **Fixed height:** ~280px so the flip looks clean.
- **Responsive width:** Uses Bootstrap grid (`col-md-6`, `col-lg-4`).
- **Border-radius:** 0.5rem, subtle box-shadow.

### Interaction

- **Flip animation:** CSS 3D `rotateY(180deg)` transform, ~0.6s ease transition. CSS-only, no JS animation library.
- **Trigger:** Click or tap anywhere on the card.
- **Keyboard:** `tabIndex={0}`, flip on `Enter` or `Space`.
- **Accessibility:** `role="button"`, `aria-label` describing the interaction, `aria-live="polite"` region for the revealed answer.
- **Toggle:** Clicking again flips back to the question.

### Placeholder SVG

A simple bar chart SVG embedded directly in the component — 4-5 bars showing an upward trend (representing increasing blade waste). Styled with palette colours (`#2092fb` bars, `#b0e6ff` axis). This is a placeholder; the team will replace it with a real graphic later.

---

## Component 2: HighlightCard

**Purpose:** Static card for showcasing key findings on the Results page. Clean, scannable, with an optional link to the detailed Dry/Wet Lab page.

**File:** `src/components/HighlightCard.tsx`

### Props

| Prop        | Type     | Required | Description                                 |
| ----------- | -------- | -------- | ------------------------------------------- |
| `icon`      | `string` | yes      | Emoji or short text for the card header     |
| `title`     | `string` | yes      | Finding title                               |
| `summary`   | `string` | yes      | 1-2 sentence summary                        |
| `linkTo`    | `string` | no       | Path to detailed page (e.g. `/experiments`) |
| `linkLabel` | `string` | no       | Link text (e.g. "See full protocol")        |

### Visual Design

- **Background:** White (`#ffffff`).
- **Left border accent:** 4px solid `#b0e6ff` (light blue).
- **Icon:** Large emoji/text at top, ~2rem.
- **Title:** `Outfit` font, dark text, bold.
- **Summary:** Regular weight, dark text.
- **Link:** Bottom of card, `#2092fb` (hero blue), with arrow indicator.
- **Border-radius:** 0.5rem, subtle box-shadow matching RevealCard.
- **Grid:** Designed for `col-md-6` — two cards side by side (one wet lab, one dry lab).

### Accessibility

- Card itself is not interactive (static content).
- Link is a standard `<a>` tag with descriptive text.

---

## Example Usage

### Description page — RevealCard

```tsx
<div className="row mt-4">
  <div className="col-md-6">
    <RevealCard
      question="How many m² of landfill will turbine blades occupy in 20 years?"
      answer="Enough to cover 900 football fields"
    />
  </div>
  <div className="col-md-6">
    <RevealCard
      question="What percentage of a wind turbine blade can currently be recycled?"
      answer="Less than 30% with conventional methods"
    />
  </div>
</div>
```

### Results page — HighlightCard

```tsx
<div className="row mt-4">
  <div className="col-md-6">
    <HighlightCard
      icon="🧬"
      title="Enzyme Activity"
      summary="PETase variant showed 3x improved degradation rate at 37°C"
      linkTo="/experiments"
      linkLabel="See full protocol"
    />
  </div>
  <div className="col-md-6">
    <HighlightCard
      icon="📊"
      title="Degradation Model"
      summary="Kinetic model predicts 80% mass reduction within 48h under optimised conditions"
      linkTo="/model"
      linkLabel="See model details"
    />
  </div>
</div>
```

---

## Styling Approach

All styles defined in a single CSS file: `src/components/ProjectComponents.css`, imported by both components. No CSS-in-JS, consistent with the existing codebase pattern (`App.css`).

## Out of Scope

- Animated counters, scroll-triggered animations, parallax
- Collapsible/accordion sections (may add later for Engineering)
- Section navigation sidebar
- Real data or graphics (placeholder content only)
