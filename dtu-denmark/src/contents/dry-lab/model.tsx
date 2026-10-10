import { useEffect, useState } from "react";

import { MODEL_PAGES, ModelPager } from "./ModelNav";
import TOC from "../../components/TOC";
import { TextBox } from "../../components/TextBox";
import { PageTitle } from "./SectionHeading";
import "./model.css";

/* Renders behind the two sides of the UPO/laccase split panel, hosted on
 * iGEM's static server. */
const upoImg =
  "https://static.igem.wiki/teams/6060/wiki/drylab/upo-pymol/upo-overview-page.avif";
const laccaseImg =
  "https://static.igem.wiki/teams/6060/wiki/drylab/laccase-pymol/laccase-overview-page.avif";

/* ========================================================================== *
 *  Model hub  (Dry Lab → Model, route /model)
 *
 *  This page is the overview + entry point: the overview text and the
 *  UPO/laccase split panel. The detail pages, each its own file, are reached
 *  from the TOC and the pager at the bottom:
 *     • Methods      → model_methods.tsx     (route /model-methods)
 *     • Discovery    → model_discovery.tsx   (route /model-discovery)
 *     • Engineering  → model_engineering.tsx (route /model-engineering)
 *
 *  All styling lives in model.css (imported above); each widget's rules stay
 *  namespaced by a class prefix (.st-*). Navigation between
 *  the four model pages lives in the TOC (components/TOC.tsx), which lists them
 *  from MODEL_PAGES in ModelNav.tsx.
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  EnzymeSplitToggle — UPOs vs Laccases split panel                           */
/* -------------------------------------------------------------------------- */

/**
 * UPOs-vs-Laccases split panels for the Overview.
 *
 * The project runs two parallel enzyme tracks; EnzymeSplitToggle puts them
 * literally side by side and lets the reader focus one at a time. Laccases sit
 * on the left and are focused by default. A button — parked over the collapsed (non-focused) side —
 * flips the focus: the focused side takes most of the width and shows its full
 * detail, while the other side collapses and its information is hidden.
 *
 * Each side carries a faint background figure that brightens as that side gains
 * focus (the team's PyMOL renders of a laccase and a UPO). The track intros are honest, generic descriptions of the two
 * enzyme families; the per-track bullet points are clearly-marked placeholders
 * — no fabricated results. Styles namespaced under `.st-*` in model.css.
 */
type SplitSide = {
  key: "upo" | "laccase";
  name: string;
  full: string;
  color: string;
  img: string;
  intro: string;
  points: string[];
};

const SPLIT_SIDES: SplitSide[] = [
  {
    key: "laccase",
    name: "Laccases",
    full: "Multi-copper oxidases",
    color: "#57caff", // the tables' bright blue (--color-brightblue)
    img: laccaseImg,
    intro:
      "Copper-containing oxidases that couple substrate oxidation to the reduction of molecular oxygen to water.",
    points: [
      "Placeholder: why laccases are a promising route to degrading the target.",
      "Placeholder: the candidate laccases this track starts from.",
      "Placeholder: the main engineering challenge for the laccase track.",
    ],
  },
  {
    key: "upo",
    name: "UPOs",
    full: "Unspecific peroxygenases",
    color: "#ff6a14", // the site orange (--color-orange)
    img: upoImg,
    intro:
      "Heme-thiolate enzymes that use hydrogen peroxide to oxidise a broad range of substrates.",
    points: [
      "Placeholder: why UPOs are a promising route to degrading the target.",
      "Placeholder: the baseline UPO variants this track starts from.",
      "Placeholder: the main engineering challenge for the UPO track.",
    ],
  },
];

/**
 * EnzymeSplitToggle — the two enzyme tracks side by side, in SPLIT_SIDES order
 * (first entry on the left, focused by default — Laccases). The switch button
 * is parked over the collapsed (non-focused) side; clicking it flips the focus
 * — the newly focused side slides open to take most of the width and reveals
 * its full detail, while the other side collapses and its information is
 * hidden. The focused side's background figure brightens.
 */
function EnzymeSplitToggle() {
  const [left, right] = SPLIT_SIDES;
  const [focusLeft, setFocusLeft] = useState(true); // left side by default
  // Focused side takes most of the width; the other collapses.
  const leftFrac = focusLeft ? 0.72 : 0.28;
  // Park the switch button over the collapsed (non-focused) side's area.
  const buttonLeft = focusLeft ? leftFrac + (1 - leftFrac) / 2 : leftFrac / 2;
  const other = focusLeft ? right : left;
  const current = focusLeft ? left : right;

  const panel = (side: SplitSide, isLeft: boolean) => (
    <section
      className={`st-panel st-${side.key}${isLeft === focusLeft ? " active" : ""}`}
      style={{ flexBasis: `${(isLeft ? leftFrac : 1 - leftFrac) * 100}%` }}
    >
      <img
        className={`st-bg ${isLeft ? "st-bg-left" : "st-bg-right"}`}
        src={side.img}
        alt=""
        aria-hidden="true"
      />
      <div className={`st-content${isLeft ? "" : " st-content-right"}`}>
        <span className="st-eyebrow" style={{ color: side.color }}>
          <span className="st-dot" style={{ background: side.color }} />
          {side.full}
        </span>
        <h4 className="st-name">{side.name}</h4>
        <p className="st-intro">{side.intro}</p>
        <ul className="st-points">
          {side.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );

  return (
    <div className="st">
      <div className={`st-wrap st-focus-${current.key}`}>
        {panel(left, true)}
        {panel(right, false)}

        <button
          type="button"
          className={`st-switch st-switch-${other.key}`}
          style={{ left: `${buttonLeft * 100}%` }}
          onClick={() => setFocusLeft((f) => !f)}
        >
          <span className="st-switch-icon" aria-hidden="true">
            ⇄
          </span>
          Focus {other.name}
        </button>
      </div>
      <p className="st-hint">
        Currently focusing <strong>{current.name}</strong>: press the button to
        switch.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page — the hub itself                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Model — the hub page: the overview text and the UPO/laccase split panel.
 * Prose is placeholder text; fill it in once there's real modelling work
 * to describe (no fabricated science).
 */
export function Model() {
  // Paint the whole page the site's constant light blue while this page is
  // mounted (matches the page-header banner). Removed again on unmount so other
  // routes keep their normal white background.
  useEffect(() => {
    document.body.classList.add("model-bg");
    return () => document.body.classList.remove("model-bg");
  }, []);

  return (
    <>
      <div className="page-container">
        <TOC pages={MODEL_PAGES} activeKey="overview" />

        <PageTitle title="Overview" />

        <div className="page-start row mt-4">
          <div className="col-lg-12">
            <section id="overview">
              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  {/* PLACEHOLDER — replace with the real overview once written. */}
                  Placeholder overview text. Briefly explain what the modelling
                  work sets out to do, why it matters for the project, and where
                  to go next.
                </p>
              </TextBox>

              {/* UPOs vs Laccases split panel */}
              <EnzymeSplitToggle />
            </section>

            {/* Bottom prev/next navigation (Overview → Methods) */}
            <ModelPager active="overview" />
          </div>
        </div>
      </div>
    </>
  );
}
