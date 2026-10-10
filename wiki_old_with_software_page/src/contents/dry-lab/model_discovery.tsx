import { useEffect, useRef, useState } from "react";

import { MODEL_PAGES, ModelPager } from "./ModelNav";
import { FigNum, NumberedFigures, TabNum } from "./FigureNumbers";
import TOC from "../../components/TOC";
import { StructureViewer } from "../../components/StructureViewer";
import { CHANNEL_BASE } from "./channel-assets";
import { TunnelFigure, FigureRow, WikiFigure } from "./ChannelFigures";
import { DATABASE_STRUCTURES, LITERATURE_ALL_STRUCTURES } from "./structures";
import { SectionHeading, SubsectionHeading } from "./SectionHeading";
import { referenceNodes } from "./Cite";
import type { CitationKey } from "./bibliography";
import { MdFigureBlock } from "./MdFigures";
import { DetailsBox } from "./DetailsBox";
import {
  StructuralMethodsBox,
} from "./structural-methods";
import {
  BlastStage,
  BoltzStage,
  MethodBlock,
  ModelPipeline,
  MvizInfo,
  PhyloStage,
  ProSmithStage,
} from "./model_methods";
import { MvizMoreInline } from "./MvizMoreInline";
import type { PipelineStep } from "./model_methods";
import { Cite } from "./Cite";
import { ChannelMethodsBox, ChannelWorkflow } from "./ChannelMethodsBox";
import {
  CHANNEL_METHOD_CITATIONS,
  CHANNEL_RESULTS_CITATIONS,
  DOCKING_METHOD_CITATIONS,
  LACCASE_CITATIONS,
  MD_METHOD_CITATIONS,
  UPO_CUPP_CITATIONS,
  UPO_LITERATURE_INTRO_CITATIONS,
  UPO_STRUCTURAL_CITATIONS,
} from "./citations";
import ReferenceBar from "../../components/ReferenceBar";
import "./model_discovery.css";

/* Figures served from public/ under the site base path — see model.tsx for the
 * full note. Swap for iGEM-uploaded URLs for the deployed wiki. */
const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`;
const surfaceImg = asset("Pada_1_Surface.png");
const pocketNnbtImg = asset("Pada_1_only_Pocket_NNBT_no_HEME.png");
const pada1Step1 = asset("pada1_step1.png");
const pada1Step2 = asset("pada1_step2.png");
const pada1Step3 = asset("pada1_step3.png");
const nnbt2 = asset("NNBT_2.png");
/* The molecular-dynamics animation is `pada1_step4.gif` (~10 MB) — too large to
 * commit/push to GitLab, so it is NOT kept in public/. A static frame stands in
 * for now. TO RESTORE THE ANIMATION: put `pada1_step4.gif` in public/ and change
 * the line below back to `asset("pada1_step4.gif")`. */
const mdSimGif = asset("pada1_step3.png");
const beaverCamera = asset("beaver_camera_md.png");

/* ========================================================================== *
 *  Model → Discovery  (route /model-discovery)
 *
 *  Enzyme-discovery results: an interactive radial phylogenetic-tree hero, then
 *  pop-up result figures and the interactive pocket / docking / MD walk-through.
 *
 *  Styling lives in model_discovery.css (.dtree-*, .rf-*, .pd-*). Navigation
 *  between the four model pages is handled by the TOC (see MODEL_PAGES).
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  DiscoveryTreeHero — interactive circular (radial) phylogenetic tree         */
/* -------------------------------------------------------------------------- */

/* Layout maths for a DIVERSE radial dendrogram (a "circular phylogenetic tree").
 * It's a SCHEMATIC of the phylogenetics method: the tips are anonymous
 * placeholders carrying random placeholder sequences — NOT real data, and it
 * asserts no evolutionary result. Computed once at module load (deterministic,
 * so there's no render-to-render jitter). */
const DT_CX = 210;
const DT_CY = 220;
const DT_R = 175;
// Varied clade sizes → an unbalanced, diverse tree (23 tips across 5 clades).
const CLADE_TIP_COUNTS = [5, 3, 6, 4, 5];
const CLADE_COLORS = ["#2e9e6b", "#4a6fd0", "#e8912e", "#0d9488", "#a855f7"];
// Fixed "reader" window at 3 o'clock that each tip rotates through.
const DT_SLOT_X = DT_CX + DT_R;
const DT_BOX_X = 416;

/** Small deterministic PRNG so the tree + sequences never change per render. */
const makeRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

type DTNode = {
  id: number;
  parent: number;
  depth: number;
  children: number[];
  leaf: boolean;
  leafIndex: number;
  angle: number;
  r: number;
  x: number;
  y: number;
  clade: number;
};

function buildDiverseTree() {
  const nodes: DTNode[] = [];
  const leafOrder: number[] = [];
  let leafCount = 0;
  const rng = makeRng(20260704);

  const mk = (parent: number, depth: number): DTNode => {
    const node: DTNode = {
      id: nodes.length,
      parent,
      depth,
      children: [],
      leaf: false,
      leafIndex: -1,
      angle: 0,
      r: 0,
      x: 0,
      y: 0,
      clade: 0,
    };
    nodes.push(node);
    return node;
  };

  // Recursively split `n` tips into a small, slightly-unbalanced subtree — the
  // splits vary clade to clade, which is where the diversity comes from.
  const grow = (parent: number, depth: number, n: number): number => {
    const node = mk(parent, depth);
    if (n <= 1) {
      node.leaf = true;
      node.leafIndex = leafCount++;
      leafOrder.push(node.id);
      return node.id;
    }
    const ways = n >= 5 && rng() < 0.4 ? 3 : 2; // occasional 3-way split
    const parts: number[] = [];
    let rem = n;
    for (let w = 0; w < ways - 1; w++) {
      const slotsLeft = ways - w - 1;
      const maxPart = rem - slotsLeft;
      const mid = rem / (ways - w);
      let part = Math.round(mid + (rng() - 0.5) * (maxPart - 1));
      part = Math.max(1, Math.min(maxPart, part));
      parts.push(part);
      rem -= part;
    }
    parts.push(rem);
    for (const p of parts) node.children.push(grow(node.id, depth + 1, p));
    return node.id;
  };

  const root = mk(-1, 0);
  for (const c of CLADE_TIP_COUNTS) root.children.push(grow(root.id, 1, c));

  const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 1);

  // leaf angles evenly around the full circle (start at the top)
  for (const id of leafOrder) {
    const n = nodes[id];
    n.angle = -Math.PI / 2 + ((n.leafIndex + 0.5) / leafCount) * Math.PI * 2;
  }
  // internal-node angle = mean of children (process deepest first)
  for (const n of [...nodes].sort((a, b) => b.depth - a.depth)) {
    if (!n.leaf) {
      const cs = n.children.map((c) => nodes[c].angle);
      n.angle = cs.reduce((s, v) => s + v, 0) / cs.length;
    }
  }
  // ROUND: every tip sits on the outer circle; internal nodes are placed by
  // depth. Because leaves have different depths, their branch LENGTHS differ —
  // that's the diversity, while the outline stays a clean circle.
  const rootChildren = nodes[0].children;
  for (const n of nodes) {
    n.r = n.leaf ? DT_R : (n.depth / maxDepth) * DT_R;
    n.x = DT_CX + n.r * Math.cos(n.angle);
    n.y = DT_CY + n.r * Math.sin(n.angle);
    let cur = n;
    while (cur.parent !== -1 && cur.depth > 1) cur = nodes[cur.parent];
    n.clade = cur.depth === 1 ? Math.max(0, rootChildren.indexOf(cur.id)) : 0;
  }

  // elbow links (arc at the parent radius, then a radial segment out to child)
  const polar = (r: number, a: number): [number, number] => [
    DT_CX + r * Math.cos(a),
    DT_CY + r * Math.sin(a),
  ];
  const links = nodes
    .filter((n) => n.parent !== -1)
    .map((c) => {
      const p = nodes[c.parent];
      const [ax, ay] = polar(p.r, p.angle);
      const [bx, by] = polar(p.r, c.angle);
      const [dx, dy] = polar(c.r, c.angle);
      const sweep = c.angle > p.angle ? 1 : 0;
      const d =
        p.r > 0.5
          ? `M${ax.toFixed(1)} ${ay.toFixed(1)} A${p.r.toFixed(1)} ${p.r.toFixed(
              1,
            )} 0 0 ${sweep} ${bx.toFixed(1)} ${by.toFixed(1)} L${dx.toFixed(
              1,
            )} ${dy.toFixed(1)}`
          : `M${DT_CX} ${DT_CY} L${dx.toFixed(1)} ${dy.toFixed(1)}`;
      return { id: c.id, child: c.id, d, depth: c.depth, clade: c.clade };
    });

  // ancestors of each leaf (node ids on the path leaf → root), for highlighting
  const ancestors: Record<number, number[]> = {};
  for (const id of leafOrder) {
    const chain: number[] = [];
    let cur: number = id;
    while (cur !== -1) {
      chain.push(cur);
      cur = nodes[cur].parent;
    }
    ancestors[id] = chain;
  }

  return { nodes, links, leaves: leafOrder, ancestors };
}
const RADIAL = buildDiverseTree();

// Placeholder amino-acid sequences, one per tip — clearly NOT real data.
const AA = "ACDEFGHIKLMNPQRSTVWY";
const SEQ_LEN = 22;
const seqRng = makeRng(1337);
const SEQS = RADIAL.leaves.map(() =>
  Array.from(
    { length: SEQ_LEN },
    () => AA[Math.floor(seqRng() * AA.length)],
  ).join(""),
);

/**
 * DiscoveryTreeHero — the interactive circular phylogenetic tree that opens the
 * Discovery page. Branches draw slowly outward when it scrolls in; the whole
 * tree then turns slowly, and a fixed "reader" window at 3 o'clock reveals the
 * sequence of whichever tip is passing through it (that tip's lineage lights up
 * too). Hover/focus any tip to pause the rotation and inspect it. Purely
 * schematic — anonymous placeholder tips and sequences. Styles under `.dtree-*`.
 */
function DiscoveryTreeHero() {
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rotRef = useRef<SVGGElement | null>(null);
  const angleRef = useRef(0);
  const activeRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  // reveal (draw) when the hero scrolls into view
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.2) setDrawn(true);
      },
      { threshold: [0, 0.2, 1] },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // once drawn: rotate slowly + track which tip is in the reader window
  useEffect(() => {
    if (!drawn) return;
    // nearest leaf to the 3-o'clock reader for a given rotation (radians)
    const nearest = (rot: number) => {
      let best = RADIAL.leaves[0];
      let bd = Infinity;
      for (const id of RADIAL.leaves) {
        const a = Math.atan2(
          Math.sin(RADIAL.nodes[id].angle + rot),
          Math.cos(RADIAL.nodes[id].angle + rot),
        );
        const d = Math.abs(a); // angular distance to 0 (3 o'clock)
        if (d < bd) {
          bd = d;
          best = id;
        }
      }
      return best;
    };

    const first = nearest(0);
    activeRef.current = first;
    setActive(first);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = 0;
    const DEG_PER_MS = 360 / 60000; // one slow revolution per minute
    const tick = (t: number) => {
      if (last && !pausedRef.current) {
        angleRef.current = (angleRef.current + (t - last) * DEG_PER_MS) % 360;
      }
      last = t;
      rotRef.current?.setAttribute(
        "transform",
        `rotate(${angleRef.current.toFixed(2)} ${DT_CX} ${DT_CY})`,
      );
      const nb = nearest((angleRef.current * Math.PI) / 180);
      if (nb !== activeRef.current) {
        activeRef.current = nb;
        setActive(nb);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drawn]);

  const enter = (id: number) => {
    pausedRef.current = true;
    setHover(id);
  };
  const leave = () => {
    pausedRef.current = false;
    setHover(null);
  };

  // whichever tip is being inspected (hover) or read (rotation)
  const focusLeaf = hover ?? active;
  const hi = focusLeaf != null ? new Set(RADIAL.ancestors[focusLeaf]) : null;
  const focusNode = focusLeaf != null ? RADIAL.nodes[focusLeaf] : null;
  const focusColor = focusNode ? CLADE_COLORS[focusNode.clade] : "#0e3a57";
  const seqLines = focusNode
    ? (SEQS[focusNode.leafIndex].match(/.{1,11}/g) ?? [])
    : [];

  return (
    <header className="dtree">
      <div className="dtree-text">
        <span className="dtree-eyebrow">DTU-Denmark · Dry Lab · Discovery</span>
        <h1 className="dtree-title">
          Mapping the <span>enzyme family</span>
        </h1>
        {/* No status line here. There used to be one below the lead text
            (a live "Candidate 03 · reading…" readout, later a static
            "anonymous placeholder tips" note); both were removed. The reader
            box beside the tree names the candidate on its own. */}
      </div>

      <div className="dtree-viz" ref={wrapRef}>
        <svg
          viewBox="0 0 620 440"
          className={`dtree-svg${drawn ? " in" : ""}${
            hover != null ? " hovering" : ""
          }`}
          role="img"
          aria-label="A slowly rotating circular phylogenetic tree of placeholder candidate sequences; a reader window shows the sequence of whichever tip is passing it."
        >
          <g className="dtree-guides" aria-hidden="true">
            <circle cx={DT_CX} cy={DT_CY} r={DT_R / 3} />
            <circle cx={DT_CX} cy={DT_CY} r={(DT_R * 2) / 3} />
            <circle cx={DT_CX} cy={DT_CY} r={DT_R} />
          </g>

          <g ref={rotRef} className="dtree-rot">
            {RADIAL.links.map((l) => {
              const on = hi ? hi.has(l.child) : false;
              return (
                <path
                  key={l.id}
                  d={l.d}
                  pathLength={1}
                  className={`dtree-link${on ? " hl" : ""}`}
                  style={{
                    animationDelay: `${l.depth * 0.4}s`,
                    stroke: on ? undefined : CLADE_COLORS[l.clade],
                  }}
                />
              );
            })}

            {RADIAL.leaves.map((id) => {
              const n = RADIAL.nodes[id];
              const on = hi ? hi.has(id) : false;
              return (
                <g
                  key={id}
                  className={`dtree-tip${on ? " hl" : ""}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Candidate ${n.leafIndex + 1}`}
                  onMouseEnter={() => enter(id)}
                  onMouseLeave={leave}
                  onFocus={() => enter(id)}
                  onBlur={leave}
                >
                  <circle
                    className="dtree-tip-dot"
                    cx={n.x}
                    cy={n.y}
                    r={5}
                    style={{ fill: CLADE_COLORS[n.clade] }}
                  />
                  <circle className="dtree-tip-hit" cx={n.x} cy={n.y} r={13} />
                </g>
              );
            })}
          </g>

          <circle className="dtree-root" cx={DT_CX} cy={DT_CY} r={7} />

          {/* fixed reader window at 3 o'clock + the sequence box */}
          <rect
            className="dtree-slot"
            x={DT_SLOT_X - 22}
            y={DT_CY - 27}
            width={44}
            height={54}
            rx={9}
          />
          <line
            className="dtree-lead"
            x1={DT_SLOT_X + 24}
            y1={DT_CY}
            x2={DT_BOX_X}
            y2={DT_CY}
          />
          {focusNode && (
            <g className="dtree-reader" key={focusLeaf}>
              <rect
                className="dtree-reader-box"
                x={DT_BOX_X}
                y={150}
                width={192}
                height={150}
                rx={14}
              />
              <circle
                cx={DT_BOX_X + 20}
                cy={178}
                r={6}
                style={{ fill: focusColor }}
              />
              <text
                className="dtree-reader-title"
                x={DT_BOX_X + 34}
                y={183}
                style={{ fill: focusColor }}
              >
                Candidate {String(focusNode.leafIndex + 1).padStart(2, "0")}
              </text>
              {/* A "PLACEHOLDER SEQUENCE" label used to sit here (y=207), above
                  the sequence lines. Removed on request. The sequences below are
                  still randomly generated, not real — see SEQS above. */}
              {seqLines.map((line, i) => (
                <text
                  key={i}
                  className="dtree-reader-seq"
                  x={DT_BOX_X + 16}
                  y={236 + i * 22}
                >
                  {line}
                </text>
              ))}
            </g>
          )}
        </svg>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  ResultsFigures — two figures that pop up on scroll                          */
/* -------------------------------------------------------------------------- */

/**
 * ResultsFigures — two figures that "pop up" (bouncy scale + fade) as each
 * scrolls into view, and pop back out when scrolled away (reversible). Each
 * figure is observed independently. Placeholder captions; swap images/captions
 * for real result figures later. Styling under `.rf-*` in model_discovery.css.
 */
function ResultsFigures() {
  const FIGURES = [
    {
      src: surfaceImg,
      caption: "Figure placeholder: describe what this render shows.",
    },
    {
      src: pocketNnbtImg,
      caption: "Figure placeholder: describe what this render shows.",
    },
  ];
  const [shown, setShown] = useState<boolean[]>(() => FIGURES.map(() => false));
  const figRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers = figRefs.current.map((el, index) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          const ratio = entry.intersectionRatio;
          setShown((prev) => {
            // Hysteresis — stops the pop flickering when you pause scrolling
            // with a figure near the trigger point.
            let target = prev[index];
            if (ratio >= 0.35) target = true;
            else if (ratio <= 0.08) target = false;
            if (prev[index] === target) return prev;
            const next = [...prev];
            next[index] = target;
            return next;
          });
        },
        { threshold: [0, 0.08, 0.35, 1], rootMargin: "0px 0px -8% 0px" },
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="rf">
      {FIGURES.map((fig, index) => (
        <figure
          key={fig.src}
          ref={(el) => {
            figRefs.current[index] = el;
          }}
          className={`rf-fig${shown[index] ? " show" : ""}`}
        >
          <img src={fig.src} alt="" />
          <figcaption>{fig.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PocketDockingDemo — interactive pocket-identification & docking walk-through*/
/* -------------------------------------------------------------------------- */

/**
 * PocketDockingDemo — interactive pocket-identification & docking walk-through.
 *
 * Three stacked structure images crossfade as the user advances:
 *   step 0  pada1_step1.png  HEME only
 *   step 1  pada1_step2.png  + fpocket pocket (cyan surface)
 *   step 2  pada1_step3.png  + docked NNBT (yellow)
 *   step 3  pada1_step4.gif  molecular-dynamics trajectory (static stand-in now)
 *
 * The NNBT substrate (NNBT_2.png) drifts freely around the structure while
 * undocked; clicking "docking" sends it swooping along a path into the pocket,
 * where it fades out exactly as the docked-structure image fades in. Styles
 * namespaced under `.pd-*` in model_discovery.css.
 */
function PocketDockingDemo() {
  // 0 = HEME only, 1 = pocket (fpocket), 2 = docked (docking), 3 = MD simulation
  const [step, setStep] = useState(0);

  // The three structure stills (small PNGs) are always mounted; the MD frame is
  // mounted lazily only once step 4 is reached. (The real ~10 MB MD GIF is not
  // committed to GitLab — see the mdSimGif comment near the top of this file — so
  // a static frame currently stands in for it.)
  const STRUCTS = [pada1Step1, pada1Step2, pada1Step3];
  const STEP_LABELS = [
    { name: "HEME only", hint: "apo structure" },
    { name: "Pocket found", hint: "fpocket" },
    { name: "NNBT docked", hint: "docking" },
    { name: "MD simulation", hint: "dynamics" },
  ];

  const isMD = step === 3;
  // undocked → floating; docked or MD → keep it parked/hidden in the pocket
  const nnbtClass = step >= 2 ? "pd-nnbt docking" : "pd-nnbt floating";

  // Running "REC" timecode shown on the TV while the MD simulation plays.
  const [recSec, setRecSec] = useState(0);
  useEffect(() => {
    if (!isMD) {
      setRecSec(0);
      return;
    }
    const id = setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isMD]);
  const timecode = `${String(Math.floor(recSec / 60)).padStart(2, "0")}:${String(
    recSec % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="pd">
      <div className="pd-head">
        <span className="pd-kicker">Pocket identification &amp; docking</span>
        <h3>Find the pocket, then dock the substrate</h3>
        <p>An interactive walk-through: click the buttons to run each step.</p>
      </div>

      <div className="pd-grid">
        <div className={`pd-stage-wrap${isMD ? " pd-stage-wrap--md" : ""}`}>
          <div className={`pd-stage${isMD ? " pd-stage--md" : ""}`}>
            {STRUCTS.map((src, i) => (
              <img
                key={src}
                className={`pd-struct pd-struct--${i + 1}${
                  i === step ? " active" : ""
                }`}
                src={src}
                alt={`Pada1: ${STEP_LABELS[i].name}`}
              />
            ))}

            {/* MD step — only mounted at step 4. Static stand-in for the ~10 MB
                pada1_step4.gif, which is too large to push to GitLab; swap
                mdSimGif back to the gif (see its comment above) to animate. */}
            {isMD && (
              <img
                className="pd-md active"
                src={mdSimGif}
                alt="Molecular-dynamics trajectory of the docked Pada1–NNBT complex (static frame stand-in)"
              />
            )}

            <div className="pd-nnbt-anchor" aria-hidden="true">
              <img className={nnbtClass} src={nnbt2} alt="" />
            </div>

            {/* TV treatment while the simulation plays */}
            {isMD && (
              <>
                <div className="pd-scanlines" aria-hidden="true" />
                <div className="pd-glare" aria-hidden="true" />
                <span className="pd-rec" aria-hidden="true">
                  <span className="pd-rec-dot" /> REC {timecode}
                </span>
                <span className="pd-tvtag" aria-hidden="true">
                  CH 04 · MD TRAJECTORY
                </span>
              </>
            )}

            {!isMD && (
              <span className="pd-badge">
                Step {step + 1} · {STEP_LABELS[step].name}
              </span>
            )}
          </div>

          {/* Beaver camera operator filming the screen */}
          {isMD && (
            <>
              <div className="pd-rec-cone" aria-hidden="true" />
              <img
                className="pd-beaver"
                src={beaverCamera}
                alt="A beaver camera operator filming the molecular-dynamics simulation"
              />
            </>
          )}
        </div>

        <div className="pd-panel">
          <ol className="pd-steps">
            {STEP_LABELS.map((s, i) => (
              <li
                key={s.name}
                className={`${i === step ? "current" : ""}${
                  i < step ? " done" : ""
                }`}
              >
                <span className="pd-step-dot">{i < step ? "✓" : i + 1}</span>
                <span>
                  <strong>{s.name}</strong>
                  <em>{s.hint}</em>
                </span>
              </li>
            ))}
          </ol>

          <div className="pd-controls">
            <button
              type="button"
              className="pd-btn"
              onClick={() => setStep(1)}
              disabled={step >= 1}
            >
              🔍 fpocket
            </button>
            <button
              type="button"
              className="pd-btn"
              onClick={() => setStep(2)}
              disabled={step !== 1}
            >
              🧲 docking
            </button>
            <button
              type="button"
              className="pd-btn"
              onClick={() => setStep(3)}
              disabled={step !== 2}
            >
              ▶ MD
            </button>
            <button
              type="button"
              className="pd-btn pd-btn--ghost"
              onClick={() => setStep(0)}
              disabled={step === 0}
            >
              ↺ reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 *  Channel-discovery figures (.chf-*)
 *
 *  The figure itself is `TunnelFigure`, shared with the Engineering page (see
 *  ChannelFigures.tsx). What stays here is which structures each row lists and
 *  in what order, plus the further asset paths derived from CHANNEL_BASE below.
 *
 *  The FIGURES are real; the surrounding prose is placeholder.
 * -------------------------------------------------------------------------- */

/** Where the laccase-discovery figures are uploaded. */
const LACCASE_BASE =
  "https://static.igem.wiki/teams/6060/wiki/drylab/laccase-discovery";

/** Where the CUPP channel-clustering figures are uploaded — the overlays, the
 *  dendrogram and the per-cluster grids of the database branch.
 *
 *  It also holds the two figures for the literature UPOs whose activity was not
 *  measured (the profile overlay and the projection onto the reference curve
 *  fit), which belong to the LITERATURE branch — they were uploaded here rather
 *  than beside the four-reference comparison figures. Read off the asset host,
 *  not inferred: check the upload before assuming a figure's folder follows its
 *  section. */
const CUPP_CLUSTER_BASE = `${CHANNEL_BASE}/cupp-clustering`;

/** Where the four-reference comparison figures of the literature branch are
 *  uploaded: the channel overlay with its spread and |ΔR| panels, and the three
 *  degradation-rate-against-channel-opening plots. */
const REFERENCE_COMPARISON_BASE = `${CHANNEL_BASE}/5oxu-9he9-5fuj-grogu-comparison`;

/** The UPO structural workflow — dock, then run dynamics on the pose — as the
 *  flowchart that opens the docking-and-dynamics subsection in both UPO
 *  branches.
 *
 *  A COPY of the Methods page's own structural flowchart, not a shared
 *  constant. That page still has its own (UPO_STRUCTURAL_WORKFLOW in
 *  model_methods.tsx, module-private and left exactly as it is); exporting it
 *  for this page to read would tie the two pages' flowcharts together, so that
 *  retitling a step here silently retitles it there. They are the same two
 *  steps today and may well diverge — this page is describing what was run on
 *  these enzymes, that one is describing the method in general.
 *
 *  What IS shared is `ModelPipeline`, the component that draws any flowchart on
 *  the Model pages. That is the same arrangement the laccase flowchart below
 *  already uses: shared renderer, page's own steps.
 *
 *  KEEP IN STEP BY HAND, or deliberately let them differ — but do not replace
 *  this with an import. */
const STRUCTURAL_WORKFLOW: PipelineStep[] = [
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

/** The laccase discovery pipeline, as the flowchart the team's document asks
 *  for at this point: seed enzyme → sequence pool → reduce the pool with the
 *  tools → pick candidates from the surviving clusters. Every step is named and
 *  described from that document; nothing is added to round the shape out. */
const LACCASE_DISCOVERY_WORKFLOW: PipelineStep[] = [
  {
    title: "Seed sequences",
    tag: "Literature",
    blurb:
      "Identify ItL-03 and the other seed sequences from the literature, then annotate them with InterPro to find the families to search.",
  },
  {
    title: "Sequence pool",
    tag: "UniProt search",
    blurb:
      "Query UniProt with the two Pfam entries, keep the better-annotated entries and reduce redundancy at 90% identity.",
  },
  {
    title: "CUPP clustering",
    tag: "Reduce the pool",
    blurb:
      "Partition the sequence space into functional groups, with positive and negative anchors marking where the boundary falls.",
  },
  {
    title: "ESP and docking",
    tag: "Select from clusters",
    blurb:
      "Score enzyme-substrate compatibility and dock the substrates, then take one candidate from each cluster that survives.",
  },
];

/** How each literature structure is named in every figure on this page: the
 *  common enzyme name first, its PDB id in brackets after — "PaDa-I (5OXU)".
 *  A reader meets the enzyme first and the database entry second, and the same
 *  structure is never labelled two different ways in two different figures.
 *
 *  Keyed by slug, which is both the upload path under `channel-discovery/` and
 *  `molecular-dynamics/` and the id used by the structure viewer. The names
 *  match the `label`s in structures.ts, which is where the viewer tabs take
 *  theirs from — keep the two in step.
 *
 *  GroGu and Fett are team structures with no database entry, so they are the
 *  bare name with nothing in brackets. 7O1R's PDB title gives no short enzyme
 *  name, so it is named by organism rather than an abbreviation invented here.
 *
 *  The UniProt candidates further down are NOT in here: they take their labels
 *  from DATABASE_STRUCTURES, and an accession is all they have. */
const LIT_NAMES: Record<string, string> = {
  "9he9": "PabUPO-II (9HE9)",
  "5fuj": "MroUPO (5FUJ)",
  "5oxu": "PaDa-I (5OXU)",
  "8rnj": "MweUPO-1 (8RNJ)",
  "7o1r": "Hypoxylon sp. UPO (7O1R)",
  grogu: "GroGu",
  fett: "Fett",
};

/** The structures shown in the literature MOLECULAR-DYNAMICS rows, as slugs
 *  into LIT_NAMES, split and ordered as the team's document presents them.
 *
 *  The measured four run by DESCENDING NNBT degradation rate — PaDa-I 12%,
 *  GroGu 9%, MroUPO 8%, PabUPO-II 4% — which is the order the paragraph above
 *  them names. That is the reverse of the channel row further up, which the
 *  same document orders by ASCENDING rate; both are deliberate, so do not
 *  "fix" one to match the other.
 *
 *  They stay SEPARATE lists rather than being spliced from the channel ones:
 *  the sets diverged once already (only 9HE9, 5FUJ and 5OXU had plots), and a
 *  row that owns its own list can diverge again without anything breaking
 *  silently.
 *
 *  Only add an entry once all three MD plots exist for it under
 *  `molecular-dynamics/` — the host answers 403 for a missing one, which paints
 *  a broken image. */
const LIT_MD_MEASURED = ["5oxu", "grogu", "5fuj", "9he9"];

const LIT_MD_UNMEASURED = ["fett", "7o1r", "8rnj"];

/** The structures shown in the literature CHANNEL rows, as slugs into
 *  LIT_NAMES.
 *
 *  Split into two lists mirroring the section's two activity groups, so a
 *  reader meets the tunnels in the same grouping as the prose: measured
 *  activity first, then not-measured. (The structures themselves are no longer
 *  split — one viewer closes the subsection with all seven — so it is the
 *  headings rather than the viewers that pair the rows up.) The two render as
 *  separate rows and are laid out differently — see the `chf-row-2col` note in
 *  model_discovery.css.
 *
 *  The measured four are in the order their paragraph gives them, by INCREASING
 *  NNBT degradation rate: 4% (PabUPO-II), 8% (MroUPO), 9% (GroGu), 12% (PaDa-I).
 *  The prose says "from left to right", so the order is part of the claim — a
 *  reshuffle would make that sentence wrong.
 *
 *  Kept apart from the MD lists even though the four now cover the same
 *  structures — see the note there for why each row owns its list. */
const LIT_CHANNEL_MEASURED = ["9he9", "5fuj", "grogu", "5oxu"];

const LIT_CHANNEL_UNMEASURED = ["fett", "8rnj", "7o1r"];

/** The UPO CUPP pipeline, step by step — the flowchart that opens the CUPP
 *  discovery subsection, and the four cards in the box under it (each card's
 *  title is read from here, so the two cannot drift apart). The blurbs only
 *  summarise what that box says about each step. */
const UPO_CUPP_WORKFLOW: PipelineStep[] = [
  {
    title: "Sequence space",
    tag: "BLAST + MMseqs2",
    blurb:
      "BLAST the seeds against two UniProt databases, merge the hits and homology-reduce them with MMseqs2.",
  },
  {
    title: "CUPP",
    tag: "Clustering",
    blurb:
      "Group the sequence space into CUPP groups by conserved unique peptide patterns, as a dendrogram.",
  },
  {
    title: "ProSmith",
    tag: "Substrate scoring",
    blurb:
      "Score every sequence in the dendrogram against NNBT and keep the top 100.",
  },
  {
    title: "Boltz",
    tag: "Co-folding",
    blurb:
      "Co-fold each shortlisted sequence with heme and NNBT, giving the structures the channel and docking analyses start from.",
  },
];

/** Blind docking of NNBT into the three literature UPOs without measured
 *  degradation rates — the table under "UPOs with not experimentally measured
 *  activity", transcribed from the team's results. No activity column: there
 *  is no measured rate to put in it. */
const LIT_DOCKING_UNMEASURED = [
  { enzyme: "Hypoxylon sp. UPO", structure: "7O1R, crystal", score: "−6.81", ligandFe: "4.22" },
  { enzyme: "MweUPO-1", structure: "8RNJ, crystal", score: "−6.13", ligandFe: "3.13" },
  { enzyme: "Fett", structure: "Boltz-2 prediction", score: "−6.49", ligandFe: "7.21" },
];

/** Where the PyMOL renders of the docked reference UPOs are uploaded. */
const UPO_PYMOL_BASE =
  "https://static.igem.wiki/teams/6060/wiki/drylab/upo-pymol";

/** Blind docking of NNBT into the four reference UPOs with measured
 *  degradation rates — the table under "UPOs with experimentally measured
 *  activity", transcribed from the team's results. */
const LIT_DOCKING_MEASURED = [
  {
    enzyme: "PaDa-I",
    structure: "5OXU, crystal",
    activity: "12%",
    score: "−6.91",
    ligandFe: "3.27",
  },
  {
    enzyme: "GroGu",
    structure: "Boltz-2 prediction",
    activity: "9%",
    score: "−6.35",
    ligandFe: "6.42",
  },
  {
    enzyme: "MroUPO",
    structure: "5FUJ, crystal",
    activity: "8%",
    score: "−6.18",
    ligandFe: "4.02",
  },
  {
    enzyme: "PabUPO-II",
    structure: "9HE9, crystal",
    activity: "4%",
    score: "−6.28",
    ligandFe: "3.34",
  },
];

/** The rationale shared by the nine candidates the channel pipeline chose. */
const CHANNEL_PICK =
  "Chosen through channel discovery pipeline. More info in the next section.";

/** The final twelve UPO candidates and why each was picked, as the table in
 *  the CUPP discovery subsection lists them. */
const UPO_FINAL_CANDIDATES: { id: string; rationale: string }[] = [
  {
    id: "A0A0C9U748",
    rationale:
      "Sole representative of its CUPP group with a high Boltz confidence score.",
  },
  {
    id: "A0A0C9TXI4",
    rationale:
      "From the same organism as A0A0C9U748, indicating it may have a different function.",
  },
  {
    id: "A0A5C3KL04",
    rationale:
      "Closely related to a seed according to CUPP dendrogram and has a very high Boltz confidence score.",
  },
  { id: "A0A0C4E1P3", rationale: CHANNEL_PICK },
  { id: "A0A0C9VQZ5", rationale: CHANNEL_PICK },
  { id: "A0A2H3E6E9", rationale: CHANNEL_PICK },
  { id: "A0A4S8L4J7", rationale: CHANNEL_PICK },
  { id: "A0A8H6HXY8", rationale: CHANNEL_PICK },
  { id: "A0A9P5XE54", rationale: CHANNEL_PICK },
  { id: "A0A9P5Z220", rationale: CHANNEL_PICK },
  { id: "A0A9P7RSA8", rationale: CHANNEL_PICK },
  { id: "A0A0C9UQE3", rationale: CHANNEL_PICK },
];

/** UniProt accessions taken into MD, in the order the viewer above tabs them
 *  (DATABASE_STRUCTURES in structures.ts). Lowercase form is the upload path.
 *
 *  This is now every candidate in that viewer; it was the first three only,
 *  until the rest of the plots were uploaded. The figures themselves come from
 *  the shared MdFigures module — read the 403 warning there before adding one. */
const MD_CANDIDATES = [
  { accession: "A0A9P7RSA8", slug: "a0a9p7rsa8" },
  { accession: "A0A0C9UQE3", slug: "a0a0c9uqe3" },
  { accession: "A0A0C9VQZ5", slug: "a0a0c9vqz5" },
  { accession: "A0A0C4E1P3", slug: "a0a0c4e1p3" },
  { accession: "A0A2H3E6E9", slug: "a0a2h3e6e9" },
  { accession: "A0A4S8L4J7", slug: "a0a4s8l4j7" },
  { accession: "A0A8H6HXY8", slug: "a0a8h6hxy8" },
  { accession: "A0A9P5XE54", slug: "a0a9p5xe54" },
  { accession: "A0A9P5Z220", slug: "a0a9p5z220" },
];

/** The works this page cites in its OWN prose, as opposed to the ones it
 *  inherits by showing a method write-up in a box.
 *
 *  Derived from the per-section lists in citations.ts rather than typed out
 *  again here, so adding a citation to a section's prose is one edit, in the
 *  file that already records what that section cites. */
const DISCOVERY_OWN_CITATIONS: readonly CitationKey[] = [
  ...CHANNEL_RESULTS_CITATIONS,
  ...UPO_STRUCTURAL_CITATIONS,
  ...LACCASE_CITATIONS,
  ...UPO_CUPP_CITATIONS,
  ...UPO_LITERATURE_INTRO_CITATIONS,
];

/** Everything the References section lists.
 *
 *  Derived rather than typed out, because half of it is not this page's to
 *  maintain: the channel method write-up renders here too (see
 *  ChannelMethodsBox), and it cites fpocket and CAVER inside its own cards. If
 *  a citation is added to that method, it appears in this list automatically
 *  instead of being silently missing from the page that shows it.
 *
 *  From the channel box it is the METHOD's citations, not the whole channel
 *  section's: that box shows the three method cards only, so the works the
 *  Methods page's section introduction cites reach this page through the
 *  results prose above instead, not through the box.
 *
 *  De-duplicated because the two sets can overlap, and sorted by key, which for these entries is alphabetical by first author —
 *  the usual order for an author–year scheme. */
const DISCOVERY_REFERENCES: readonly CitationKey[] = [
  ...new Set([
    ...DISCOVERY_OWN_CITATIONS,
    ...CHANNEL_METHOD_CITATIONS,
    ...DOCKING_METHOD_CITATIONS,
    ...MD_METHOD_CITATIONS,
  ]),
].sort();

/* -------------------------------------------------------------------------- */
/*  Section content (headings come from the shared SectionHeading component)    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * ModelDiscovery — the Discovery detail page: enzyme-discovery result figures
 * and the interactive pocket/docking/MD walk-through on Pada1.
 */
export function ModelDiscovery() {
  // Constant light-blue page background across the Model section (removed on
  // unmount). Rule lives in model.css but Vite emits one global CSS bundle.
  useEffect(() => {
    document.body.classList.add("model-bg");
    return () => document.body.classList.remove("model-bg");
  }, []);

  return (
    <>
      <DiscoveryTreeHero />

      <div className="page-container">
        <TOC pages={MODEL_PAGES} activeKey="discovery" />

        <div className="page-start row mt-4">
          <NumberedFigures className="col-lg-12">
            {/* Page introduction, from the team's "Discovery_Introduction"
                document. Both works it cites are already in the page's
                reference list (via CHANNEL_RESULTS_CITATIONS and
                LACCASE_CITATIONS in citations.ts). */}
            <p className="md-prose">
              The discovery of enzymes capable of degrading NNBT started with a
              literature search. Two main groups of enzymes were identified as
              strong candidates for NNBT degradation: unspecific peroxygenases
              (UPOs), and laccases <Cite id="Dolz2022" />{" "}
              <Cite id="Wongwattanarat2025" />. Because of their different
              structural characteristics, our approach to discovering other
              enzymes that can also perform the reaction had to be divided in
              two, one focusing on each group.
            </p>
            <p className="md-prose">
              In both cases we built similarity based sequence databases
              starting from the enzymes confirmed to perform our reaction of
              interest. These databases were organized and clustered into
              dendrograms and the resulting sequences screened through
              different pipelines depending on whether they were UPOs or
              laccases.
            </p>

            {/* --- Group 1: the laccase branch ---
                Both discovery routes are split per enzyme family, one sibling
                section each, so every branch gets its own TOC entry (the same
                shape as the engineering split on the Methods page).
                The four sections are ordered by enzyme family first — each
                family's literature route is followed by its database route —
                rather than grouping both families under each route.
                Laccases lead and UPOs follow; the UPO halves nonetheless keep
                the original `literature-based` and `database-based` ids, so
                existing links to them still resolve.

                The laccase branch has no literature section: everything the
                team's laccase document contains describes the DATABASE route —
                seeding a UniProt search, clustering the hits with CUPP, scoring
                the clusters — so all of it sits in the section below. --- */}

            {/* --- Group 1b: database-based discovery, laccase branch ---
                Introduction, then the method (the flowchart and one box per
                tool it names), then the results. Every section on this page is
                arranged that way: a reader who wants the method has it before
                the findings, and a reader who does not is past it in one
                screen. */}
            <section id="database-based-laccases">
              <SectionHeading title="Laccases discovery" />

              <p className="md-prose">
                In this section, we explain our computational enzyme discovery
                strategy to find laccase/multicopper oxidase enzyme candidates,
                spanning from initial sequence seeding to the selection of 5
                candidate enzymes.
              </p>
              <p className="md-prose">
                More specifically, we started by identifying ItL03 as a
                promising candidate enzyme from the literature, which we used to
                query the UniProt/Swissprot database. We then investigated the
                protein families of ItL03 to find potential homologs. For this,
                we partitioned the sequence space into functional groups using
                CUPP, a clustering algorithm. To select which of these clusters
                were relevant for our search, we relied on enzyme-substrate
                docking and ESP (enzyme-substrate pair prediction), and selected
                one candidate from the most relevant clusters to be tested in
                the Wetlab.
              </p>
              <p className="md-prose">
                Our approach mainly relied on 3 tools: CUPP (for sequence-based
                clustering based on conserved peptide patterns), ESP (an
                enzyme-substrate prediction algorithm based on the protein LLM
                ESM), and our laccase-specific docking programme based on Vina.
              </p>

              {/* The flowchart the source document asks for at this point:
                  seed enzyme → pool → reduce the pool with the tools → select
                  from the surviving clusters. Same component as every other
                  workflow on the Model pages. */}
              <ModelPipeline steps={LACCASE_DISCOVERY_WORKFLOW} />

              {/* One box per tool the paragraph above names, in that order —
                  the source's "INFOBOX MORE ABOUT CUPP", "INFOBOX ESP" and
                  "MORE INFO INFOBOX". Each is transcribed from the team's own
                  method documents (docs/sources: "CUPP Explained.docx",
                  "ESP.docx", "Enzyme_discovery_methods.docx" and "Laccase
                  docking.docx"); nothing here is filled in from elsewhere.
                  See .claude/RESPONSIBLE_AI_USE.md. */}
              <DetailsBox label="More about CUPP">
                <p className="mm-prose">
                  Conserved unique peptide patterns (CUPP) is a platform to
                  annotate and group peptides and enzymes based on conserved
                  patterns/domains in their sequences. It can be run on the{" "}
                  <a
                    className="md-link"
                    href="https://cupp.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CUPP web server
                  </a>{" "}
                  or locally on your computer. Though originally designed for
                  carbohydrate-active enzymes (CAZymes), it can now be used for
                  any enzyme or peptide class.
                </p>
                <p className="mm-prose">
                  If you give CUPP a set of amino acid sequences, it will
                  perform unsupervised clustering of these sequences into
                  so-called CUPP groups. It is also able to fetch metadata such
                  as protein superfamily or EC number from public databases,
                  which is very useful to annotate the sequence space and draw a
                  functional boundary <Cite id="Barrett2020" />.
                </p>
              </DetailsBox>
              <DetailsBox label="More about ESP">
                <p className="mm-prose">
                  ESP (Enzyme Substrate Prediction) is a machine learning model
                  that predicts whether a small molecule is a substrate of a
                  given enzyme. It was published by Kroll et al.{" "}
                  <Cite id="Kroll2023" /> and is freely available as a web
                  server (esp.cs.hhu.de), with code and data on GitHub. ESP
                  combines two learned representations. Enzymes are encoded from
                  their amino-acid sequence by a modified version of the protein
                  language model ESM-1b <Cite id="Rives2021" />, fine-tuned for
                  this task via an added whole-enzyme token (ESM-1b_ts).
                  Substrates are encoded as task-specific fingerprints generated
                  by a graph neural network. The concatenated vectors are passed
                  to a gradient-boosted decision tree, which outputs a score
                  between 0 and 1 for the pair.
                </p>
                <p className="mm-prose">
                  Training used 18,351 experimentally confirmed enzyme–substrate
                  pairs from the GO annotation database, covering 12,156 enzymes
                  and 1,379 distinct small molecules. Because such databases
                  record only positive examples, negatives were generated
                  artificially: for each positive pair, three structurally
                  similar molecules from the same compound set were sampled and
                  labelled as non-substrates, yielding 69,365 pairs in total.
                </p>
                <p className="mm-prose">
                  On a test set where no enzyme shares more than 80% sequence
                  identity with any training enzyme, ESP reaches 91.5% accuracy
                  (ROC-AUC 0.96, MCC 0.78), falling only to 89% for enzymes
                  below 40% identity. Performance is substantially worse for
                  molecules outside the ~1,400 training substrates, so the
                  authors recommend restricting use to that set.
                </p>
              </DetailsBox>
              <DetailsBox label="More about our MSA and docking tool">
                <p className="mm-prose">
                  Although we already used docking for UPOs, the laccase
                  pipeline required a different approach for docking because of
                  the underlying biology. The active site of UPOs is clearly
                  defined as their pocket, which contains the heme group, and
                  this in turn defines where the search box for targeted docking
                  should be placed. However, for laccases, the active site is
                  different. It consists of 4 copper atoms in 2 different
                  centres (T1 contains 1 copper atom, T2/3 has the remaining 3).
                  Oxygen gets reduced to water at the T2/3 copper site, while
                  the substrate gets oxidised at the T1 copper centre,
                  transferring its electrons to the T2/3 centre. Therefore, the
                  T1 copper centre is effectively our point of interest for
                  docking, since the reaction happens there. This copper atom is
                  maintained into place by a few histidine and cysteine
                  residues, which we will call the HCH motive{" "}
                  <Cite id="Aza2023" />.
                </p>
                <p className="mm-prose">
                  Our docking program first maps the T1 copper centre residues
                  using a multiple sequence alignment tool (mafft), basing
                  itself on a known reference (CueO from E. coli). Then, it
                  downloads the pdb structures for the provided sequences and it
                  runs a targeted docking using Autodock Vina with a 22 Å box
                  centered on the predicted centroid of the HCH motive, which is
                  where the T1 copper should roughly be. The results are then
                  ranked based on their affinity (kcal/mol) values.
                </p>
              </DetailsBox>

              <div
                id="laccase-candidate-selection"
                className="dsub"
                data-toc-title="Candidate selection"
              >
                <SubsectionHeading title="Candidate selection" />
                <p className="md-prose">
                  We grounded our seed sequence selection in
                  Wongwattanarat&apos;s dissertation from 2025{" "}
                  <Cite id="Wongwattanarat2025" />, which provided the primary
                  basis for identifying enzyme candidates capable of degrading
                  epoxy resin and its precursors. Although the work was
                  conducted in the context of aviation-grade epoxy resins, the
                  substrates and enzymatic targets examined are directly
                  transferable to the present use case. The study isolated
                  enzymatic sequences from the spruce beetle (
                  <i>Ips typographus</i>) metagenome, heterologously expressed a
                  subset of these, and screened them against a panel of epoxy
                  model substrates (NNBT, BMAP, and BBCM) which are monomeric
                  constituents of RTM6, an aerospace-grade epoxy resin with a
                  complex crosslinked architecture. Among the candidates
                  characterized, ItL-03 exhibited the highest activity across
                  substrates, with particularly strong activity on NNBT,
                  establishing it as the primary seed sequence for this
                  discovery campaign. The less active ItL-02 and ItL-01
                  sequences were also retained as seed sequences, alongside CueO
                  (copper-efflux oxidase) from <i>E. coli</i>, which served as a
                  functional reference in the original study.
                </p>
                <p className="md-prose">
                  As ItL-03 was absent from public sequence databases at the
                  time of this work, we submitted its sequence to InterPro for
                  domain and protein family annotation. The analysis placed
                  ItL-03 within the multicopper oxidase (MCO) superfamily, a
                  functionally diverse group encompassing laccases, bilirubin
                  oxidases, ascorbate oxidases, ferroxidases, and CueO-type
                  enzymes. InterPro further resolved its domain architecture
                  into two protein family (Pfam) entries: PF07731 and PF07732.
                </p>
                <WikiFigure
                  src={`${LACCASE_BASE}/pfam.avif`}
                  alt="InterPro domain annotation of ItL-03, with the two predicted Pfam domains marked along the length of the sequence."
                >
                  InterPro analysis of ItL03 with predicted Pfam domains (in
                  dark blue)
                </WikiFigure>
              </div>

              {/* --- subsection: CUPP discovery ----------------------------- */}
              <div
                id="cupp-database-laccases"
                className="dsub"
                data-toc-title="CUPP discovery"
              >
                <SubsectionHeading title="CUPP discovery" />
                <p className="md-prose">
                  We used these 2 Pfams to query the Uniprot database, which
                  yielded 80.000 results. This exceeded the computational
                  capacity available for processing with the CUPP clustering
                  algorithm; the dataset was therefore filtered to retain only
                  entries with an annotation score of ≥3, reducing the set to
                  approximately 4,500 sequences. Redundancy was further reduced
                  by applying a 90% homology-reducing step using MMseqs2,
                  removing near-identical entries while preserving sequence
                  diversity.
                </p>

                <p className="md-prose">
                  Before clustering these 4.500 sequences, we decided to add
                  more seeds to the selection in order to later help us
                  visualizing a functional boundary within the selection. We
                  chose some positive anchors, i.e. enzymes that have shown very
                  similar activities (mainly lignin degradation) to the one we
                  are looking for, and negative anchors (unrelated functions).
                  They are shown in Table <TabNum of="laccase-anchors" />.
                </p>

                {/* The anchor table, transcribed entry for entry. `.mm-table`
                    and its scroll wrapper come from model_methods.css — one
                    global CSS bundle, so they apply here too. */}
                <div className="mm-tablewrap dtable-wrap">
                  <table
                    className="mm-table dtable numtab"
                    data-tab="laccase-anchors"
                  >
                    <caption>
                      The sequences added to the selection before clustering:
                      the seeds themselves, plus anchors on either side of the
                      functional boundary we wanted to see.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">&nbsp;</th>
                        <th scope="col">UniProtKB ID</th>
                        <th scope="col">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row" rowSpan={3}>
                          Positive anchors
                        </th>
                        <td>D4GPK6</td>
                        <td>
                          Lignin degrading laccase, from archea{" "}
                          <i>Haloferax vulcanii</i>
                        </td>
                      </tr>
                      <tr>
                        <td>P07788</td>
                        <td>
                          <i>B. subtilis</i>, MCO laccase catalyzing oxidation
                          of a variety of substrates (including phenolic
                          compounds)
                        </td>
                      </tr>
                      <tr>
                        <td>P36649</td>
                        <td>
                          CueO enzyme from <i>E. coli</i>, reference enzyme for
                          the group
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">seeds</th>
                        <td>ItL01, 02 &amp; 03</td>
                        <td>Seed sequences</td>
                      </tr>
                      <tr>
                        <th scope="row" rowSpan={3}>
                          Negative anchors
                        </th>
                        <td>Q12737</td>
                        <td>
                          Bilirubin oxidase, <i>Albifimbria verrucari</i>
                        </td>
                      </tr>
                      <tr>
                        <td>P37064</td>
                        <td>
                          <i>Cucurbita pepo</i> (zucchini) Ascorbate oxidase
                        </td>
                      </tr>
                      <tr>
                        <td>P00450</td>
                        <td>
                          Human ceruloplasmin/ferroxidase, iron transport across
                          cell membrane
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="md-prose">
                  These sequences were then clustered using CUPP3, and it became
                  clear that all sequences of interest (green and black)
                  clustered together in a subspace of 189 sequences, which
                  became our curated sequence space, while the negative anchors
                  landed away.
                </p>
                <WikiFigure
                  wide
                  src={`${LACCASE_BASE}/cupp.avif`}
                  alt="Two CUPP sequence-space trees: the full set with the seeds and anchors marked, and the curated subspace containing the positive anchors."
                >
                  a) sequence space of the +- 1.500 sequences of proteins in
                  both PF07731 and PF07732 on Uniprot after homology reduction
                  at 90% sequence identity and retaining only annotation scores
                  3 and higher. ItL sequences an CueO are in black, positive
                  anchors in green, and negative anchors in red. b) curated
                  subspace of 189 sequences containing all the positive anchors
                </WikiFigure>
              </div>

              {/* --- subsection: selection of clusters ---------------------- */}
              <div
                id="laccase-cluster-selection"
                className="dsub"
                data-toc-title="Selection of clusters"
              >
                <SubsectionHeading title="Selection of clusters" />
                <p className="md-prose">
                  The curated sequence space was now analyzed using ESP and our
                  MSA + Vina docking programme.
                </p>
                <p className="md-prose">
                  ESP leverages embeddings from the protein large language model
                  ESM to score enzyme-substrate compatibility, and it has been
                  trained on many different substrates. Unfortunately for us,
                  NNBT is not among the substrates on which ESP has been
                  trained, making predictions on NNBT alone very unreliable.
                  However, laccases are enzymes that often rely on a redox
                  mediator to perform their reaction on the substrate. They
                  reduce/oxidise the mediator which in turn reduces/oxidises the
                  substrate <Cite id="Aza2023" />.
                </p>

                <WikiFigure
                  src={`${LACCASE_BASE}/mediator.avif`}
                  alt="Scheme of mediated oxidation: the laccase oxidises a small mediator, which in turn oxidises the substrate."
                >
                  Mechanism of mediated substrate oxidation from laccases, from
                  Aza et al <Cite id="Aza2023" />
                </WikiFigure>

                <p className="md-prose">
                  One of the most common mediators, guaiacol, was present in
                  ESPs training data and was used by Wongwattanarat together
                  with ItL03 in her dissertation, showing improved results
                  compared to NNBT + enzyme alone. This is why we thought of
                  performing ESP predictions on both NNBT and guaiacol and
                  choose the best performers for both. ESP showed us that only
                  82 of the 189 initial sequences were in clusters that have
                  high ESP scorers, which is why we discarded the other
                  sequences.
                </p>
                <WikiFigure
                  wide
                  /* The source document writes this one's path with the
                     screenshot's original filename, spaces, capitals, dots and
                     all. The uploads tool does not keep that: it lowercases and
                     slugifies, so the file is served under the name below and
                     the document's own path answers 403. Checked, not
                     assumed — as every path on this page should be. */
                  src={`${LACCASE_BASE}/screenshot-2026-06-12-at-11-11-05.avif`}
                  alt="The 189-sequence tree after ESP and docking analysis, with the discarded left-hand part and the sequences lacking copper-binding domains marked, and the retained region circled."
                >
                  Subspace of 189 sequences after ESP &amp; docking analysis.
                  ESP discarded the left part of the tree (almost no values
                  &gt;0.1), and the MSA from docking showed that the sequences
                  in red do not have the copper-binding domains that laccases
                  need to form their active site, which is why only the part
                  circled in red was chosen for further analysis.
                </WikiFigure>

                <p className="md-prose">
                  We then ran our multiple sequence alignment + docking tool on
                  guaiacol and NNBT, which showed us that only 61 of the 82
                  sequences actually had the active site (T1 copper centre) in
                  the relevant place. The other 21 sequences were discarded.
                </p>

                <p className="md-prose">
                  This tree shows that the best docking results all cluster in a
                  single CUPP group, and after visualizing the results in pymol,
                  it became clear that this laccase subgroup had in fact a small
                  pocket close to the active site, which could contain the
                  substrate and allow for a more efficient reaction. This was a
                  very interesting result, and we chose to test one of these
                  pocket laccases in the wetlab. Moreover, we tried to choose
                  one member of each of the other CUPP groups based on either
                  good docking or ESP results (or both).
                </p>
                <WikiFigure
                  wide
                  src={`${LACCASE_BASE}/results.avif`}
                  alt="The CUPP tree with the best ESP hits and the top docking results marked, and the chosen candidates coloured."
                >
                  CUPP tree with the best ESP hits (red: between 0.2-0.3,
                  orange: 0.1-0.2) and top 15 docking results. Chosen candidates
                  Uniprot IDs have been coloured in green/yellow.
                </WikiFigure>
              </div>

              {/* --- subsection: candidate shortlist ------------------------ */}
              <div
                id="laccase-shortlist"
                className="dsub"
                data-toc-title="Candidate shortlist"
              >
                <SubsectionHeading title="Candidate shortlist" />
                <div className="mm-tablewrap dtable-wrap">
                  <table
                    className="mm-table dtable numtab"
                    data-tab="laccase-shortlist"
                  >
                    <caption>
                      The five laccase candidates taken forward, and why each
                      was chosen.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">UniProt ID</th>
                        <th scope="col">Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">
                          <strong>A0A517I632</strong>
                        </th>
                        <td>
                          Best docking results, one of the &ldquo;pocket
                          laccases&rdquo;.
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">A0A7T1FRB0</th>
                        <td>
                          same CUPP group as ItL03, good ESP results on both
                          NNBT and Guaiacol
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">A0AAJ2KTQ9</th>
                        <td>
                          Quite distant structurally from the other cupp groups,
                          good results on Guaiacol docking &amp; ESP. Chosen
                          member from its CUPP group
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">A0A1H2RLL0</th>
                        <td>
                          Chosen member of its CUPP group, good ESP results on
                          Guaiacol
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">A0A4R3UXC8</th>
                        <td>
                          Same CUPP group as A0A517I632, but fairly divergent
                          structurally. Best ESP results on guaiacol, good
                          docking results as well
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* --- Group 2: the UPO branch --- */}
            {/* --- Group 2a: literature-based discovery, UPO branch ---
                ORDER: the structural work (docking and molecular dynamics)
                comes FIRST, then channel discovery. Both are applied to the
                same characterised enzymes to validate the method against
                known activity, so neither feeds the other here — unlike the
                database branch below, where the channel search is what selects
                the structures that are then simulated, and therefore runs
                first. */}
            <section id="literature-based">
              <SectionHeading title="UPOs literature discovery" />
              {/* From the team's "Introduction_Literature_Discovery"
                  document. */}
              <p className="md-prose">
                Unspecific peroxygenases (UPOs, EC 1.11.2.1) are a class of
                fungal heme-thiolate enzymes. In contrast with laccases, UPOs
                present a more complex catalytic site structure as it is in the
                proximity of the heme buried inside the enzyme. In AaeUPO, for
                instance, the substrate accesses this region through a channel
                and is guided by specific amino acids{" "}
                <Cite id="Hofrichter2014" /> <Cite id="RamirezEscudero2018" />.
                Furthermore, the proximity to the heme determines the kind of
                reaction, peroxidase or peroxygenase{" "}
                <Cite id="Hofrichter2014" /> <Cite id="RamirezEscudero2018" />.
              </p>
              <p className="md-prose">
                Given these constraints, we saw the need for a pipeline to
                simulate molecular docking, molecular dynamics, and perform
                channel analysis to characterize known enzymes. Parts of this
                pipeline also served to screen novel candidates, and further
                engineer candidate enzymes (described in the UPOs database
                discovery, and engineering sections respectively).
              </p>
              <p className="md-prose">
                Here we present our computational work on known,
                well-characterized reference UPOs from the literature. We
                started by validating our methods reproducing existing research
                findings to establish a baseline for comparison in our
                subsequent database discovery and engineering campaigns.
              </p>
              <p className="md-prose">
                The four reference UPOs analyzed here are:
              </p>
              {/* The source lists each enzyme with a colon and nothing after
                  it — a description per enzyme is still to be written. */}
              <ul className="md-list">
                <li>AaeUPO, PaDa-I Variant</li>
                <li>MroUPO</li>
                <li>PabUPO-II</li>
                <li>GroGu</li>
              </ul>

              {/* --- subsection: molecular docking and molecular dynamics ----
                  ONE subsection, not two. The source document introduces the
                  two techniques together and runs them as one pipeline — the
                  docking pose is what the dynamics then start from — and it
                  reports no docking results of its own on these enzymes, only
                  the trajectories below. Splitting it in two would give the
                  docking half a heading, a method box and nothing else.
                  The database branch keeps its own split headings inside this
                  same subsection, where there ARE docking results to report. */}
              <div
                id="structural-literature"
                className="dsub"
                data-toc-title="Molecular docking and dynamics"
              >
                <SubsectionHeading title="Molecular docking and molecular dynamics" />
                <p className="md-prose">
                  Molecular Docking and Molecular Dynamics simulations are
                  computational modelling techniques commonly applied to UPOs
                  research, offering insights into the stability of structures
                  and interactions formed in substrate binding. For PaDa-I, the
                  best-characterized engineered UPO, molecular dynamics has been
                  used to investigate how single point mutations at
                  channel-lining phenylalanine residues (F76, F191) alter the
                  flexibility and topography of the substrate access channel{" "}
                  <Cite id="RamirezRamirez2020" />.
                </p>
                <p className="md-prose">
                  In MroUPO, MD simulations of substrate-binding pathways were
                  used to predict how heme channel mutations would shift the
                  balance between epoxidation and hydroxylation of oleic acid, <strong>a
                  prediction later validated experimentally</strong>, with variant I153T
                  showing strongly enriched epoxide formation relative to the
                  wild type <Cite id="Knorrscheidt2021" />.
                </p>
                <p className="md-prose">
                  In this section, we attempt to perform Molecular Docking and
                  Molecular Dynamics simulations in established UPOs to <strong>validate
                  our algorithm&apos;s logic and create a baseline</strong> for
                  comparison with novel or engineered UPO candidates.
                </p>

                {/* The two steps as a flowchart, then the write-up behind each
                    one's box — the same shape the channel subsection has, and
                    the same order every section on this page follows:
                    introduction, method, results. */}
                <ModelPipeline steps={STRUCTURAL_WORKFLOW} />

                {/* Both method write-ups in one box, straight after the
                    flowchart and before any result. Not a copy: the same
                    component is rendered by the database branch
                    (structural-methods.tsx). */}
                <StructuralMethodsBox
                  idPrefix="lit"
                  steps={STRUCTURAL_WORKFLOW}
                />

                {/* Docking results first, straight after the method boxes,
                    then the molecular-dynamics results below. */}
                <p className="md-prose">
                  <strong>Molecular Docking</strong> analysis was run across the
                  entire receptor
                  for each enzyme using identical parameters throughout (AutoDock Vina
                  1.2.5, exhaustiveness 128, 50 poses, fixed seed and with heme
                  kept in place each time). Our docking results consistently
                  returned the same output: the best-fitting pose was always
                  inside the active site pocket, never somewhere else on the
                  protein surface.
                </p>
                <p className="md-prose">
                  Surface-binding poses (more than 12 Å from the iron)
                  weren&apos;t just slightly worse; they scored 0.7–1.4 kcal/mol
                  lower than the best pose (within the active site pocket).
                  Additionally in 6 of the 7 enzymes, no surface-bound pose even
                  made it into the top 15 poses (out of the total 50 poses). So
                  while binding elsewhere on the protein isn&apos;t physically
                  impossible, it&apos;s clearly and consistently disfavored.
                  This confirms our docking protocol correctly resolves the
                  functional active site across the enzyme panel, supporting its
                  use as a reliable step in the broader pipeline.
                </p>

                {/* Extra space above: this is where the docking results end
                    and the molecular-dynamics results begin. */}
                <p className="md-prose" style={{ marginTop: "3rem" }}>
                  <strong>Molecular dynamics</strong> analysis of our literature
                  candidates
                  showed that, beyond having stable structures overall
                  (expected, since these are in-vitro validated wild-type
                  enzymes), <strong>all candidates were also able to maintain the given
                  docking pose within their pockets</strong> (evident both from the
                  simulation GIF and from the analysis plots below).
                </p>
                <p className="md-prose">
                  Root mean square deviation (RMSD) is a fundamental metric in
                  molecular dynamics simulations, as it quantifies the average
                  displacement of atoms (or a selected subset, such as the
                  backbone, a ligand, or a cofactor) relative to a reference
                  structure (here the energy-minimized conformation) over the
                  simulation.
                </p>
                <p className="md-prose">
                  By tracking RMSD over time, we can assess the conformational
                  stability of a system: <strong>a plateauing RMSD indicates that the
                  structure has reached equilibrium</strong> and is not undergoing
                  large-scale structural rearrangements, while a continuously
                  increasing or highly fluctuating RMSD may signal unfolding,
                  instability, or a poor starting conformation.
                </p>
                <p className="md-prose">
                  In the context of our analysis, RMSD allows us to evaluate
                  whether the protein backbone, the heme cofactor, and the bound
                  ligand (NNBT) each maintain a stable configuration throughout
                  the simulation, providing a first indication of whether the
                  docked pose and the overall enzyme structure are physically
                  reasonable and consistent with the expected biological
                  behavior. Across all of our candidates, <strong>we observed low and
                  stable RMSD values</strong>, confirming that each system reached a
                  well-behaved equilibrium without significant structural drift
                  (a strong positive result that supports the reliability of our
                  simulations and the validity of the docked poses used for
                  downstream analysis).
                </p>
                <p className="md-prose">
                  Ligand-to-heme distance and relative SASA (solvent-accessible
                  surface area) were used to capture this docking placement
                  within the pocket, tracking NNBT&apos;s distance to the active
                  site and its exposure to the external environment. This
                  indicates that <strong>our docking runs were successful</strong> and that the
                  predicted pose has biological plausibility.
                </p>

                <SubsectionHeading
                  plain
                  title="UPOs with experimentally measured activity"
                />
                {/* Docking results for the four measured UPOs, ahead of their
                    molecular-dynamics results below. */}
                <p className="md-prose">
                  The first UPOs analyzed and presented in this section are
                  Pada-I, GroGu, MroUPO, and PabUPO-II, with corresponding NNBT
                  degradation rates of 12%, 9%, 8%, and 4%, respectively.
                  Results from docking analysis in these four UPOs with
                  experimentally measured activity are shown in Table{" "}
                  <TabNum of="lit-docking-measured" />. Three out of the four
                  reference UPOs with experimentally measured activity (Pada-I,
                  MroUPO, PabUPO-II) placed NNBT between 3.27 and 4.02 Å of the
                  heme iron. GroGu was the exception, with NNBT binding in the
                  pocket but stopping 6.42 Å short of the catalytic centre. This
                  gap may come down to GroGu&apos;s access channel shape, which
                  here is based on a Boltz-predicted structure rather than an
                  experimental one. Boltz&apos;s confidence score was high, but
                  that doesn&apos;t rule out the channel looking different in
                  the real enzyme. Separately, calculated affinities span a
                  narrow range and cannot separate the panel: the four differ by
                  0.73 kcal/mol across a threefold range of degradation rates.
                </p>

                <div className="mm-tablewrap dtable-wrap">
                  <table
                    className="mm-table dtable numtab"
                    data-tab="lit-docking-measured"
                  >
                    <caption>
                      Blind docking results for the four reference UPOs with
                      measured NNBT degradation rates. &ldquo;Ligand–Fe&rdquo;
                      is the shortest distance from any NNBT heavy atom to the
                      heme iron in the top-scoring pose.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Enzyme</th>
                        <th scope="col">Structure</th>
                        <th scope="col">Activity</th>
                        <th scope="col">Top score (kcal/mol)</th>
                        <th scope="col">Ligand–Fe (Å)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LIT_DOCKING_MEASURED.map((r) => (
                        <tr key={r.enzyme}>
                          <th scope="row">{r.enzyme}</th>
                          <td>{r.structure}</td>
                          <td>{r.activity}</td>
                          <td>{r.score}</td>
                          <td>{r.ligandFe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="md-prose">
                  PyMOL figures showing the placement of NNBT in the pocket of
                  UPOs are shown in Figures <FigNum of="lit-docking-pymol" />.
                </p>
                {/* A 2×2 grid, in the table's order. */}
                <div data-fig="lit-docking-pymol">
                  <FigureRow cols={2}>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/5oxu-layered-whole-with-substrate.avif`}
                      alt="PyMOL render of PaDa-I (PDB 5OXU) with docked NNBT in its pocket."
                    >
                      PyMOL figure of Pada-I (PDB id: 5OXU).
                    </WikiFigure>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/grogu-layered-whole-with-substrate.avif`}
                      alt="PyMOL render of GroGu (Boltz-predicted structure) with docked NNBT in its pocket."
                    >
                      PyMOL figure of GroGu (Boltz predicted structure).
                    </WikiFigure>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/5fuj-whole-with-substrate.avif`}
                      alt="PyMOL render of MroUPO (PDB 5FUJ) with docked NNBT in its pocket."
                    >
                      PyMOL figure of MroUPO (PDB id: 5FUJ).
                    </WikiFigure>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/9he9-layered-whole-with-substrate.avif`}
                      alt="PyMOL render of PabUPO-II (PDB 9HE9) with docked NNBT in its pocket."
                    >
                      PyMOL figure of PabUPO-II (PDB id: 9HE9).
                    </WikiFigure>
                  </FigureRow>
                </div>

                <p className="md-prose">
                  Providing the docking poses from above, enabled us to perform
                  our Molecular Dynamics simulations. <strong>All four
                  candidates show stable backbones and maintain NNBT within
                  their pockets throughout the simulation</strong>, as shown in
                  the following figures (Figures{" "}
                  <FigNum of="lit-md-measured" />).
                </p>
                {/* Wrapper only so the paragraph above can cite the whole run
                    of plots as one range. */}
                <div data-fig="lit-md-measured">
                  {LIT_MD_MEASURED.map((slug) => (
                    <MdFigureBlock
                      key={slug}
                      name={LIT_NAMES[slug]}
                      slug={slug}
                    />
                  ))}
                </div>

                <SubsectionHeading
                  plain
                  title="UPOs with not experimentally measured activity"
                />
                <p className="md-prose">
                  Beyond those 4 UPOs with experimentally measured activity,
                  molecular dynamics analysis of three additional UPOs known
                  from the literature: Fett, Hsp (PDB ID: 7O1R), and Mwe (PDB
                  ID: 8RNJ) was performed. Results from analysis are shown in
                  Table <TabNum of="lit-docking-unmeasured" />. These UPOs had
                  similar docking results to the ones with measured activity
                  above. Hypoxylon sp. UPO and MweUPO-1 placed NNBT 4.22 and
                  3.13 Å from the iron respectively. However, docking pose from
                  Fett did not reach the catalytic centre, stopping 7.21 Å
                  short; its channel profile is also atypical.
                </p>

                <div className="mm-tablewrap dtable-wrap">
                  <table
                    className="mm-table dtable numtab"
                    data-tab="lit-docking-unmeasured"
                  >
                    <caption>
                      Blind docking results for the three literature UPOs
                      without measured NNBT degradation rates.
                      &ldquo;Ligand–Fe&rdquo; as in Table{" "}
                      <TabNum of="lit-docking-measured" />.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Enzyme</th>
                        <th scope="col">Structure</th>
                        <th scope="col">Top score (kcal/mol)</th>
                        <th scope="col">Ligand–Fe (Å)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LIT_DOCKING_UNMEASURED.map((r) => (
                        <tr key={r.enzyme}>
                          <th scope="row">{r.enzyme}</th>
                          <td>{r.structure}</td>
                          <td>{r.score}</td>
                          <td>{r.ligandFe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="md-prose">
                  Their corresponding Molecular Dynamics analysis{" "}
                  <strong>showed the same consistent trend</strong>: stable RMSD
                  profiles, well-maintained ligand-to-heme distances, and SASA
                  values indicative of a properly buried NNBT within the active
                  site. These results confirm that the docking poses generated
                  for all three additional literature candidates are
                  structurally sound and biologically plausible, reinforcing the
                  robustness of our computational pipeline across a diverse set
                  of previously characterized UPO structures.
                </p>
                {LIT_MD_UNMEASURED.map((slug) => (
                  <MdFigureBlock
                    key={slug}
                    name={LIT_NAMES[slug]}
                    slug={slug}
                  />
                ))}
              </div>

              {/* --- subsection: channel discovery ---------------------------
                  A <div>, not a <section id>, and SubsectionHeading renders no
                  <h1> — both keep it out of the TOC, which lists only the
                  numbered sections.

                  WITHIN IT, each activity group is complete before the next
                  one starts: the measured references get their tunnel profiles
                  and the analysis drawn from them, and only then does the
                  not-measured group begin. The structures of both groups are
                  shown together by the single viewer that closes the
                  subsection, immediately before "UPOs database discovery". */}
              <div
                id="channel-literature"
                className="dsub"
                data-toc-title="Channel discovery"
              >
                <SubsectionHeading title="Channel discovery" />

                {/* The section introduction. It opens the channel work on both
                    Model pages — the Methods page renders the same three
                    paragraphs from ChannelIntro.tsx — but here they are page
                    prose rather than part of the method box, which is what the
                    source document asks for. */}
                <p className="md-prose">
                  Unspecific peroxygenases (UPOs) carry a heme cofactor buried
                  deep within the protein. The heme is isolated from the
                  surrounding solvent at the base of an access channel that
                  connects the enzyme surface to the heme iron{" "}
                  <Cite id="RamirezEscudero2018" />. For a substrate to be
                  oxidized, <strong>it must first travel through this channel</strong>, which, in
                  native and engineered <i>Agrocybe aegerita</i> UPO
                  (AaeUPO/PaDa-I), consists mainly of hydrophobic and aromatic
                  residues. Several of these residues, including a triad of
                  phenylalanines, orient the substrate toward the heme, while
                  others delimit the entrance and act as a gate to the catalytic
                  pocket <Cite id="RamirezEscudero2018" />.
                </p>
                <p className="md-prose">
                  The dimensions of this channel are not fixed across the UPO
                  family: reported widths range from roughly 7.2 Å in the
                  chloroperoxidase LfuCPO to 9.8 Å in AaeUPO and around 12.9 Å
                  in the shorter, wider channel of MroUPO{" "}
                  <Cite id="RamirezRamirez2020" />. This variability is not
                  random: mutagenesis studies show that <strong>even single
                  substitutions at positions lining the channel can reshape its
                  topography</strong>, in some cases expanding channel volume by 70 to 90
                  percent and in others constricting it, directly altering how
                  readily a substrate can access the heme{" "}
                  <Cite id="RamirezRamirez2020" />. Consistent with this,
                  engineering the entrance of the channel, for instance the
                  F311L substitution in PaDa-I, which widened the outer entrance
                  from 8 to 12 Å, has been shown to directly enhance substrate
                  accessibility to the catalytic site{" "}
                  <Cite id="RamirezEscudero2018" />.
                </p>
                <p className="md-prose">
                  At the family level, a comparative structural survey across
                  phylogenetically diverse UPO clades further supports the
                  channel&apos;s role as a gatekeeper of catalytic outcome:
                  enzymes with a broad, funnel-shaped channel and a narrow base
                  predominantly favour peroxidase-type reactivity, whereas UPOs
                  possessing a more constrained channel, often paired with an
                  accessory &ldquo;aliphatic pocket&rdquo; near the heme, tend
                  to retain substrate closer to the active site and favour the
                  peroxygenase reaction instead <Cite id="BarrosReguera2025" />.
                  Taken together, these findings indicate that the geometry of
                  the access channel is <strong>one of the strongest structural
                  determinants of a UPO&apos;s reaction selectivity</strong>.
                </p>
                <p className="md-prose">
                  Motivated by this link between channel geometry and UPO
                  activity, we investigated existing methods for calculating and
                  evaluating enzyme channels. Although tools such as CAVER{" "}
                  <Cite id="Chovancova2012" /> provide quantitative per-channel
                  descriptors (e.g., bottleneck radius, length, and curvature),
                  they are not designed for systematic comparison across large
                  sets of structures, typically requiring manual,
                  structure-by-structure curation. We therefore sought a method
                  capable of scalable, quantitative channel comparison, reducing
                  the bias inherent to case-by-case, visual inspection. <strong>This led
                  to the development of our novel channel discovery pipeline</strong>: a
                  workflow that identifies channels (and pockets) of interest,
                  normalizes them for length via linear interpolation, and
                  thereby makes diverse channels directly comparable. The final
                  stage of the pipeline performs clustering, grouping UPOs
                  according to their channel geometry; this step is not applied
                  in the present section but is instead leveraged later, in the
                  database discovery and engineering sections.
                </p>

                {/* The method, brought to the results, at the point the source
                    document asks for it — directly after the paragraph that
                    names the pipeline. The flowchart sits in the normal flow
                    (it is the summary of what that paragraph just described);
                    the full write-up — the same one the Methods page carries —
                    is behind the disclosure, so a reader can have it here
                    instead of leaving the page. See ChannelMethodsBox.tsx:
                    nothing here is a copy, both pages render the same
                    components. */}
                <ChannelWorkflow />
                <ChannelMethodsBox idPrefix="lit" />

                {/* `plain` matches the viewer titles too: these label a figure
                    group, they are not subsections of the page (the TOC lists
                    neither). */}
                <SubsectionHeading
                  plain
                  title="Known UPOs with experimentally measured activity"
                />
                <p className="md-prose">
                  Here, we apply our channel discovery pipeline (without the
                  final clustering step) to the four reference UPOs with
                  experimental activity values available from the literature.
                  Note that no filtering step can disqualify pockets or channels
                  identified in these reference UPOs; filtering is applied
                  exclusively to database-derived candidates. Results are shown
                  in the following figures (
                  <FigNum of="lit-channels-measured" />
                  ), which show the cross-sectional radius profiles of the
                  selected tunnels, plotted as +R and its mirror −R to visualize
                  the channel&apos;s shape along its length (before length
                  normalization). <strong>The channels, from left to right, correspond
                  to structures with increasing NNBT degradation rates</strong>, at 4%
                  (PabUPO-II, PDB ID: 9HE9), 8% (MroUPO, PDB ID: 5FUJ), 9%
                  (GroGu, Boltz predicted structure) and 12% (Pada-1, PDB ID:
                  5OXU) <Cite id="Dolz2022" />.
                </p>

                {/* Tunnel cross-sections, in two rows mirroring the two
                    activity groups, each under that group's heading.

                    The measured-activity four go two to a row, so they read as
                    a 2x2 block; the not-measured three go on one row. Both
                    counts divide evenly into their column count, which is the
                    point — a shared row would leave an orphan figure on a line
                    of its own.
 */}
                <div
                  className="chf-row chf-row-2col"
                  data-fig="lit-channels-measured"
                >
                  {LIT_CHANNEL_MEASURED.map((slug) => (
                    <TunnelFigure
                      key={slug}
                      label={LIT_NAMES[slug]}
                      slug={slug}
                      caption={`Selected channel for ${LIT_NAMES[slug]}`}
                    />
                  ))}
                </div>

                <p className="md-prose">
                  An overlay of these channels (after length normalization) is
                  shown in Figure <FigNum of="lit-reference-region" /> (top
                  panel). This pattern agrees with the study linking UPO
                  activity to channel geometry <Cite id="BarrosReguera2025" />.
                  UPOs with higher activity, such as PaDa-I (PDB ID: 5OXU),{" "}
                  <strong>display a funnel-shaped channel, with a narrow diameter close
                  to the heme and a wide diameter toward the entrance</strong>. In
                  contrast, UPOs with lower activity, such as PabUPO-II (PDB ID:
                  9HE9), <strong>have a narrower entrance and widen closer to the heme</strong>.
                  The funnel-shaped, narrow-base geometry of the former
                  restricts the substrate&apos;s proximity to the heme,
                  favouring rapid substrate entry and product exit and thereby
                  promoting peroxidase activity (favouring NNBT degradation),
                  whereas the more constrained overall channel of the latter
                  keeps the substrate closer to the heme for longer, promoting
                  peroxygenase activity instead (not favouring NNBT
                  degradation).
                </p>
                <p className="md-prose">
                  To identify which stretch of the substrate access channel best
                  distinguishes tunnel geometry among structurally characterized
                  reference peroxidases, we analysed the radius (R) profile of
                  their CAVER channels.
                </p>
                <p className="md-prose">
                  <strong>Spread metric.</strong> At each of the 100 grid
                  positions, the cross reference spread of R was computed as the
                  standard deviation of the three resampled radius values at
                  that position. This spread curve is a purely descriptive
                  measure of separation magnitude; it does not test statistical
                  significance, which is not meaningful at n = 4 references.
                </p>
                <p className="md-prose">
                  <strong>Window selection.</strong> The position of maximum
                  spread was taken as the peak. Starting from the peak, the
                  window was extended left and right as long as the spread
                  remained at least 50% of the peak value, producing a
                  contiguous &ldquo;high discrimination&rdquo; interval on the
                  normalized distance axis. For this run, the peak occurred at
                  normalized distance 0.91, <strong>giving a window of [0.59, 1.00],
                  corresponding to the last approximately 40% of the channel</strong>,
                  that is, the region nearest the solvent facing exit.
                </p>
                <p className="md-prose">
                  The bottom panel of the figure below shows pairwise absolute
                  radius differences (|ΔR|) for all four reference pairs,
                  included to confirm that the selected window separates all
                  pairs of references rather than being driven by a single
                  outlier structure.
                </p>

                <WikiFigure
                  wide
                  fig="lit-reference-region"
                  src={`${REFERENCE_COMPARISON_BASE}/reference-region-simple.avif`}
                  alt="Three stacked panels: the overlaid normalized channel profiles of the four reference UPOs, the per-position spread across them with the peak and window marked, and the pairwise absolute radius differences."
                >
                  The first panel shows the overlay of the tunnels across the 4
                  reference UPOs. The middle panel shows the per position spread
                  (standard deviation across the three references) as a function
                  of normalized distance, with a dashed horizontal line marking
                  the 50% of peak threshold used to define the window, a red
                  dotted vertical line marking the peak position and the peak
                  location and window bounds reported alongside. The bottom
                  panel shows pairwise absolute radius differences (|ΔR|) for
                  all four reference pairs, included to confirm that the
                  selected window separates all pairs of references rather than
                  being driven by a single outlier structure.
                </WikiFigure>

                <p className="md-prose">
                  The calculated window from the reference UPOs suggests that{" "}
                  <strong>the width of the entrance may be the most crucial factor for
                  UPO activity</strong> (though this does not imply that the region close
                  to the heme is unimportant).
                </p>

                <p className="md-prose">
                  To further probe this relationship, a scatter plot showing
                  the degradation rate of the four reference UPOs against their
                  corresponding channel opening is presented in Figure{" "}
                  <FigNum of="lit-scatter" />. Visually, the points suggest a
                  possible linear trend. Such a linear fit (shown in Figure{" "}
                  <FigNum of="lit-linear-fit" />) would imply that degradation
                  rate increases proportionally with channel opening. However,
                  this relationship shows no plateau, which we suspect does not
                  reflect biological reality. For this reason, <strong>we instead fitted
                  a quadratic curve</strong> (shown in Figure{" "}
                  <FigNum of="lit-curve-fit" />
                  ), which we believe offers a more biologically plausible
                  representation of the relationship. This, too, remains a
                  simplification of a rather complex underlying relationship;
                  the true functional form could, for instance, be sigmoidal
                  instead.
                </p>

                <p className="md-prose">
                  Although the trend observed in Figure{" "}
                  <FigNum of="lit-curve-fit" /> is strong, it is based on
                  relatively few data points and is therefore not sufficient, on
                  its own, to propose an entirely new theory for specifically
                  UPOs research. For this reason, <strong>we also look directly at the
                  channel opening radius as a second, complementary approach</strong>,
                  without setting aside the geometry-activity relationship
                  established above. We treat the two as complementary rather
                  than competing, and use each where it best fits our needs.
                  Full channel geometry analysis is more appropriate for
                  filtering UPO candidates generated by the CUPP and Boltz
                  pipeline, and for providing detailed insight into the
                  structures of our engineered candidates. The single
                  entrance-radius metric, meanwhile, offers a faster estimate of
                  NNBT degradation potential and is used to filter candidates
                  produced by RFdiffusion.
                </p>

                <p className="md-prose">
                  Note that this trend is not intended as a generalized,
                  production-level model; rather, it is used to better elucidate
                  the relationship between channel geometry/opening and
                  activity. Although this trend is later used to predict
                  activity for UPOs without experimental measurements available,
                  or for novel UPO candidates, <strong>it is intended mainly for
                  qualitative comparison</strong> (e.g., &quot;UPO X is probably more
                  active than UPO Y&quot;) rather than strict quantitative
                  prediction.
                </p>

                {/* The source document's Figures 6, 7 and 8 (the page numbers its
                    own figures — see FigureNumbers.tsx). It gives no upload
                    path for them, so these three were supplied separately;
                    every one was checked against the asset host before being
                    put here. */}
                {/* All three across, because they are the SAME four points
                    drawn three ways — bare, under a linear fit, under the curve
                    fit — and the paragraph above asks the reader to compare the
                    fits. Side by side that comparison is one glance; stacked it
                    is three screens of scrolling. */}
                <FigureRow cols={3}>
                  <WikiFigure
                    fig="lit-scatter"
                    src={`${REFERENCE_COMPARISON_BASE}/degradation-vs-channel-opening.avif`}
                    alt="Scatter plot with one point per reference UPO: channel opening on one axis, NNBT degradation rate on the other."
                  >
                    Scatter plot of the NNBT degradation rate of the four
                    reference UPOs against their corresponding channel opening.
                  </WikiFigure>
                  <WikiFigure
                    fig="lit-linear-fit"
                    src={`${REFERENCE_COMPARISON_BASE}/degradation-vs-channel-opening-linear-fit.avif`}
                    alt="The same four points with a straight line fitted through them."
                  >
                    The same points with a linear fit, which would imply that
                    degradation rate increases proportionally with channel
                    opening.
                  </WikiFigure>
                  <WikiFigure
                    fig="lit-curve-fit"
                    src={`${REFERENCE_COMPARISON_BASE}/degradation-vs-channel-opening-curve-fit.avif`}
                    alt="The same four points with a curve fitted through them, levelling off rather than rising without limit."
                  >
                    The same points with the curve fit used instead, whose
                    equation is reused in the database discovery section below
                    and on the engineering page.
                  </WikiFigure>
                </FigureRow>

                {/* The channels of the literature UPOs whose activity has not
                    been measured, laid out like the measured group above:
                    intro and tunnel figures. The structures themselves are not
                    here: both groups share the one viewer below, under a
                    heading of its own. */}
                <SubsectionHeading
                  plain
                  title="Known UPOs with not experimentally measured activity"
                />
                <p className="md-prose">
                  As in the Molecular Docking/Dynamics section above, we present
                  the results for the other three reference UPOs (those without
                  experimentally measured activity) in a separate subsection.
                  Their channels (before normalization) appear in Figures{" "}
                  <FigNum of="lit-channels-unmeasured" />.
                </p>
                <div className="chf-row" data-fig="lit-channels-unmeasured">
                  {LIT_CHANNEL_UNMEASURED.map((slug) => (
                    <TunnelFigure
                      key={slug}
                      label={LIT_NAMES[slug]}
                      slug={slug}
                      caption={`Selected channel for ${LIT_NAMES[slug]}`}
                    />
                  ))}
                </div>

                <p className="md-prose">
                  There is no additional knowledge to extract from their channel
                  geometry alone, since we do not have NNBT degradation rates
                  available for them. However, after normalization (see Figure{" "}
                  <FigNum of="lit-unmeasured-overlay" />
                  ), we projected their channel opening radius onto the curve
                  fit produced in the section above and estimated their NNBT
                  degradation activity values (see Figure{" "}
                  <FigNum of="lit-unmeasured-projection" />
                  ). <strong>We expect Fett to have the greatest activity</strong>, with the
                  other two showing roughly similar values to one another. Note,
                  however, that Fett&apos;s channel appears unique in terms of
                  its distribution; given the very small pocket produced by
                  fpocket, we cannot exclude the possibility that this channel is
                  the result of a structural artifact.
                </p>

                {/* The two of them across, because the second is the first one
                    read against the references: the overlay shows the three
                    channels, the scatter puts the opening radius each of them
                    ends on back onto the curve fitted to the measured four.
                    `matchHeights` because the overlay is much wider than it is
                    tall and the scatter is nearly square — left to themselves
                    they come out at different heights side by side. */}
                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="lit-unmeasured-overlay"
                    src={`${CUPP_CLUSTER_BASE}/fett-hsp-mwe-reference-region-simple-profiles.avif`}
                    alt="Overlaid normalized channel profiles for Fett, Hypoxylon sp. UPO and MweUPO-1, each drawn as +R and its mirror −R against normalized distance from heme to exit, with the last quarter of the channel shaded."
                  >
                    The normalized channel profiles of the three UPOs without
                    measured activity, overlaid; the shaded band marks the
                    clustering window. Fett widens fastest towards the exit,
                    while the other two stay close to one another over most of
                    the channel.
                  </WikiFigure>
                  <WikiFigure
                    fig="lit-unmeasured-projection"
                    src={`${CUPP_CLUSTER_BASE}/degradation-vs-channel-opening-with-fett-hsp-mwe-curve-fit.avif`}
                    alt="The degradation-rate against channel-opening scatter plot with the four measured references marked in red on the quadratic fit, and Fett, Hypoxylon sp. UPO and MweUPO-1 placed on that fit in blue at their own channel openings."
                  >
                    The three UPOs (blue) placed on the curve fitted to the four
                    measured references (red) at their own channel opening,
                    giving the degradation rate the fit predicts for each.
                  </WikiFigure>
                </FigureRow>

                {/* The viewer gets a group of its own, headed like the two
                    activity groups above it, because it belongs to neither:
                    it holds all seven structures. Same `plain`
                    SubsectionHeading, so the three read as siblings and none
                    of them reaches the TOC. */}
                <SubsectionHeading
                  plain
                  title="Structure Viewer for known UPOs"
                />
                <p className="md-prose">
                  In the structure viewer below, you can see all seven known
                  UPOs analyzed above (both those with known and unknown
                  activity), along with their best NNBT docking pose and their
                  corresponding pockets/channels.
                </p>

                {/* Interactive 3D structure viewer (3Dmol.js, lazy-loaded).
                  Moved here from the Engineering page; it stays with the UPO
                  branch because the structures listed in it are heme enzymes.

                  POSITION AND CONTENTS: one viewer for the whole section,
                  closing it, immediately before "UPOs database discovery". The
                  two activity groups each used to end on a viewer of their own,
                  which put the same three overlays and the same controls on
                  screen twice and made comparing across the groups a matter of
                  scrolling between two canvases. They now share this one, built
                  from LITERATURE_ALL_STRUCTURES (see structures.ts), whose tabs
                  list the measured four first. The groups keep their own
                  headings, intros and tunnel figures — only the structures were
                  pooled. No heading of its own: the reader arrives here from
                  the group above and StructureViewer renders none.

                  Two WebGL contexts now live on this page — this one and the
                  database viewer further down — and the lazily-imported 3Dmol
                  chunk is shared between them, so this costs no extra
                  download. */}
                <StructureViewer structures={LITERATURE_ALL_STRUCTURES} />
              </div>
            </section>

            {/* --- Group 2b: database-based discovery, UPO branch ---
                ORDER: channel discovery FIRST, then docking and dynamics. The
                channel search is what picks most of the structures that are
                then simulated (9 of the 12 selected accessions, per the intro
                below), so it cannot come after them. That is the one thing
                arranged differently from the literature branch above. */}
            <section id="database-based" className="mt-5">
              <SectionHeading title="UPOs database discovery" />
              <p className="md-prose">
                In this section, we demonstrate how we used the CUPP pipeline
                for novel UPO discovery. After filtering the set of CUPP
                sequences down to 100, we used Boltz to predict their
                structures. This initial filtering was based on prediction
                confidence metrics, among other criteria. From this set, 12
                accessions were ultimately selected, based on a practical limit
                set by the wet lab group. Of these 12 accessions, 9 were chosen
                using our channel discovery pipeline, and 3 from the CUPP tree
                to ensure distributed tree representation.
              </p>

              {/* --- subsection: CUPP discovery ----------------------------- */}
              <div
                id="cupp-database"
                className="dsub"
                data-toc-title="CUPP discovery"
              >
                <SubsectionHeading title="CUPP discovery" />
                {/* Transcribed from the team's "CUPP_Database_Discovery"
                    document; the method half is folded into the box at the
                    end, like the laccase and structural boxes elsewhere on
                    this page. */}
                <p className="md-prose">
                  To discover other enzymes that may perform our reaction of
                  interest more efficiently than known enzymes, we devised a
                  strategy to explore relevant sequence space. It consisted of
                  building a sequence space based on blasting a list of seed
                  sequences against large databases, generating a dendrogram
                  based on CUPP, a clustering tool, followed by docking and
                  binding analysis of candidates across the resulting CUPP
                  groups.
                </p>
                {/* The CUPP pipeline as a flowchart, then its method write-up
                    behind a disclosure — the same arrangement as the channel
                    discovery subsections (ChannelWorkflow + ChannelMethodsBox):
                    one card per step, animation beside the summary, and the rest
                    of the write-up printed in the card rather than behind a
                    second toggle. */}
                <ModelPipeline steps={UPO_CUPP_WORKFLOW} />
                <DetailsBox label="More details on the CUPP pipeline">
                  <p className="mm-prose">
                    In order to explore more diverse enzymes that may have
                    activity with NNBT, we built a sequence space from sequences
                    at UniProt using BLAST and MMseqs2. We created two
                    databases: one containing all reviewed sequences with an EC
                    number and another with all sequences in the hemethiolate
                    peroxidase enzyme superfamily (SSF47571). We BLASTed our
                    seeds against these two databases, then we made the union of
                    both BLAST results and homology reduced this union using
                    MMseqs2. The resulting sequence space was then used to
                    create a dendrogram using CUPP.
                  </p>
                  <p className="mm-prose">
                    In the case of the UPOs, the resulting CUPP dendrogram
                    contained about 1500 sequences. As a broad filter for
                    further docking and structural analysis, we used ProSmith to
                    score all ~1500 sequences, narrowing them down to the top
                    100 highest ProSmith score against the substrate NNBT. We
                    predicted the structures of these 100 sequences using Boltz2
                    and acquired 100 structures. First the channel discovery
                    pipeline was applied and led to the selection of 9
                    structures with promising and diverse channel profiles. More
                    details regarding this step are presented in the following
                    section.
                  </p>
                  <p className="mm-prose">
                    The disposition on the CUPP tree of the final 100 structures
                    from Boltz2, molecular dynamics, channel discovery pipeline,
                    and taxonomy was used to choose 12 homolog sequences for
                    production and wet-lab testing.
                  </p>
                  <MvizMoreInline value={true}>
                    <MethodBlock
                      id="upo-cupp-method-sequence-space"
                      step={UPO_CUPP_WORKFLOW[0]}
                    >
                      <div className="mviz">
                        <BlastStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[0].title}
                          more={
                            <>
                              <p>
                                We Blasted our seed sequences against two
                                databases extracted from UniProt. One was all
                                enzymes at UniProt which had an EC number and
                                were reviewed. The other was all UniProt
                                sequences from the hemethiolate peroxidase
                                enzyme superfamily (SSF47571).
                              </p>
                              <p>
                                The sequence space was homology reduced using
                                MMseqs2 <Cite id="Gabler2020" />{" "}
                                <Cite id="Zimmermann2018" /> to prevent bias
                                towards too similar sequences when clustering
                                them.
                              </p>
                            </>
                          }
                        >
                          Basic Local Alignment Search Tool (BLAST) compares
                          sequence similarity based on statistical significance
                          of matches, finding regions of similarity across
                          sequences <Cite id="Sayers2024" />. We used it to
                          create a sequence space of relevant sequences that
                          were later grouped using CUPP.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                    <MethodBlock
                      id="upo-cupp-method-cupp"
                      step={UPO_CUPP_WORKFLOW[1]}
                    >
                      <div className="mviz">
                        <PhyloStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[1].title}
                          more={
                            <>
                              <p>
                                The CUPP analysis generated a dendrogram on
                                which we plotted seed information (whether known
                                to have activity on NNBT), CUPP group, taxonomy,
                                Boltz2 ranking results, ProSmith, and channel
                                data.
                              </p>
                            </>
                          }
                        >
                          CUPP is a clustering and functional annotation tool
                          that groups proteins based on conserved unique peptide
                          patterns <Cite id="Barrett2019" />. We used it to
                          group our sequences contained in the sequence space
                          generated through the previously described Blast
                          searches. We refer to these groups as CUPP groups.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                    <MethodBlock
                      id="upo-cupp-method-prosmith"
                      step={UPO_CUPP_WORKFLOW[2]}
                    >
                      <div className="mviz">
                        <ProSmithStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[2].title}
                          more={
                            <>
                              <p>
                                ProSmith is trained on a list of substrates that
                                does not contain NNBT; however, when plotted
                                against the CUPP dendrogram, the sequences with
                                the top 100 highest ProSmith score for NNBT were
                                all concentrated on the branches containing the
                                enzymes known to react with NNBT. Therefore, we
                                used it as a primary screening tool to shortlist
                                100 sequences for further analysis using Boltz2
                                and our channel discovery pipeline.
                              </p>
                            </>
                          }
                        >
                          We used ProSmith, a machine learning based enzyme
                          substrate pair prediction (ProSmith) tool to score the
                          sequences in our CUPP dendrogram. It processes protein
                          amino acid sequences and small molecule strings and
                          gives a score that indicates how likely it is that a
                          specific small molecule string is a substrate to a
                          given enzyme sequence <Cite id="Kroll2024" />.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                    <MethodBlock
                      id="upo-cupp-method-boltz"
                      step={UPO_CUPP_WORKFLOW[3]}
                    >
                      <div className="mviz">
                        <BoltzStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[3].title}
                          more={
                            <>
                              <p>
                                Each sequence was folded as a complex rather
                                than alone. The prediction specification
                                contained the protein sequence, the heme
                                cofactor as CCD entry HEM, and NNBT as a SMILES
                                string, with the affinity property set on NNBT.
                                Co-folding the heme is what makes these
                                structures usable downstream: the access channel
                                is traced outward from the heme iron, so a model
                                folded without its cofactor gives the tunnel
                                search no starting point, and docking into a
                                vacant porphyrin cavity would let the substrate
                                occupy the space the cofactor should fill.
                                Multiple sequence alignments were generated
                                through the Boltz MSA server.
                              </p>
                              <p>
                                Predictions were run through our batch script
                                that takes a YAML template and a FASTA file and
                                submits one prediction per sequence, executed on
                                an NVIDIA A100 GPU. The template holds the
                                ligand definitions and a <code>{"{seq}"}</code>{" "}
                                placeholder, so the same driver serves both
                                enzyme families: the UPO template specifies heme
                                and NNBT, while the laccase template specifies
                                four copper ions and no substrate. The script is
                                resume-safe, so an interrupted run continues
                                from the last completed accession, and it writes
                                every confidence and affinity metric Boltz
                                reports into a single summary table alongside
                                each predicted structure converted to PDB.
                              </p>
                            </>
                          }
                        >
                          Boltz-2 is a co-folding model that predicts the
                          structure of a protein together with its ligands in a
                          single pass, and additionally predicts a binding
                          affinity for a nominated ligand{" "}
                          <Cite id="Passaro2025" /> <Cite id="Wohlwend2024" />{" "}
                          <Cite id="Mirdita2022" />. We used it to generate
                          structures for the 100 sequences shortlisted by
                          ProSmith, none of which has an experimental structure,
                          and on which all subsequent pocket, channel, docking
                          and dynamics analysis depends.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                  </MvizMoreInline>
                </DetailsBox>
                <p className="md-prose">
                  We began by selecting a list of seed enzyme sequences that may
                  or may not have been reported in literature to have the
                  activity we were looking for. The list is depicted in Table{" "}
                  <TabNum of="upo-seeds" />. By including seeds that were not
                  known to perform the reaction, we hoped to enhance the
                  sequence space with more variety and perhaps get clues based
                  on the disposition of the seeds across the tree. We then
                  blasted these seeds against two sequence databases, one
                  containing all verified enzymes with an EC number, and another
                  that contained all enzymes in the same superfamilies as the
                  seed sequences. We then combined these blast results, homology
                  reduced them and made sure the seeds were in the final
                  sequence space. We then used CUPP to generate a dendrogram in
                  which sequences are clustered into CUPP groups based on motifs
                  and similarities.
                </p>

                <div className="mm-tablewrap dtable-wrap">
                  <table
                    className="mm-table dtable numtab"
                    data-tab="upo-seeds"
                  >
                    <caption>
                      List of seeds used to build the databases clustered by
                      CUPP.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Activity on NNBT</th>
                        <th scope="col">UniProt ID</th>
                        <th scope="col">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row" rowSpan={4}>
                          Known
                        </th>
                        <td>B9W4V6</td>
                        <td>
                          Aromatic peroxygenase from <em>Cyclocybe aegerita</em>
                        </td>
                      </tr>
                      <tr>
                        <td>A0A4Q2DF10</td>
                        <td>
                          Heme-thiolate peroxidase from{" "}
                          <em>Candolleomyces aberdarensis</em>
                        </td>
                      </tr>
                      <tr>
                        <td>A0A4V1Q376</td>
                        <td>
                          Heme-thiolate peroxidase from{" "}
                          <em>Candolleomyces aberdarensis</em>
                        </td>
                      </tr>
                      <tr>
                        <td>A0A023H437</td>
                        <td>
                          Heme-thiolate peroxidase from{" "}
                          <em>Marasmius rotula</em>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" rowSpan={3}>
                          Not known
                        </th>
                        <td>A0ACB7PKW6</td>
                        <td>
                          Chloroperoxidase from <em>Chaetomium tenue</em>
                        </td>
                      </tr>
                      <tr>
                        <td>AEO60306.1</td>
                        <td>
                          Chloroperoxidase from{" "}
                          <em>Thermothelomyces thermophilus</em>
                        </td>
                      </tr>
                      <tr>
                        <td>AEO68242.1</td>
                        <td>
                          Heme haloperoxidase family profile domain-containing
                          protein from <em>Thermothielavioides terrestris</em>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="md-prose">
                  In the case of the UPOs, the seeds known to do the NNBT
                  reaction were all clustered on one side of the tree, while the
                  seeds not known to do the NNBT reaction were on another. We
                  interpreted that as indicating that one side of the tree was
                  far more relevant for our analysis.
                </p>
                <p className="md-prose">
                  To further help us reduce the amount of sequences we would
                  analyze, we scored all of the sequences in the dendrogram with
                  ProSmith (Enzyme-Substrate Pair Prediction). ProSmith is a
                  machine learning based model that predicts enzyme-substrate
                  pairs and provides a score all based on the sequence and
                  SMILES of the substrate.
                </p>
                <p className="md-prose">
                  Interestingly, the sequences with the top 100 highest ProSmith
                  scores were all on the same side of the tree as the seeds
                  known to do the NNBT reaction, furthermore, they were
                  surrounding the branches around these seeds (see Figure{" "}
                  <FigNum of="upo-cupp-tree" />
                  ). ProSmith is not trained on NNBT and even though the scores
                  were overall low, the fact that they were all present in the
                  same side of the tree as the NNBT reacting seeds convinced us
                  that we could rely on it as a preliminary filter. Therefore,
                  we selected the top 100 ProSmith score sequences for further
                  analysis in binding, molecular dynamics, etc.
                </p>
                <WikiFigure
                  wide
                  fig="upo-cupp-tree"
                  src="https://static.igem.wiki/teams/6060/wiki/drylab/upo-discovery/finalupotree.avif"
                  alt="CUPP dendrogram of the UPO sequence space, ringed by CUPP group, organism family and CAVER channel-size score bars."
                >
                  CUPP dendrogram for UPOs. Inner most circle represents the
                  CUPP groups while outer most circle represents the family of
                  the organism of origin. CAVER channel size scores are
                  represented by score bars.
                </WikiFigure>

                <p className="md-prose">
                  The 100 shortlisted sequences have no experimental structures,
                  so structures were predicted with Boltz-2, which folds the
                  protein together with its ligands in one pass. Each sequence
                  was folded as a complex with the heme cofactor and NNBT,
                  giving a starting point for the channel and docking analyses
                  that follow. Predictions were ranked on Boltz&apos;s
                  confidence score and its predicted affinity for NNBT, with
                  low-confidence structures excluded; see Methods for the
                  thresholds and their limitations.
                </p>
                <p className="md-prose">
                  Three candidates were chosen at this point. A0A0C9U748 is the
                  only representative of its CUPP group so its addition enhances
                  the diversity of our candidate pool. We found A0A0C9TXI4 to be
                  from the same organism as A0A0C9U748. That indicates these two
                  enzymes might have different functions, so we also included it
                  to enhance diversity. Lastly, we chose A0A5C3KL04 due to its
                  close location to a seed known to have activity on NNBT, and
                  its high confidence score from Boltz-2.
                </p>
                <p className="md-prose">
                  Our final selection took into consideration the results from
                  our channel discovery pipeline (presented in the next
                  section), molecular docking and molecular dynamics analysis,
                  as well as disposition of the sequences across the CUPP tree.
                  We aimed to represent all relevant CUPP groups and to explore
                  the sequence space farther away from our seeds as well as
                  sequences that scored high in our analysis and were close to
                  the seeds in the CUPP tree. The final 12 candidates are
                  depicted in Table <TabNum of="upo-final-candidates" />.
                </p>

                <div className="mm-tablewrap dtable-wrap">
                  <table
                    className="mm-table dtable numtab"
                    data-tab="upo-final-candidates"
                  >
                    <caption>List of final novel candidate UPOs.</caption>
                    <thead>
                      <tr>
                        <th scope="col">UniProt ID</th>
                        <th scope="col">Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {UPO_FINAL_CANDIDATES.map(({ id, rationale }) => (
                        <tr key={id}>
                          <th scope="row">{id}</th>
                          <td>{rationale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* --- subsection: channel discovery --------------------------- */}
              <div
                id="channel-database"
                className="dsub"
                data-toc-title="Channel discovery"
              >
                <SubsectionHeading title="Channel discovery" />
                <p className="md-prose">
                  As described in the literature-based UPO discovery section,
                  our novel channel discovery pipeline is able to identify
                  channels with NNBT degradation potential based on channel
                  geometry. This means it can be applied to the structures
                  generated by the CUPP and Boltz pipeline to <strong>identify which
                  ones have channels resembling the desired geometry</strong>.
                </p>

                {/* The same method write-up as the literature branch above —
                    see the note there. A separate `idPrefix` so the two copies
                    of the cards do not collide on ids. */}
                <ChannelWorkflow />
                <ChannelMethodsBox idPrefix="db" />

                <p className="md-prose">
                  The starting point for this analysis is the set of 100
                  structures produced by Boltz. These structures were <strong>filtered
                  using a confidence threshold of 0.85</strong>. The structures that
                  survived this filtering were then given as input to our
                  channel discovery pipeline. Figure{" "}
                  <FigNum of="db-overlay-window" /> shows an overlay of all
                  channels that survived pocket/channel filtering, alongside our
                  reference UPOs (which did not undergo pocket/channel
                  filtering). It additionally displays the window calculated in
                  the literature-based channel discovery section, allowing the
                  reader to focus on the region of highest discrimination.
                </p>

                <p className="md-prose">
                  The dendrogram produced from clustering on the entrance window
                  alone is shown in Figure <FigNum of="db-dendrogram" />. We
                  used the default number of clusters,{" "}
                  <em>max(2, n_structures // 3)</em>.{" "}
                  <strong>Clustering on the entrance window alone reduces noise
                  introduced by other regions of the channel.</strong> As previously
                  mentioned, the cone base is also an important feature;
                  however, at least within the set of structures we are working
                  with, it appears to remain almost constant and would not
                  meaningfully differentiate the results.
                </p>
                <p className="md-prose">
                  Extracting the clusters from the dendrogram and generating
                  per-cluster overlays produces Figure{" "}
                  <FigNum of="db-cluster-overlays" />, which shows the cluster
                  overlays of the raw channels directly. Figure{" "}
                  <FigNum of="db-cluster-means" /> is produced from the same
                  clusters but instead plots mean/std.
                </p>
                <p className="md-prose">
                  In these plots (dendrogram and cluster overlays), we have
                  annotated the reference UPOs with red labels, while the
                  accessions chosen for wet-lab validation are labeled in
                  blue. Justification for the selection follows below.
                </p>

                {/* The overlay and the tree it is clustered into, side by side.
                    matchHeights because the tree is much taller than the
                    overlay — without it the pair would come out at very
                    different heights. */}
                <FigureRow cols={2} matchHeights>
                  {/* NOTE THE NAME. This one is not
                      `best-tunnel-overlay-uncolored-with-window`, which is what
                      the figures around it would lead you to expect —
                      "with-window" sits in the MIDDLE, after `best-tunnel`.
                      That is why it could not be found by pattern and had to be
                      supplied; checked against the asset host, like the rest. */}
                  <WikiFigure
                    fig="db-overlay-window"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-overlay-uncolored.avif`}
                    alt="The same overlay of CUPP and Boltz channel profiles, with the high-discrimination window marked across the normalized distance axis."
                  >
                    Overlay of the channels from the structures generated by the
                    CUPP and Boltz enzyme discovery pipeline, alongside the
                    discrimination window.
                  </WikiFigure>
                  <WikiFigure
                    fig="db-dendrogram"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-dendrogram.avif`}
                    alt="Hierarchical clustering dendrogram of the channel shape profiles, with each leaf labelled by accession and the reference UPOs among them."
                  >
                    Dendrogram showing the clustering of the novel enzymes
                    (labeled by accession ID) together with the seven known
                    UPOs.
                  </WikiFigure>
                </FigureRow>

                <p className="md-prose">
                  Our goal was to choose structures with diverse channel
                  geometry. We therefore aimed to <strong>select accessions covering as
                  much of the dendrogram as possible</strong>, which allows us to further
                  elucidate the relationship between channel geometry and
                  activity. Additionally, since some of our selections cluster
                  close to different reference UPOs, we expect (if the structure
                  prediction is close to reality and our proposed theory is
                  valid) to obtain candidates with variation in their NNBT
                  degradation activity.
                </p>
                <p className="md-prose">
                  After choosing an initial, promising set of seven structures
                  (accession IDs: A0A9P7RSA8, A0A0C9UQE3, A0A0C9VQZ5,
                  A0A0C4E1P3, A0A4S8L4J7, A0A8H6HXY8, A0A9P5Z220), we decided to
                  soften the fpocket filtering threshold to identify <strong>two
                  additional structures covering unexplored regions of the
                  dendrogram</strong>. The accession IDs of these structures are
                  A0A9P5XE54 and A0A2H3E6E9.
                </p>
                {/* The shapes the clusters turn out to have — the same
                    per-cluster grid twice, once with the member profiles
                    alone and once with the mean ± standard deviation band
                    over it. The tree that defines them now sits beside the
                    overlay above. */}
                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="db-cluster-overlays"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-cluster-overlays.avif`}
                    alt="A grid of per-cluster channel profile overlays showing the member profiles alone, without a mean or standard-deviation band, and the discrimination window shaded grey toward the channel entrance."
                  >
                    Grid of per-cluster channel overlays, without showing the
                    mean ± standard deviation for each cluster.
                  </WikiFigure>
                  <WikiFigure
                    fig="db-cluster-means"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-cluster-means.avif`}
                    alt="A grid of per-cluster channel profile overlays, each panel showing the cluster mean with a shaded standard-deviation band, and the discrimination window shaded grey toward the channel entrance."
                  >
                    Grid of per-cluster channel overlays, showing the mean ±
                    standard deviation for each cluster.
                  </WikiFigure>
                </FigureRow>

                {/* The source document numbers these two figures 6 and 7 —
                    its own count, not the page's. Both are cited by id here,
                    so they carry whatever number they end up with on the
                    page, and follow the figures if either moves. */}
                <p className="md-prose">
                  Extracting the channels of the nine candidates and creating a
                  separate overlay for them enables a better justification of
                  our choices. In Figure <FigNum of="db-candidates-overlay" />,
                  the variation in channel geometries is shown.
                </p>
                <p className="md-prose">
                  Furthermore, we used the equation derived from the four
                  reference UPOs with known activity values (see UPO
                  literature-based discovery) and mapped the channel opening of
                  our nine candidates onto that curve. It is worth reiterating
                  that we do not aim for a strong quantitative prediction of
                  activity, but rather a qualitative approximation; for example,
                  based on Figure <FigNum of="db-candidates-curve" />, <strong>we expect
                  A0A0C9UQE3 to have higher activity than A0A9P7RSA8</strong>.
                </p>
                {/* The candidates' own channels on the left, in the same
                    discrimination window as the database-wide overlay further
                    up; the curve they are mapped onto on the right. The two
                    plots are different shapes, so the row matches their
                    heights. The prose above cites the curve by id, so its
                    number follows it to the right. */}
                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="db-candidates-overlay"
                    src={`${CUPP_CLUSTER_BASE}/candidates-overlay-uncolored.avif`}
                    alt="Channel radius profiles of the nine chosen candidates overlaid on one normalized axis from the heme (0) to the channel exit (1), with the high-discrimination window shaded towards the exit."
                  >
                    Overlay of the channels of the nine chosen candidates,
                    alongside the discrimination window.
                  </WikiFigure>
                  <WikiFigure
                    fig="db-candidates-curve"
                    src={`${CUPP_CLUSTER_BASE}/degradation-vs-channel-opening-curve-fit-with-candidates.avif`}
                    alt="NNBT degradation rate against channel opening: the four reference UPOs as red points and the nine candidate accessions as blue points placed on the dashed quadratic curve fitted to the references."
                  >
                    Predicted NNBT degradation activity of the nine chosen
                    candidates, estimated by mapping their channel opening onto
                    the fitted curve.
                  </WikiFigure>
                </FigureRow>

                {/* Every candidate's channel, in ONE row and one group.

                    Driven off DATABASE_STRUCTURES, the same list the viewer
                    below tabs, so the channels and the structures can never
                    disagree about which candidates there are: adding one to
                    that list adds it here too, in the same order. The slug is
                    the accession lowercased, which is also the upload path —
                    all nine plots checked against the asset host. */}
                <p className="md-prose">
                  The following plots show the raw, pre-normalized 2D channel
                  profiles for the nine chosen candidates. Note that, unlike the
                  channels shown in previous plots, <strong>these are not directly
                  comparable to one another</strong>; instead, they provide information
                  on the length of each channel.
                </p>
                <div className="chf-row">
                  {DATABASE_STRUCTURES.map((st) => (
                    <TunnelFigure
                      key={st.id}
                      label={st.label}
                      slug={st.id}
                      caption={`Selected channel for ${st.label}`}
                    />
                  ))}
                </div>
              </div>

              {/* --- subsection: molecular docking and molecular dynamics ----
                  Same subsection as the literature branch, and the same shape
                  inside it: heading, flowchart, both method boxes, then the
                  results as ONE run of prose and figures.

                  The results used to carry a plain "Molecular docking" and
                  "Molecular dynamics" heading of their own. They are gone: the
                  two techniques are one pipeline here — the docking poses are
                  what the dynamics start from, and the paragraphs read
                  straight on from one another — so splitting them put two
                  headings between a reader and three paragraphs, and made this
                  section look unlike the literature one for no reason. What
                  separates the results is still in their first words
                  ("Molecular docking successfully generated poses…", "As shown
                  in the following figures…"). */}
              <div
                id="structural-database"
                className="dsub"
                data-toc-title="Molecular docking and dynamics"
              >
                <SubsectionHeading title="Molecular docking and molecular dynamics" />
                {/* The same flowchart and the same box as the literature
                    branch: one pipeline, applied to a second set of
                    structures. */}
                <ModelPipeline steps={STRUCTURAL_WORKFLOW} />
                <StructuralMethodsBox
                  idPrefix="db"
                  steps={STRUCTURAL_WORKFLOW}
                />

                <p className="md-prose">
                  <strong>Molecular docking successfully generated poses with the
                  expected NNBT orientation in all 9 structures</strong>, with the
                  aromatic ring oriented toward the heme and the two oxygen
                  atoms facing the solvent.
                </p>
                <p className="md-prose">
                  Comparing NNBT poses across the set revealed that the
                  ligand&apos;s proximity to the heme varied between structures,{" "}
                  <strong>reflecting the strong influence of channel geometry and length
                  on NNBT placement</strong>.
                </p>

                {/* Headed like the literature section's viewer ("Structure
                    Viewer for known UPOs"), with the same `plain`
                    SubsectionHeading, so the two viewers on this page are
                    introduced the same way and neither reaches the TOC. */}
                <SubsectionHeading
                  plain
                  title="Structure Viewer for candidate UPOs"
                />
                <p className="md-prose">
                  This is the structure viewer for the nine chosen candidates,
                  showing their best NNBT docking pose, best pocket, and
                  channel.
                </p>
                {/* The same interactive 3D viewer as in the literature section
                  above, pointed at the database-search candidates instead of
                  the literature-curated reference structures (the tab list is
                  a prop — see DATABASE_STRUCTURES in structures.ts).
                  Two instances means two WebGL contexts on this page, but the
                  lazily-imported 3Dmol chunk is shared between them. */}
                <StructureViewer structures={DATABASE_STRUCTURES} />

                <p className="md-prose">
                  Heading into the molecular dynamics validation of our
                  candidates and their NNBT docking poses, we provided the best
                  docking pose for each candidate and ran the same MD pipeline
                  as in the literature-based discovery section.
                </p>
                <p className="md-prose">
                  As shown in the following figures, <strong>most structures exhibit
                  relatively low RMSD</strong> compared to the baseline established
                  during literature discovery of UPOs, indicating good overall
                  stability. Additionally, inspection of the ligand-to-heme and
                  SASA plots, together with visual analysis of the trajectories,{" "}
                  <strong>confirmed that NNBT did not escape the pocket in any case</strong>.
                </p>

                {/* Accession and plots only — see the note on the literature
                    rows above for where a per-candidate description would go. */}
                {MD_CANDIDATES.map((c) => (
                  <MdFigureBlock
                    key={c.accession}
                    name={c.accession}
                    slug={c.slug}
                  />
                ))}
              </div>

              {/* --- subsection: conclusion ------------------------------- */}
              <div
                id="conclusion-database"
                className="dsub"
                data-toc-title="Conclusion"
              >
                <SubsectionHeading title="Conclusion" />
                <p style={{ color: "#123a52" }}>
                  {/* PLACEHOLDER — replace with the real conclusion. */}
                  Placeholder: summarise what the UPO database discovery
                  produced, and which candidates go forward.
                </p>
              </div>
            </section>

            {/* Discussion */}
            <section id="discussion" className="mt-5">
              <SectionHeading title="Discussion" />
              <p style={{ color: "#123a52" }}>
                {/* PLACEHOLDER — replace with the real discussion. */}
                Placeholder discussion text. Interpret the discovery results,
                note the limitations, and connect them back to the wet lab /
                project goals.
              </p>
            </section>

            {/* --- Testing ------------------------------------------------
                A top-level section (not nested in Discussion), so it carries an
                <h1> via SectionHeading and therefore appears in the TOC. */}
            <section id="testing" className="mt-5">
              <SectionHeading title="Testing" />

              {/* Two figures that pop up on scroll */}
              <ResultsFigures />

              {/* Interactive pocket-identification & docking walk-through */}
              <PocketDockingDemo />
            </section>

            {/* References */}
            <section id="references" className="mt-5">
              <SectionHeading title="References" />
              {/* Everything here comes from the channel-method cards, which
                  this page renders at the end of both Channel discovery
                  subsections — the rest of the page is placeholder text and
                  cites nothing. The list is built from DISCOVERY_REFERENCES
                  rather than typed out, so it follows whatever that method
                  cites; add to DISCOVERY_OWN_CITATIONS when a section on this
                  page starts citing works of its own. */}
              <ReferenceBar
                references={referenceNodes(DISCOVERY_REFERENCES)}
                showTitle={false}
              />
            </section>

            {/* Bottom prev/next navigation (Methods ← Discovery → Engineering) */}
            <ModelPager active="discovery" />
          </NumberedFigures>
        </div>
      </div>
    </>
  );
}
