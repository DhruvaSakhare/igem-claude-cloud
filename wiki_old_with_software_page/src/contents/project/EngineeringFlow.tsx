import { useState } from "react";

import type { Cycle } from "./engineering-cycles";

/* ========================================================================== *
 *  EngineeringFlow — the "flow chart with all cycles" that opens the page
 *
 *  A redrawing of the DBTL figure in the team's Engineering document: the
 *  four-segment Design / Build / Test / Learn ring, and the loop it stands for
 *  (identify candidates → produce in the wet lab → test on the model substrate
 *  → ask what worked best). Here it is drawn once per cycle and the three rings
 *  are chained, so the whole page is visible at a glance.
 *
 *  INLINE SVG, NOT AN IMAGE, on purpose. iGEM requires every asset a wiki loads
 *  to be served from iGEM infrastructure, which would mean uploading a PNG via
 *  the uploads tool and referencing static.igem.wiki. Drawing it in SVG keeps
 *  it as code in this repository — nothing to upload, nothing to re-upload when
 *  a cycle is renamed — and it can respond to the reader, which a PNG cannot:
 *  hovering a segment names that step, and clicking a ring scrolls to it.
 *
 *  The segment colours are the document's own (dark red / blue / green / navy),
 *  not the site palette, because they are what makes this recognisable as the
 *  DBTL figure. Everything else — the rails, the labels — uses the site colours.
 * ========================================================================== */

/** The four stages, clockwise from the top, matching the document's figure:
 *  BUILD top-right, TEST bottom-right, LEARN bottom-left, DESIGN top-left.
 *  `step` is the plain-language box the document pairs with the stage. */
const STAGES = [
  {
    key: "build",
    label: "Build",
    initial: "B",
    color: "#2b35ee",
    step: "Produce the enzymes in the wet lab",
  },
  {
    key: "test",
    label: "Test",
    initial: "T",
    color: "#2ec78d",
    step: "Test the enzymes on our model substrate",
  },
  {
    key: "learn",
    label: "Learn",
    initial: "L",
    color: "#16173f",
    step: "Ask which enzymes worked best",
  },
  {
    key: "design",
    label: "Design",
    initial: "D",
    color: "#8e1b1b",
    step: "Identify candidate enzymes",
  },
] as const;

/* Geometry. The viewBox is fixed and the wrapper scrolls sideways below its
 * width, rather than the rings shrinking until the letters are unreadable. */
const VIEW_W = 900;
const VIEW_H = 250;
const RING_Y = 96;
const RING_X = [150, 450, 750];
const R_OUT = 72;
const R_IN = 42;
/** Degrees trimmed from each end of a segment, giving the white gaps. */
const GAP = 3;

/** A point on a circle, by angle measured clockwise from twelve o'clock. */
function pt(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

/** One segment of the ring: an annular sector from `a0` to `a1`. */
function sector(cx: number, cy: number, a0: number, a1: number) {
  const [x0, y0] = pt(cx, cy, R_OUT, a0);
  const [x1, y1] = pt(cx, cy, R_OUT, a1);
  const [x2, y2] = pt(cx, cy, R_IN, a1);
  const [x3, y3] = pt(cx, cy, R_IN, a0);
  return [
    `M ${x0} ${y0}`,
    `A ${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}`,
    "Z",
  ].join(" ");
}

export function EngineeringFlow({
  cycles,
  onJump,
}: {
  /** The active branch's three cycles — the rings are labelled from these, so
   *  renaming a cycle in engineering-cycles.tsx renames it here too. */
  cycles: Cycle[];
  /** Called with a cycle id when its ring is activated. */
  onJump: (id: string) => void;
}) {
  /** The stage the reader is pointing at, named in the caption below. */
  const [hovered, setHovered] = useState<(typeof STAGES)[number] | null>(null);

  return (
    <figure className="eng-flow">
      <div className="eng-flow-scroll">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="eng-flow-svg"
          role="img"
          aria-label={`The three engineering cycles: ${cycles
            .map((c) => c.title)
            .join("; ")}. Each runs through Design, Build, Test and Learn.`}
        >
          {/* Rails between the rings: cycle 1 feeds cycle 2 feeds cycle 3. */}
          {RING_X.slice(0, -1).map((x, i) => {
            const from = x + R_OUT + 14;
            const to = RING_X[i + 1] - R_OUT - 22;
            return (
              <g key={`rail-${i}`} className="eng-flow-rail">
                <line x1={from} y1={RING_Y} x2={to} y2={RING_Y} />
                <polygon
                  points={`${to + 12},${RING_Y} ${to},${RING_Y - 6} ${to},${RING_Y + 6}`}
                />
              </g>
            );
          })}

          {cycles.slice(0, RING_X.length).map((cycle, ci) => {
            const cx = RING_X[ci];
            return (
              <g key={cycle.id}>
                {/* The ring itself. One button per cycle, not per segment: the
                    segments explain the method, the ring is the link. */}
                <g
                  className="eng-flow-ring"
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to ${cycle.title}`}
                  onClick={() => onJump(cycle.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onJump(cycle.id);
                    }
                  }}
                >
                  {STAGES.map((stage, si) => {
                    const a0 = si * 90 + GAP;
                    const a1 = (si + 1) * 90 - GAP;
                    const [lx, ly] = pt(
                      cx,
                      RING_Y,
                      (R_IN + R_OUT) / 2,
                      si * 90 + 45,
                    );
                    const dim = hovered !== null && hovered.key !== stage.key;
                    return (
                      <g
                        key={stage.key}
                        className={`eng-flow-seg${dim ? " is-dim" : ""}`}
                        onMouseEnter={() => setHovered(stage)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <path
                          d={sector(cx, RING_Y, a0, a1)}
                          fill={stage.color}
                        />
                        <text x={lx} y={ly} className="eng-flow-initial">
                          {stage.initial}
                        </text>
                      </g>
                    );
                  })}

                  {/* Cycle number in the hole of the ring. */}
                  <text x={cx} y={RING_Y + 7} className="eng-flow-number">
                    {ci + 1}
                  </text>
                </g>

                {/* Name under the ring. Two lines: the short label, then what
                    the cycle actually was. */}
                <text x={cx} y={RING_Y + R_OUT + 30} className="eng-flow-label">
                  {cycle.label}
                </text>
                <text x={cx} y={RING_Y + R_OUT + 52} className="eng-flow-sub">
                  {/* "Cycle 1: Literature research" → "Literature research" */}
                  {cycle.title.split(":").slice(1).join(":").trim() ||
                    cycle.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Caption. Idle, it names the loop; pointing at a segment names that
          step, so the figure explains itself without a legend. */}
      <figcaption className="eng-flow-caption">
        {hovered ? (
          <>
            <span
              className="eng-flow-dot"
              style={{ backgroundColor: hovered.color }}
              aria-hidden="true"
            />
            <strong>{hovered.label}</strong> — {hovered.step}
          </>
        ) : (
          <>
            Three Design–Build–Test–Learn cycles, each one starting from what
            the last one taught us. Hover a segment to see what that step was;
            click a ring to jump to the cycle.
          </>
        )}
      </figcaption>
    </figure>
  );
}
