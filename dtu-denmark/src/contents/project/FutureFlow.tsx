import { useState } from "react";
import type { ReactNode } from "react";

/* ========================================================================== *
 *  FutureFlow — the one-pot process drawn at the top of "Future prospects"
 *
 *  Blade → mild solvolysis → laccases → UPOs → defined product, left to right
 *  (top to bottom on a phone). Fragments drift along the arrows and shrink as
 *  they go: blade shards, then large irregular resin fragments, then smaller
 *  ones, and finally a row of identical product molecules.
 *
 *  Inline SVG, like EngineeringFlow.tsx, so nothing has to be uploaded to
 *  static.igem.wiki. All motion is CSS (description.css, .ff-*) and stops
 *  under prefers-reduced-motion.
 *
 *  It illustrates a PROPOSED process that was not tested this season — the
 *  caption says so, and the step texts only repeat what the page text says.
 * ========================================================================== */

const BLUE = "#2b35ee"; // laccases
const RED = "#8e1b1b"; // UPOs
const RESIN = "#c98a2b"; // resin fragments
const COPPER = "#e8912e";
const INK = "var(--color-darkblue)";

type Step = {
  key: string;
  label: string;
  info: string;
  art: ReactNode;
};

/** A regular hexagon centred on (cx, cy) — the "defined product" molecule. */
function hex(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

const STEPS: Step[] = [
  {
    key: "blade",
    label: "Turbine blade",
    info: "Glass fibres held together by a cross-linked epoxy thermoset resin.",
    art: (
      <g className="ff-pulse">
        <path
          d="M8 50 C8 38 20 34 30 36 L112 46 Q117 50 112 54 L30 64 C20 66 8 62 8 50 Z"
          fill="#eef3f7"
          stroke={INK}
          strokeWidth="2"
        />
        <path
          d="M32 44 L106 49 M32 50 L108 51 M32 56 L106 53"
          stroke="#9bb3c4"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          fill="none"
        />
        <circle
          cx="16"
          cy="50"
          r="5"
          fill="none"
          stroke={INK}
          strokeWidth="2"
        />
      </g>
    ),
  },
  {
    key: "solvolysis",
    label: "Mild solvolysis",
    info: "A mild solvolysis step breaks the network apart and releases soluble resin fragments.",
    art: (
      <g className="ff-pulse">
        <path
          d="M38 66 L82 66 L92 86 Q94 90 89 90 L31 90 Q26 90 28 86 Z"
          fill="var(--color-lightblue)"
        />
        <path
          d="M52 12 L52 40 L28 86 Q26 90 31 90 L89 90 Q94 90 92 86 L68 40 L68 12"
          fill="none"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line
          x1="47"
          y1="12"
          x2="73"
          y2="12"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon
          className="ff-rise"
          points="42,82 49,77 53,82 49,87 42,86"
          fill={RESIN}
        />
        <polygon
          className="ff-rise ff-d1"
          points="58,84 66,79 71,84 64,88"
          fill={RESIN}
        />
        <polygon
          className="ff-rise ff-d2"
          points="74,82 80,78 84,83 78,87 73,86"
          fill={RESIN}
        />
      </g>
    ),
  },
  {
    key: "laccases",
    label: "Laccases",
    info: "Laccases oxidise a small mediator (green → purple). The mediator diffuses to a fragment, oxidises it so it breaks apart, and returns to its original state.",
    art: (
      <>
        <g className="ff-pulse">
          <path
            d="M82 14 C100 14 112 28 110 46 C108 64 96 74 80 74 C62 74 52 62 54 44 C56 26 66 14 82 14 Z"
            fill={BLUE}
          />
          <circle cx="86" cy="32" r="3.5" fill={COPPER} />
          <circle cx="90" cy="50" r="3" fill={COPPER} />
          <circle cx="96" cy="45" r="3" fill={COPPER} />
          <circle cx="86" cy="56" r="3" fill={COPPER} />
        </g>
        {/* The fragment, already drawn as the two halves it splits into. */}
        <polygon
          className="ff-half ff-half-l"
          points="10,70 20,62 30,66 28,74 26,84 14,86 8,78"
          fill={RESIN}
        />
        <polygon
          className="ff-half ff-half-r"
          points="30,66 40,62 48,70 44,82 26,84 28,74"
          fill={RESIN}
        />
        <circle
          className="ff-mediator"
          cx="36"
          cy="22"
          r="5"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      </>
    ),
  },
  {
    key: "upos",
    label: "UPOs → defined product",
    info: "UPOs take the smaller fragments into their channel and carry out N-dealkylation, giving more defined products that can be reused or sold.",
    art: (
      <>
        <g className="ff-pulse">
          <path
            d="M45 18 C66 18 80 34 78 54 C76 74 62 86 44 86 C24 86 12 70 13 52 C14 32 26 18 45 18 Z"
            fill={RED}
          />
          <line
            x1="11"
            y1="52"
            x2="42"
            y2="52"
            stroke="#4a0909"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <rect
            x="40"
            y="46"
            width="12"
            height="12"
            transform="rotate(45 46 52)"
            fill={COPPER}
          />
        </g>
        <polygon
          className="ff-enter"
          points="0,50 5,47 8,52 4,55"
          fill={RESIN}
        />
        {[0, 1, 2].map((i) => (
          <polygon
            key={i}
            className={`ff-emit ff-d${i}`}
            points={hex(100, 32 + i * 20, 7)}
            fill="none"
            stroke={INK}
            strokeWidth="2"
          />
        ))}
      </>
    ),
  },
];

/** What drifts along each arrow: what the previous step hands to the next. */
const ARROW_CARGO: ReactNode[] = [
  // blade → solvolysis: shredded blade pieces
  <>
    <rect x="0" y="15" width="8" height="5" fill="#9bb3c4" />
    <rect x="0" y="22" width="6" height="4" fill="#9bb3c4" />
  </>,
  // solvolysis → laccases: large, irregular resin fragments
  <polygon points="0,14 9,11 14,18 10,26 2,25" fill={RESIN} />,
  // laccases → UPOs: smaller fragments
  <>
    <polygon points="0,16 5,14 7,19 3,21" fill={RESIN} />
    <polygon points="0,23 4,22 5,26 1,27" fill={RESIN} />
  </>,
];

function Arrow({ cargo }: { cargo: ReactNode }) {
  return (
    <li className="ff-arrow" aria-hidden="true">
      <svg viewBox="0 0 80 40">
        <line x1="4" y1="20" x2="70" y2="20" stroke={INK} strokeWidth="2" />
        <polygon points="70,14 78,20 70,26" fill={INK} />
        <g className="ff-drift">{cargo}</g>
        <g className="ff-drift ff-d1">{cargo}</g>
      </svg>
    </li>
  );
}

export function FutureFlow() {
  /** The step the reader is pointing at (or last tapped). */
  const [active, setActive] = useState<string | null>(null);
  const current = STEPS.find((s) => s.key === active);

  return (
    <figure className="ff">
      <ol className="ff-row">
        {STEPS.map((step, i) => (
          <FlowItem
            key={step.key}
            step={step}
            arrowBefore={i > 0 ? ARROW_CARGO[i - 1] : null}
            active={active === step.key}
            onActivate={setActive}
          />
        ))}
      </ol>

      <p className="ff-info" aria-live="polite">
        {current ? (
          <>
            <strong>{current.label}:</strong> {current.info}
          </>
        ) : (
          "Hover over or tap a step to see what happens there."
        )}
      </p>

      <figcaption>
        Proposed one-pot process. Not tested in this project.
      </figcaption>
    </figure>
  );
}

function FlowItem({
  step,
  arrowBefore,
  active,
  onActivate,
}: {
  step: Step;
  arrowBefore: ReactNode;
  active: boolean;
  onActivate: (key: string | null) => void;
}) {
  return (
    <>
      {arrowBefore ? <Arrow cargo={arrowBefore} /> : null}
      <li className="ff-item">
        <button
          type="button"
          className={`ff-step${active ? " is-active" : ""}`}
          aria-pressed={active}
          onMouseEnter={() => onActivate(step.key)}
          onMouseLeave={() => onActivate(null)}
          onFocus={() => onActivate(step.key)}
          onBlur={() => onActivate(null)}
          onClick={() => onActivate(step.key)}
        >
          <svg viewBox="0 0 120 100" role="img" aria-label={step.label}>
            {step.art}
          </svg>
          <span className="ff-label">{step.label}</span>
        </button>
      </li>
    </>
  );
}
