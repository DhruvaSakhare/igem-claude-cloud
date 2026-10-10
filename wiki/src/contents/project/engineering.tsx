import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { TocSection } from "../../components/WindmillToc";
import { WindmillTocDrawn } from "../../components/WindmillTocDrawn";
import ReferenceBar from "../../components/ReferenceBar";
import { referenceNodes } from "../dry-lab/Cite";
import { EngineeringFlow } from "./EngineeringFlow";
import {
  BRANCHES,
  BRANCH_ORDER,
  type Branch,
  type BranchKey,
  type Cycle,
  type Stage,
} from "./engineering-cycles";
import "./engineering.css";

/* ========================================================================== *
 *  Engineering Success  (route /engineering)
 *
 *  Two enzyme families, three DBTL cycles each. The two are shown one at a
 *  time behind a toggle rather than side by side: the dry lab and wet lab work
 *  together within a family, so the split that matters is Laccases vs UPOs, and
 *  six cycles in one column would be a very long page to scroll past to reach
 *  the family you came for.
 *
 *  THE PROSE IS NOT IN THIS FILE. This is the layout — the intro, the flow
 *  chart, the toggle and the loop that draws a cycle. Everything written lives
 *  in engineering-cycles.tsx, so writing up a cycle never means editing page
 *  machinery. See that file before adding content.
 *
 *  Styling is engineering.css (.eng-*).
 * ========================================================================== */

/** The stages of a cycle, in the order they are drawn. `key` indexes the
 *  matching field on a Cycle, so adding a stage here is a type error until the
 *  content file grows one too. */
const STAGES: {
  key: keyof Pick<Cycle, "design" | "build" | "test" | "learn">;
  label: string;
}[] = [
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "test", label: "Test" },
  { key: "learn", label: "Learn" },
];

/** Which branch a URL hash selects. Anything else (including no hash) opens on
 *  laccases, the branch that is written up. */
function branchFromHash(hash: string): BranchKey {
  const key = hash.replace(/^#/, "");
  return (BRANCH_ORDER as string[]).includes(key)
    ? (key as BranchKey)
    : "laccases";
}

/* -------------------------------------------------------------------------- */
/*  Pieces of a cycle                                                          */
/* -------------------------------------------------------------------------- */

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
        {stage.body}
        {/* What is still outstanding, said plainly. This is deliberately a
            quiet line and never a claim: the team's open questions stay in
            their own document until there is a result to report. */}
        {stage.pending && <p className="eng-pending">{stage.pending}</p>}
      </div>
    </div>
  );
}

function CycleSection({ cycle }: { cycle: Cycle }) {
  return (
    <section id={cycle.id} className="eng-cycle">
      {/* The TOC indexes `section[id] h1`, so the cycle title is the <h1> that
          puts this cycle in the contents. */}
      <h1 className="eng-cycle-title">{cycle.title}</h1>

      <p className="eng-question">
        <span className="eng-question-tag">Question</span>
        {cycle.question}
      </p>

      {STAGES.map(({ key, label }) => (
        <StageBlock key={key} label={label} stage={cycle[key]} />
      ))}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  The branch toggle                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The Laccases / UPOs switch.
 *
 * A tablist rather than two links: the two branches are one page's two halves,
 * not two pages. Both buttons stay visible and the selected one is filled in
 * its branch colour, so which half you are reading is readable at a glance
 * rather than inferred from which button looks pressed. Left/right arrows move
 * between them, as a tablist should.
 */
function BranchToggle({
  active,
  onSelect,
}: {
  active: BranchKey;
  onSelect: (key: BranchKey) => void;
}) {
  return (
    <div className="eng-toggle-wrap">
      <div className="eng-toggle" role="tablist" aria-label="Enzyme family">
        {BRANCH_ORDER.map((key) => {
          const branch = BRANCHES[key];
          const selected = key === active;
          return (
            <button
              key={key}
              role="tab"
              id={`eng-tab-${key}`}
              aria-selected={selected}
              aria-controls={`eng-panel-${key}`}
              tabIndex={selected ? 0 : -1}
              className={`eng-toggle-btn${selected ? " is-active" : ""}`}
              data-branch={key}
              onClick={() => onSelect(key)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                e.preventDefault();
                const i = BRANCH_ORDER.indexOf(active);
                const next =
                  BRANCH_ORDER[
                    (i +
                      (e.key === "ArrowRight" ? 1 : BRANCH_ORDER.length - 1)) %
                      BRANCH_ORDER.length
                  ];
                onSelect(next);
                document.getElementById(`eng-tab-${next}`)?.focus();
              }}
            >
              <span className="eng-toggle-label">{branch.label}</span>
              <span className="eng-toggle-blurb">{branch.blurb}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  The page                                                                   */
/* -------------------------------------------------------------------------- */

export function Engineering() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const active = branchFromHash(hash);
  const branch: Branch = BRANCHES[active];

  // Give this page the same light-blue background as the header, restoring
  // the default when navigating away.
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#b0e6ff";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  /* The branch lives in the URL hash (/engineering#upos) so a link can open on
   * a specific family and a reload keeps it. `replace` keeps the toggle out of
   * the back button's history — going back should leave the page, not undo
   * four flips of a switch. App.tsx resets scroll on `pathname` only, so a
   * hash change does not throw the reader to the top; the scroll below is ours
   * and is deliberate, since everything under the toggle has just changed. */
  const selectBranch = useCallback(
    (key: BranchKey) => {
      navigate(`#${key}`, { replace: true });
      document
        .getElementById("branches")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [navigate],
  );

  const jumpToCycle = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* The windmill's blades, rebuilt when the branch changes so the rotor lists
   * the cycles actually on the page. Memoised because useActiveSection
   * re-subscribes its observer whenever this array's identity changes. */
  const sections: TocSection[] = useMemo(
    () => [
      { id: "intro", label: "Introduction" },
      ...branch.cycles.map((c) => ({ id: c.id, label: c.label })),
      { id: "future-steps", label: "Future steps" },
    ],
    [branch],
  );

  return (
    <>
      {/* Windmill table of contents — fixed on the left. As the reader scrolls,
          the rotor spins so the current section's blade turns horizontal and
          carries its title. */}
      <WindmillTocDrawn sections={sections} />

      {/* ── SECTION: Introduction (common to both branches) ───────────────── */}
      <section id="intro" className="eng-intro">
        <h1 className="eng-intro-title">Two tracks, three cycles each</h1>
        <p className="lead">
          We've been using Design-Build-Test-Learn (DBTL) cycles to achieve our
          goal of enhancing the activity of enzymes on our model substrate NNBT
          and on bigger "real deal" substrates, like epoxy resin. We followed
          two parallel tracks of interesting enzymes: <strong>UPOs</strong> —
          channel-including enzymes, with improved activity on NNBT — and{" "}
          <strong>laccases</strong>, whose active site sits on the outside,
          making them more ideal for real-life substrates and bigger polymers.
        </p>
        <p>
          To design these enzymes we used the DBTL engineering process:
          identifying the candidate enzymes, "building" them in the laboratory,
          then "testing" them using the colorimetric assay, and finally
          "learning" which candidates performed best and what to improve for the
          next iteration.
        </p>

        <EngineeringFlow cycles={branch.cycles} onJump={jumpToCycle} />
      </section>

      {/* ── The toggle, and the branch it selects ─────────────────────────── */}
      <div id="branches" className="eng-branches" data-branch={active}>
        <BranchToggle active={active} onSelect={selectBranch} />

        <div
          id={`eng-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`eng-tab-${active}`}
          className="eng-panel"
        >
          {branch.draft && (
            <p className="eng-draft-note">
              <strong>Draft.</strong> This track is still being written up — the
              cycles below are an outline of the work, not a report of its
              results.
            </p>
          )}

          {branch.cycles.map((cycle) => (
            <CycleSection key={cycle.id} cycle={cycle} />
          ))}

          {/* References for the branch on show. Each branch cites its own
              works, so the list changes with the toggle; both read the shared
              bibliography in contents/dry-lab/bibliography.ts. */}
          <ReferenceBar
            references={referenceNodes(branch.references)}
            title={`References — ${branch.label}`}
          />
        </div>
      </div>

      {/* ── SECTION: Future steps (common to both branches) ───────────────── */}
      <section id="future-steps" className="eng-future">
        <h1>Future steps</h1>
        <p className="eng-pending">
          Where the two tracks come together — an enzyme cocktail, and what we
          would do next — is still being written.
        </p>
      </section>
    </>
  );
}
