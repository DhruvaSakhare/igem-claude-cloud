/* ========================================================================== *
 *  Software-page figures (.swf-*)
 *
 *  Inline SVG, not uploaded images, for two reasons:
 *
 *   1. iGEM requires every asset to be served from its own host and forbids
 *      external CDNs (see channel-assets.ts). An inline SVG needs no host at
 *      all, so these figures cannot break when an upload path changes and
 *      cannot be the thing that fails iGEM's no-external-assets rule.
 *   2. They are diagrams and a line plot, not photographs. SVG stays sharp at
 *      any width, reflows on a phone, and takes its colours from the page --
 *      which a flattened .avif of a matplotlib plot cannot.
 *
 *  THE PROFILE DATA IS REAL. PROFILE below is tunnel 1, cluster 1 of
 *  PabUPO-II_withHEMEFE_and_NNBT.pdb, read from CAVER 3.0.2's own
 *  out/analysis/tunnel_profiles.csv and transcribed unchanged. Reproduce it:
 *
 *      python partial_diffusion/scripts/00_caver_channel.py \
 *          examples/PabUPO-II_withHEMEFE_and_NNBT.pdb
 *
 *  which prints bottleneck 0.983 A, length 14.96 A, throughput 0.717 -- the
 *  same figures as docs/validation.md in the repository. Do not hand-edit the
 *  numbers to make a nicer curve; re-run CAVER and paste what it says.
 *
 *  Styling is in software.css (.swf-*).
 * ========================================================================== */

/** Tunnel 1 of the PabUPO-II parent: [distance along tunnel (A), radius (A)].
 *
 *  Straight from CAVER. The bottleneck is the FIRST point -- distance 0 is the
 *  buried end, at the heme -- which is the whole problem in one number: the
 *  tunnel is at its narrowest exactly where the substrate has to arrive. */
const PROFILE: [number, number][] = [
  [0.0, 0.983],
  [0.41, 1.025],
  [0.87, 1.122],
  [1.37, 1.291],
  [1.87, 1.524],
  [2.33, 1.721],
  [2.8, 1.976],
  [3.29, 2.276],
  [3.63, 2.411],
  [3.93, 2.491],
  [4.2, 2.467],
  [4.51, 2.489],
  [4.92, 2.51],
  [5.35, 2.592],
  [5.78, 2.731],
  [6.23, 2.923],
  [6.61, 3.083],
  [6.88, 3.174],
  [7.19, 3.316],
  [7.43, 3.362],
  [7.52, 3.271],
  [7.88, 3.136],
  [8.23, 2.96],
  [8.38, 2.692],
  [8.74, 2.487],
  [9.12, 2.335],
  [9.5, 2.245],
  [9.89, 2.201],
  [10.38, 2.347],
  [10.83, 2.498],
  [11.17, 2.483],
  [11.53, 2.527],
];

/** The best design's bottleneck, from docs/validation.md. A separate CAVER run
 *  on a different structure, so it is drawn as a reference line and not as a
 *  second curve -- we have the parent's full profile here, not the design's. */
const BEST_DESIGN_BOTTLENECK = 1.094;

/* --- plot geometry --------------------------------------------------------- */
const W = 680;
const H = 300;
const PAD = { top: 18, right: 108, bottom: 44, left: 52 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const X_MAX = 12;
const Y_MAX = 3.6;

const sx = (d: number) => PAD.left + (d / X_MAX) * PLOT_W;
const sy = (r: number) => PAD.top + PLOT_H - (r / Y_MAX) * PLOT_H;

/** The measured profile of the parent tunnel.
 *
 *  Reads as the answer to "why is this enzyme the problem?": the curve falls
 *  off a cliff at the buried end. Everything the pipeline does is an attempt
 *  to lift the left-hand edge of this line. */
export function ChannelProfileFigure() {
  const line = PROFILE.map(
    ([d, r], i) => `${i === 0 ? "M" : "L"}${sx(d).toFixed(1)},${sy(r).toFixed(1)}`,
  ).join(" ");

  // Closed under the curve, so the tunnel reads as a space with a width
  // rather than as an abstract line.
  const area =
    `M${sx(0).toFixed(1)},${sy(0).toFixed(1)} ` +
    PROFILE.map(([d, r]) => `L${sx(d).toFixed(1)},${sy(r).toFixed(1)}`).join(" ") +
    ` L${sx(PROFILE[PROFILE.length - 1][0]).toFixed(1)},${sy(0).toFixed(1)} Z`;

  return (
    <figure className="swf-fig numfig">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="swf-svg"
        role="img"
        aria-label={
          "Measured radius along the PabUPO-II parent tunnel. The radius is " +
          "0.98 angstrom at the buried end next to the heme, rises to about " +
          "3.4 angstrom in the middle, and leaves the protein at about 2.5 " +
          "angstrom. The narrowest point is where the substrate must arrive."
        }
      >
        {/* horizontal gridlines, one per angstrom */}
        {[1, 2, 3].map((r) => (
          <g key={r}>
            <line
              x1={PAD.left}
              y1={sy(r)}
              x2={PAD.left + PLOT_W}
              y2={sy(r)}
              className="swf-grid"
            />
            <text x={PAD.left - 8} y={sy(r) + 4} className="swf-tick swf-tick-y">
              {r}
            </text>
          </g>
        ))}

        <path d={area} className="swf-area" />
        <path d={line} className="swf-line" />

        {/* The design's measured bottleneck, for scale. Drawn AFTER the filled
            area: underneath it, the fill hid everything but two stubs at the
            edges, which read as a rendering fault rather than a reference. */}
        <line
          x1={PAD.left}
          y1={sy(BEST_DESIGN_BOTTLENECK)}
          x2={PAD.left + PLOT_W}
          y2={sy(BEST_DESIGN_BOTTLENECK)}
          className="swf-ref"
        />
        <text
          x={PAD.left + PLOT_W + 8}
          y={sy(BEST_DESIGN_BOTTLENECK) + 4}
          className="swf-ref-label"
        >
          1.094 Å
          <tspan x={PAD.left + PLOT_W + 8} dy="13" className="swf-ref-sub">
            best design
          </tspan>
        </text>

        {/* The bottleneck itself. Labelled BELOW and right of the dot, inside
            the shaded tunnel area: the curve climbs steeply out of this corner,
            so anything placed above the dot runs straight into the line within
            a couple of angstrom. The fill is pale enough to read dark text. */}
        <circle cx={sx(0)} cy={sy(0.983)} r="4.5" className="swf-dot" />
        <text x={sx(0) + 11} y={sy(0.983) + 19} className="swf-callout">
          0.983 Å
          <tspan x={sx(0) + 11} dy="13" className="swf-callout-sub">
            bottleneck, at the heme
          </tspan>
        </text>

        {/* axes */}
        <line
          x1={PAD.left}
          y1={PAD.top + PLOT_H}
          x2={PAD.left + PLOT_W}
          y2={PAD.top + PLOT_H}
          className="swf-axis"
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + PLOT_H}
          className="swf-axis"
        />
        {[0, 3, 6, 9, 12].map((d) => (
          <text key={d} x={sx(d)} y={PAD.top + PLOT_H + 18} className="swf-tick">
            {d}
          </text>
        ))}
        <text
          x={PAD.left + PLOT_W / 2}
          y={H - 6}
          className="swf-axis-label"
        >
          distance along tunnel (Å) &mdash; 0 is the buried end
        </text>
        <text
          transform={`translate(14,${PAD.top + PLOT_H / 2}) rotate(-90)`}
          className="swf-axis-label"
        >
          radius (Å)
        </text>
      </svg>
      <figcaption>
        The parent tunnel, as CAVER measures it. The constriction is not
        half-way along &mdash; it is at the far end, next to the heme, exactly
        where a bulky substrate has to arrive. Widening the mouth would achieve
        nothing, which is why the pipeline picks the residues it is allowed to
        move from this curve rather than from the surface.
      </figcaption>
    </figure>
  );
}

/* ========================================================================== *
 *  Architecture
 * ========================================================================== */

/** One box in the stage chain. */
function Stage({
  x,
  y,
  w,
  label,
  sub,
  kind,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  sub: string;
  kind: "cpu" | "gpu" | "gate";
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={46} rx="5" className={`swa-box swa-${kind}`} />
      <text x={x + w / 2} y={y + 20} className="swa-label">
        {label}
      </text>
      <text x={x + w / 2} y={y + 35} className="swa-sub">
        {sub}
      </text>
    </g>
  );
}

const AW = 760;
const AH = 430;

/** How the pieces fit together.
 *
 *  Three things this has to show that a linear "A then B then C" strip cannot,
 *  and that are the actual design of the thing:
 *
 *    - the CPU gate sits BETWEEN the two expensive GPU stages, which is the
 *      whole idea;
 *    - what a run needs is split into three layers, which is why an experiment
 *      is publishable and a filesystem is not;
 *    - the same stages run under two drivers, one per machine kind.
 */
export function ArchitectureFigure() {
  return (
    <figure className="swf-fig swf-fig-wide numfig">
      <svg
        viewBox={`0 0 ${AW} ${AH}`}
        className="swf-svg"
        role="img"
        aria-label={
          "Architecture of channel-design. Three input layers feed one stage " +
          "chain: prepare and diffuse on the GPU, then a CPU tunnel-measurement " +
          "gate that discards collapsed backbones, then sequence design and " +
          "folding on the GPU, then scoring and collection on the CPU. The same " +
          "chain runs either on one GPU through run_local.py or on an LSF " +
          "cluster through 00_submit_all.py."
        }
      >
        {/* ---------- inputs: the three layers ---------- */}
        <text x="20" y="22" className="swa-head">
          WHAT A RUN NEEDS — three layers, kept apart on purpose
        </text>

        <g>
          <rect x="20" y="32" width="228" height="62" rx="5" className="swa-in" />
          <text x="32" y="51" className="swa-in-title">
            Experiment
          </text>
          <text x="32" y="67" className="swa-in-body">
            configs/*.py — which enzyme,
          </text>
          <text x="32" y="81" className="swa-in-body">
            which residues move, substrate
          </text>
        </g>
        <g>
          <rect x="266" y="32" width="228" height="62" rx="5" className="swa-in" />
          <text x="278" y="51" className="swa-in-title">
            Machine
          </text>
          <text x="278" y="67" className="swa-in-body">
            site.py — checkpoints, queues,
          </text>
          <text x="278" y="81" className="swa-in-body">
            scratch. Env-overridable
          </text>
        </g>
        <g>
          <rect x="512" y="32" width="228" height="62" rx="5" className="swa-in" />
          <text x="524" y="51" className="swa-in-title">
            Personal
          </text>
          <text x="524" y="67" className="swa-in-body">
            envs/site.env — your paths.
          </text>
          <text x="524" y="81" className="swa-in-body">
            Never committed
          </text>
        </g>

        {/* A bus joining all three, then one arrow down. A single arrow under
            the middle box read as "the machine layer feeds the chain", which
            is wrong -- a run is all three together. */}
        <path
          d="M134,94 L134,104 M380,94 L380,104 M626,94 L626,104 M134,104 L626,104 M380,104 L380,118"
          className="swa-arrow"
          markerEnd="url(#swa-tip)"
        />

        {/* ---------- the stage chain ---------- */}
        <text x="20" y="136" className="swa-head">
          THE CHAIN — eight stages, run in order
        </text>

        <Stage x={20} y={148} w={118} label="0 · prep" sub="CPU · validate" kind="cpu" />
        <Stage x={152} y={148} w={118} label="1 · RFD3" sub="GPU · diffuse" kind="gpu" />
        <Stage x={284} y={148} w={118} label="2 · process" sub="CPU · geometry" kind="cpu" />
        <Stage
          x={416}
          y={148}
          w={154}
          label="3 · CAVER gate"
          sub="CPU · measure & cut"
          kind="gate"
        />

        {[138, 270, 402].map((x) => (
          <path
            key={x}
            d={`M${x},171 L${x + 13},171`}
            className="swa-arrow"
            markerEnd="url(#swa-tip)"
          />
        ))}

        {/* the gate's own callout */}
        <path d="M493,194 L493,218" className="swa-arrow-note" />
        <rect x="300" y="218" width="330" height="60" rx="5" className="swa-note" />
        <text x="314" y="238" className="swa-note-title">
          This is the point of the whole thing
        </text>
        <text x="314" y="256" className="swa-note-body">
          A collapsed tunnel is cheap to spot and dies here, before it
        </text>
        <text x="314" y="269" className="swa-note-body">
          costs GPU. Fails open: no CAVER, no silent loss.
        </text>

        {/* wrap to the second row */}
        {/* Out to x=700, clear of the callout box (which ends at 630): the
            previous route at x=596 ran straight through its text. */}
        <path
          d="M570,171 L700,171 L700,290 L20,290 L20,306"
          className="swa-arrow"
          markerEnd="url(#swa-tip)"
        />

        <Stage x={20} y={308} w={118} label="4 · MPNN" sub="GPU · sequence" kind="gpu" />
        <Stage x={152} y={308} w={118} label="5 · RF3" sub="GPU · refold" kind="gpu" />
        <Stage x={284} y={308} w={118} label="6 · score" sub="CPU · re-measure" kind="cpu" />
        <Stage x={416} y={308} w={118} label="7 · collect" sub="CPU · rank" kind="cpu" />

        {[138, 270, 402].map((x) => (
          <path
            key={`b${x}`}
            d={`M${x},331 L${x + 13},331`}
            className="swa-arrow"
            markerEnd="url(#swa-tip)"
          />
        ))}

        {/* ---------- the two drivers ---------- */}
        <rect x="556" y="300" width="184" height="62" rx="5" className="swa-driver" />
        <text x="568" y="319" className="swa-in-title">
          One chain, two drivers
        </text>
        <text x="568" y="335" className="swa-in-body">
          run_local.py — one GPU
        </text>
        <text x="568" y="349" className="swa-in-body">
          00_submit_all.py — LSF arrays
        </text>

        <text x="20" y="390" className="swa-foot">
          Ranking is by <tspan className="swa-em">measured</tspan> change in
          bottleneck radius at stage 6 — never by how confident the model was.
        </text>
        <text x="20" y="408" className="swa-foot">
          Stages 0–3 and 6–7 need no GPU and no model weights, so the
          measurement half runs on a laptop.
        </text>

        <defs>
          <marker
            id="swa-tip"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L8,5 L0,9 z" className="swa-tip" />
          </marker>
        </defs>
      </svg>
      <figcaption>
        The architecture. The expensive stages are 1, 4 and 5; the cheap
        measurement at stage&nbsp;3 sits deliberately between them, so a
        backbone that has already closed the tunnel is discarded before it
        costs anything. The three input layers are why an experiment config can
        be published while the filesystem it ran on stays private.
      </figcaption>
    </figure>
  );
}

/** A captured terminal session.
 *
 *  `lines` is real output, pasted. The point of showing it rather than
 *  describing it is that iGEM asks for screenshots, and a judge can run the
 *  same command and compare -- so it must be genuine, down to the numbers.
 */
export function Terminal({
  title,
  command,
  lines,
}: {
  title: string;
  command: string;
  lines: { text: string; kind?: "dim" | "key" | "head" }[];
}) {
  return (
    <figure className="swf-term numfig">
      <div className="swf-term-bar">
        <span className="swf-term-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="swf-term-title">{title}</span>
      </div>
      <pre className="swf-term-body">
        <code>
          <span className="swf-term-prompt">$ </span>
          <span className="swf-term-cmd">{command}</span>
          {"\n"}
          {lines.map((l, i) => (
            <span key={i} className={l.kind ? `swf-term-${l.kind}` : undefined}>
              {l.text}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
