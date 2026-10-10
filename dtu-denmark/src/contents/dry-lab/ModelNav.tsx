import { Link } from "react-router-dom";

import "./ModelNav.css";

export type ModelPageKey =
  | "overview"
  | "methods"
  | "discovery"
  | "engineering"
  | "software";

/* The four Model pages, in reading order. Single source of truth: the TOC
 * renders these as its top level (see components/TOC.tsx) and ModelPager below
 * derives prev/next from the same order.
 *
 * There used to be a sticky page-switcher bar (ModelNav, .mnav-*) pinned under
 * the site navbar. It was removed: it duplicated the TOC and, being fixed, cost
 * 14% of the viewport height on a landscape phone. */
export const MODEL_PAGES: { to: string; label: string; key: ModelPageKey }[] = [
  { to: "/model", label: "Overview", key: "overview" },
  { to: "/model-methods", label: "Methods", key: "methods" },
  { to: "/model-discovery", label: "Discovery", key: "discovery" },
  { to: "/model-engineering", label: "Engineering", key: "engineering" },
  // The Software page sits in this section in pages.ts, so it belongs in the
  // section's own navigation too -- otherwise a reader on Engineering has no
  // way to reach it except the top navbar.
  { to: "/software", label: "Software", key: "software" },
];

/* ModelPager — bottom-of-page prev/next navigation shared by the four Model
 * pages. Reuses the MODEL_PAGES ordering above, so the Overview page shows only
 * "Next", the Engineering page only "Previous", and the two middle pages show
 * both. Styling is in ModelNav.css (.mpager-*); the arrow bobs continuously
 * (gated by prefers-reduced-motion) and the card lifts on hover, echoing the
 * other Model-page animations. */
export function ModelPager({ active }: { active: ModelPageKey }) {
  const idx = MODEL_PAGES.findIndex((l) => l.key === active);
  const prev = idx > 0 ? MODEL_PAGES[idx - 1] : null;
  const next =
    idx >= 0 && idx < MODEL_PAGES.length - 1 ? MODEL_PAGES[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="mpager" aria-label="Previous and next model pages">
      {prev ? (
        <Link to={prev.to} className="mpager-link prev">
          <span className="mpager-arrow" aria-hidden="true">
            &larr;
          </span>
          <span className="mpager-text">
            <span className="mpager-dir">Previous</span>
            <span className="mpager-label">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span className="mpager-spacer" aria-hidden="true" />
      )}

      {next ? (
        <Link to={next.to} className="mpager-link next">
          <span className="mpager-text">
            <span className="mpager-dir">Next</span>
            <span className="mpager-label">{next.label}</span>
          </span>
          <span className="mpager-arrow" aria-hidden="true">
            &rarr;
          </span>
        </Link>
      ) : (
        <span className="mpager-spacer" aria-hidden="true" />
      )}
    </nav>
  );
}
