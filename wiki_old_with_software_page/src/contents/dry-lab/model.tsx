import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { MODEL_PAGES, ModelPager } from "./ModelNav";
import TOC from "../../components/TOC";
import { SectionHeading } from "./SectionHeading";
import "./model.css";

/* Figures are served from public/ (the files live there, copied from the wiki/
 * folder one level above the repo). Public assets are served at the site base
 * path, so we build each URL from import.meta.env.BASE_URL (resolves to the
 * team slug, e.g. "/dtu-denmark/"). NOTE: these are for local preview — for the
 * deployed wiki the images should be uploaded via the iGEM tool and these paths
 * swapped for the iGEM URLs. */
const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const surfaceImg = asset("Pada_1_Surface.png");
const pocketNnbtImg = asset("Pada_1_only_Pocket_NNBT_no_HEME.png");

/* ========================================================================== *
 *  Model hub  (Dry Lab → Model, route /model)
 *
 *  This page is the overview + entry point. It shows the project's purpose
 *  (flowcharts + the UPO/laccase split) and then three cards that lead to the
 *  detail pages, each its own file:
 *     • Methods      → model_methods.tsx     (route /model-methods)
 *     • Discovery    → model_discovery.tsx   (route /model-discovery)
 *     • Engineering  → model_engineering.tsx (route /model-engineering)
 *
 *  All styling lives in model.css (imported above); each widget's rules stay
 *  namespaced by a class prefix (.pf-*, .def-*, .st-*, .mh-*). Navigation between
 *  the four model pages lives in the TOC (components/TOC.tsx), which lists them
 *  from MODEL_PAGES in ModelNav.tsx.
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  ProjectOverviewFlowchart — branching diagram of the project's purpose      */
/* -------------------------------------------------------------------------- */

/**
 * ProjectOverviewFlowchart — simple branching diagram of the project's purpose.
 *
 * Reads top-down: shared methods (enzyme discovery → engineering) feed two
 * parallel enzyme tracks (Laccases / UPOs) that both converge on the goal of
 * degrading NNBT. Static + hover (no scroll animation) for a calm overview.
 * Styles namespaced under `.pf-*` in model.css.
 */
function ProjectOverviewFlowchart() {
  return (
    <div className="pf">
      {/* Shared methods feed both tracks */}
      <div className="pf-shared">
        <span className="pf-shared-label">Shared methods</span>
        <div className="pf-shared-row">
          <div className="pf-node">Enzyme discovery</div>
          <span className="pf-arrow">&rarr;</span>
          <div className="pf-node">Enzyme engineering</div>
        </div>
      </div>

      <div className="pf-vline" />
      <div className="pf-branch" aria-hidden="true" />

      {/* Two parallel enzyme tracks */}
      <div className="pf-tracks">
        <div className="pf-track">
          <div className="pf-node">
            <span className="pf-dot laccase" aria-hidden="true" />
            Laccases
          </div>
        </div>
        <div className="pf-track">
          <div className="pf-node">
            <span className="pf-dot upo" aria-hidden="true" />
            UPOs
          </div>
        </div>
      </div>

      <div className="pf-branch down" aria-hidden="true" />
      <div className="pf-vline" />

      {/* Shared goal */}
      <div className="pf-goal">
        <div className="pf-node">Degrade NNBT</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ProjectOverviewFlowchartV2 — enhanced animated version of the branching     */
/*  diagram (kept alongside the original; toggled by USE_V2_FLOWCHART below).   */
/* -------------------------------------------------------------------------- */

/**
 * ProjectOverviewFlowchartV2 — the same story as ProjectOverviewFlowchart
 * (shared methods → the two enzyme tracks → the shared goal), redrawn as one
 * SVG so the connectors can carry a continuous "flow" (marching dashes) and the
 * nodes pop in when the diagram scrolls into view. Purely presentational; it
 * makes no new claims. Styles namespaced under `.pf2-*`.
 *
 * This is an ADD-ON: the original ProjectOverviewFlowchart is left intact as a
 * backup. Flip USE_V2_FLOWCHART (near the page component) to switch back.
 */
function ProjectOverviewFlowchartV2() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        setInView((prev) => {
          if (ratio >= 0.3) return true;
          if (ratio <= 0.05) return false;
          return prev;
        });
      },
      { threshold: [0, 0.05, 0.3, 1], rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`pf2${inView ? " in" : ""}`} ref={ref}>
      <svg
        viewBox="0 0 600 470"
        className="pf2-svg"
        role="img"
        aria-label="Project overview: shared discovery and engineering methods feed the laccase and UPO tracks, which both aim to degrade NNBT."
      >
        <defs>
          <linearGradient id="pf2-goal-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4a63c" />
            <stop offset="1" stopColor="#e8912e" />
          </linearGradient>
        </defs>

        {/* connectors (behind the nodes) with a continuous downward flow */}
        <g className="pf2-lines">
          <path className="pf2-line" d="M300 116 V150" />
          <path className="pf2-line" d="M300 150 C300 182 203 176 203 210" />
          <path className="pf2-line" d="M300 150 C300 182 397 176 397 210" />
          <path className="pf2-line" d="M203 276 C203 308 300 302 300 332" />
          <path className="pf2-line" d="M397 276 C397 308 300 302 300 332" />
          <path className="pf2-line" d="M300 332 V360" />
        </g>

        {/* shared-methods container */}
        <g className="pf2-shared">
          <rect x="90" y="18" width="420" height="98" rx="16" />
          <text className="pf2-kicker-t" x="300" y="37">
            SHARED METHODS
          </text>
        </g>

        {/* shared inner nodes */}
        <g
          className="pf2-node-g"
          style={{ transitionDelay: inView ? "0s" : "0s" }}
        >
          <rect
            className="pf2-rect"
            x="112"
            y="52"
            width="182"
            height="48"
            rx="12"
          />
          <text className="pf2-label-t" x="203" y="77">
            Enzyme discovery
          </text>
        </g>
        <text className="pf2-arrow-t" x="300" y="78">
          →
        </text>
        <g
          className="pf2-node-g"
          style={{ transitionDelay: inView ? "0.12s" : "0s" }}
        >
          <rect
            className="pf2-rect"
            x="306"
            y="52"
            width="192"
            height="48"
            rx="12"
          />
          <text className="pf2-label-t" x="402" y="77">
            Enzyme engineering
          </text>
        </g>

        {/* two parallel tracks */}
        <g
          className="pf2-node-g"
          style={{ transitionDelay: inView ? "0.3s" : "0s" }}
        >
          <rect
            className="pf2-rect"
            x="118"
            y="210"
            width="170"
            height="66"
            rx="14"
          />
          <circle className="pf2-dot-c laccase" cx="150" cy="243" r="7" />
          <text className="pf2-track-t" x="168" y="245">
            Laccases
          </text>
        </g>
        <g
          className="pf2-node-g"
          style={{ transitionDelay: inView ? "0.42s" : "0s" }}
        >
          <rect
            className="pf2-rect"
            x="312"
            y="210"
            width="170"
            height="66"
            rx="14"
          />
          <circle className="pf2-dot-c upo" cx="344" cy="243" r="7" />
          <text className="pf2-track-t" x="362" y="245">
            UPOs
          </text>
        </g>

        {/* shared goal */}
        <g
          className="pf2-node-g"
          style={{ transitionDelay: inView ? "0.6s" : "0s" }}
        >
          <rect
            className="pf2-rect pf2-rect--goal"
            x="205"
            y="360"
            width="190"
            height="68"
            rx="16"
          />
          <text className="pf2-goal-t" x="300" y="396">
            Degrade NNBT
          </text>
        </g>
      </svg>
    </div>
  );
}

/** Toggle for the overview flowchart: `true` shows the enhanced animated V2,
 *  `false` reverts to the original simple ProjectOverviewFlowchart. Both
 *  components stay in this file so switching back is a one-line change. */
const USE_V2_FLOWCHART = true;

/* -------------------------------------------------------------------------- */
/*  EnzymePipelines — the two shared-method pipelines (discovery | engineering) */
/* -------------------------------------------------------------------------- */

/**
 * EnzymePipelines — the two shared-method pipelines (enzyme discovery → enzyme
 * engineering) shown under Overview beneath the branching diagram.
 *
 * Presented as TWO side-by-side columns (discovery | engineering) in the same
 * simple cream-box style as flowchart.png: each column is a vertical chain of
 * labelled boxes that fade/slide up as they scroll into view (per-node
 * IntersectionObserver), joined by down-arrows. Each column header is an
 * emphasised "phase" box carrying a one-line explanation.
 *
 * The phase explanations are short honest summaries; the individual stage boxes
 * are PLACEHOLDER labels — rename them to the team's real stages (no fabricated
 * methods/results). Styles namespaced under `.def-*` in model.css.
 */
type Pipeline = { title: string; note: string; steps: string[] };

const ENZYME_PIPELINES: Pipeline[] = [
  {
    title: "Enzyme discovery",
    note: "Find & characterise candidate laccases and UPOs that could act on the target.",
    steps: ["Source candidates", "Shortlist", "Characterise"],
  },
  {
    title: "Enzyme engineering",
    note: "Redesign the best candidates to boost activity, stability and specificity toward NNBT.",
    steps: ["Design", "Model", "Validate"],
  },
];

// Flatten to indexed boxes so each box has one global index for scroll-reveal.
type FlowBox = {
  idx: number;
  col: number;
  label: string;
  note?: string;
  phase?: boolean;
  lastInCol: boolean;
};
const FLOW_BOXES: FlowBox[] = (() => {
  const boxes: FlowBox[] = [];
  let idx = 0;
  ENZYME_PIPELINES.forEach((p, col) => {
    boxes.push({
      idx: idx++,
      col,
      label: p.title,
      note: p.note,
      phase: true,
      lastInCol: p.steps.length === 0,
    });
    p.steps.forEach((s, si) => {
      boxes.push({
        idx: idx++,
        col,
        label: s,
        lastInCol: si === p.steps.length - 1,
      });
    });
  });
  return boxes;
})();

function EnzymePipelines() {
  const [visible, setVisible] = useState<boolean[]>(() =>
    FLOW_BOXES.map(() => false),
  );
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Each box reveals itself as it scrolls into the middle of the viewport
  // (per-node IntersectionObserver) — same mechanism as the ModelFlowchart
  // vertical workflow in the project's reference file.
  useEffect(() => {
    const observers = nodeRefs.current.map((node, index) => {
      if (!node) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          const ratio = entry.intersectionRatio;
          setVisible((prev) => {
            // Hysteresis: reveal once well in view (>= 0.5), hide only once well
            // out (<= 0.12). The dead zone in between keeps the state stable, so
            // items don't flicker when you pause scrolling near a threshold.
            let target = prev[index];
            if (ratio >= 0.5) target = true;
            else if (ratio <= 0.12) target = false;
            if (prev[index] === target) return prev;
            const next = [...prev];
            next[index] = target;
            return next;
          });
        },
        { threshold: [0, 0.12, 0.5, 1], rootMargin: "0px 0px -10% 0px" },
      );
      observer.observe(node);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="def">
      <div className="def-cols">
        {ENZYME_PIPELINES.map((pipeline, col) => (
          <div className="def-col" key={pipeline.title}>
            {FLOW_BOXES.filter((b) => b.col === col).map((b) => (
              <Fragment key={b.label}>
                <div
                  ref={(el) => {
                    nodeRefs.current[b.idx] = el;
                  }}
                  className={`def-node${b.phase ? " phase" : ""}${
                    visible[b.idx] ? " visible" : ""
                  }`}
                >
                  <span className="def-label">{b.label}</span>
                  {b.note && <span className="def-note">{b.note}</span>}
                </div>
                {!b.lastInCol && (
                  <div className="def-spacer">
                    <span
                      className={`def-arrow${visible[b.idx] ? " visible" : ""}`}
                    >
                      &darr;
                    </span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EnzymeSplitToggle — UPOs vs Laccases split panel                           */
/* -------------------------------------------------------------------------- */

/**
 * UPOs-vs-Laccases split panels for the Overview.
 *
 * The project runs two parallel enzyme tracks; EnzymeSplitToggle puts them
 * literally side by side and lets the reader focus one at a time. UPOs are
 * focused by default. A button — parked over the collapsed (non-focused) side —
 * flips the focus: the focused side takes most of the width and shows its full
 * detail, while the other side collapses and its information is hidden.
 *
 * Each side carries a faint background figure that brightens as that side gains
 * focus (reusing existing renders as placeholders — swap for real UPO / laccase
 * figures later). The track intros are honest, generic descriptions of the two
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
    key: "upo",
    name: "UPOs",
    full: "Unspecific peroxygenases",
    color: "#4a6fd0",
    img: surfaceImg,
    intro:
      "Heme-thiolate enzymes that use hydrogen peroxide to oxidise a broad range of substrates.",
    points: [
      "Placeholder: why UPOs are a promising route to degrading the target.",
      "Placeholder: the baseline UPO variants this track starts from.",
      "Placeholder: the main engineering challenge for the UPO track.",
    ],
  },
  {
    key: "laccase",
    name: "Laccases",
    full: "Multi-copper oxidases",
    color: "#2e9e6b",
    img: pocketNnbtImg,
    intro:
      "Copper-containing oxidases that couple substrate oxidation to the reduction of molecular oxygen to water.",
    points: [
      "Placeholder: why laccases are a promising route to degrading the target.",
      "Placeholder: the candidate laccases this track starts from.",
      "Placeholder: the main engineering challenge for the laccase track.",
    ],
  },
];

/**
 * EnzymeSplitToggle — the two enzyme tracks side by side. UPOs are focused by
 * default. The switch button is parked over the collapsed (non-focused) side;
 * clicking it flips the focus — the newly focused side slides open to take most
 * of the width and reveals its full detail, while the other side collapses and
 * its information is hidden. The focused side's background figure brightens.
 */
function EnzymeSplitToggle() {
  const [upo, laccase] = SPLIT_SIDES;
  const [focus, setFocus] = useState<"upo" | "laccase">("upo"); // UPOs by default
  const focusLeft = focus === "upo";
  // Focused side takes most of the width; the other collapses.
  const leftFrac = focusLeft ? 0.72 : 0.28;
  // Park the switch button over the collapsed (non-focused) side's area.
  const buttonLeft = focusLeft ? leftFrac + (1 - leftFrac) / 2 : leftFrac / 2;
  const other = focusLeft ? laccase : upo;
  const current = focusLeft ? upo : laccase;

  return (
    <div className="st">
      <div className="st-wrap">
        <section
          className={`st-panel st-upo${focusLeft ? " active" : ""}`}
          style={{ flexBasis: `${leftFrac * 100}%` }}
        >
          <img
            className="st-bg st-bg-left"
            src={upo.img}
            alt=""
            aria-hidden="true"
          />
          <div className="st-content">
            <span className="st-eyebrow" style={{ color: upo.color }}>
              <span className="st-dot" style={{ background: upo.color }} />
              {upo.full}
            </span>
            <h4 className="st-name">{upo.name}</h4>
            <p className="st-intro">{upo.intro}</p>
            <ul className="st-points">
              {upo.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className={`st-panel st-laccase${focusLeft ? "" : " active"}`}
          style={{ flexBasis: `${(1 - leftFrac) * 100}%` }}
        >
          <img
            className="st-bg st-bg-right"
            src={laccase.img}
            alt=""
            aria-hidden="true"
          />
          <div className="st-content st-content-right">
            <span className="st-eyebrow" style={{ color: laccase.color }}>
              <span className="st-dot" style={{ background: laccase.color }} />
              {laccase.full}
            </span>
            <h4 className="st-name">{laccase.name}</h4>
            <p className="st-intro">{laccase.intro}</p>
            <ul className="st-points">
              {laccase.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </section>

        <button
          type="button"
          className="st-switch"
          style={{ left: `${buttonLeft * 100}%` }}
          onClick={() => setFocus((f) => (f === "upo" ? "laccase" : "upo"))}
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

/** Cards that lead from the hub to each detail page. */
const MODEL_SECTIONS = [
  {
    path: "/model-methods",
    icon: "🧪",
    title: "Methods",
    desc: "The computational methods behind the project: pocket detection, docking, molecular dynamics, sequence search and the enzyme-design pipeline.",
  },
  {
    path: "/model-discovery",
    icon: "🔬",
    title: "Discovery",
    desc: "Enzyme-discovery results: mapping the Pada1 pocket, docking the NNBT substrate and the molecular-dynamics walk-through.",
  },
  {
    path: "/model-engineering",
    icon: "🛠️",
    title: "Engineering",
    desc: "Enzyme-engineering results: designed variants and how they were evaluated (coming soon).",
  },
];

/**
 * Model — the hub page. Overview widgets, then the nav cards to the detail
 * pages. Prose is placeholder text; fill it in once there's real modelling work
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

        <div className="page-start row mt-4">
          <div className="col-lg-12">
            <section id="overview">
              <SectionHeading title="Overview" />
              <p style={{ color: "#123a52" }}>
                {/* PLACEHOLDER — replace with the real overview once written. */}
                Placeholder overview text. Briefly explain what the modelling
                work sets out to do, why it matters for the project, and where
                to go next.
              </p>

              {/* Branching diagram of the project's overall purpose. V2 is the
                enhanced animated version; flip USE_V2_FLOWCHART to false to use
                the original simple one (still defined above as a backup). */}
              {USE_V2_FLOWCHART ? (
                <ProjectOverviewFlowchartV2 />
              ) : (
                <ProjectOverviewFlowchart />
              )}

              {/* Brief explanation of the two shared pipelines (figures sit behind
                the columns as a faint backdrop — see EnzymePipelines) */}
              <EnzymePipelines />
            </section>

            {/* UPOs vs Laccases split panel */}
            <section id="two-tracks" className="mt-5">
              <SectionHeading title="Two tracks" />
              <p
                style={{
                  color: "#123a52",
                  maxWidth: "70ch",
                  margin: "0 0 1.75rem",
                }}
              >
                {/* PLACEHOLDER — one line framing the UPO vs laccase comparison. */}
                Placeholder: the project pursues two enzyme families in
                parallel. Bring either side into focus to see how that track is
                approached.
              </p>

              <EnzymeSplitToggle />
            </section>

            {/* Nav cards to the detail pages */}
            <section id="exploration" className="mt-5">
              <SectionHeading title="Exploration" />
              <p
                style={{
                  color: "#123a52",
                  maxWidth: 720,
                  margin: "0 0 0.5rem",
                }}
              >
                The model is split across three pages: open any of them below.
              </p>
              <nav className="mh-nav">
                {MODEL_SECTIONS.map((s) => (
                  <Link key={s.path} to={s.path} className="mh-card">
                    <span className="mh-icon" aria-hidden="true">
                      {s.icon}
                    </span>
                    <h4 className="mh-title">{s.title}</h4>
                    <p className="mh-desc">{s.desc}</p>
                    <span className="mh-go">Open {s.title} &rarr;</span>
                  </Link>
                ))}
              </nav>
            </section>

            {/* Bottom prev/next navigation (Overview → Methods) */}
            <ModelPager active="overview" />
          </div>
        </div>
      </div>
    </>
  );
}
