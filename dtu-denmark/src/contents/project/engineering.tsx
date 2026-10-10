import { useCallback } from "react";

import TOC from "../../components/TOC";
import ReferenceBar from "../../components/ReferenceBar";
import { referenceNodes } from "../dry-lab/Cite";
import { descriptionReferenceNodes } from "./descriptionReferenceNodes";
import { SectionHeading } from "../dry-lab/SectionHeading";
import "../dry-lab/tracks.css";
import { EngineeringFlow } from "./EngineeringFlow";
import {
  FUTURE_STEPS,
  CYCLES,
  DESCRIPTION_REFERENCES_CITED,
  FAMILY_LABEL,
  INTRO,
  REFERENCES,
  type Cycle,
  type Stage,
} from "./engineering-cycles";
import "./engineering.css";

/* ========================================================================== *
 *  Engineering Success  (route /engineering)
 *
 *  One page read top to bottom: an introduction, the four DBTL cycles —
 *  laccase discovery, laccase engineering, UPO discovery, UPO engineering —
 *  and future steps. Each cycle is drawn in its enzyme family's colour, the
 *  same blue (laccases) and orange (UPOs) as the Model pages: the cycle's
 *  <section> carries `track-laccase` / `track-upo` from dry-lab/tracks.css,
 *  and everything inside it reads `--track`.
 *
 *  THE PROSE IS NOT IN THIS FILE. This is the layout. Everything written lives
 *  in engineering-cycles.tsx, so writing up a cycle never means editing page
 *  machinery. See that file before adding content.
 *
 *  Styling is engineering.css (.eng-*).
 * ========================================================================== */

/** The stages of a cycle, in the order they are drawn. `key` indexes the
 *  matching field on a Cycle. */
const STAGES: {
  key: keyof Pick<Cycle, "design" | "build" | "test" | "learn">;
  label: string;
}[] = [
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "test", label: "Test" },
  { key: "learn", label: "Learn" },
];

/* -------------------------------------------------------------------------- */
/*  Pieces of the page                                                         */
/* -------------------------------------------------------------------------- */

/** Written text and/or its outstanding note. Renders nothing when neither is
 *  set. */
function StageText({ stage }: { stage: Stage }) {
  return (
    <>
      {stage.body}
      {/* What is still outstanding, said plainly. Deliberately a quiet line
          and never a claim. */}
      {stage.pending && <p className="eng-pending">{stage.pending}</p>}
    </>
  );
}

/** One DBTL stage. A stage with neither written content nor an outstanding
 *  note is not drawn at all — an empty heading says less than nothing. */
function StageBlock({ label, stage }: { label: string; stage: Stage }) {
  if (!stage.body && !stage.pending) return null;

  return (
    <div className={`eng-stage eng-stage-${label.toLowerCase()}`}>
      <h3 className="eng-stage-title">
        <span className="eng-stage-initial" aria-hidden="true">
          {label[0]}
        </span>
        {label}
      </h3>
      <div className="eng-stage-body">
        <StageText stage={stage} />
      </div>
    </div>
  );
}

function CycleSection({ cycle }: { cycle: Cycle }) {
  return (
    <section id={cycle.id} className={`eng-cycle track-${cycle.family}`}>
      {/* Which enzyme family this cycle belongs to, in its colour. */}
      <p className="eng-family">{FAMILY_LABEL[cycle.family]}</p>
      {/* The TOC indexes `section[id] h1`; SectionHeading is that <h1>. */}
      <SectionHeading title={cycle.title} />

      <div className="eng-question">
        <span className="eng-question-tag">Question</span>
        <StageText stage={cycle.question} />
      </div>

      {STAGES.map(({ key, label }) => (
        <StageBlock key={key} label={label} stage={cycle[key]} />
      ))}
    </section>
  );
}

/** The page's references in one alphabetical list. They come from two
 *  bibliographies — the Dry Lab one, and the Project Description one that the
 *  "More about …" boxes cite — so both are formatted, then sorted by key
 *  (first author + year). */
const PAGE_REFERENCES = [
  ...REFERENCES.map((id) => ({ id, node: referenceNodes([id])[0] })),
  ...DESCRIPTION_REFERENCES_CITED.map((id) => ({
    id,
    node: descriptionReferenceNodes([id])[0],
  })),
]
  .sort((a, b) => a.id.localeCompare(b.id))
  .map(({ node }) => node);

/* -------------------------------------------------------------------------- */
/*  The page                                                                   */
/* -------------------------------------------------------------------------- */

export function Engineering() {
  const jumpToCycle = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <TOC />

      <div className="page-start">
        {/* ── Introduction ─────────────────────────────────────────────────── */}
        <section id="intro" className="eng-intro">
          <SectionHeading title="Introduction" />
          <StageText stage={INTRO} />

          <EngineeringFlow cycles={CYCLES} onJump={jumpToCycle} />
        </section>

        {/* ── The four cycles ──────────────────────────────────────────────── */}
        {CYCLES.map((cycle) => (
          <CycleSection key={cycle.id} cycle={cycle} />
        ))}

        {/* ── Future steps ─────────────────────────────────────────────────── */}
        <section id="future-steps" className="eng-future">
          <SectionHeading title="Future steps" />
          <StageText stage={FUTURE_STEPS} />
        </section>

        <ReferenceBar references={PAGE_REFERENCES} />
      </div>
    </>
  );
}
