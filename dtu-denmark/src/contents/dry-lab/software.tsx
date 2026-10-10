import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import TOC from "../../components/TOC";
import { TextBox } from "../../components/TextBox";
import PartsTable from "../../components/PartsTable";
import type { TableColumn } from "../../components/PartsTable";
import { PageTitle, SectionHeading, SubsectionHeading } from "./SectionHeading";
import { MODEL_PAGES, ModelPager } from "./ModelNav";
import { DetailsBox } from "./DetailsBox";
import { FigNum, NumberedFigures, TabNum } from "./FigureNumbers";
import {
  ArchitectureFigure,
  ChannelProfileFigure,
  StorageFigure,
  Terminal,
} from "./SoftwareFigures";
import "./software.css";

/* ========================================================================== *
 *  Software — channel-design
 *
 *  THIS PAGE IS DOCUMENTATION: what the tool is, what you need, how to install
 *  it, and how to run it on your own enzyme, in the order you would actually
 *  do those things. It is written for somebody about to use it.
 *
 *  Deliberately NOT here, because they are not instructions:
 *    - the validation work and the crystal benchmark  -> docs/validation.md
 *    - the standards and data-format inventory        -> docs/data-formats.md
 *    - the design rationale and its trade-offs        -> docs/architecture.md
 *  All three are pointed at from the last section. The results the pipeline
 *  produced for our own enzymes are on the Engineering page and the CAVER
 *  method is on Methods; both are linked rather than retold.
 *
 *  EVERY COMMAND AND NUMBER HERE IS FROM THE REPOSITORY -- the steps follow
 *  docs/walkthrough-gpu.md, the troubleshooting table is its "When something
 *  breaks" section, and the terminal output is real output on the bundled
 *  structure. If one changes, change it in both places.
 * ========================================================================== */

const REPO = "https://gitlab.igem.org/2026/software/dtu-denmark/channel-design";

/* --- the five steps of the loop ------------------------------------------- */
const FLOW = [
  {
    step: "Measure",
    tool: "CAVER",
    what: "bottleneck radius; which residues line the tunnel",
    key: true,
  },
  {
    step: "Remodel",
    tool: "RFdiffusion3",
    what: "moves only those residues, holds the fold rigid",
  },
  {
    step: "Redesign",
    tool: "LigandMPNN",
    what: "new sequence for the tunnel lining",
  },
  {
    step: "Refold",
    tool: "RF3",
    what: "folds each design with heme and substrate",
  },
  {
    step: "Measure again",
    tool: "CAVER",
    what: "rank by real change in bottleneck",
    key: true,
  },
];

/* --- what a run needs, by how much hardware you have ----------------------- */
const TIERS = [
  {
    title: "A laptop",
    body: (
      <>
        The whole measurement half: pocket detection, tunnel geometry,
        clustering, every analysis script, and the full test suite. No GPU, no
        model weights, no network.
      </>
    ),
  },
  {
    title: "One GPU",
    body: (
      <>
        The complete design pipeline, stage by stage, with{" "}
        <code>run_local.py</code>. No scheduler needed.
      </>
    ),
  },
  {
    title: "An LSF cluster",
    body: (
      <>
        The same stages submitted as job arrays for scale, with{" "}
        <code>00_submit_all.py</code>. On SLURM, run <code>run_local.py</code>{" "}
        inside an allocation.
      </>
    ),
  },
];

/* --- the config lines meant to be edited ---------------------------------- *
   docs/walkthrough-gpu.md step 7. Everything else in the template has a
   working default. */
const CONFIG_COLUMNS: TableColumn[] = [
  { field: "setting", header: "Set", rowHeader: true },
  { field: "to", header: "To" },
];

const CONFIG_ROWS = [
  {
    setting: <code>INPUT_PDB</code>,
    to: (
      <>
        <code>inputs/my_enzyme.pdb</code> — the structure you prepared in step 1
      </>
    ),
  },
  {
    setting: <code>FLEXIBLE_RESIDUES</code>,
    to: "the list step 3 printed. Everything not in it is held rigid in diffusion and native in sequence design — that is the whole idea: change the tunnel, keep the enzyme",
  },
  {
    setting: <code>SUBSTRATE_SMILES</code>,
    to: "your substrate, as a SMILES string",
  },
  {
    setting: (
      <>
        <code>YOUR_NAME</code>, <code>EXPERIMENT</code>
      </>
    ),
    to: "anything; they name the output directory",
  },
];

/* --- troubleshooting ------------------------------------------------------- *
   The "When something breaks" table from docs/walkthrough-gpu.md. The full
   list, with a command to verify each one, is KNOWN_ISSUES.md in the repo. */
const TROUBLE_COLUMNS: TableColumn[] = [
  { field: "symptom", header: "Symptom" },
  { field: "look", header: "Look at" },
];

const TROUBLE_ROWS = [
  {
    symptom: <strong>CAVER finds no tunnel</strong>,
    look: (
      <>
        Is your substrate <code>HETATM</code> and not <code>ATOM</code>? A
        substrate written as <code>ATOM</code> is invisible to every
        ligand-aware step. In our own pair of files this was the difference
        between <strong>0 tunnels and 40</strong> on the same coordinates.
      </>
    ),
  },
  {
    symptom: <strong>Every design is identical</strong>,
    look: (
      <>
        <code>MPNN_TEMPERATURE</code>. LigandMPNN&rsquo;s own default of 0.1 is
        effectively argmax; <code>0.25</code> is the default here. Raise it to
        explore the lining — above ~0.5 expect more fold failures.
      </>
    ),
  },
  {
    symptom: (
      <strong>
        A job says <code>signal 9</code> but the output exists
      </strong>
    ),
    look: "It probably succeeded. Check the files before re-running it.",
  },
  {
    symptom: (
      <strong>
        <code>--check</code> cannot find <code>rfd3</code> or <code>mpnn</code>
      </strong>
    ),
    look: (
      <>
        Activate the design environment, or name the paths in{" "}
        <code>envs/site.env</code>.
      </>
    ),
  },
  {
    symptom: <strong>Nothing passes the quality gate</strong>,
    look: (
      <>
        Are you folding without an MSA? Lower <code>PLDDT_CUT</code> to ~0.70.
      </>
    ),
  },
];

/* --- the models the pipeline calls ---------------------------------------- */
const MODEL_COLUMNS: TableColumn[] = [
  { field: "model", header: "Model", rowHeader: true },
  { field: "role", header: "Role" },
  { field: "source", header: "Source" },
];

const FOUNDRY = (
  <a href="https://github.com/RosettaCommons/foundry">RosettaCommons/foundry</a>
);

const MODEL_ROWS = [
  {
    model: "Boltz-2",
    role: "holo structure and binding affinity from sequence",
    source: <a href="https://github.com/jwohlwend/boltz">jwohlwend/boltz</a>,
  },
  {
    model: "RFdiffusion3",
    role: "partial diffusion — remodels the tunnel residues",
    source: FOUNDRY,
  },
  { model: "LigandMPNN", role: "ligand-aware inverse folding", source: FOUNDRY },
  {
    model: "RF3",
    role: "folds and scores each design with its cofactors",
    source: FOUNDRY,
  },
];

/** The repository line, which opens the page and closes it. */
function RepoBar({ label }: { label: string }) {
  return (
    <div className="sw-repo">
      <span className="sw-repo-label">{label}</span>
      <code>
        <a href={REPO}>
          gitlab.igem.org/2026/software/dtu-denmark/channel-design
        </a>
      </code>
      <span className="sw-repo-meta">Apache-2.0 · Python</span>
    </div>
  );
}

/** One numbered step of the run-through. The number is decoration — the
 *  heading already says what the step is — so it is hidden from assistive
 *  tech rather than read out before every title. */
function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="sw-step">
      <h3 className="sw-step-head">
        <span className="sw-step-n" aria-hidden="true">
          {n}
        </span>
        <span className="sw-step-title">{title}</span>
      </h3>
      <div className="sw-step-body">{children}</div>
    </section>
  );
}

/** Copy-to-clipboard button for a command block.
 *
 *  `navigator.clipboard` needs a secure context. The published wiki is HTTPS
 *  so it is there, but a plain-HTTP preview of a build is not, hence the
 *  execCommand fallback — deprecated, and still the only thing that works
 *  where the async API is missing. If both fail the button says so rather
 *  than claiming a copy that did not happen.
 *
 *  The label is a live region, so a screen reader hears the result; the button
 *  itself keeps one accessible name instead of renaming itself mid-press. */
function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        // Off-screen rather than hidden: a display:none textarea cannot be
        // selected, and the page must not scroll when it is focused.
        ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    setState(ok ? "done" : "failed");
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" className="sw-copy" onClick={copy} aria-label="Copy">
      <span aria-hidden="true">
        {state === "idle" ? "Copy" : state === "done" ? "Copied" : "Press ⌘C"}
      </span>
      <span className="visually-hidden" aria-live="polite">
        {state === "done"
          ? "Copied to clipboard"
          : state === "failed"
            ? "Could not copy — select the text and copy it yourself"
            : ""}
      </span>
    </button>
  );
}

/** A shell block: a plain string is a command, `{ c }` is a dimmed comment.
 *
 *  What the button copies is exactly what is on screen, comments included —
 *  the block is meant to be pasted into a terminal whole, and a `#` line is
 *  harmless there. */
function Cmd({ lines }: { lines: (string | { c: string })[] }) {
  const text = lines.map((l) => (typeof l === "string" ? l : l.c)).join("\n");

  return (
    <div className="sw-cmd">
      <CopyButton text={text} />
      <code>
        {lines.map((l, i) =>
          typeof l === "string" ? (
            <span key={i}>
              {l}
              {"\n"}
            </span>
          ) : (
            <span key={i} className="sw-comment">
              {l.c}
              {"\n"}
            </span>
          ),
        )}
      </code>
    </div>
  );
}

export function Software() {
  // Constant light-blue page background across the Model section (removed on
  // unmount). Rule lives in model.css but Vite emits one global CSS bundle.
  useEffect(() => {
    document.body.classList.add("model-bg");
    return () => document.body.classList.remove("model-bg");
  }, []);

  return (
    <>
      <div className="page-container">
        <TOC pages={MODEL_PAGES} activeKey="software" />

        {/* The hero (pages.ts) already says "Software" — the name of the
            deliverable. This names the thing the page is ABOUT, the way
            Discovery and Engineering name theirs, so the two do not repeat. */}
        <PageTitle title="channel-design" />

        <div className="page-start row mt-4">
          <NumberedFigures className="col-lg-12">
            {/* ---------------------------------------------------------------- */}
            <section id="software-what-it-is">
              <SectionHeading title="What it is" />

              <RepoBar label="Repository" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  A substrate only reacts if it can physically reach the active
                  site. In unspecific peroxygenases (UPOs) that journey runs
                  through a narrow tunnel to the heme, and for a bulky substrate
                  the tunnel &mdash; not the chemistry &mdash; is what stops the
                  reaction. The constriction we started from is under
                  1&nbsp;&Aring; in radius (Figure <FigNum of="profile" />
                  ).
                </p>
                <p className="mm-prose">
                  <strong>
                    channel-design measures that tunnel and then uses the
                    measurement to redesign it.
                  </strong>{" "}
                  The tunnel geometry chooses which residues are allowed to
                  move, rejects candidate backbones before they cost GPU time,
                  and scores the finished designs. The loop closes on a physical
                  measurement rather than on a model&rsquo;s own confidence in
                  itself.
                </p>
              </TextBox>

              <div data-fig="profile">
                <ChannelProfileFigure />
              </div>

              <ul className="sw-flow">
                {FLOW.map((f) => (
                  <li key={f.step} className={f.key ? "sw-flow-key" : undefined}>
                    <span className="sw-flow-step">{f.step}</span>
                    <span className="sw-flow-tool">{f.tool}</span>
                    <span className="sw-flow-what">{f.what}</span>
                  </li>
                ))}
              </ul>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Two supporting tools come with it: a batch driver for{" "}
                  <strong>Boltz-2</strong> (holo structures and binding affinity
                  from sequence alone) and a command-line wrapper for{" "}
                  <strong>AutoDock Vina</strong>. Nothing in the method is
                  specific to peroxygenases &mdash; cofactors are named by their
                  standard PDB codes, so heme, copper, zinc, NAD and FAD all
                  work the same way.
                </p>
                <p className="mm-prose">
                  <strong>This page is the instructions.</strong> The results
                  the pipeline produced for our own enzymes are on the{" "}
                  <Link to="/model-engineering">Engineering</Link> page, and the
                  CAVER method itself is described on{" "}
                  <Link to="/model-methods">Methods</Link>.
                </p>
              </TextBox>

              <SubsectionHeading title="The eight stages" />
              <TextBox className="model-prose">
                <p className="mm-prose">
                  Three stages want a GPU and a model checkpoint; the rest are
                  cheap enough for a laptop. The measurement gate sits at
                  stage&nbsp;3, between them (Figure{" "}
                  <FigNum of="architecture" />) &mdash; a backbone whose tunnel
                  has already collapsed is discarded for a minute of CPU rather
                  than hours of GPU. It <strong>fails open</strong>: if CAVER is
                  not installed it says so in the log and passes every backbone
                  through, rather than silently emptying your run.
                </p>
              </TextBox>

              <div data-fig="architecture">
                <ArchitectureFigure />
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-requirements" className="mt-5">
              <SectionHeading title="What you need" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  You do not need our cluster, and for a large part of it you do
                  not need a GPU. There are three entry points, and only the
                  last assumes a scheduler.
                </p>
              </TextBox>

              <div className="sw-tiers">
                {TIERS.map((t) => (
                  <div className="sw-tier" key={t.title}>
                    <h4>{t.title}</h4>
                    <p>{t.body}</p>
                  </div>
                ))}
              </div>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  CAVER needs a JDK; your system one is almost certainly fine (8
                  and 17 are both tested). Two platform caveats are worth
                  knowing before you start:{" "}
                  <strong>fpocket&rsquo;s source build fails on macOS</strong>{" "}
                  &mdash; use <code>conda install -c bioconda fpocket</code>,
                  and note it is only needed for the pocket stage, not for
                  tunnel measurement &mdash; and{" "}
                  <strong>macOS arm64 has no AutoDock Vina wheel</strong>, so
                  the docking extra needs boost headers. Linux x86_64 needs
                  neither.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-install" className="mt-5">
              <SectionHeading title="Installing it" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  One script, and it does not need conda. It installs{" "}
                  <a href="https://docs.astral.sh/uv/">uv</a> if you do not have
                  it (asking first), installs every Python dependency from a
                  committed lockfile so the versions are exactly ours, downloads
                  CAVER&nbsp;3.0 from its authors and checks it against a
                  SHA-256, builds fpocket from source, and checks for a JDK
                  without installing one. Re-running it is safe.
                </p>
              </TextBox>

              <Cmd
                lines={[
                  "git clone https://gitlab.igem.org/2026/software/dtu-denmark/channel-design.git",
                  "cd channel-design",
                  "",
                  { c: "# the CPU half: tests + channel measurement" },
                  "./setup.sh",
                  "",
                  { c: "# ...and the GPU design stages" },
                  "./setup.sh --gpu",
                ]}
              />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Model checkpoints are deliberately <em>not</em> downloaded
                  unless you ask with <code>--weights</code>: they are tens of
                  gigabytes and are usually already on a shared filesystem.
                  Point at the copy you have instead of fetching another. Then
                  check what the install actually found &mdash; thirty seconds,
                  and it is the difference between a clean start and
                  discovering a missing checkpoint mid-run.
                </p>
              </TextBox>

              <Terminal
                title="./setup.sh --check"
                command="./setup.sh --check"
                lines={[
                  { text: "== uv", kind: "head" },
                  { text: "   ok    uv 0.13.0" },
                  { text: "" },
                  { text: "== External tools", kind: "head" },
                  { text: "   ok    CAVER: third_party/caver" },
                  { text: "   fail  fpocket: missing", kind: "key" },
                  { text: '   ok    java: java version "1.8.0_481"' },
                  { text: "" },
                  { text: "== Model checkpoints", kind: "head" },
                  {
                    text: "  RFD3_CKPT    .../ckpt/rfd3_latest.ckpt   <-- DOES NOT EXIST",
                    kind: "key",
                  },
                  {
                    text: "  MPNN_CKPT    .../ligandmpnn_v_32_010_25.pt   <-- DOES NOT EXIST",
                    kind: "key",
                  },
                  {
                    text: "   note  name them in envs/site.env, or ./setup.sh --gpu --weights",
                    kind: "dim",
                  },
                ]}
              />
              <p className="sw-figcap">
                A real <code>--check</code> on a laptop with no model weights.
                Every line is either <code>ok</code> or says exactly what is
                missing and how to supply it. The two failures here are
                expected: this machine measures tunnels and does not run the
                design stages.
              </p>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  To confirm the install works, run the test suite. It takes
                  about a second, needs no GPU, no cluster, no model weights and
                  no network, and exercises the real join between components on
                  fixture data:
                </p>
              </TextBox>

              <Cmd lines={["uv run --extra tests pytest -q"]} />
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-run" className="mt-5">
              <SectionHeading title="Running it on your own enzyme" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  The shape of a run is{" "}
                  <em>
                    measure &rarr; pilot &rarr; commit &rarr; re-measure &rarr;
                    explain
                  </em>
                  , so the expensive step is guarded on both sides. These are
                  the steps in the order you do them; the long form, with every
                  flag, is <code>docs/walkthrough-gpu.md</code> in the
                  repository.
                </p>
              </TextBox>

              <div className="sw-steps">
                <Step n={1} title="Prepare your structure">
                  <p>
                    Your enzyme needs solvent stripped, the heme on its own
                    chain, and the substrate on another chain roughly
                    4&ndash;5&nbsp;&Aring; above the iron. And &mdash; this one
                    bites people &mdash;{" "}
                    <strong>
                      every ligand must be written as <code>HETATM</code>, not{" "}
                      <code>ATOM</code>
                    </strong>
                    . A substrate written as <code>ATOM</code> is invisible to
                    every ligand-aware step, and CAVER will find no tunnel at
                    all. <code>fix_pdb_chains.py</code> does the chain surgery.
                  </p>
                  <Cmd
                    lines={[
                      "cp my_enzyme.pdb enzyme_design/inputs/",
                      'grep -E "^(ATOM|HETATM)" enzyme_design/inputs/my_enzyme.pdb \\',
                      "  | cut -c22 | sort -u",
                      { c: "# expect three chain letters, e.g. A B C" },
                    ]}
                  />
                </Step>

                <Step n={2} title="Tell it where things are">
                  <p>
                    Machine-specific paths &mdash; checkpoints, queues, scratch
                    directories &mdash; live in one file that is never
                    committed, so adopting the tool does not mean editing the
                    science. On a single machine most of it can stay empty: the
                    checkpoints default to <code>enzyme_design/ckpt/</code>.
                    Every path <code>site.py</code> prints should exist. This
                    costs nothing and catches most setup mistakes.
                  </p>
                  <Cmd
                    lines={[
                      "cp envs/dtu-hpc.env.example envs/site.env",
                      { c: "# edit it, then:" },
                      "source envs/site.env",
                      "python enzyme_design/partial_diffusion/site.py",
                    ]}
                  />
                </Step>

                <Step n={3} title="Measure the parent enzyme">
                  <p>
                    <strong>
                      This is the step that makes the tool worth using.
                    </strong>{" "}
                    It answers the hardest question in this kind of design work
                    &mdash; which residues should I allow to change? &mdash;
                    from measured geometry instead of intuition, and records the
                    baseline every design will be compared against. If you try
                    one command, try this one.
                  </p>
                  <Cmd
                    lines={[
                      "python enzyme_design/partial_diffusion/scripts/00_caver_channel.py",
                    ]}
                  />
                  <Terminal
                    title="00_caver_channel.py — measuring the parent"
                    command="python 00_caver_channel.py examples/PabUPO-II_withHEMEFE_and_NNBT.pdb"
                    lines={[
                      {
                        text: "Running CAVER (this takes a minute)...",
                        kind: "dim",
                      },
                      {
                        text: "Substrate : UNL — stripped (measuring apo)",
                        kind: "dim",
                      },
                      { text: "" },
                      {
                        text: "Best channel — tunnel 1 (cluster 1)",
                        kind: "head",
                      },
                      {
                        text: "  bottleneck radius : 0.983 A   <- the number to beat",
                        kind: "key",
                      },
                      { text: "  length            : 14.96 A" },
                      { text: "  throughput        : 0.717" },
                      { text: "  curvature         : 1.30" },
                      { text: "" },
                      {
                        text: "Channel-lining residues on chain A:",
                        kind: "head",
                      },
                      {
                        text: "  sidechain-lining (20) : [52, 85, 86, 88, 89, 92, ...]",
                      },
                      {
                        text: "  backbone-only     (7) : [90, 94, 204, 209, ...]",
                      },
                      {
                        text: "  -> FLEXIBLE_RESIDUES (27) : [52, 85, 86, 88, 89, 90, ...]",
                        kind: "key",
                      },
                      { text: "" },
                      { text: "Wrote:", kind: "head" },
                      {
                        text: "  ..._flex.json        the residues, ready to paste",
                      },
                      {
                        text: "  ..._baseline.json    what designs are compared against",
                      },
                      {
                        text: "  ..._channel.pdb      the tunnel, as placeholder atoms",
                      },
                    ]}
                  />
                  <p className="sw-figcap">
                    Real output on the structure bundled with the repository.
                    The three numbers at the top are the same ones in Figure{" "}
                    <FigNum of="profile" />, and you can reproduce them in about
                    a minute on a laptop.
                  </p>
                  <p>
                    You will also want an alignment, once per enzyme:{" "}
                    <code>00_make_msa.py</code>. It may query the public
                    ColabFold server.
                  </p>
                </Step>

                <Step n={4} title="Write your config">
                  <p>
                    Copy the template and edit the tagged lines. The settings in
                    Table <TabNum of="config" /> are the ones meant to be
                    changed; everything else has a working default.{" "}
                    <code>config.py</code> is gitignored &mdash; it is your
                    working copy, not part of the repository.
                  </p>
                  <Cmd
                    lines={[
                      "cp partial_diffusion/config_template.py partial_diffusion/config.py",
                    ]}
                  />
                  <PartsTable
                    columns={CONFIG_COLUMNS}
                    data={CONFIG_ROWS}
                    numberId="config"
                    caption="The four settings you have to supply. FLEXIBLE_RESIDUES is copied straight from what step 3 printed."
                  />
                </Step>

                <Step n={5} title="Preflight, then pilot">
                  <p>
                    <code>--check</code> reports what is installed and
                    resolvable; <code>--dry-run</code> prints every command
                    without running one, so a whole run can be inspected before
                    anything is spent. Then pilot:{" "}
                    <strong>
                      one backbone tells you whether the tunnel opens at all.
                    </strong>{" "}
                    If it does not open here it will not open across two hundred
                    designs, and you retune cheaply instead of discovering it a
                    day later.
                  </p>
                  <Cmd
                    lines={[
                      "python partial_diffusion/scripts/run_local.py --check",
                      "",
                      {
                        c: "# one backbone, diffusion only, before spending anything",
                      },
                      "python partial_diffusion/scripts/run_local.py \\",
                      "  --stages prep-caver_filter",
                      "python partial_diffusion/scripts/08_probe_channel.py ...",
                    ]}
                  />
                </Step>

                <Step n={6} title="The full run">
                  <p>
                    Same stages either way &mdash; <code>run_local.py</code> is
                    the cluster path with <code>bsub</code> taken out, so
                    nothing is cluster-specific except the batch scripts
                    themselves. Stages can be named or numbered, and each stage
                    script is independently runnable if you would rather drive
                    them yourself.
                  </p>
                  <Cmd
                    lines={[
                      { c: "# one GPU" },
                      "python partial_diffusion/scripts/run_local.py",
                      "",
                      { c: "# or, on an LSF cluster" },
                      "python partial_diffusion/scripts/00_submit_all.py",
                    ]}
                  />
                </Step>

                <Step n={7} title="Did it work?">
                  <p>
                    Designs are ranked by{" "}
                    <strong>measured change in bottleneck radius</strong>, never
                    by how confident the model was. Three further scripts
                    explain <em>why</em> a design worked: overlaying tunnel
                    profiles, clustering designs by tunnel shape rather than by
                    a single number, and naming the residues physically blocking
                    the tunnel. That last one is how we learned our own ceiling
                    was catalytic &mdash; a conclusion the tool handed us rather
                    than one we assumed.
                  </p>
                  <Cmd
                    lines={[
                      "python partial_diffusion/scripts/07_caver_rescore.py",
                      "python partial_diffusion/scripts/09_compare_to_parent.py ...",
                      "",
                      { c: "# why it worked" },
                      "python partial_diffusion/scripts/10_plot_channels.py",
                      "python partial_diffusion/scripts/11_cluster_channels.py",
                      "python partial_diffusion/scripts/12_bottleneck_residues.py",
                    ]}
                  />
                </Step>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-skill" className="mt-5">
              <SectionHeading title="Running it with Claude Code" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  The repository ships{" "}
                  <strong>
                    a Claude Code skill, <code>run-pipeline</code>
                  </strong>
                  , at <code>.claude/skills/run-pipeline/SKILL.md</code>. It is
                  a plain Markdown file that an assistant reads before touching
                  the pipeline, and it exists because the mistakes worth
                  preventing here are not coding mistakes. This pipeline spends
                  shared GPU hours and produces numbers that go on a public wiki
                  and into a competition.
                </p>
                <p className="mm-prose">
                  Clone the repository and open it in Claude Code and the skill
                  loads itself &mdash; there is nothing to install and no key to
                  configure. If you do not use Claude Code, read it anyway: it
                  is the shortest honest description of how to drive this
                  pipeline that we have written.
                </p>
              </TextBox>

              <div className="sw-skill">
                <div className="sw-skill-item">
                  <h4>Cheapest check first, always</h4>
                  <p>
                    Six steps in a fixed order, each with what it costs and what
                    it proves: the test suite, then path resolution, then{" "}
                    <code>--check</code>, then <code>--dry-run</code>, then a
                    one-backbone pilot, and only then the full run. Each rules
                    out a class of failure that would otherwise surface hours
                    into a run.
                  </p>
                </div>
                <div className="sw-skill-item">
                  <h4>Stop and ask before spending</h4>
                  <p>
                    The skill tells the assistant to halt after the pilot and
                    report, and to ask a human before submitting a full run,
                    before re-running a stage that already has output, before
                    deleting anything under the work root, and before any
                    commit. It is not allowed to decide on its own that your GPU
                    hours are worth spending.
                  </p>
                </div>
                <div className="sw-skill-item">
                  <h4>Failures that are not failures</h4>
                  <p>
                    Two things in this pipeline look like crashes and are not: a{" "}
                    <code>signal 9</code> from a job whose output exists, and
                    the CAVER gate failing open. Both are written down, so an
                    assistant reports them accurately instead of &ldquo;fixing&rdquo;
                    a run that was fine.
                  </p>
                </div>
                <div className="sw-skill-item">
                  <h4>Never report what you did not measure</h4>
                  <p>
                    The rule the skill opens and closes on. Do not summarise a
                    run as successful because it exited&nbsp;0; check the files
                    exist and the numbers are there, and say plainly if a stage
                    was skipped. An assistant is also told not to invent a{" "}
                    <code>FLEXIBLE_RESIDUES</code> list &mdash; choosing those
                    residues by eye defeats the point of the tool &mdash; and
                    never to guess a cluster path.
                  </p>
                </div>
              </div>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Those constraints are the point. An assistant that is fast and
                  confident is exactly the wrong thing to put in front of a
                  queue of shared GPU jobs and a wiki full of measured numbers,
                  and the skill is mostly a list of the things it must not do on
                  its own. The same policy for the whole repository is in{" "}
                  <code>.claude/RESPONSIBLE_AI_USE.md</code>: we remain
                  accountable for every claim, and nothing on this page was
                  reported without being measured.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-troubleshooting" className="mt-5">
              <SectionHeading title="When something breaks" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Table <TabNum of="trouble" /> is the short list. The full one
                  &mdash; nine traps that each cost somebody a run, each with
                  the command to verify it &mdash; is{" "}
                  <code>KNOWN_ISSUES.md</code> in the repository. If you read
                  one file before changing anything, read that one.
                </p>
              </TextBox>

              <PartsTable
                columns={TROUBLE_COLUMNS}
                data={TROUBLE_ROWS}
                numberId="trouble"
                caption="The five failures that come up most often, and what to check first."
              />
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-interfaces" className="mt-5">
              <SectionHeading title="Calling it from your own tools" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  There is no web service and no REST API, and that is a
                  deliberate choice rather than an omission: every stage is a
                  command-line script that reads files and writes files, which
                  is what makes it composable with a scheduler, a Makefile, or
                  somebody else&rsquo;s pipeline. Three interfaces are stable
                  enough to build on.
                </p>
              </TextBox>

              <div className="sw-api">
                <div className="sw-api-item">
                  <h4>The command line</h4>
                  <p>
                    Every script takes <code>--help</code>. The two drivers take{" "}
                    <code>--check</code> and <code>--dry-run</code>. A test in
                    the suite asserts that every flag named in the documentation
                    actually exists &mdash; which it did not always.
                  </p>
                </div>

                <div className="sw-api-item">
                  <h4>Python, importable</h4>
                  <p>
                    <code>lib/caver_utils.py</code> is the measurement layer:
                    stage a structure, run CAVER, parse tunnels, lining residues
                    and profiles. If all you want is &ldquo;how wide is the
                    tunnel in this PDB&rdquo;, that is the import, and it needs
                    no GPU and no model weights.
                  </p>
                </div>

                <div className="sw-api-item">
                  <h4>A CSV contract between the tools</h4>
                  <p>
                    The Boltz-2 driver writes{" "}
                    <code>accession, ligand_iptm, affinity_pred_value</code>;
                    the clustering joins on the accession. Because the contract
                    is a file and not a function call,{" "}
                    <strong>any affinity predictor can replace Boltz-2</strong>{" "}
                    &mdash; emit those three columns and nothing else changes.
                  </p>
                </div>
              </div>

              <SubsectionHeading title="Cutting into the workflow" />
              <TextBox className="model-prose">
                <p className="mm-prose">
                  You can start or stop at any stage, because{" "}
                  <strong>
                    every boundary is a community-standard format and none of
                    them is ours
                  </strong>
                  : structures go in and out as PDB and mmCIF, sequences as
                  FASTA, alignments as A3M, your substrate as SMILES, cofactors
                  by their standard three-letter codes, docking input as SDF and
                  PDBQT, and every results table as CSV. There is no project
                  file format to adopt and nothing to export.
                </p>
                <p className="mm-prose">
                  So the common ways to integrate it are all subtractive rather
                  than additive. Bring your own structures and skip Boltz-2
                  entirely. Take the CAVER wrapper on its own &mdash; it needs
                  no GPU and no model weights, and measuring a tunnel does not
                  require adopting the design pipeline. Or replace a stage:
                  tables are addressed by column name, never by position, so a
                  different affinity predictor only has to emit the three
                  columns above. Public identifiers are consumed rather than
                  reinvented &mdash; RCSB accessions, UniProt and NCBI
                  accessions, CUPP clades.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-storage" className="mt-5">
              <SectionHeading title="How a run is laid out" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Figure <FigNum of="storage" /> is where everything a run
                  touches actually lives. Two things about it are worth knowing
                  before your first run, because both are easier to arrange at
                  the start than to unpick afterwards.
                </p>
                <p className="mm-prose">
                  <strong>What you supply is split three ways.</strong> The
                  experiment &mdash; which enzyme, which residues may move,
                  which substrate &mdash; is in version control and publishable.
                  The machine &mdash; checkpoints, queues, scratch space
                  &mdash; is one file that is never committed. Your own paths
                  are a third. That is why the configs in the repository can be
                  read by anyone without exposing the filesystem they ran on,
                  and why moving to another cluster is one file rather than
                  thirty.
                </p>
                <p className="mm-prose">
                  <strong>
                    Everything a run produces lands under one directory
                  </strong>
                  , named for you and for the experiment, so a second run never
                  overwrites a first. Each stage writes its own subdirectory,
                  and the config and the exact commands are frozen there before
                  any GPU time is spent &mdash; which means a finished run can
                  be read back, and repeated, without the repository that made
                  it.
                </p>
              </TextBox>

              <div data-fig="storage">
                <StorageFigure />
              </div>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  The pipeline itself flows left to right through the same
                  directories: each stage reads what the stage before it wrote
                  and writes its own, so you can stop after any of them, inspect
                  the files, and resume. Stages are addressable by name as well
                  as by number &mdash;{" "}
                  <code>--stages prep-caver_filter</code> is the pilot, and
                  names are stable where numbers shift if a stage is ever
                  inserted. Figure <FigNum of="architecture" /> above is the
                  same eight stages seen as cost: which of them want a GPU, and
                  where the cheap measurement sits relative to them.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-depends" className="mt-5">
              <SectionHeading title="What it depends on" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  <strong>We trained nothing and fine-tuned nothing.</strong>{" "}
                  Every model in Table <TabNum of="models" /> is a published,
                  pre-trained network used as released, and none of their
                  weights are redistributed in our repository &mdash; they are
                  fetched from their upstream projects. Tunnel measurement is
                  CAVER&nbsp;3.0 (GPLv3, Masaryk University), fetched by the
                  install script rather than vendored; pocket detection is
                  fpocket.
                </p>
              </TextBox>

              <PartsTable
                columns={MODEL_COLUMNS}
                data={MODEL_ROWS}
                numberId="models"
                caption="The four pre-trained networks the pipeline calls, and where each comes from."
              />

              <div className="sw-caveat">
                <strong>Before you trust a number this produces.</strong> Every
                result the pipeline gives you is computational. Nothing it has
                designed for us has been expressed or assayed in a laboratory; a
                design that folds confidently may not express or function; and
                pLDDT&nbsp;0.96 says the network is certain rather than right
                &mdash; which matters most at exactly the redesigned positions,
                where there is least evolutionary signal behind it.
              </div>

              <DetailsBox label="More details on the limitations we know about">
                <ul className="mm-prose">
                  <li>
                    Affinity predictions are used for ranking. We make no claim
                    about their absolute calibration on UPOs, a family unlikely
                    to be well represented in training data.
                  </li>
                  <li>
                    Bottleneck radii measured on predicted structures carry the
                    prediction&rsquo;s error, which is why every comparison
                    should be anchored to real crystal structures.
                  </li>
                  <li>
                    The pipeline inherits its models&rsquo; biases. A generative
                    model trained mostly on soluble, well-behaved proteins
                    proposes soluble, well-behaved proteins, whether or not that
                    suits an industrial enzyme.
                  </li>
                  <li>
                    Their training data is not ours to characterise &mdash; all
                    four were trained by their authors, largely on the Protein
                    Data Bank, and the upstream projects are the authority on
                    composition and cut-off dates.
                  </li>
                </ul>
              </DetailsBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-more" className="mt-5">
              <SectionHeading title="Where the rest of the documentation is" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  The stage scripts are numbered in the order they run and each
                  one works on its own. Configuration is layered: what the
                  experiment <em>is</em> in one file, what the <em>machine</em>{" "}
                  is in another, and personal overrides in a third that is never
                  committed &mdash; so publishing an experiment never publishes
                  somebody&rsquo;s home directory, and moving to a new cluster
                  is one file rather than thirty.
                </p>
              </TextBox>

              <div className="sw-docs">
                <div className="sw-doc">
                  <code>docs/walkthrough-gpu.md</code>
                  <span>
                    This page in long form: twelve steps from clone to ranked
                    designs, plus a measurement-only path with no GPU.
                  </span>
                </div>
                <div className="sw-doc">
                  <code>docs/architecture.md</code>
                  <span>
                    How the four components chain, the two hand-offs between
                    them, and why the measurement gate sits where it does.
                  </span>
                </div>
                <div className="sw-doc">
                  <code>docs/validation.md</code>
                  <span>
                    What is verified and what is not &mdash; including two
                    measurement artifacts we found that were each larger than
                    the effect we were trying to detect. Worth reading if you
                    compare protein tunnels, even if you never run this code.
                  </span>
                </div>
                <div className="sw-doc">
                  <code>docs/data-formats.md</code>
                  <span>
                    Every format at every boundary, and the CSV contract between
                    the components.
                  </span>
                </div>
                <div className="sw-doc">
                  <code>KNOWN_ISSUES.md</code>
                  <span>
                    Nine traps that each cost somebody a run, with the command
                    to verify each one.
                  </span>
                </div>
                <div className="sw-doc">
                  <code>CHANNEL_WIDENING_LOG.md</code>
                  <span>
                    The laboratory notebook: what was tried, what failed, and
                    why it is built this way.
                  </span>
                </div>
              </div>

              <RepoBar label="Source, docs and tests" />
            </section>

            {/* Bottom prev/next navigation (Engineering ← Software) */}
            <ModelPager active="software" />
          </NumberedFigures>
        </div>
      </div>
    </>
  );
}
