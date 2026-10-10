import { useContext, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { MODEL_PAGES, ModelPager } from "./ModelNav";
import TOC from "../../components/TOC";
import { TextBox } from "../../components/TextBox";
import { PageTitle, SectionHeading } from "./SectionHeading";
import { Cite, referenceNodes } from "./Cite";
import { ChannelIntro } from "./ChannelIntro";
import { CHANNEL_CITATIONS } from "./citations";
import { MvizMoreInline } from "./MvizMoreInline";
import ReferenceBar from "../../components/ReferenceBar";
import PartsTable from "../../components/PartsTable";
import type { TableColumn, TableRow } from "../../components/PartsTable";
import "./model_methods.css";

/* ========================================================================== *
 *  Model → Methods  (route /model-methods)
 *
 *  The computational methods behind the project, grouped by track: UPO
 *  structural assessment (fpocket / docking / MD), enzyme discovery
 *  (BLAST / phylogenetics / Boltz-2), UPO channel methods, and the
 *  enzyme-engineering design pipelines for UPOs and laccases (ModelPipeline).
 *
 *  Styling lives in model_methods.css (.mp-*). Navigation between the four model
 *  pages is handled by the TOC (see MODEL_PAGES in ModelNav.tsx).
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  SectionIntro — placeholder blurb between a section heading and its chart    */
/* -------------------------------------------------------------------------- */

/**
 * Short intro paragraph sitting under a SectionHeading, above that section's
 * flowchart. The copy is deliberately lorem ipsum: it is visibly filler, so it
 * can never be mistaken for a real claim about the project. Replace each one
 * with a real description of that method group when there is work to describe
 * (see .claude/RESPONSIBLE_AI_USE.md).
 */
function SectionIntro({ children }: { children: ReactNode }) {
  return (
    <TextBox className="model-prose">
      <p className="mm-sintro">{children}</p>
    </TextBox>
  );
}

/* -------------------------------------------------------------------------- */
/*  MethodBlock — wraps one illustration card so the TOC lists it              */
/* -------------------------------------------------------------------------- */

/**
 * Wrapper that puts an illustration card into the contents list, nested under
 * its section. The TOC indexes any element inside a `<section id>` that carries
 * both an `id` and `data-toc-title` (see components/TOC.tsx); the card itself
 * has no <h1>, which would make it look like a top-level section instead.
 *
 * The label is taken from the matching flowchart step rather than typed again,
 * so the contents list and the flowchart above it cannot drift apart — rename a
 * step and the TOC entry follows. The `id` is written out at the call site so
 * it stays stable when a placeholder step name is eventually replaced.
 */
export function MethodBlock({
  id,
  step,
  children,
}: {
  id: string;
  step: PipelineStep;
  children: ReactNode;
}) {
  return (
    <div id={id} className="mm-msub" data-toc-title={step.title}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ModelPipeline — animated vertical workflow/flowchart of a group of methods  */
/* -------------------------------------------------------------------------- */

/**
 * Steps for a workflow flowchart. `title`/`tag` name a real method or stage;
 * `blurb` is a short honest description of that step's role (generic method
 * summaries are fine — team-specific claims stay clearly-marked placeholders).
 * The same component renders the flowchart for every method group. See
 * .claude/RESPONSIBLE_AI_USE.md.
 *
 * There used to be an `icon` here — one emoji per step, drawn in the marker on
 * the spine. It was dropped from every flowchart on the team's request: an
 * emoji renders differently on every platform, carries no meaning a reader can
 * rely on, and the marker reads as a milestone on the timeline without one.
 * A step is named by its `title` and `tag`. If a step ever needs a picture, it
 * already has `image`, which puts a real render beside the card.
 */
export type PipelineStep = {
  title: string;
  tag: string;
  blurb: string;
  image?: string;
};

/** UPO structural workflow: analyse one structure (dock → dynamics). */
const UPO_STRUCTURAL_WORKFLOW: PipelineStep[] = [
  {
    title: "Molecular docking",
    tag: "Binding",
    blurb:
      "Dock the substrate into the target pocket and score candidate poses.",
  },
  {
    title: "Molecular dynamics",
    tag: "Dynamics",
    blurb:
      "Relax the docked complex and follow how it moves over a trajectory.",
  },
];

/** Discovery workflow: find candidate enzymes (search → place on a tree). */
const DISCOVERY_WORKFLOW: PipelineStep[] = [
  {
    title: "BLAST",
    tag: "Sequence search",
    blurb: "Search sequence databases for homologues of the target enzymes.",
  },
  {
    title: "Phylogenetics",
    tag: "Evolutionary analysis",
    blurb:
      "Place candidates on a tree and pick representative, non-redundant ones.",
  },
  {
    title: "Boltz-2",
    tag: "Co-folding",
    blurb:
      "Co-fold a shortlisted sequence with its HEME cofactor to get a structure.",
  },
];

/** Channel-discovery workflow: locate the pocket, then trace the access tunnel (UPOs only). */
export const CHANNEL_WORKFLOW: PipelineStep[] = [
  {
    title: "fpocket",
    tag: "Cavity detection",
    blurb:
      "Fills cavities with alpha spheres to find the active-site pocket, gating out structures that have none and giving the pocket centre used later.",
  },
  {
    title: "CAVER",
    tag: "Channel search",
    blurb:
      "Traces the paths from the buried heme iron out to the surface and reports each one's length, curvature and radius profile.",
  },
  {
    title: "Channel discovery pipeline",
    tag: "Compare & cluster",
    blurb:
      "Normalizes, resamples and clusters the selected channels so enzymes can be grouped by the shape of their access channel.",
  },
];

const PIPELINE_STEPS: PipelineStep[] = [
  {
    title: "RFdiffusion",
    tag: "Backbone design",
    blurb:
      "Placeholder: describe how backbones are generated/diffused around the target scaffold.",
  },
  {
    title: "LigandMPNN",
    tag: "Sequence design",
    blurb:
      "Placeholder: describe how sequences are designed onto the new backbones.",
  },
  {
    title: "RoseTTAFold",
    tag: "Structure prediction",
    blurb:
      "Placeholder: describe predicting the folded structure of the designed sequence.",
  },
];

/** Laccase-design workflow: three stages, matching the three illustrations
 *  below. Only the first stage is named; the copy for the other two is dummy
 *  text for now — their stage names, tools and parameters are still to be
 *  written. */
const LACCASE_WORKFLOW: PipelineStep[] = [
  {
    title: "Rational design",
    tag: "Literature-guided",
    blurb:
      "Pick the positions to change by hand, from what published work reports about the enzyme.",
  },
  {
    title: "sint velit",
    tag: "Dolore ut consequat",
    blurb: "Excepteur laboris amet ea proident nostrud sit aliqua velit.",
  },
  {
    title: "tempor id",
    tag: "Aliqua eu nostrud",
    blurb: "Consectetur veniam duis irure lorem aute minim esse commodo.",
  },
];

/**
 * ModelPipeline — animated vertical timeline of the modelling pipeline. Central
 * "spine" fills as you scroll; each step reveals via IntersectionObserver.
 * Styling namespaced under `.mp-*` in model_methods.css. The spine fill height
 * is dynamic, so it's applied inline (style={{ height }}) from fillPct.
 */
export function ModelPipeline({ steps }: { steps: PipelineStep[] }) {
  const [visible, setVisible] = useState<boolean[]>(() =>
    steps.map(() => false),
  );
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = nodeRefs.current.map((node, index) => {
      if (!node) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          const ratio = entry.intersectionRatio;
          setVisible((prev) => {
            // Hysteresis: reveal when well in view, hide only when well out,
            // with a stable dead zone so nodes don't flicker near the trigger.
            let target = prev[index];
            if (ratio >= 0.5) target = true;
            else if (ratio <= 0.12) target = false;
            if (prev[index] === target) return prev;
            const next = [...prev];
            next[index] = target;
            return next;
          });
        },
        { threshold: [0, 0.12, 0.5, 1], rootMargin: "0px 0px -15% 0px" },
      );
      observer.observe(node);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // The spine fills down to the lowest currently-revealed node.
  const activeIndex = visible.lastIndexOf(true);
  const fillPct =
    activeIndex >= 0 ? ((activeIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="mp-wrap">
      <div className="mp-track">
        <div className="mp-spine" aria-hidden="true">
          <div className="mp-spine-fill" style={{ height: `${fillPct}%` }} />
        </div>

        {steps.map((step, index) => {
          const isVisible = visible[index];
          const isActive = index === activeIndex;
          const side = index % 2 === 0 ? "left" : "right";
          return (
            <div
              key={step.title}
              ref={(el) => {
                nodeRefs.current[index] = el;
              }}
              className={`mp-node ${side}${isVisible ? " visible" : ""}${
                isActive ? " active" : ""
              }`}
            >
              {step.image && (
                <img
                  className="mp-bg"
                  src={step.image}
                  alt=""
                  aria-hidden="true"
                />
              )}
              <div className="mp-cell mp-card-cell">
                <div className="mp-card">
                  <div className="mp-card-head">
                    <span className="mp-num">
                      STEP {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mp-tag">{step.tag}</span>
                  </div>
                  <h4>{step.title}</h4>
                  <p className="mp-blurb">{step.blurb}</p>
                </div>
              </div>

              {/* The marker on the spine. Empty: it is the milestone itself,
                  not a container for a glyph (see PipelineStep). */}
              <div className="mp-dot-cell">
                <div className="mp-dot" aria-hidden="true" />
              </div>

              {/* Opposite side of the spine, rendered only when a step supplies
                  a real `image` — the empty "🖼️ Image placeholder" boxes that
                  used to sit here were removed. Omitting the cell entirely (vs.
                  leaving it empty) matters on mobile, where .mp-img-cell has a
                  margin an empty div would still contribute. The card and dot
                  pin their own grid-column, so the alternating layout holds. */}
              {step.image && (
                <div className="mp-cell mp-img-cell">
                  <div className="mp-imgph">
                    <img src={step.image} alt={`${step.title}: model render`} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Method illustrations — schematic animations that sit beside each method      */
/*                                                                              */
/*  All four share one light card shell (.mviz) so the Methods page reads as a  */
/*  single system. Each is a SCHEMATIC of an established method (which the       */
/*  honesty rule allows) — none shows real data or results. Stages are          */
/*  namespaced (.fp2-/.dsv-/.mdv-/.phy-); the shared shell is .mviz-*.           */
/* -------------------------------------------------------------------------- */

/**
 * Small reusable text side for every illustration card.
 *
 * `more` adds a collapsed "More about this method" panel at the bottom of the
 * card. It is a native <details>/<summary>, so it works without JS, is
 * keyboard-operable and is searchable by the browser's find-in-page — no state
 * to manage. Returns a fragment so the panel is a DIRECT child of the .mviz
 * grid and can span both columns (see .mviz-more in model_methods.css).
 *
 * Under `MvizMoreInline` the same content is rendered in a plain <div> carrying
 * the SAME .mviz-more class — the panel's layout (full-width flex line, top
 * rule) comes from that class, and only the summary row is dropped, so the two
 * forms line up without a second rule set.
 *
 * `note` is the muted line under the text. It is OPTIONAL: the cards that used
 * it to say the animation beside them is a schematic no longer carry one (the
 * team asked for both that line and the "Method illustration" pill above the
 * title to come off). What is left on it is PLACEHOLDER prompting text — it
 * names what the team should write for that method (tools, versions,
 * parameters, cut-offs) and states no result. Replace those with the real
 * write-up; do not let one turn into invented detail. See
 * .claude/RESPONSIBLE_AI_USE.md.
 */
export function MvizInfo({
  title,
  children,
  note,
  more,
}: {
  title: string;
  children: ReactNode;
  note?: string;
  more?: ReactNode;
}) {
  const inlineMore = useContext(MvizMoreInline);

  return (
    <>
      <div className="mviz-info">
        <h4>{title}</h4>
        <p>{children}</p>
        {note && <p className="mviz-note">{note}</p>}
      </div>

      {more &&
        (inlineMore ? (
          <div className="mviz-more">
            <div className="mviz-more-body">{more}</div>
          </div>
        ) : (
          <details className="mviz-more">
            <summary className="mviz-more-toggle">
              <span>More about this method</span>
              <span className="mviz-more-chev" aria-hidden="true">
                ▾
              </span>
            </summary>
            <div className="mviz-more-body">{more}</div>
          </details>
        ))}
    </>
  );
}

/* ---- fpocket: the algorithm, in four beats (.fp2-*) -----------------------
 *
 *  Walks through what fpocket actually does: alpha spheres are generated across the
 *  structure, filtered by RADIUS, and the survivors are CLUSTERED into discrete
 *  pockets, which are then ranked. The top-ranked pocket is picked out in
 *  orange, the runner-up in teal. Still a schematic — no real structure, no
 *  real ranking.
 *
 *  Note the filter is only half-shown: the real one also discards spheres too
 *  LARGE to be in a pocket (out in bulk solvent). Those were drawn outside the
 *  atom cloud and removed as visual clutter, so only the too-small case (buried
 *  in the core) is depicted. */
const FP2_CX = 148;
const FP2_CY = 152;

/** The two concavities carved out of the atom cloud — the alpha spheres that
 *  survive filtering are the ones sitting in these. */
const FP2_POCKETS = [
  { x: 196, y: 108, r: 40 },
  { x: 100, y: 208, r: 27 },
];

/** Protein atoms, laid out on concentric rings with the pocket regions left
 *  empty so the cavities are visible. */
const FP2_ATOMS = (() => {
  const rings = [
    { rad: 0, n: 1 },
    { rad: 24, n: 7 },
    { rad: 46, n: 13 },
    { rad: 66, n: 18 },
    { rad: 86, n: 24 },
  ];
  const out: { x: number; y: number }[] = [];
  rings.forEach(({ rad, n }, ri) => {
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + ri * 0.4;
      const x = FP2_CX + Math.cos(ang) * rad;
      const y = FP2_CY + Math.sin(ang) * rad;
      const inPocket = FP2_POCKETS.some(
        (p) => Math.hypot(x - p.x, y - p.y) < p.r,
      );
      if (!inPocket) out.push({ x, y });
    }
  });
  return out;
})();

/** Alpha spheres. `kind` is what the radius filter makes of each one:
 *  `top`/`alt` survive and cluster into the two pockets, `small` (buried in the
 *  core) is discarded. */
type Fp2Kind = "top" | "alt" | "small";
const FP2_RAW: { x: number; y: number; r: number; kind: Fp2Kind }[] = [
  // main pocket — kept, ranked first
  { x: 196, y: 108, r: 15, kind: "top" },
  { x: 178, y: 96, r: 12, kind: "top" },
  { x: 212, y: 98, r: 12, kind: "top" },
  { x: 186, y: 124, r: 13, kind: "top" },
  { x: 210, y: 122, r: 11, kind: "top" },
  { x: 200, y: 88, r: 10, kind: "top" },
  { x: 172, y: 114, r: 10, kind: "top" },
  // secondary pocket — kept, ranked second
  { x: 100, y: 208, r: 12, kind: "alt" },
  { x: 86, y: 198, r: 10, kind: "alt" },
  { x: 112, y: 216, r: 10, kind: "alt" },
  { x: 96, y: 222, r: 9, kind: "alt" },
  // buried in the core — too small, discarded
  { x: 148, y: 152, r: 5, kind: "small" },
  { x: 122, y: 132, r: 5, kind: "small" },
  { x: 168, y: 176, r: 4, kind: "small" },
  { x: 130, y: 176, r: 5, kind: "small" },
  { x: 170, y: 140, r: 4, kind: "small" },
  { x: 108, y: 158, r: 5, kind: "small" },
  { x: 150, y: 196, r: 5, kind: "small" },
  { x: 186, y: 168, r: 4, kind: "small" },
];

/** Centroid of each surviving group — the kept spheres draw in towards it in
 *  the clustering beat. */
const FP2_CENTROIDS = (["top", "alt"] as const).reduce<
  Record<string, { x: number; y: number }>
>((acc, kind) => {
  const group = FP2_RAW.filter((s) => s.kind === kind);
  acc[kind] = {
    x: group.reduce((t, s) => t + s.x, 0) / group.length,
    y: group.reduce((t, s) => t + s.y, 0) / group.length,
  };
  return acc;
}, {});

const FP2_ALPHAS = FP2_RAW.map((s, i) => {
  const c = FP2_CENTROIDS[s.kind];
  return {
    ...s,
    // kept spheres tighten toward their cluster centre; discarded ones stay put
    dx: c ? (c.x - s.x) * 0.35 : 0,
    dy: c ? (c.y - s.y) * 0.35 : 0,
    d: (i % 8) * 0.05,
  };
});

export function FpocketVizV2() {
  return (
    <div className="mviz">
      <div className="mviz-stage fp2-stage" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="fp2-svg">
          {/* the structure: atoms, with the two cavities left open */}
          {FP2_ATOMS.map((a, i) => (
            <circle
              key={`a${i}`}
              className="fp2-atom"
              cx={a.x}
              cy={a.y}
              r={9}
            />
          ))}

          {/* alpha spheres: generated everywhere, then filtered by radius */}
          {FP2_ALPHAS.map((s, i) => (
            <circle
              key={`s${i}`}
              className={`fp2-alpha ${s.kind}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              style={
                {
                  "--dx": `${s.dx.toFixed(1)}px`,
                  "--dy": `${s.dy.toFixed(1)}px`,
                  animationDelay: `${s.d}s`,
                } as CSSProperties
              }
            />
          ))}

          {/* the pockets the survivors cluster into, best-scoring one first */}
          <ellipse className="fp2-hull top" cx="193" cy="107" rx="36" ry="29" />
          <ellipse className="fp2-hull alt" cx="98" cy="211" rx="25" ry="21" />
        </svg>
      </div>
      <MvizInfo
        title="fpocket"
        more={
          <>
            <p>
              fpocket works by filling the protein&apos;s cavities with small
              &ldquo;alpha spheres&rdquo; and grouping them into candidate
              pockets, typically reporting many pockets per structure, most of
              which are unrelated to the active site. This serves two roles in
              our pipeline: (1) a quality gate, structures that do not present a
              well-formed active-site pocket (for example, models where the
              region is collapsed, too small, or too buried) are flagged and
              excluded from further analysis, preventing us from wasting effort
              on and drawing conclusions from structures whose active site is
              not physically accessible; and (2) a geometric anchor, for every
              structure that passes, fpocket provides the centre of the
              active-site pocket (computed as the average position of its alpha
              spheres), which becomes a reference point used later to tell
              genuine substrate channels apart from irrelevant ones.
            </p>
            <p>
              Because fpocket has no ground truth information on which of its
              candidate pockets corresponds to the active site, we first locate
              the heme iron in each structure. We do this by identifying the Fe
              atom within the HEME residue; if no explicit Fe atom is present,
              we instead use the centroid of the HEME residue as an
              approximation of its position. We then walk fpocket&apos;s
              candidate pockets in rank order and select the first one that
              satisfies all of the following criteria: proximity to the heme
              iron (the minimum distance from the pocket&apos;s alpha spheres to
              the Fe atom must fall within 10 Å); solvent accessibility (the
              pocket must not be fully buried); and a set of five geometric and
              physicochemical thresholds: a druggability score of at least 0.2,
              reflecting a bindability estimate; a volume of at least 500 Å³,
              large enough to accommodate NNBT; a total SASA of at least 80 Å²,
              excluding fully buried cavities; an apolar sphere fraction of at
              least 0.4, consistent with the hydrophobic &ldquo;Phe cage&rdquo;
              character of UPO active sites; and at least 15 alpha spheres,
              ensuring the pocket is geometrically well-defined.
            </p>
            <p>
              If a pocket lies close enough to the iron but fails one of these
              metric checks, the search continues to the next-ranked pocket
              rather than stopping; the closest heme-proximal candidate is
              nonetheless retained so that, if no pocket ultimately passes, the
              structure can be reported together with the specific metric and
              value that caused the failure. Every structure&apos;s outcome,
              pass or fail, along with the selected pocket&apos;s full metrics
              (and, for failures, the reason it was rejected), is recorded for
              later review.
            </p>
            <p>
              fpocket&apos;s own cavity detection was run with default
              alpha-sphere parameters. Structures whose selected pocket fails
              any of the above checks are excluded before the channel search
              (PASS/FAIL structure gate). The pocket centre of the selected
              pocket, computed as the mean of its alpha-sphere coordinates, is
              the reference point used by the pocket-proximity filter in the
              CAVER selection step.
            </p>
          </>
        }
      >
        Before searching for channels, we use fpocket{" "}
        <Cite id="LeGuilloux2009" /> to detect cavities on and inside each
        protein and to score their druggability and geometric quality. fpocket
        tells us whether a usable active-site pocket exists and where its centre
        is.
      </MvizInfo>
    </div>
  );
}

/* ---- docking: sampling poses in the pocket -------------------------------- */
/** The docking animation on its own, without the blurb beside it.
 *
 *  Exported so the "More details on the molecular docking methods" box on the
 *  Discovery page can show the same animation next to its introduction (see
 *  structural-methods.tsx). Split out rather than copied for the reason given
 *  on ChannelMethodsBox: one definition, so the two pages cannot drift apart.
 *  `DockingSearchViz` below is this stage plus the card's own text, which is
 *  what the Methods page renders. */
export function DockingSearchStage() {
  const N = 14;
  const poses = Array.from({ length: N }, (_, i) => {
    const ang = (i / N) * Math.PI * 2;
    const R = 118;
    return {
      x: Math.cos(ang) * R,
      y: Math.sin(ang) * R,
      delay: (i % 7) * 0.34,
    };
  });

  return (
    <div className="mviz-stage dsv-stage" aria-hidden="true">
      <div className="dsv-rings">
        <span />
        <span />
        <span />
      </div>
      <div className="dsv-pocket">
        <span className="dsv-core" />
      </div>
      {poses.map((p, i) => (
        <span
          key={i}
          className="dsv-pose"
          style={
            {
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              animationDelay: `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function DockingSearchViz() {
  return (
    <div className="mviz">
      <DockingSearchStage />
      <MvizInfo
        title="Molecular docking: searching the pocket"
        more="Placeholder: record the docking program and version, how the search box was defined, the scoring function, how many poses were generated and how many kept, and the criteria used to choose the top pose. Add the receptor and ligand preparation steps too (protonation, charges, flexible side chains). No real docking results are shown here yet."
        note="Placeholder: swap in the real search box, scoring function and top poses once the docking runs are done."
      >
        A docking run samples many candidate <em>poses</em> (positions,
        orientations and flexible conformations of the substrate inside the
        pocket) and scores each one, keeping the most favourable as predicted
        binding modes. This is a schematic of that search; it shows no real
        scores.
      </MvizInfo>
    </div>
  );
}

/* ---- molecular dynamics: a jiggling, swaying molecule --------------------- */
const MD_ATOMS = [
  { cx: 150, cy: 120, r: 15, c: "#ff6a14", d: 0 },
  { cx: 108, cy: 96, r: 12, c: "#0d9488", d: 0.25 },
  { cx: 192, cy: 96, r: 12, c: "#0e3a57", d: 0.5 },
  { cx: 104, cy: 164, r: 12, c: "#0d9488", d: 0.75 },
  { cx: 196, cy: 164, r: 12, c: "#0e3a57", d: 1.0 },
  { cx: 150, cy: 200, r: 14, c: "#ff6a14", d: 1.25 },
];
const MD_BONDS = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [3, 5],
  [4, 5],
];

/** The molecular-dynamics animation on its own. Same split, and for the same
 *  reason, as `DockingSearchStage` above: the "More details on the molecular
 *  dynamics methods" box shows it beside its introduction. */
export function MDStage() {
  return (
    <div className="mviz-stage mdv-stage" aria-hidden="true">
      <div className="mdv-ring" />
      <svg viewBox="0 0 300 300" className="mdv-svg">
        <g className="mdv-mol">
          {MD_BONDS.map(([a, b], i) => (
            <line
              key={i}
              className="mdv-bond"
              x1={MD_ATOMS[a].cx}
              y1={MD_ATOMS[a].cy}
              x2={MD_ATOMS[b].cx}
              y2={MD_ATOMS[b].cy}
            />
          ))}
          {MD_ATOMS.map((a, i) => (
            <circle
              key={i}
              className="mdv-atom"
              cx={a.cx}
              cy={a.cy}
              r={a.r}
              fill={a.c}
              style={{ animationDelay: `${a.d}s` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function MDViz() {
  return (
    <div className="mviz">
      <MDStage />
      <MvizInfo
        title="Molecular dynamics: letting it move"
        more="Placeholder: record the MD engine and version, the force field and water model, box size and ion concentration, the minimisation and equilibration protocol, production length, timestep, temperature and pressure coupling, and how many independent replicas were run. Then say which analyses were done (RMSD, RMSF, contacts) and over which time window. No trajectories have been analysed yet."
        note="Placeholder: note the MD engine, force field, solvation and simulation length once the runs are done."
      >
        Molecular dynamics integrates Newton’s equations for every atom under a
        force field, in tiny time steps, so the protein–substrate complex
        relaxes and flexes over a trajectory. This molecule jiggling under a
        thermostat is a schematic of that motion: not a real trajectory.
      </MvizInfo>
    </div>
  );
}

/* ---- phylogenetics: a self-drawing cladogram (moved from Discovery) ------- */
/** Branch segments of the schematic cladogram, grouped by depth so each layer
 *  draws slightly after the one before it (root → tips). Pure illustration of
 *  the phylogenetics method — the tips are generic candidates, not named/real
 *  sequences, and no evolutionary claim is made. */
const PHYLO_BRANCHES: { d: string; depth: number }[] = [
  { d: "M15 135 H70", depth: 0 },
  { d: "M70 75 V195", depth: 0 },
  { d: "M70 75 H140", depth: 1 },
  { d: "M70 195 H140", depth: 1 },
  { d: "M140 45 V105", depth: 2 },
  { d: "M140 150 V235", depth: 2 },
  { d: "M140 45 H250", depth: 3 },
  { d: "M140 105 H250", depth: 3 },
  { d: "M140 150 H250", depth: 3 },
  { d: "M140 235 H250", depth: 3 },
];
const PHYLO_TIPS = [45, 105, 150, 235];

/** The self-drawing cladogram on its own. Exported, like DockingSearchStage,
 *  so the "More details on the CUPP pipeline" box on the Discovery page shows
 *  the same animation; `PhyloTreeViz` below is this stage plus its card text.
 *  The redraw-on-scroll observer lives here, on the stage, so both get it. */
export function PhyloStage() {
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        // Hysteresis so the redraw doesn't retrigger when paused near the edge.
        setDrawn((prev) => {
          if (ratio >= 0.4) return true;
          if (ratio <= 0.1) return false;
          return prev;
        });
      },
      { threshold: [0, 0.1, 0.4, 1], rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mviz-stage phy-viz" aria-hidden="true" ref={ref}>
      <svg viewBox="0 0 270 275" className={`phy-svg${drawn ? " draw" : ""}`}>
        {PHYLO_BRANCHES.map((b, i) => (
          <path
            key={i}
            d={b.d}
            pathLength={1}
            className="phy-branch"
            style={{ animationDelay: `${b.depth * 0.45}s` }}
          />
        ))}
        {PHYLO_TIPS.map((y, i) => (
          <circle
            key={i}
            cx={250}
            cy={y}
            r={6}
            className="phy-tip"
            style={{ animationDelay: `${1.5 + i * 0.12}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

function PhyloTreeViz() {
  return (
    <div className="mviz">
      <PhyloStage />
      <MvizInfo
        title="Phylogenetics: placing candidates on the tree"
        more="Placeholder: record the alignment tool, any trimming applied, the substitution model and how it was selected, the tree-building method, and the branch-support scheme with its number of replicates. Then explain how representative, non-redundant candidates were picked from the tree. The tips shown are anonymous placeholders, not real sequences."
        note="Placeholder: replace with the real tree (alignment tool, tree-building method and the actual candidate set)."
      >
        Phylogenetic analysis aligns candidate sequences and reconstructs how
        they relate, so closely related enzymes cluster together. That maps the
        diversity of the laccase / UPO families and helps pick representative,
        non-redundant candidates. The tips here are anonymous placeholders, not
        real sequences.
      </MvizInfo>
    </div>
  );
}

/* ---- BLAST: local alignment / sequence search (.blast-*) ------------------ */
/** Query row (dark) over database rows; a scan sweeps and conserved stretches
 *  ("hits") light up. Schematic of local alignment — no real sequences. */
const BLAST_ROWS: { q: boolean; hit: number[] }[] = [
  { q: true, hit: [] },
  { q: false, hit: [3, 4, 5, 6, 7] },
  { q: false, hit: [5, 6, 7, 8] },
  { q: false, hit: [2, 3, 4] },
];
const BLAST_COLS = 14;

/** The alignment scan on its own — exported for the CUPP pipeline box on the
 *  Discovery page, for the reason given on PhyloStage. */
export function BlastStage() {
  return (
    <div className="mviz-stage blast-stage" aria-hidden="true">
      <div className="blast-grid">
        {BLAST_ROWS.map((row, r) => (
          <div key={r} className={`blast-row${row.q ? " query" : ""}`}>
            {Array.from({ length: BLAST_COLS }, (_, c) => (
              <span
                key={c}
                className={`blast-cell${row.hit.includes(c) ? " hit" : ""}`}
                style={{ animationDelay: `${c * 0.07 + r * 0.12}s` }}
              />
            ))}
          </div>
        ))}
        <span className="blast-scan" />
      </div>
    </div>
  );
}

function BlastViz() {
  return (
    <div className="mviz">
      <BlastStage />
      <MvizInfo
        title="BLAST: searching for homologues"
        more="Placeholder: record which databases were queried and on what date, the BLAST flavour used, and the E-value, percent-identity and query-coverage cut-offs applied. Note how many hits were returned, how many survived filtering, and how duplicates were collapsed. No real search has been logged here yet."
        note="Placeholder: note the databases queried and the identity / E-value cut-offs used."
      >
        BLAST slides a query sequence against a database, builds local
        alignments and scores them, reporting the closest matches by
        significance. Here a scan sweeps the rows and conserved stretches light
        up as “hits”: a schematic of local alignment, not a real search.
      </MvizInfo>
    </div>
  );
}

/* ---- RFdiffusion: denoising random noise into a backbone (.rfd-*) --------- */
const RFD_N = 13;
const RFD_ATOMS = Array.from({ length: RFD_N }, (_, i) => ({
  x: 28 + (i * 244) / (RFD_N - 1),
  y: 150 + Math.sin(i * 0.92) * 52,
  // deterministic pseudo-scatter (the "noise" each point starts from)
  nx: (((i * 53) % 100) - 50) * 1.5,
  ny: (((i * 37) % 100) - 50) * 1.5,
  d: i * 0.06,
}));
const RFD_PATH = RFD_ATOMS.map(
  (a, i) => `${i ? "L" : "M"} ${a.x.toFixed(1)} ${a.y.toFixed(1)}`,
).join(" ");

function RFDiffusionViz() {
  return (
    <div className="mviz">
      <div className="mviz-stage rfd-stage" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="rfd-svg">
          <path className="rfd-chain" d={RFD_PATH} pathLength={1} />
          {RFD_ATOMS.map((a, i) => (
            <circle
              key={i}
              className="rfd-atom"
              cx={a.x}
              cy={a.y}
              r={7}
              style={
                {
                  "--nx": `${a.nx}px`,
                  "--ny": `${a.ny}px`,
                  animationDelay: `${a.d}s`,
                } as CSSProperties
              }
            />
          ))}
        </svg>
      </div>
      <MvizInfo
        title="RFdiffusion: denoising a backbone"
        more="Placeholder: record the model version, what was held fixed versus generated, any hotspot or symmetry constraints, how many backbones were sampled, and the filters applied before the next stage. No designed backbones exist yet."
        note="Placeholder: note the RFdiffusion settings and scaffold constraints used."
      >
        RFdiffusion starts from random noise and iteratively denoises it into a
        plausible protein backbone. Here scattered points converge onto an
        ordered chain and drift back: a schematic of the diffusion process, not
        a real design.
      </MvizInfo>
    </div>
  );
}

/* ---- LigandMPNN: assigning a residue to each backbone position (.lmp-*) ---- */
const LMP_N = 13;
const LMP_SLOTS = Array.from({ length: LMP_N }, (_, i) => ({
  x: 28 + (i * 244) / (LMP_N - 1),
  y: 150 + Math.sin(i * 0.92) * 52,
}));
// Generic one-letter codes — clearly a placeholder set, NOT a real design.
const LMP_LETTERS = [
  "A",
  "V",
  "L",
  "G",
  "S",
  "T",
  "K",
  "D",
  "E",
  "F",
  "N",
  "Q",
  "R",
];
const LMP_PATH = LMP_SLOTS.map(
  (a, i) => `${i ? "L" : "M"} ${a.x.toFixed(1)} ${a.y.toFixed(1)}`,
).join(" ");

function LigandMPNNViz() {
  return (
    <div className="mviz">
      <div className="mviz-stage lmp-stage" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="lmp-svg">
          <path className="lmp-chain" d={LMP_PATH} />
          {LMP_SLOTS.map((s, i) => (
            <g
              key={i}
              className="lmp-res"
              style={{ animationDelay: `${i * 0.26}s` } as CSSProperties}
            >
              <circle cx={s.x} cy={s.y} r={11} className="lmp-bead" />
              <text x={s.x} y={s.y} className="lmp-letter">
                {LMP_LETTERS[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <MvizInfo
        title="LigandMPNN: designing the sequence"
        more="Placeholder: record the model version, the sampling temperature, how many sequences were designed per backbone, which positions were fixed or excluded, and how the ligand and cofactor context were supplied. Then note the filters used to shortlist sequences. No sequences have been designed yet."
        note="Placeholder: note the LigandMPNN settings and any fixed / constrained positions."
      >
        LigandMPNN reads a fixed backbone (and any bound ligand) and predicts an
        amino acid for each position. Here residues are assigned one by one
        along the chain: a schematic of sequence design; the letters are generic
        placeholders, not a real designed sequence.
      </MvizInfo>
    </div>
  );
}

/* ---- Boltz-2: co-folding the sequence with its HEME cofactor (.blz-*) -------- */
const BLZ_N = 12;
const BLZ_BEADS = Array.from({ length: BLZ_N }, (_, i) => {
  const ex = 24 + (i * 252) / (BLZ_N - 1); // extended-chain x
  const ey = 150;
  const ang = (i / BLZ_N) * Math.PI * 2;
  const rad = 46 + (i % 3) * 10;
  const fx = 150 + Math.cos(ang) * rad; // folded position
  const fy = 150 + Math.sin(ang) * rad;
  return { fx, fy, dx: ex - fx, dy: ey - fy, d: i * 0.05 };
});

/** The co-folding animation on its own — exported for the CUPP pipeline box
 *  on the Discovery page, for the reason given on PhyloStage. */
export function BoltzStage() {
  return (
    <div className="mviz-stage blz-stage" aria-hidden="true">
      <svg viewBox="0 0 300 300" className="blz-svg">
        {BLZ_BEADS.map((b, i) => (
          <circle
            key={i}
            className="blz-bead"
            cx={b.fx}
            cy={b.fy}
            r={8}
            style={
              {
                "--dx": `${b.dx.toFixed(1)}px`,
                "--dy": `${b.dy.toFixed(1)}px`,
                animationDelay: `${b.d}s`,
              } as CSSProperties
            }
          />
        ))}
        <g className="blz-heme">
          <rect
            x={139}
            y={139}
            width={22}
            height={22}
            rx={3}
            className="blz-heme-sq"
          />
        </g>
      </svg>
    </div>
  );
}

function BoltzViz() {
  return (
    <div className="mviz">
      <BoltzStage />
      <MvizInfo
        title="Boltz-2: co-folding with HEME"
        more="Placeholder: record the model version, the exact inputs (sequence plus cofactor and any ligands), how the cofactor was specified, which confidence metrics were read out, and the cut-offs used to accept or reject a prediction. No co-folded structures are reported here yet."
        note="Placeholder: note the Boltz-2 version and how the HEME cofactor is supplied."
      >
        Boltz-2 predicts the folded structure of the designed sequence together
        with its HEME cofactor. Here an extended chain collapses into a compact
        fold as the cofactor (red) settles into the centre: a schematic of
        co-folding, not a real predicted structure.
      </MvizInfo>
    </div>
  );
}

/* ---- ProSmith: scoring an enzyme–substrate pair (.psm-*) ------------------ */
/** A row of sequence tokens over a row of SMILES tokens, attention flickering
 *  between the two, and a score bar filling from the pair. Schematic of a
 *  sequence + SMILES model scoring a pair — no real tokens or scores. Only the
 *  CUPP pipeline box on the Discovery page shows it; the Methods page has no
 *  ProSmith card. */
const PSM_SEQ = Array.from({ length: 7 }, (_, i) => 45 + i * 35);
const PSM_MOL = Array.from({ length: 5 }, (_, i) => 80 + i * 35);
const PSM_SEQ_Y = 62;
const PSM_MOL_Y = 172;
const PSM_LINKS = PSM_SEQ.flatMap((sx, si) =>
  PSM_MOL.map((mx, mi) => ({
    sx,
    mx,
    // Deterministic scatter, so the flicker looks random but renders the same
    // on every load.
    d: ((si * 3 + mi * 5) % 7) * 0.22,
  })),
);

export function ProSmithStage() {
  return (
    <div className="mviz-stage psm-stage" aria-hidden="true">
      <svg viewBox="0 0 300 300" className="psm-svg">
        {PSM_LINKS.map((l, i) => (
          <line
            key={i}
            className="psm-attn"
            x1={l.sx}
            y1={PSM_SEQ_Y + 11}
            x2={l.mx}
            y2={PSM_MOL_Y - 10}
            style={{ animationDelay: `${l.d}s` }}
          />
        ))}
        {PSM_SEQ.map((x, i) => (
          <rect
            key={i}
            className="psm-seq"
            x={x - 11}
            y={PSM_SEQ_Y - 11}
            width={22}
            height={22}
            rx={5}
          />
        ))}
        <path
          className="psm-bond"
          d={`M${PSM_MOL[0]} ${PSM_MOL_Y} ${PSM_MOL.slice(1)
            .map((x, i) => `L${x} ${PSM_MOL_Y + (i % 2 ? 0 : -14)}`)
            .join(" ")}`}
        />
        {PSM_MOL.map((x, i) => (
          <circle
            key={i}
            className="psm-mol"
            cx={x}
            cy={PSM_MOL_Y + (i % 2 ? -14 : 0)}
            r={10}
          />
        ))}
        <rect
          className="psm-track"
          x={50}
          y={236}
          width={200}
          height={14}
          rx={7}
        />
        <rect
          className="psm-fill"
          x={50}
          y={236}
          width={200}
          height={14}
          rx={7}
        />
      </svg>
    </div>
  );
}

/* ---- laccase MSA + docking: find the T1 site, then dock at it (.lcd-*) ----- */
/** The laccase docking tool, as the team's own description of it: a multiple
 *  sequence alignment locates the HCH motif that holds the T1 copper, and a
 *  docking box is then centred on that motif and the substrate docked into it.
 *
 *  Why this is not `DockingSearchStage`: that one samples poses in a pocket the
 *  structure already shows. The laccase tool's whole point is that there IS no
 *  pocket to aim at, so the alignment step is what finds the target — which is
 *  the half this animation has to show. Schematic throughout: the alignment
 *  cells are not residues, the coppers are positions not coordinates, and no
 *  real pose or affinity is drawn. See .claude/RESPONSIBLE_AI_USE.md.
 *
 *  Only the laccase pipeline box on the Discovery page shows it; the Methods
 *  page has no laccase docking card. */
const LCD_COLS = Array.from({ length: 9 }, (_, i) => 26 + i * 28);
const LCD_ROWS = [24, 48, 72, 96];
/** Column indices of the conserved HCH columns the alignment locks onto. */
const LCD_MOTIF = [3, 4, 5];
/** Where each substrate pose flies in from, as an offset from the box centre. */
const LCD_POSES = [
  { dx: -92, dy: -30, d: 0 },
  { dx: 96, dy: -16, d: 0.9 },
  { dx: 70, dy: 56, d: 1.8 },
];

export function LaccaseDockStage() {
  return (
    <div className="mviz-stage lcd-stage" aria-hidden="true">
      <svg viewBox="0 0 300 300" className="lcd-svg">
        {/* the alignment: four sequences, nine columns */}
        {LCD_ROWS.map((y, r) =>
          LCD_COLS.map((x, c) => (
            <rect
              key={`${r}-${c}`}
              className={
                LCD_MOTIF.includes(c) ? "lcd-cell lcd-cell-motif" : "lcd-cell"
              }
              x={x - 11}
              y={y - 8}
              width={22}
              height={16}
              rx={4}
              style={
                LCD_MOTIF.includes(c)
                  ? { animationDelay: `${LCD_MOTIF.indexOf(c) * 0.22}s` }
                  : undefined
              }
            />
          )),
        )}
        {/* the box the alignment draws around those columns. Geometry is tied
            to the cells: the motif columns are centred on x=110/138/166 and a
            cell is 22 wide, so the columns span 99–177 and the box is that
            plus a hair, centred on 138 — which is also where the drop arrow,
            the T1 copper and the search box sit, so the whole chain lines up in
            one vertical. */}
        <rect
          className="lcd-motif-box"
          x={95}
          y={12}
          width={86}
          height={104}
          rx={8}
        />
        {/* and the hand-off down to the structure */}
        <path className="lcd-drop" d="M138 122 V152" pathLength={1} />
        <path className="lcd-drop-head" d="M131 148 L138 158 L145 148" />

        {/* the structure: T1 copper near the surface, T2/3 cluster behind it */}
        <ellipse className="lcd-blob" cx={150} cy={222} rx={82} ry={62} />
        {[
          [186, 240],
          [202, 226],
          [188, 220],
        ].map(([cx, cy], i) => (
          <circle key={i} className="lcd-cu23" cx={cx} cy={cy} r={6} />
        ))}
        <circle className="lcd-cu1" cx={138} cy={200} r={9} />

        {/* the search box centred on the T1 copper, and the poses docking into it */}
        <rect
          className="lcd-box"
          x={104}
          y={166}
          width={68}
          height={68}
          rx={6}
        />
        {LCD_POSES.map((p, i) => (
          <circle
            key={i}
            className="lcd-pose"
            cx={138}
            cy={200}
            r={7}
            style={
              {
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                animationDelay: `${p.d}s`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </div>
  );
}

/* ---- CAVER: tracing an access tunnel to the buried active site (.cav-*) ---- */
const CAVER_TUNNEL = "M46 150 Q100 118 150 150 Q205 182 256 156";

export function CaverViz() {
  return (
    <div className="mviz">
      <div className="mviz-stage cav-stage" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="cav-svg">
          <path
            className="cav-blob"
            d="M150 40 C212 40 254 92 254 150 C254 212 210 258 150 258 C90 258 46 214 46 154 C46 94 90 40 150 40 Z"
          />
          <path className="cav-tunnel" d={CAVER_TUNNEL} pathLength={1} />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              className="cav-probe"
              cx={0}
              cy={0}
              r={6}
              style={{ animationDelay: `${i}s` }}
            />
          ))}
          <circle className="cav-mouth" cx={46} cy={150} r={9} />
        </svg>
      </div>
      <MvizInfo
        title="CAVER"
        more={
          <>
            <p>
              For each structure that passes the fpocket quality gate, we run
              CAVER starting from the heme iron. CAVER models the empty space
              inside the protein and computes the widest possible paths leading
              from the buried starting point out to the surface, reporting each
              channel&apos;s full geometry: its length, its curvature (how
              straight or winding it is), and its radius profile along the path,
              including the narrowest bottleneck. CAVER typically reports many
              candidate paths per structure, because it finds every route out of
              the protein. As a result, it includes many irrelevant channels
              from unrelated regions not linked to the desired substrate
              channel. The raw output therefore has to be filtered down to the
              biologically meaningful access channel.
            </p>
            <p>
              This is where the two tools combine. Using the pocket centre from
              fpocket, we apply three filters to CAVER&apos;s channels and keep
              only those that pass all of them. Proximity to the active-site
              pocket: we require a channel to stay close to the fpocket pocket
              along its whole length, using the average distance of the path to
              the pocket centre rather than just its closest approach, which
              removes paths that start near the iron but then shift into
              unrelated parts of the protein. Directness/curvature: substrate
              access channels tend to be relatively direct, whereas spurious
              paths are often long and winding, so we discard channels whose
              path is excessively convoluted. Length: very long channels are
              almost always winding routes through unrelated regions rather
              than genuine access tunnels, so we cap the acceptable length.
              Only channels that satisfy all three criteria are retained. Each
              surviving channel is also given a throughput score by CAVER (a
              measure of how open and unobstructed the path is), which we use to
              rank the channels within each structure and pick the most
              plausible substrate route.
            </p>
            <p>
              The pipeline was run with the following CAVER search parameters:
              starting point at the heme iron (Fe), the catalytic centre of the
              enzyme, since the substrate channel is defined as the path leading
              to it; probe radius of 0.4 Å, the minimum bottleneck radius a
              channel must have to be detected, lowered from the commonly used
              0.7 Å to reliably detect the narrow access channels in structures;
              clustering threshold of 3.5 Å, governing how geometrically
              different two paths must be to be reported as separate channels;
              shell radius of 5.0 Å, the search radius for Voronoi vertices
              around each atom; and shell depth of 6.0 Å, how far beyond the
              starting sphere the search extends. The remaining CAVER search
              parameters were left at values that rarely need tuning. The
              channel selection filters applied to CAVER&apos;s output were as
              follows. Pocket proximity, 12 Å maximum mean distance: the average
              distance of the channel path to the fpocket pocket centre must
              stay below 12 Å, using the mean rather than the closest approach
              to reject paths that begin near the iron but then wander into
              unrelated regions. Curvature, 1.5 maximum: the ratio of path
              length to straight-line end-to-end distance, where 1.0 is
              perfectly straight. Direct access channels are typically 1.2–1.4,
              winding detours are 1.8 and above. Length, 25 Å maximum: channels
              longer than 25 Å are almost always indirect routes through
              unrelated parts of the protein.
            </p>
          </>
        }
      >
        CAVER <Cite id="Chovancova2012" />, the second tool in the pipeline,
        traces the channels that connect the buried active site to the surface,
        telling us what path the substrate would take to reach it. Every channel
        search needs a defined origin. For UPOs this is standard: the reaction
        happens at the heme iron, so the channel we care about is the one that
        ends there. For each structure, the pipeline automatically locates the
        iron atom within the heme group and marks its exact coordinates as the
        starting point of the search. This works identically for both
        experimentally determined crystal structures and for predicted models.
      </MvizInfo>
    </div>
  );
}

/* ---- RoseTTAFold: predicting the fold (contact map → 3D) (.rff-*) ---- */
const RFF_N = 6;
const RFF_GRID_X = 72;
const RFF_GRID_Y = 26;
const RFF_CONTACTS = [
  [0, 3],
  [1, 4],
  [2, 5],
  [0, 4],
  [1, 5],
];
const RFF_ATOMS = [
  { x: 150, y: 226 },
  { x: 123, y: 248 },
  { x: 177, y: 248 },
  { x: 134, y: 274 },
  { x: 166, y: 274 },
];
const RFF_BONDS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 4],
];

/* ---- channel clustering: many tunnels -> a few representatives (.ccl-*) ----
 *
 *  One 9s loop, shared by every path:
 *    0-18%   the raw ensemble, all tunnels drawn faint and grey (the overlay)
 *    32-52%  each tunnel takes its cluster colour (the clustering step)
 *    66-88%  one representative per cluster thickens, the rest fade back
 *
 *  Schematic only: the paths are generated from fixed angles, not from any real
 *  tunnel search, and the three clusters carry no counts or occupancies. */
const CCL_CLUSTERS = [
  { hex: "#0d9488", baseAngle: -74 },
  { hex: "#ff6a14", baseAngle: 42 },
  { hex: "#4a6fd0", baseAngle: 166 },
];

/** Four tunnels per cluster, fanned around the cluster's own direction. The
 *  second of each four is the representative that survives to the last phase. */
const CCL_PATHS = CCL_CLUSTERS.flatMap((c, ci) =>
  Array.from({ length: 4 }, (_, i) => {
    const a = ((c.baseAngle + (i - 1.5) * 10) * Math.PI) / 180;
    const r = 116;
    const ex = 150 + r * Math.cos(a);
    const ey = 150 + r * Math.sin(a);
    const bow = (i % 2 ? 1 : -1) * (11 + i * 5); // sideways bow, so they differ
    const cx = 150 + r * 0.55 * Math.cos(a) + Math.sin(a) * bow;
    const cy = 150 + r * 0.55 * Math.sin(a) - Math.cos(a) * bow;
    return {
      key: `${ci}-${i}`,
      d: `M150 150 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      ex,
      ey,
      cluster: ci,
      rep: i === 1,
      delay: (ci * 0.18 + i * 0.09).toFixed(2),
    };
  }),
);

// The worked interpolation example's two tables, values transcribed exactly.
// As measured: one row per series, so the header row is hidden and the first
// column labels each row. Channel A has only four points, so its last two
// cells stay empty.
const INTERP_MEASURED_COLUMNS: TableColumn[] = [
  { field: "label", rowHeader: true },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ field: `v${i}` })),
];
const INTERP_MEASURED: TableRow[] = [
  {
    label: "Channel A · position",
    v0: "0.00",
    v1: "0.33",
    v2: "0.66",
    v3: "1.00",
  },
  {
    label: "Channel A · radius (Å)",
    v0: "1.0",
    v1: "2.5",
    v2: "3.0",
    v3: "2.0",
  },
  {
    label: "Channel B · position",
    v0: "0.00",
    v1: "0.20",
    v2: "0.40",
    v3: "0.60",
    v4: "0.80",
    v5: "1.00",
  },
  {
    label: "Channel B · radius (Å)",
    v0: "1.2",
    v1: "2.0",
    v2: "2.8",
    v3: "3.1",
    v4: "2.9",
    v5: "2.2",
  },
];

// After resampling: both channels at the same five positions.
const INTERP_RESAMPLED_COLUMNS: TableColumn[] = [
  { field: "label", header: "Position", rowHeader: true },
  ...["0.00", "0.25", "0.50", "0.75", "1.00"].map((pos, i) => ({
    field: `v${i}`,
    header: pos,
  })),
];
const INTERP_RESAMPLED: TableRow[] = [
  {
    label: "Channel A · radius (Å)",
    v0: "1.0",
    v1: "2.1",
    v2: "2.7",
    v3: "2.7",
    v4: "2.0",
  },
  {
    label: "Channel B · radius (Å)",
    v0: "1.2",
    v1: "2.3",
    v2: "2.9",
    v3: "3.0",
    v4: "2.2",
  },
];

export function ChannelClusterViz() {
  return (
    <div className="mviz">
      <div className="mviz-stage ccl-stage" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="ccl-svg">
          {/* protein body + buried active site the tunnels start from */}
          <circle className="ccl-blob" cx="150" cy="150" r="132" />
          <circle className="ccl-site" cx="150" cy="150" r="9" />

          {CCL_PATHS.map((p) => (
            <path
              key={p.key}
              className={`ccl-path c${p.cluster}${p.rep ? " rep" : ""}`}
              d={p.d}
              style={{ animationDelay: `${p.delay}s` } as CSSProperties}
            />
          ))}

          {/* exit mouths, coloured once the clusters are formed */}
          {CCL_PATHS.map((p) => (
            <circle
              key={`e${p.key}`}
              className={`ccl-exit c${p.cluster}`}
              cx={p.ex.toFixed(1)}
              cy={p.ey.toFixed(1)}
              r={p.rep ? 5 : 3.2}
              style={{ animationDelay: `${p.delay}s` } as CSSProperties}
            />
          ))}
        </svg>
      </div>

      <MvizInfo
        title="Channel discovery pipeline"
        more={
          <>
            <p>
              We describe each channel by its radius profile: how wide the
              channel is at each point along the path from the heme iron out to
              the surface. A narrow bottleneck shows up as a dip in this
              profile; a funnel-shaped mouth shows up as a widening toward the
              exit. This profile captures the geometric information most
              relevant to substrate passage and it is the basis for all the
              comparisons that follow.
            </p>
            <p>
              <strong>
                Step 1, Normalization: putting every channel on a 0-to-1 scale.
              </strong>{" "}
              CAVER reports the radius along each channel as a function of the
              distance travelled from the starting point, measured in ångströms.
              Because channels have different total lengths, these distance axes
              are not comparable: a point 8 Å into a short channel and a point 8
              Å into a long one are at completely different relative positions.
              To fix this, we normalize the distance axis of every channel so
              that it runs from 0 to 1, where 0 is the heme (entrance) and 1 is
              the surface (exit). This is done by dividing each channel&apos;s
              distance values by its own total length. After normalization, the
              value 0.5 always means &ldquo;halfway along this particular
              channel,&rdquo; regardless of whether the channel is 7 Å or 20 Å
              long. This lets us compare channels by shape rather than by
              absolute size. (Absolute length is not discarded, it is recorded
              separately and was already used as a filter in the earlier stage.)
            </p>
            <p>
              <strong>
                Step 2, Interpolation: sampling every channel at the same
                positions.
              </strong>{" "}
              Even after normalization, two channels are still described by a
              different number of measurements taken at different positions, so
              they cannot be compared point-by-point. We resolve this by
              choosing a fixed set of evenly spaced positions along the 0-to-1
              axis (100 positions in our runs) and reading off each
              channel&apos;s radius at exactly those same positions. Where a
              channel was not measured precisely at one of those positions, we
              estimate the radius by linear interpolation: connecting the two
              nearest real measurements with a straight line and reading the
              value in between, much like a &ldquo;connect-the-dots&rdquo;
              reconstruction of the profile. The result is that every channel,
              whatever its original length or number of measurements, becomes a
              list of 100 radius values sampled at identical relative positions,
              making them directly comparable. Safeguards preserve the
              biologically important features through this resampling. Because
              the fixed positions include exactly 0 and 1, which are real
              measured points (the heme entrance and the surface exit), the
              entrance and exit radii are carried through unchanged, with no
              interpolation error at the ends.
            </p>
            <p>
              <strong>Step 3, Clustering: grouping channels by shape.</strong>{" "}
              With every channel now represented as a comparable, fixed-length
              shape profile, we group them using hierarchical (agglomerative)
              clustering. This method repeatedly merges the most similar
              channels (and then the most similar groups of channels), building
              a tree (a dendrogram) that shows how the channels relate to one
              another at every level of similarity. Channels with near-identical
              radius profiles join near the tips of the tree, whereas channels
              that differ strongly join only near the root. The dendrogram lets
              us choose how many distinct channel types to recognise without
              committing to that number in advance: cutting the tree at a given
              height defines the clusters. Each resulting cluster is a group of
              enzymes whose access channels share a common geometric signature
              (for example, a common bottleneck position or a similarly flared
              mouth). We visualise these groups by overlaying the member
              profiles and their average shape, giving a compact picture of the
              distinct channel architectures present across the enzyme family.
              The output of this stage is a set of channel-shape clusters: each
              enzyme is assigned to a group of others with geometrically similar
              substrate access channels, together with the supporting plots (the
              similarity tree and per-cluster shape overlays).
            </p>

            {/* The worked interpolation example. The two tables are DATA the
                reader is meant to read across, so they are a real table
                (PartsTable) rather than the source draft's aligned monospace text — which
                only lines up in a fixed-width font and falls apart at a narrow
                width. Values are transcribed exactly. */}
            <p>
              <strong>Technical detail: how linear interpolation works.</strong>{" "}
              Linear interpolation estimates a value at a position that was
              never directly measured, by assuming the quantity changes along a
              straight line between the two nearest measured points. In our
              pipeline it is what lets us read every channel&apos;s radius at
              the same set of positions even though CAVER measured each channel
              at different, unevenly spaced points. Consider two channels,
              already normalized so their positions run from 0 (heme) to 1
              (exit), measured at different points:
            </p>
            <PartsTable
              data={INTERP_MEASURED}
              columns={INTERP_MEASURED_COLUMNS}
              showHeaders={false}
              caption="The two channels as measured (different positions, and a different number of them)."
            />
            <p>
              We want the radius of both channels at the same fixed set of
              positions: for this example, five evenly spaced positions: 0.00,
              0.25, 0.50, 0.75, 1.00. (Our actual pipeline uses 100 positions,
              but the principle is identical.) Most of those positions fall
              between real measurements, so we estimate them. Take Channel A at
              position 0.25. The two nearest measured points are position 0.00
              (radius 1.0) and position 0.33 (radius 2.5). Position 0.25 lies
              about three-quarters of the way from 0.00 to 0.33, so we move
              about three-quarters of the way from radius 1.0 to radius 2.5:
            </p>
            {/* Each line is a name and its expression, in two grid columns so
                the "=" signs line up — see .mm-calc in model_methods.css for
                how it restacks instead of scrolling in a narrow column. */}
            <div className="mm-calc-wrap">
              <div className="mm-calc">
                <span className="mm-calc-lhs">fraction</span>
                <span className="mm-calc-rhs">
                  = (0.25 − 0.00) / (0.33 − 0.00) ≈ 0.76
                </span>
                <span className="mm-calc-lhs">radius at position 0.25</span>
                <span className="mm-calc-rhs">
                  = 1.0 + 0.76 × (2.5 − 1.0) ≈ 2.1 Å
                </span>
              </div>
            </div>
            <p>Doing this at all five positions for both channels gives:</p>
            <PartsTable
              data={INTERP_RESAMPLED}
              columns={INTERP_RESAMPLED_COLUMNS}
              caption="After resampling (both channels described at the same positions)."
            />
            <p>
              Both channels are now described by the same number of values at
              the same positions, so they can be compared point-by-point and
              passed to the clustering step. Note that the first and last
              positions (0.00 and 1.00) coincide with real measured points (the
              heme entrance and the surface exit) so no estimation happens there
              and the true entrance and exit radii are preserved exactly. This
              is the reason the endpoints are always faithful, while only the
              interior points are reconstructed.
            </p>
          </>
        }
      >
        Once the fpocket + CAVER pipeline has selected a single substrate access
        channel for each enzyme, we want to ask a family-wide question: which
        enzymes have similarly shaped channels, and how many distinct channel
        &ldquo;types&rdquo; exist across our set? Answering this means comparing
        channels to one another. However, channels cannot be compared directly,
        because every enzyme&apos;s channel is a different length and is
        measured at a different number of points. This stage of the pipeline
        solves this in three steps: (1) normalization, (2) interpolation and (3)
        clustering, so that channels of any size can be placed on a common scale
        and grouped by shape.
      </MvizInfo>
    </div>
  );
}

function RosettaFoldViz() {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < RFF_N; r++) {
    for (let c = 0; c < RFF_N; c++) cells.push({ r, c });
  }
  const contact = new Set<string>();
  RFF_CONTACTS.forEach(([a, b]) => {
    contact.add(`${a}-${b}`);
    contact.add(`${b}-${a}`);
  });

  return (
    <div className="mviz">
      <div className="mviz-stage rff-stage" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="rff-svg">
          {/* 2D contact map */}
          {cells.map(({ r, c }) => {
            const kind =
              r === c ? "diag" : contact.has(`${r}-${c}`) ? "contact" : "";
            return (
              <rect
                key={`${r}-${c}`}
                className={`rff-cell ${kind}`}
                x={RFF_GRID_X + c * 26}
                y={RFF_GRID_Y + r * 26}
                width={22}
                height={22}
                rx={4}
                style={{ animationDelay: `${(r + c) * 0.12}s` }}
              />
            );
          })}
          <path
            className="rff-arrow"
            d="M150 190 L150 210 M143 203 L150 210 L157 203"
          />
          {/* 3D structure assembling from the contacts */}
          <g className="rff-fold">
            {RFF_BONDS.map(([a, b], i) => (
              <line
                key={i}
                className="rff-bond"
                x1={RFF_ATOMS[a].x}
                y1={RFF_ATOMS[a].y}
                x2={RFF_ATOMS[b].x}
                y2={RFF_ATOMS[b].y}
              />
            ))}
            {RFF_ATOMS.map((a, i) => (
              <circle
                key={i}
                className="rff-atom"
                cx={a.x}
                cy={a.y}
                r={9}
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </g>
        </svg>
      </div>
      <MvizInfo
        title="RoseTTAFold: predicting the fold"
        more="Placeholder: record the model version, what was predicted, which per-residue and global confidence metrics were used, and the thresholds applied. Then say how the prediction was compared against the intended design, and what counted as agreement. No predictions have been run yet."
        note="Placeholder: note the RoseTTAFold variant and inputs once structure prediction is done."
      >
        RoseTTAFold predicts a protein’s 3D structure from its sequence,
        reasoning jointly over the sequence, residue–residue contacts and
        coordinates. Here a contact map fills in and a compact fold assembles
        from it: a schematic of structure prediction, not a real predicted
        model.
      </MvizInfo>
    </div>
  );
}

/* ---- rational design: passages highlighted in the literature pick out the
 *      positions to change (.rdz-*) -----------------------------------------
 *
 *  The first of the three laccase cards. A stack of papers on the left, the top
 *  one being read: a passage is highlighted, the insight it carries travels
 *  across, and the residue it motivates lights up on the fold at the right. The
 *  fold is drawn as the same bead ring as the two cards below it, so the three
 *  read as one sequence. Schematic only — no real papers, positions or
 *  mutations. */
const RDZ_CX = 214; // fold centre, offset right to leave room for the papers
const RDZ_CY = 148;
const RDZ_N = 11;
/** Radius cycles with (i % 3) so the fold comes out lumpy rather than a perfect
 *  circle — the same trick as SMT_RESIDUES and BLZ_BEADS. */
const RDZ_R_BASE = 44;
const RDZ_R_STEP = 8;
/** Generic bead indices the reading picks out — not real residues. */
const RDZ_PICKED = [1, 5, 8];

const RDZ_BEADS = Array.from({ length: RDZ_N }, (_, i) => {
  const ang = (i / RDZ_N) * Math.PI * 2 - Math.PI / 2;
  const rad = RDZ_R_BASE + (i % 3) * RDZ_R_STEP;
  return {
    x: RDZ_CX + Math.cos(ang) * rad,
    y: RDZ_CY + Math.sin(ang) * rad,
    picked: RDZ_PICKED.indexOf(i),
  };
});

/** Body text on the front page: line widths vary so it reads as prose. The
 *  three lines that get highlighted are the ones at HIGHLIGHT_Y. */
const RDZ_LINE_Y0 = 100;
const RDZ_LINE_GAP = 16;
const RDZ_LINES = Array.from({ length: 8 }, (_, i) => ({
  y: RDZ_LINE_Y0 + i * RDZ_LINE_GAP,
  w: [70, 82, 58, 78, 66, 80, 52, 74][i],
}));

/** One insight per picked position: it leaves the highlighted line and lands on
 *  the residue that line motivates. Staggered by 1.2s across the 3.6s loop, the
 *  same rhythm as the stability-mutagenesis card. */
const RDZ_INSIGHTS = RDZ_PICKED.map((beadIndex, i) => {
  const line = RDZ_LINES[i * 2 + 1]; // every other line, spread down the page
  const from = { x: 116, y: line.y + 2 }; // right-hand end of the highlight
  const to = RDZ_BEADS[beadIndex];
  return {
    x: from.x,
    y: from.y,
    markY: line.y + 2,
    dx: to.x - from.x,
    dy: to.y - from.y,
    delay: (i * 1.2).toFixed(2),
  };
});

/** The animation on its own — exported for the laccase rational-design
 *  method box on the Engineering page, for the reason given on PhyloStage. */
export function RationalDesignStage() {
  return (
    <div className="mviz-stage rdz-stage" aria-hidden="true">
      <svg viewBox="0 0 300 300" className="rdz-svg">
        {/* the literature: a stack of papers, the top one being read */}
        <rect
          className="rdz-sheet back"
          x="42"
          y="74"
          width="96"
          height="146"
          rx="7"
        />
        <rect
          className="rdz-sheet mid"
          x="35"
          y="79"
          width="96"
          height="146"
          rx="7"
        />
        <rect
          className="rdz-sheet front"
          x="28"
          y="84"
          width="96"
          height="146"
          rx="7"
        />

        {/* body text on the front page */}
        {RDZ_LINES.map((l, i) => (
          <rect
            key={`l${i}`}
            className="rdz-line"
            x="40"
            y={l.y}
            width={l.w}
            height="5"
            rx="2.5"
          />
        ))}

        {/* the passages that motivate a change: highlighted in turn */}
        {RDZ_INSIGHTS.map((ins, i) => (
          <rect
            key={`m${i}`}
            className="rdz-mark"
            x="38"
            y={ins.markY - 7}
            width="78"
            height="14"
            rx="7"
            style={{ animationDelay: `${ins.delay}s` } as CSSProperties}
          />
        ))}

        {/* the fold being designed — one circle per residue */}
        {RDZ_BEADS.map((b, i) => (
          <circle key={`b${i}`} className="rdz-bead" cx={b.x} cy={b.y} r={9} />
        ))}

        {/* insight travelling from the highlighted passage to its residue */}
        {RDZ_INSIGHTS.map((ins, i) => (
          <circle
            key={`i${i}`}
            className="rdz-insight"
            cx={ins.x}
            cy={ins.y}
            r={5}
            style={
              {
                "--dx": `${ins.dx.toFixed(1)}px`,
                "--dy": `${ins.dy.toFixed(1)}px`,
                animationDelay: `${ins.delay}s`,
              } as CSSProperties
            }
          />
        ))}

        {/* residues the reading picks out: halo, then the bead lights up */}
        {RDZ_BEADS.filter((b) => b.picked >= 0).map((b, i) => (
          <g key={`p${i}`}>
            <circle
              className="rdz-ring"
              cx={b.x}
              cy={b.y}
              r={9}
              style={
                {
                  animationDelay: `${(b.picked * 1.2).toFixed(2)}s`,
                } as CSSProperties
              }
            />
            <circle
              className="rdz-pick"
              cx={b.x}
              cy={b.y}
              r={10}
              style={
                {
                  animationDelay: `${(b.picked * 1.2).toFixed(2)}s`,
                } as CSSProperties
              }
            />
          </g>
        ))}

        <text className="rdz-label" x="76" y="256">
          literature
        </text>
        <text className="rdz-label" x="214" y="256">
          target positions
        </text>
      </svg>
    </div>
  );
}

function RationalDesignViz() {
  return (
    <div className="mviz">
      <RationalDesignStage />
      <MvizInfo
        title="Rational design: reading the literature onto the structure"
        more="Placeholder: record which papers and reviews the design was based on, the positions they point to and the reasoning for each, the substitutions proposed, and how they were prioritised before being passed to the stages below. Cite every source. No real positions or mutations are shown here yet."
        note="Placeholder: swap in the real positions, substitutions and their references once the design round is done."
      >
        Rational design starts from what is already published about an enzyme:
        reported structure–function relationships, characterised active-site
        residues and earlier mutagenesis studies are read together to choose, by
        hand, which positions to change and what to change them to. This is a
        schematic of that step; it names no positions and shows no results.
      </MvizInfo>
    </div>
  );
}

/* ---- stability mutagenesis: flagged positions swapped, ΔΔG gauge climbs ----
 *      (.smt-*)
 *
 *  Drawn as the same bead fold as MiniaturisationViz below, so the two laccase
 *  cards read as one pair. The fold itself does not change here — this method
 *  swaps residues in place rather than shortening the chain. */
const SMT_N = 12;
const SMT_CX = 138; // offset left to leave room for the gauge
const SMT_CY = 150;
/** Radius cycles with (i % 3) instead of staying fixed, so the fold comes out
 *  lumpy rather than a perfect circle — same trick as BLZ_BEADS in BoltzViz. */
const SMT_R_BASE = 54;
const SMT_R_STEP = 11;

/** Positions the scan flags and substitutes, mapped to the delay that makes
 *  them be treated one at a time across the 3.6s loop. Positions left out are
 *  drawn as plain residues. Generic indices — not real residues or mutations. */
const SMT_FLAGGED: Record<number, number | undefined> = {
  1: 0,
  5: 1.2,
  9: 2.4,
};

const SMT_RESIDUES = Array.from({ length: SMT_N }, (_, i) => {
  const ang = (i / SMT_N) * Math.PI * 2 - Math.PI / 2;
  const rad = SMT_R_BASE + (i % 3) * SMT_R_STEP;
  return {
    x: SMT_CX + Math.cos(ang) * rad,
    y: SMT_CY + Math.sin(ang) * rad,
    delay: SMT_FLAGGED[i],
  };
});

/** The animation on its own — exported for the laccase rational-design
 *  method box on the Engineering page, for the reason given on PhyloStage. */
export function StabilityMutagenesisStage() {
  return (
    <div className="mviz-stage smt-stage" aria-hidden="true">
      <svg viewBox="0 0 300 300" className="smt-svg">
        {/* untouched residues sit still; flagged ones are swapped in place */}
        {SMT_RESIDUES.map((r, i) =>
          r.delay === undefined ? (
            <circle key={i} className="smt-bead" cx={r.x} cy={r.y} r={9} />
          ) : (
            <g key={i}>
              {/* focus ring expands at the moment of the swap */}
              <circle
                className="smt-focus"
                cx={r.x}
                cy={r.y}
                r={9}
                style={{ animationDelay: `${r.delay}s` } as CSSProperties}
              />
              {/* wild-type residue: wobbles, then fades as it is replaced */}
              <circle
                className="smt-wt"
                cx={r.x}
                cy={r.y}
                r={10}
                style={{ animationDelay: `${r.delay}s` } as CSSProperties}
              />
              {/* substituted residue: scales in and holds steady */}
              <circle
                className="smt-mut"
                cx={r.x}
                cy={r.y}
                r={10}
                style={{ animationDelay: `${r.delay}s` } as CSSProperties}
              />
            </g>
          ),
        )}

        {/* ΔΔG gauge — named so it is clear what the bar tracks, but left
            without a scale or numbers. Each substitution moves it either way:
            some are stabilising, some are not, so the level rises and falls
            rather than only climbing. */}
        <text className="smt-gauge-label" x="265" y="52">
          ΔΔG
        </text>
        <rect
          className="smt-meter"
          x="252"
          y="68"
          width="26"
          height="180"
          rx="13"
        />
        <rect
          className="smt-meter-fill"
          x="255"
          y="71"
          width="20"
          height="174"
          rx="10"
        />
      </svg>
    </div>
  );
}

function StabilityMutagenesisViz() {
  return (
    <div className="mviz">
      <StabilityMutagenesisStage />
      <MvizInfo
        title="Reprehenderit magna aute ea labore"
        more="Placeholder: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation. Record the stability or mutagenesis method, the scoring scheme, and how candidate mutations were ranked and filtered. Nothing here is a real result yet."
        note="Nostrud aliqua est cupidatat elit veniam laboris ea commodo ut sint dolore aute pariatur."
      >
        Cupidatat exercitation sunt velit anim ea nostrud commodo laboris ex
        dolore magna irure et pariatur ut labore veniam qui aliqua est occaecat
        sed minim duis lorem esse aute non proident amet ad consequat elit
        tempor sit ullamco eu fugiat mollit adipisicing enim reprehenderit id
        deserunt culpa in voluptate.
      </MvizInfo>
    </div>
  );
}

/* ---- enzyme miniaturisation: the chain is trimmed from one end, then the
 *      shortened sequence refolds into a smaller core (.mnf-*) --------------
 *
 *  Built on the same trick as BoltzViz above: every residue is drawn ONCE, at
 *  its full-length folded position, and CSS translates it to the other states
 *  by per-residue custom properties. Here there are three states instead of
 *  two — full fold → trimmed → refolded smaller — so each residue carries the
 *  offset to its refolded position (--dx/--dy) and, if it is one of the
 *  removed ones, the direction it drifts off in (--ox/--oy). */
const MNF_N = 14; // full-length chain
const MNF_KEEP = 9; // residues retained after trimming from the C-terminal end
const MNF_CX = 150; // fold centre
const MNF_CY = 132;
const MNF_R_FULL = 52; // full-length fold, base radius
const MNF_R_MINI = 32; // refolded (miniaturised), base radius
/** Both radii cycle with (i % 3) rather than staying fixed, so each fold comes
 *  out lumpy rather than a perfect circle — same trick as BLZ_BEADS. */
const MNF_R_STEP = 11;
const MNF_SEQ_Y = 258; // the sequence strip below the fold
const MNF_SEQ_X0 = 26;
const MNF_SEQ_X1 = 274;

const MNF_RESIDUES = Array.from({ length: MNF_N }, (_, i) => {
  const kept = i < MNF_KEEP;
  const bump = (i % 3) * MNF_R_STEP;

  // full-length fold: all residues spread around the big fold
  const angFull = (i / MNF_N) * Math.PI * 2 - Math.PI / 2;
  const radFull = MNF_R_FULL + bump;
  const fx = MNF_CX + Math.cos(angFull) * radFull;
  const fy = MNF_CY + Math.sin(angFull) * radFull;

  // refolded: only the kept residues, respread around the smaller fold
  const angMini = (i / MNF_KEEP) * Math.PI * 2 - Math.PI / 2;
  const radMini = MNF_R_MINI + bump;
  const mx = MNF_CX + Math.cos(angMini) * radMini;
  const my = MNF_CY + Math.sin(angMini) * radMini;

  return {
    kept,
    fx,
    fy,
    dx: mx - fx, // full fold → refolded
    dy: my - fy,
    ox: Math.cos(angFull) * 52, // trimmed residues drift outward
    oy: Math.sin(angFull) * 52,
    sx: MNF_SEQ_X0 + (i * (MNF_SEQ_X1 - MNF_SEQ_X0)) / (MNF_N - 1),
  };
});

/** Where the sequence is cut — midway between the last kept residue and the
 *  first removed one. */
const MNF_CUT_X =
  (MNF_RESIDUES[MNF_KEEP - 1].sx + MNF_RESIDUES[MNF_KEEP].sx) / 2;

function MiniaturisationViz() {
  return (
    <div className="mviz">
      <div className="mviz-stage mnf-stage" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="mnf-svg">
          {/* the fold itself — one circle per residue */}
          {MNF_RESIDUES.map((r, i) => (
            <circle
              key={`f${i}`}
              className={`mnf-bead${r.kept ? "" : " trim"}`}
              cx={r.fx}
              cy={r.fy}
              r={8}
              style={
                {
                  "--dx": `${r.dx.toFixed(1)}px`,
                  "--dy": `${r.dy.toFixed(1)}px`,
                  "--ox": `${r.ox.toFixed(1)}px`,
                  "--oy": `${r.oy.toFixed(1)}px`,
                } as CSSProperties
              }
            />
          ))}

          {/* active site — never removed: the point is that function survives */}
          <circle className="mnf-active" cx={MNF_CX} cy={MNF_CY} r={12} />

          {/* the sequence below: retained stretch, then the removed tail */}
          <rect
            className="mnf-seq-line"
            x={MNF_SEQ_X0}
            y={MNF_SEQ_Y - 1.5}
            width={MNF_RESIDUES[MNF_KEEP - 1].sx - MNF_SEQ_X0}
            height={3}
          />
          <rect
            className="mnf-seq-line trim"
            x={MNF_RESIDUES[MNF_KEEP - 1].sx}
            y={MNF_SEQ_Y - 1.5}
            width={MNF_SEQ_X1 - MNF_RESIDUES[MNF_KEEP - 1].sx}
            height={3}
          />
          {MNF_RESIDUES.map((r, i) => (
            <circle
              key={`s${i}`}
              className={`mnf-seq${r.kept ? "" : " trim"}`}
              cx={r.sx}
              cy={MNF_SEQ_Y}
              r={7}
            />
          ))}

          {/* where the cut is made */}
          <line
            className="mnf-cut"
            x1={MNF_CUT_X}
            y1={MNF_SEQ_Y - 24}
            x2={MNF_CUT_X}
            y2={MNF_SEQ_Y + 24}
          />
        </svg>
      </div>
      <MvizInfo
        title="Consequat velit nostrud ea proident"
        more="Placeholder: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate. Record the approach, its inputs and parameters, and what the output was used to decide. Nothing here is a real result yet."
        note="Aliquip ea dolore sunt magna ut consectetur veniam id laborum eu nisi adipisicing elit."
      >
        Voluptate ullamco fugiat esse aliqua duis mollit tempor ad sint
        exercitation non culpa qui deserunt lorem in eiusmod amet labore sed
        proident occaecat velit aute commodo est enim reprehenderit ea nostrud
        pariatur laboris minim cupidatat ut anim dolor incididunt sit consequat
        irure et aliquip magna.
      </MvizInfo>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Subsection headings                                                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  MethodsHero — animated workflow-flow banner (.mxh-*)                         */
/* -------------------------------------------------------------------------- */

/** Node coordinates (SVG units) for the branching pipeline motif in the hero. */
const HERO_NODES: { x: number; y: number; accent?: boolean }[] = [
  { x: 60, y: 130 },
  { x: 210, y: 66, accent: true },
  { x: 210, y: 194 },
  { x: 360, y: 130, accent: true },
  { x: 510, y: 74 },
  { x: 510, y: 186, accent: true },
  { x: 630, y: 130 },
];
/** Edges (index pairs into HERO_NODES) — branch out, merge, branch, merge. */
const HERO_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
];

/**
 * MethodsHero — the animated banner atop the Methods page. A lightweight SVG
 * pipeline (nodes branch, merge and pulse; an orange "flow" travels the edges)
 * echoes the workflow flowcharts below. Sits directly on the light-blue page —
 * white/orange marks, navy text. Chips jump to the method groups. Motion is
 * gated by prefers-reduced-motion in CSS. Namespaced under `.mxh-*`.
 */
function MethodsHero() {
  return (
    <header className="mxh">
      <div className="mxh-content">
        <span className="mxh-eyebrow">DTU-Denmark · Dry Lab · Methods</span>
        <h1 className="mxh-title">
          The <span>computational methods</span> behind the project
        </h1>
        <p className="mxh-sub">
          From binding pockets to designed variants: the tools, models and
          workflows that turn structures and sequences into decisions.
        </p>
      </div>

      {/* Mirrors the Discovery hero: text column on the left, the motif as a
          real grid column on the right. It used to be an absolutely-positioned
          background with preserveAspectRatio="xMidYMid slice" — "slice" crops
          to fill, so once the hero grew to full-screen height the 690x260
          artwork was cut and the nodes were sliced through. As a sized column
          with height:auto it scales whole instead. */}
      <div className="mxh-viz" aria-hidden="true">
        <svg className="mxh-canvas" viewBox="0 0 690 260">
          {HERO_EDGES.map(([a, b], i) => {
            const p1 = HERO_NODES[a];
            const p2 = HERO_NODES[b];
            return (
              <line
                key={`e${i}`}
                className="mxh-edge"
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
              />
            );
          })}
          {HERO_EDGES.map(([a, b], i) => {
            const p1 = HERO_NODES[a];
            const p2 = HERO_NODES[b];
            return (
              <line
                key={`f${i}`}
                className="mxh-flow"
                style={{ animationDelay: `${i * -0.4}s` } as CSSProperties}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
              />
            );
          })}
          {HERO_NODES.map((n, i) => (
            <circle
              key={`n${i}`}
              className={n.accent ? "mxh-node accent" : "mxh-node"}
              cx={n.x}
              cy={n.y}
              r={n.accent ? 11 : 8}
              style={{ animationDelay: `${i * -0.35}s` } as CSSProperties}
            />
          ))}
        </svg>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * ModelMethods — the Methods detail page: the computational methods used across
 * the project, grouped into general-purpose, discovery and engineering methods.
 */
export function ModelMethods() {
  // Constant light-blue page background across the Model section (removed on
  // unmount). Rule lives in model.css but Vite emits one global CSS bundle.
  useEffect(() => {
    document.body.classList.add("model-bg");
    return () => document.body.classList.remove("model-bg");
  }, []);

  return (
    <>
      <MethodsHero />

      <div className="page-container">
        <TOC pages={MODEL_PAGES} activeKey="methods" />

        <PageTitle title="Methods" />

        <div className="page-start row mt-4">
          <div className="col-lg-12">
            <TextBox className="model-prose">
              <p style={{ color: "#123a52" }}>
                {/* PLACEHOLDER — replace with the real methods intro. */}
                Placeholder methods intro. Set up the computational pipeline
                below: the tools used at each stage, the key assumptions, and
                where the inputs and parameters come from.
              </p>
            </TextBox>

            {/* --- Group 1: structural assessment, UPO track only ---
                These were originally framed as "general-purpose" and described
                as applying to both the laccase and the UPO tracks. In practice
                they are used only on UPOs, so the group is named for that. */}
            <section id="methods-upo-structural">
              <SectionHeading title="UPOs structural assessment" />
              <SectionIntro>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                euismod ligula vitae felis tincidunt, quis dignissim arcu
                vehicula. Nunc placerat, sapien nec porttitor gravida, tellus
                urna consequat nisl, at lacinia risus nibh eu magna.
              </SectionIntro>

              {/* Workflow flowchart first, then the method illustrations — one
                  MethodBlock per flowchart step, in the same order, so the TOC
                  lists the steps under this section. */}
              <ModelPipeline steps={UPO_STRUCTURAL_WORKFLOW} />
              <MethodBlock
                id="method-docking"
                step={UPO_STRUCTURAL_WORKFLOW[0]}
              >
                <DockingSearchViz />
              </MethodBlock>
              <MethodBlock id="method-md" step={UPO_STRUCTURAL_WORKFLOW[1]}>
                <MDViz />
              </MethodBlock>
            </section>

            {/* --- Group 2: enzyme discovery --- */}
            <section id="methods-discovery">
              <SectionHeading title="Enzyme discovery" />
              <SectionIntro>
                Praesent vulputate mauris id turpis vestibulum, non feugiat
                ipsum aliquet. Curabitur maximus lorem sit amet enim tempor, ut
                convallis quam mattis. Integer fermentum velit id purus
                ultricies, vitae bibendum orci pulvinar.
              </SectionIntro>

              {/* Discovery workflow flowchart first, then the method illustrations */}
              <ModelPipeline steps={DISCOVERY_WORKFLOW} />
              <MethodBlock id="method-blast" step={DISCOVERY_WORKFLOW[0]}>
                <BlastViz />
              </MethodBlock>
              <MethodBlock
                id="method-phylogenetics"
                step={DISCOVERY_WORKFLOW[1]}
              >
                <PhyloTreeViz />
              </MethodBlock>
              <MethodBlock id="method-boltz" step={DISCOVERY_WORKFLOW[2]}>
                <BoltzViz />
              </MethodBlock>
            </section>

            {/* --- Group 3: channel-discovery methods (UPOs only) --- */}
            <section id="methods-channel">
              <SectionHeading title="UPO channel discovery" />

              {/* Team-written introduction (draft). The paragraphs live in
                  ChannelIntro.tsx because the Discovery page shows this same
                  method write-up at the end of each of its Channel discovery
                  subsections — one copy, two pages. Edit them there.

                  This introduction is the ONLY prose in this section that sits
                  outside a method card. Each method's own write-up lives in its
                  card below: the opening paragraph on the face of the card, the
                  detail behind "More about this method". */}
              <ChannelIntro />

              {/* Channel-discovery workflow flowchart first, then the method illustrations */}
              <ModelPipeline steps={CHANNEL_WORKFLOW} />

              <MethodBlock id="method-fpocket" step={CHANNEL_WORKFLOW[0]}>
                <FpocketVizV2 />
              </MethodBlock>
              <MethodBlock id="method-caver" step={CHANNEL_WORKFLOW[1]}>
                <CaverViz />
              </MethodBlock>
              <MethodBlock
                id="method-channel-clustering"
                step={CHANNEL_WORKFLOW[2]}
              >
                <ChannelClusterViz />
              </MethodBlock>
            </section>

            {/* --- Group 4: methods specific to enzyme engineering --- */}
            {/* --- Group 4a: enzyme-engineering methods, UPO branch ---
                The engineering track is split into two sibling sections, one per
                enzyme family, so each gets its own TOC entry. Both headings must
                each render a SectionHeading, which is what emits the <h1> the
                TOC indexes. The Laccase block used to be a heading-less
                sub-block inside this section, which is why it never appeared in
                the contents list.

                This section keeps the id `methods-engineering`; it was the
                target of a hero jump chip, and keeping it means any existing
                link to #methods-engineering still resolves. */}
            <section id="methods-engineering">
              <SectionHeading title="UPOs enzyme engineering" />
              <SectionIntro>
                Etiam porta magna in dui rhoncus, ac tempor libero facilisis.
                Morbi consequat arcu nec mi laoreet, sed rutrum est varius.
                Phasellus dapibus quam ut ante ullamcorper, in tristique nulla
                eleifend.
              </SectionIntro>

              {/* Engineering pipeline flowchart first, then the method illustrations */}
              <ModelPipeline steps={PIPELINE_STEPS} />
              <MethodBlock id="method-rfdiffusion" step={PIPELINE_STEPS[0]}>
                <RFDiffusionViz />
              </MethodBlock>
              <MethodBlock id="method-ligandmpnn" step={PIPELINE_STEPS[1]}>
                <LigandMPNNViz />
              </MethodBlock>
              <MethodBlock id="method-rosettafold" step={PIPELINE_STEPS[2]}>
                <RosettaFoldViz />
              </MethodBlock>
            </section>

            {/* --- Group 4b: enzyme-engineering methods, laccase branch --- */}
            <section id="methods-engineering-laccases">
              <SectionHeading title="Laccases enzyme engineering" />
              <SectionIntro>
                Fusce tempus arcu a mauris blandit, quis efficitur nunc
                sollicitudin. Cras interdum lacus vitae elit congue, nec
                pharetra augue mollis. Duis vel eros ac ligula posuere fringilla
                at non velit.
              </SectionIntro>
              <ModelPipeline steps={LACCASE_WORKFLOW} />
              <MethodBlock
                id="method-rational-design"
                step={LACCASE_WORKFLOW[0]}
              >
                <RationalDesignViz />
              </MethodBlock>
              <MethodBlock id="method-stability" step={LACCASE_WORKFLOW[1]}>
                <StabilityMutagenesisViz />
              </MethodBlock>
              <MethodBlock
                id="method-miniaturisation"
                step={LACCASE_WORKFLOW[2]}
              >
                <MiniaturisationViz />
              </MethodBlock>
            </section>

            {/* References */}
            <section id="references" className="mt-5">
              <SectionHeading title="References" />
              {/* The works cited in the UPO channel-discovery section above.
                  The other method groups on this page are still placeholders
                  and cite nothing yet — add their tools and papers here as
                  those sections are written, rather than pre-listing works the
                  page does not actually cite. */}
              <ReferenceBar
                references={referenceNodes(CHANNEL_CITATIONS)}
                showTitle={false}
              />
            </section>

            {/* Bottom prev/next navigation (Overview ← Methods → Discovery) */}
            <ModelPager active="methods" />
          </div>
        </div>
      </div>
    </>
  );
}
