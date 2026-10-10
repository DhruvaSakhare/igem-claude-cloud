# Project Section Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two reusable components (RevealCard, HighlightCard) for the Project section of the DTU Denmark iGEM wiki.

**Architecture:** Two standalone React components with a shared CSS file. RevealCard uses CSS 3D transforms for a flip animation. HighlightCard is a static display card with an optional react-router Link. Both integrate into existing Bootstrap grid layouts on Description and Results pages.

**Tech Stack:** React 19, TypeScript, Bootstrap 5, react-router-dom 7, CSS (no animation libraries)

## Global Constraints

- No external CDNs or npm animation libraries — CSS-only transitions
- Font: `"Outfit", sans-serif` (already loaded globally)
- Colours from `src/containers/App/App.css`: dark `#343a40`, light blue `#b0e6ff`, hero blue `#2092fb`, white `#ffffff`
- Images must use the iGEM uploads tool (not relevant here — SVG is inline)
- Do not modify `LICENSE` or `Footer` component

---

### Task 1: RevealCard Component + CSS

**Files:**

- Create: `src/components/RevealCard.tsx`
- Create: `src/components/ProjectComponents.css`

**Interfaces:**

- Consumes: nothing
- Produces: `RevealCard` component with props `{ question: string; answer: string; graphPlaceholder?: boolean }`

- [ ] **Step 1: Create the CSS file with RevealCard styles**

Create `src/components/ProjectComponents.css`:

```css
/* RevealCard */
.reveal-card {
  perspective: 1000px;
  height: 280px;
  cursor: pointer;
}

.reveal-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
}

.reveal-card.flipped .reveal-card-inner {
  transform: rotateY(180deg);
}

.reveal-card-front,
.reveal-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 0.5rem;
  background-color: #343a40;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.reveal-card-front {
  font-family: "Outfit", sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  text-align: center;
}

.reveal-card-back {
  transform: rotateY(180deg);
  font-family: "Outfit", sans-serif;
  text-align: center;
}

.reveal-card-back p {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.reveal-card-back svg {
  max-width: 200px;
  max-height: 120px;
}

.reveal-card-hint {
  position: absolute;
  bottom: 0.75rem;
  font-size: 0.8rem;
  opacity: 0.6;
}
```

- [ ] **Step 2: Create the RevealCard component**

Create `src/components/RevealCard.tsx`:

```tsx
import { useState } from "react";
import "./ProjectComponents.css";

interface RevealCardProps {
  question: string;
  answer: string;
  graphPlaceholder?: boolean;
}

function PlaceholderGraph() {
  return (
    <svg
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Placeholder bar chart showing upward trend"
    >
      <line x1="30" y1="10" x2="30" y2="100" stroke="#b0e6ff" strokeWidth="1" />
      <line
        x1="30"
        y1="100"
        x2="190"
        y2="100"
        stroke="#b0e6ff"
        strokeWidth="1"
      />
      <rect x="45" y="75" width="24" height="25" fill="#2092fb" rx="2" />
      <rect x="80" y="58" width="24" height="42" fill="#2092fb" rx="2" />
      <rect x="115" y="38" width="24" height="62" fill="#2092fb" rx="2" />
      <rect x="150" y="18" width="24" height="82" fill="#2092fb" rx="2" />
    </svg>
  );
}

export function RevealCard({
  question,
  answer,
  graphPlaceholder = true,
}: RevealCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`reveal-card${flipped ? " flipped" : ""}`}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={
        flipped
          ? `Answer: ${answer}. Click to show question.`
          : `${question} Click to reveal answer.`
      }
    >
      <div className="reveal-card-inner">
        <div className="reveal-card-front">
          <p>{question}</p>
          <span className="reveal-card-hint">Click to reveal</span>
        </div>
        <div className="reveal-card-back" aria-live="polite">
          <p>{answer}</p>
          {graphPlaceholder && <PlaceholderGraph />}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify RevealCard renders**

Run: `yarn dev`

Open the browser, temporarily import RevealCard in `src/contents/description.tsx` to test:

```tsx
import { RevealCard } from "../components/RevealCard";
```

Add inside the return:

```tsx
<div className="row mt-4">
  <div className="col-md-6">
    <RevealCard
      question="How many m² of landfill will turbine blades occupy in 20 years?"
      answer="Enough to cover 900 football fields"
    />
  </div>
</div>
```

Verify: card renders with dark background, white text, flips on click, shows placeholder graph on back.

- [ ] **Step 4: Commit**

```bash
git add src/components/RevealCard.tsx src/components/ProjectComponents.css
git commit -m "feat: add RevealCard flip component with placeholder graph"
```

---

### Task 2: HighlightCard Component

**Files:**

- Create: `src/components/HighlightCard.tsx`
- Modify: `src/components/ProjectComponents.css`

**Interfaces:**

- Consumes: nothing
- Produces: `HighlightCard` component with props `{ icon: string; title: string; summary: string; linkTo?: string; linkLabel?: string }`

- [ ] **Step 1: Add HighlightCard styles to ProjectComponents.css**

Append to `src/components/ProjectComponents.css`:

```css
/* HighlightCard */
.highlight-card {
  background-color: #ffffff;
  border-left: 4px solid #b0e6ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.highlight-card-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.highlight-card-title {
  font-family: "Outfit", sans-serif;
  font-weight: 700;
  font-size: 1.15rem;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.highlight-card-summary {
  color: #343a40;
  font-size: 0.95rem;
  flex: 1;
}

.highlight-card-link {
  color: #2092fb;
  font-weight: 600;
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;
}

.highlight-card-link:hover {
  text-decoration: underline;
}
```

- [ ] **Step 2: Create the HighlightCard component**

Create `src/components/HighlightCard.tsx`:

```tsx
import { Link } from "react-router-dom";
import "./ProjectComponents.css";

interface HighlightCardProps {
  icon: string;
  title: string;
  summary: string;
  linkTo?: string;
  linkLabel?: string;
}

export function HighlightCard({
  icon,
  title,
  summary,
  linkTo,
  linkLabel,
}: HighlightCardProps) {
  return (
    <div className="highlight-card">
      <div className="highlight-card-icon">{icon}</div>
      <div className="highlight-card-title">{title}</div>
      <div className="highlight-card-summary">{summary}</div>
      {linkTo && linkLabel && (
        <Link to={linkTo} className="highlight-card-link">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify HighlightCard renders**

Run: `yarn dev`

Temporarily import HighlightCard in `src/contents/results.tsx` to test:

```tsx
import { HighlightCard } from "../components/HighlightCard";
```

Add inside the return:

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

Verify: two cards side-by-side, white background, blue left border, link navigates to correct page.

- [ ] **Step 4: Commit**

```bash
git add src/components/HighlightCard.tsx src/components/ProjectComponents.css
git commit -m "feat: add HighlightCard component with optional router link"
```

---

### Task 3: Integrate Components into Project Pages

**Files:**

- Modify: `src/contents/description.tsx`
- Modify: `src/contents/results.tsx`

**Interfaces:**

- Consumes: `RevealCard` from `src/components/RevealCard.tsx`, `HighlightCard` from `src/components/HighlightCard.tsx`
- Produces: updated Description and Results pages with components integrated

- [ ] **Step 1: Add RevealCards to Description page**

Replace the contents of `src/contents/description.tsx` with:

```tsx
import { Inspirations, InspirationLink } from "../components/Inspirations";
import { RevealCard } from "../components/RevealCard";

export function Description() {
  const links: InspirationLink[] = [
    { year: 2025, teamName: "Heidelberg", pageName: "description" },
    { year: 2025, teamName: "McGill", pageName: "description" },
    { year: 2025, teamName: "IZJU-China", pageName: "description" },
    { year: 2025, teamName: "GreatBay-SCIE", pageName: "description" },
    { year: 2024, teamName: "Marburg", pageName: "description" },
    { year: 2024, teamName: "EPFL", pageName: "description" },
  ];

  return (
    <>
      <div className="row mt-4">
        <div className="col">
          <div className="bd-callout bd-callout-info">
            <h4>Bronze Medal Criterion #1: Wiki</h4>
            <p>Describe how and why you chose your iGEM project.</p>
            <hr />
            <p>
              Visit the{" "}
              <a href="https://competition.igem.org/judging/awards/medals">
                Medals page
              </a>{" "}
              for more information.
            </p>
          </div>
        </div>
      </div>

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

      <div className="row mt-4">
        <div className="col-lg-8">
          <h2>What Should this Page Contain?</h2>
          <hr />
          <ul>
            <li>
              Explain the problem your project addresses and its potential
              impact.
            </li>
            <li>
              Provide a clear and concise summary of your project's goals and
              objectives.
            </li>
            <li>
              Detail the specific reasons why your team chose this project.
            </li>
            <li>
              Explain the inspiration behind your project, including any prior
              research or real-world problems that motivated your team.
            </li>
            <li>
              Use illustrations, diagrams, and other visual aids to enhance
              understanding.
            </li>
            <li>
              Include relevant scientific background, technical details, and
              experimental approaches.
            </li>
          </ul>
        </div>
        <Inspirations inspirationLinkList={links} />
      </div>

      <div className="row mt-4">
        <div className="col-lg-8">
          <h2>Tips for Success</h2>
          <hr />
          <ul>
            <li>
              While providing detailed information, strive for clarity and
              conciseness.
            </li>
            <li>Use summaries and subheadings to organize your content.</li>
            <li>Utilize visuals to enhance understanding and engagement.</li>
            <li>Document your research process and sources thoroughly.</li>
          </ul>
        </div>
        <div className="col-lg-4">
          <h2>References</h2>
          <hr />
          <p>
            Cite all relevant research papers, scientific articles, and other
            sources that informed your project.
          </p>
          <p>
            Create a dedicated "References" section at the end of the page, and
            use a consistent citation style.
          </p>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add HighlightCards to Results page**

Replace the contents of `src/contents/results.tsx` with:

```tsx
import { Inspirations, InspirationLink } from "../components/Inspirations";
import { HighlightCard } from "../components/HighlightCard";

export function Results() {
  const links: InspirationLink[] = [
    { year: 2025, teamName: "Heidelberg", pageName: "results" },
    { year: 2025, teamName: "McGill", pageName: "results" },
    { year: 2025, teamName: "EPFL", pageName: "results" },
    { year: 2025, teamName: "Marburg", pageName: "results" },
    { year: 2025, teamName: "Munich", pageName: "results" },
    { year: 2025, teamName: "Freiburg", pageName: "results" },
  ];

  return (
    <>
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

      <div className="row mt-4">
        <div className="col-lg-8">
          <h2>What Should this Page Contain?</h2>
          <hr />
          <ul>
            <li>
              Clearly and objectively describe the results of your experiments
              and research.
            </li>
            <li>Use tables, graphs, and images to visualize your data.</li>
            <li>
              Discuss the implications of your findings in the context of your
              project goals.
            </li>
            <li>
              Highlight any trends, patterns, or significant observations.
            </li>
            <li>
              Include an analysis summary section to synthesize your findings
              and discuss their overall significance.
            </li>
            <li>
              Outline your future plans for the project, including potential
              applications, further research, and development.
            </li>
            <li>
              Explain what went wrong and what you learned from these
              experiences.
            </li>
            <li>Discuss potential improvements or alternative approaches.</li>
            <li>
              Emphasize the importance of scientific honesty and transparency.
            </li>
          </ul>
        </div>
        <Inspirations inspirationLinkList={links} />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Visual verification**

Run: `yarn dev`

Check both pages in the browser:

- `/description` — two RevealCards appear below the callout, flip on click, show graph placeholder
- `/results` — two HighlightCards at top, links navigate to `/experiments` and `/model`
- Both pages render without console errors
- Cards are responsive (check at mobile width)

- [ ] **Step 4: Commit**

```bash
git add src/contents/description.tsx src/contents/results.tsx
git commit -m "feat: integrate RevealCard and HighlightCard into project pages"
```
