/* ========================================================================== *
 *  Software-page figures (.swf-*, .swa-*, .sws-*)
 *
 *  Inline SVG, not uploaded images, for two reasons:
 *
 *   1. iGEM requires every asset to be served from its own host and forbids
 *      external CDNs (see channel-assets.ts). An inline SVG needs no host at
 *      all, so these figures cannot break when an upload path changes and
 *      cannot be the thing that fails iGEM's no-external-assets rule.
 *   2. They are diagrams, not photographs. SVG stays sharp at any width,
 *      reflows on a phone, and takes its colours from the page -- which a
 *      flattened .avif of a diagram cannot.
 *
 *  These are diagrams of the TOOL: how its stages chain, and where a run's
 *  files go. A measured-result plot does not belong here -- the results this
 *  pipeline produced are on the Engineering page, and this page is about the
 *  software. (ChannelProfileFigure, a plot of the PabUPO-II parent tunnel,
 *  lived here until that split; it is in git history if it is ever wanted.)
 *
 *  Styling is in software.css.
 * ========================================================================== */

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

/* ========================================================================== *
 *  Storage figure (.sws-*) — where a run's files actually go.
 *
 *  Transcribed from the repository, not drawn from memory:
 *    - the three input layers are enzyme_design/inputs/, the gitignored
 *      partial_diffusion/config.py and envs/site.env (lib/paths.py and
 *      docs/walkthrough-gpu.md steps 3-4 and 7);
 *    - the run directory and its nine subdirectories are the derived-paths
 *      block at the end of config_template.py, verbatim and in that order:
 *      WORK = SHARED_ROOT / YOUR_NAME / EXPERIMENT, then configs, submit,
 *      logs, cmds, scores, diffusion_out, mpnn_out, rf3_out, best_designs;
 *    - the stage numbers are STAGES in run_local.py.
 *
 *  If any of those move, this figure is wrong and has to move with them.
 * ========================================================================== */

/** A labelled box. `sub` lines are stacked under the title. */
function SwsBox({
  x,
  y,
  w,
  h,
  title,
  sub = [],
  cls = "sws-card",
  tag,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string[];
  cls?: string;
  tag?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" className={cls} />
      {tag ? (
        <text x={x + 12} y={y + 17} className="sws-tag">
          {tag}
        </text>
      ) : null}
      <text x={x + 12} y={y + (tag ? 36 : 23)} className="sws-title">
        {title}
      </text>
      {sub.map((s, i) => (
        <text
          key={i}
          x={x + 12}
          y={y + (tag ? 52 : 41) + i * 13}
          className="sws-sub"
        >
          {s}
        </text>
      ))}
    </g>
  );
}

/** A right-pointing arrow between two boxes on the same row. */
function SwsArrow({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g>
      <path d={`M${x1},${y} L${x2 - 6},${y}`} className="sws-arrow" />
      <path
        d={`M${x2},${y} l-7,-4 l0,8 Z`}
        className="sws-tip"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function StorageFigure() {
  // Five result directories, written in pipeline order; the number is the
  // stage in run_local.py that writes each one.
  const CHAIN = [
    { dir: "diffusion_out/", by: "1 · RFD3", what: "backbones" },
    { dir: "mpnn_out/", by: "4 · MPNN", what: "sequences" },
    { dir: "rf3_out/", by: "5 · RF3", what: "folded designs" },
    { dir: "scores/", by: "6 · score", what: "metrics, CSV" },
    { dir: "best_designs/", by: "7 · collect", what: "what passed" },
  ];
  const CW = 168;
  const CGAP = 14;
  const CX0 = 40;
  const CY = 330;

  return (
    <figure className="swf-fig swf-fig-wide numfig">
      <svg
        viewBox="0 0 950 560"
        className="swf-svg"
        role="img"
        aria-label={
          "Where a run's files go. Three inputs — your structure in " +
          "enzyme_design/inputs, the experiment in config.py and the machine " +
          "paths in envs/site.env — feed one run directory, PIPELINE_WORK_ROOT " +
          "over your name over the experiment name. Inside it, configs, cmds, " +
          "submit and logs hold the bookkeeping, and five directories hold the " +
          "results in pipeline order: diffusion_out from RFD3, mpnn_out from " +
          "LigandMPNN, rf3_out from RF3, scores, and best_designs. The " +
          "analysis scripts read rf3_out and best_designs and write beside them."
        }
      >
        {/* ---- inputs ---- */}
        <text x="40" y="26" className="swa-head">
          WHAT YOU SUPPLY — three layers, kept apart on purpose
        </text>

        <SwsBox
          x={40}
          y={38}
          w={280}
          h={78}
          tag="IN THE REPOSITORY"
          title="enzyme_design/inputs/"
          sub={[
            "your prepared structure, as PDB",
            "ships empty — ours stay in examples/",
          ]}
        />
        <SwsBox
          x={335}
          y={38}
          w={280}
          h={78}
          tag="GITIGNORED — YOUR COPY"
          title="partial_diffusion/config.py"
          sub={[
            "the experiment: which residues may",
            "move, which substrate, how many",
          ]}
        />
        <SwsBox
          x={630}
          y={38}
          w={280}
          h={78}
          tag="NEVER COMMITTED"
          title="envs/site.env"
          sub={[
            "the machine: checkpoints, queues,",
            "scratch space. One file to change",
          ]}
        />

        {/* three arrows converging into the run directory */}
        <path
          d="M180,116 L180,140 L475,140 L475,166"
          className="sws-arrow"
        />
        <path d="M475,116 L475,166" className="sws-arrow" />
        <path d="M770,116 L770,140 L475,140" className="sws-arrow" />
        <path
          d="M475,172 l-5,-9 l10,0 Z"
          className="sws-tip"
          strokeLinejoin="round"
        />

        {/* ---- the run directory ---- */}
        <rect
          x="25"
          y="176"
          width="900"
          height="290"
          rx="12"
          className="sws-run"
        />
        <text x="40" y="200" className="sws-run-title">
          $PIPELINE_WORK_ROOT / &lt;your name&gt; / &lt;experiment&gt;/
        </text>
        <text x="40" y="217" className="sws-sub">
          One directory per run, created by the driver. Nothing else writes
          here, and nothing here is in version control.
        </text>

        {/* bookkeeping row */}
        <text x="40" y="243" className="swa-head">
          BOOKKEEPING — written before any GPU time is spent
        </text>
        <SwsBox
          x={40}
          y={250}
          w={200}
          h={48}
          title="configs/"
          sub={["the config, frozen at submit"]}
          cls="sws-card sws-card-dim"
        />
        <SwsBox
          x={252}
          y={250}
          w={200}
          h={48}
          title="cmds/ · submit/"
          sub={["the exact commands that ran"]}
          cls="sws-card sws-card-dim"
        />
        <SwsBox
          x={464}
          y={250}
          w={200}
          h={48}
          title="logs/"
          sub={["per-job output"]}
          cls="sws-card sws-card-dim"
        />
        <text x={680} y={272} className="sws-note-text">
          A finished run can be read
        </text>
        <text x={680} y={284} className="sws-note-text">
          back without the repository.
        </text>

        {/* results chain */}
        <text x="40" y={CY - 12} className="swa-head">
          RESULTS — one directory per stage, in the order they are written
        </text>
        {CHAIN.map((c, i) => {
          const x = CX0 + i * (CW + CGAP);
          return (
            <g key={c.dir}>
              <SwsBox
                x={x}
                y={CY}
                w={CW}
                h={72}
                tag={c.by}
                title={c.dir}
                sub={[c.what]}
                cls={i === 4 ? "sws-card sws-card-key" : "sws-card"}
              />
              {i < CHAIN.length - 1 ? (
                <SwsArrow x1={x + CW} x2={x + CW + CGAP} y={CY + 36} />
              ) : null}
            </g>
          );
        })}

        {/* the gate sits between diffusion_out and mpnn_out */}
        <path
          d={`M${CX0 + CW / 2},${CY + 72} L${CX0 + CW / 2},${CY + 92} L${CX0 + CW + CGAP + CW / 2},${CY + 92} L${CX0 + CW + CGAP + CW / 2},${CY + 78}`}
          className="sws-arrow-gate"
        />
        <text x={CX0 + 14} y={CY + 110} className="sws-gate-text">
          3 · the CAVER gate measures every backbone here, and only the
          survivors reach LigandMPNN
        </text>

        {/* ---- analysis out ---- */}
        <path d="M475,466 L475,490" className="sws-arrow" />
        <path
          d="M475,496 l-5,-9 l10,0 Z"
          className="sws-tip"
          strokeLinejoin="round"
        />
        <SwsBox
          x={225}
          y={500}
          w={500}
          h={40}
          title="analysis 07–12"
          sub={[
            "read rf3_out/ and best_designs/, write CSV and PNG beside them",
          ]}
          cls="sws-card sws-card-out"
        />
      </svg>
      <figcaption>
        Where a run's files go. The three things you supply are kept apart on
        purpose: the experiment is publishable, the machine paths are not, and
        neither is mixed into the results. Everything a run produces lands under
        one directory named for you and the experiment — so a second run never
        overwrites a first, and a finished run can be read back without the
        repository that made it.
      </figcaption>
    </figure>
  );
}
